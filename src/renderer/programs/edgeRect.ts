/**
 * EdgeRect: renders thick edges as rectangles via 2 triangles (6 vertices).
 * Line width is computed in the vertex shader via normal offset in pixel space.
 * Stride: 13 floats per vertex (source.xy, target.xy, posCoef, normalCoef, lineWidth, color.rgb, pickingColor.rgb).
 */

import { Program } from './program.js';
import type { RenderParams, AttributeLayout } from './program.js';
import { vertexShader } from './shaders/edgeRect.vert.js';
import { fragmentShader } from './shaders/edgeRect.frag.js';
import { encodeId } from '../picking.js';

const FLOATS_PER_VERTEX = 13;
const VERTICES_PER_ITEM = 6;

// 6 vertices: (posCoef, normalCoef)
// posCoef: 0=source, 1=target | normalCoef: -1 or +1
const COEFFICIENTS: [number, number][] = [
  [0, -1], [1, -1], [0, 1],
  [1, -1], [1, 1], [0, 1],
];

export class EdgeRectProgram extends Program {
  getVertexShader() { return vertexShader; }
  getFragmentShader() { return fragmentShader; }
  getFloatsPerVertex() { return FLOATS_PER_VERTEX; }
  getVerticesPerItem() { return VERTICES_PER_ITEM; }
  getDrawMethod() { return this.gl.TRIANGLES; }

  getAttributeLayout(): AttributeLayout[] {
    return [
      { name: 'a_source', size: 2 },
      { name: 'a_target', size: 2 },
      { name: 'a_posCoef', size: 1 },
      { name: 'a_normalCoef', size: 1 },
      { name: 'a_lineWidth', size: 1 },
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

  processEdge(
    index: number,
    sx: number, sy: number,
    tx: number, ty: number,
    color: [number, number, number],
    pickingIndex: number,
    lineWidth: number,
  ): void {
    const [pr, pg, pb] = encodeId(pickingIndex);
    const pR = pr / 255, pG = pg / 255, pB = pb / 255;

    for (let v = 0; v < VERTICES_PER_ITEM; v++) {
      const o = (index * VERTICES_PER_ITEM + v) * FLOATS_PER_VERTEX;
      const [posCoef, normalCoef] = COEFFICIENTS[v];
      this.array[o] = sx;
      this.array[o + 1] = sy;
      this.array[o + 2] = tx;
      this.array[o + 3] = ty;
      this.array[o + 4] = posCoef;
      this.array[o + 5] = normalCoef;
      this.array[o + 6] = lineWidth;
      this.array[o + 7] = color[0];
      this.array[o + 8] = color[1];
      this.array[o + 9] = color[2];
      this.array[o + 10] = pR;
      this.array[o + 11] = pG;
      this.array[o + 12] = pB;
    }
  }
}
