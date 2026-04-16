/**
 * EdgeLine: renders edges as GL_LINES with per-edge color and picking.
 * Stride: 8 floats per vertex (x, y, r, g, b, pickR, pickG, pickB), 2 vertices per edge.
 */

import { Program } from './program.js';
import type { RenderParams, AttributeLayout } from './program.js';
import { vertexShader } from './shaders/edgeLine.vert.js';
import { fragmentShader } from './shaders/edgeLine.frag.js';
import { encodeId } from '../picking.js';

const FLOATS_PER_VERTEX = 8;

export class EdgeLineProgram extends Program {
  getVertexShader() { return vertexShader; }
  getFragmentShader() { return fragmentShader; }
  getFloatsPerVertex() { return FLOATS_PER_VERTEX; }
  getVerticesPerItem() { return 2; }
  getDrawMethod() { return this.gl.LINES; }

  getAttributeLayout(): AttributeLayout[] {
    return [
      { name: 'a_position', size: 2 },
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

  /**
   * Write one edge (source→target) into the buffer.
   * @param pickingIndex - global picking index for this edge
   */
  processEdge(
    index: number,
    sx: number, sy: number,
    tx: number, ty: number,
    color: [number, number, number],
    pickingIndex: number,
  ): void {
    const o = index * 2 * FLOATS_PER_VERTEX;
    const [pr, pg, pb] = encodeId(pickingIndex);
    const pR = pr / 255;
    const pG = pg / 255;
    const pB = pb / 255;
    // source vertex
    this.array[o] = sx;
    this.array[o + 1] = sy;
    this.array[o + 2] = color[0];
    this.array[o + 3] = color[1];
    this.array[o + 4] = color[2];
    this.array[o + 5] = pR;
    this.array[o + 6] = pG;
    this.array[o + 7] = pB;
    // target vertex
    this.array[o + 8] = tx;
    this.array[o + 9] = ty;
    this.array[o + 10] = color[0];
    this.array[o + 11] = color[1];
    this.array[o + 12] = color[2];
    this.array[o + 13] = pR;
    this.array[o + 14] = pG;
    this.array[o + 15] = pB;
  }
}
