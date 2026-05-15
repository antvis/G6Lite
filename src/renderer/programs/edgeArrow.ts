/**
 * EdgeArrow: renders arrow heads as dart/chevron shapes (concave base).
 * 4 logical vertices -> 2 triangles -> 6 vertices per arrow.
 *
 * Stride: 15 floats per vertex.
 */

import { Program } from './program.js';
import type { RenderParams, AttributeLayout } from './program.js';
import { vertexShader } from './shaders/edgeArrow.vert.js';
import { fragmentShader } from './shaders/edgeArrow.frag.js';
import { encodeId } from '../picking.js';

const FLOATS_PER_VERTEX = 15;
const VERTICES_PER_ITEM = 6;

// Indent depth: 20% of arrowLength from base toward tip
const INDENT = 0.2;

// 6 vertices forming 2 triangles (dart/chevron shape):
// Triangle 1: tip, leftBase, indent
// Triangle 2: tip, indent, rightBase
const COORDS: [number, number][] = [
  [0.5, 1.0], // tip
  [0.0, 0.0], // left base
  [0.5, INDENT], // indent (concave center)
  [0.5, 1.0], // tip
  [0.5, INDENT], // indent (concave center)
  [1.0, 0.0], // right base
];

export class EdgeArrowProgram extends Program {
  getVertexShader() {
    return vertexShader;
  }
  getFragmentShader() {
    return fragmentShader;
  }
  getFloatsPerVertex() {
    return FLOATS_PER_VERTEX;
  }
  getVerticesPerItem() {
    return VERTICES_PER_ITEM;
  }
  getDrawMethod() {
    return this.gl.TRIANGLES;
  }

  getAttributeLayout(): AttributeLayout[] {
    return [
      { name: 'a_source', size: 2 },
      { name: 'a_target', size: 2 },
      { name: 'a_barycentric', size: 2 },
      { name: 'a_arrowSize', size: 1 },
      { name: 'a_lineWidth', size: 1 },
      { name: 'a_nodeRadius', size: 1 },
      { name: 'a_color', size: 3 },
      { name: 'a_pickingColor', size: 3 },
    ];
  }

  setUniforms(params: RenderParams): void {
    const gl = this.gl;
    gl.uniform2f(this.uniform('u_translate'), params.camera.x, params.camera.y);
    gl.uniform1f(this.uniform('u_scale'), params.camera.zoom);
    gl.uniform2f(this.uniform('u_resolution'), params.width, params.height);
  }

  processArrow(
    index: number,
    sx: number,
    sy: number,
    tx: number,
    ty: number,
    arrowSize: number,
    lineWidth: number,
    nodeRadius: number,
    color: [number, number, number],
    pickingIndex: number,
  ): void {
    const [pr, pg, pb] = encodeId(pickingIndex);
    const pR = pr / 255,
      pG = pg / 255,
      pB = pb / 255;

    for (let v = 0; v < VERTICES_PER_ITEM; v++) {
      const o = (index * VERTICES_PER_ITEM + v) * FLOATS_PER_VERTEX;
      const [cx, cy] = COORDS[v];
      this.array[o] = sx;
      this.array[o + 1] = sy;
      this.array[o + 2] = tx;
      this.array[o + 3] = ty;
      this.array[o + 4] = cx;
      this.array[o + 5] = cy;
      this.array[o + 6] = arrowSize;
      this.array[o + 7] = lineWidth;
      this.array[o + 8] = nodeRadius;
      this.array[o + 9] = color[0];
      this.array[o + 10] = color[1];
      this.array[o + 11] = color[2];
      this.array[o + 12] = pR;
      this.array[o + 13] = pG;
      this.array[o + 14] = pB;
    }
  }
}
