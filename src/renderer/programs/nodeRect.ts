/**
 * NodeRect: renders nodes as rectangles via 2 triangles (6 vertices).
 * Stride: 12 floats per vertex (center.xy, size.wh, corner.xy, color.rgb, pickingColor.rgb).
 */

import { Program } from './program.js';
import type { RenderParams, AttributeLayout } from './program.js';
import { vertexShader } from './shaders/nodeRect.vert.js';
import { fragmentShader } from './shaders/nodeRect.frag.js';
import { encodeId } from '../picking.js';

const FLOATS_PER_VERTEX = 12;
const VERTICES_PER_ITEM = 6;

// Two triangles forming a quad: (-1,-1),(1,-1),(-1,1) and (1,-1),(1,1),(-1,1)
const CORNERS: [number, number][] = [
  [-1, -1], [1, -1], [-1, 1],
  [1, -1], [1, 1], [-1, 1],
];

export class NodeRectProgram extends Program {
  getVertexShader() { return vertexShader; }
  getFragmentShader() { return fragmentShader; }
  getFloatsPerVertex() { return FLOATS_PER_VERTEX; }
  getVerticesPerItem() { return VERTICES_PER_ITEM; }
  getDrawMethod() { return this.gl.TRIANGLES; }

  getAttributeLayout(): AttributeLayout[] {
    return [
      { name: 'a_center', size: 2 },
      { name: 'a_size', size: 2 },
      { name: 'a_corner', size: 2 },
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

  processNode(
    index: number,
    x: number, y: number,
    width: number, height: number,
    color: [number, number, number],
    pickingIndex: number,
  ): void {
    const [pr, pg, pb] = encodeId(pickingIndex);
    const pR = pr / 255, pG = pg / 255, pB = pb / 255;

    for (let v = 0; v < VERTICES_PER_ITEM; v++) {
      const o = (index * VERTICES_PER_ITEM + v) * FLOATS_PER_VERTEX;
      const [cx, cy] = CORNERS[v];
      this.array[o] = x;
      this.array[o + 1] = y;
      this.array[o + 2] = width;
      this.array[o + 3] = height;
      this.array[o + 4] = cx;
      this.array[o + 5] = cy;
      this.array[o + 6] = color[0];
      this.array[o + 7] = color[1];
      this.array[o + 8] = color[2];
      this.array[o + 9] = pR;
      this.array[o + 10] = pG;
      this.array[o + 11] = pB;
    }
  }
}
