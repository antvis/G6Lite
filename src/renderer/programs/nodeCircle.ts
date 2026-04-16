/**
 * NodeCircle: renders nodes as GL_POINTS with circle discard.
 * Stride: 9 floats per vertex (x, y, size, r, g, b, pickR, pickG, pickB).
 */

import { Program } from './program.js';
import type { RenderParams, AttributeLayout } from './program.js';
import { vertexShader } from './shaders/nodeCircle.vert.js';
import { fragmentShader } from './shaders/nodeCircle.frag.js';
import { encodeId } from '../picking.js';

const FLOATS_PER_VERTEX = 9;

export class NodeCircleProgram extends Program {
  getVertexShader() { return vertexShader; }
  getFragmentShader() { return fragmentShader; }
  getFloatsPerVertex() { return FLOATS_PER_VERTEX; }
  getVerticesPerItem() { return 1; }
  getDrawMethod() { return this.gl.POINTS; }

  getAttributeLayout(): AttributeLayout[] {
    return [
      { name: 'a_position', size: 2 },
      { name: 'a_size', size: 1 },
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
   * Write one node into the buffer.
   * @param pickingIndex - global picking index for this node
   */
  processNode(
    index: number,
    x: number, y: number,
    size: number,
    color: [number, number, number],
    pickingIndex: number,
  ): void {
    const o = index * FLOATS_PER_VERTEX;
    const [pr, pg, pb] = encodeId(pickingIndex);
    this.array[o] = x;
    this.array[o + 1] = y;
    this.array[o + 2] = size;
    this.array[o + 3] = color[0];
    this.array[o + 4] = color[1];
    this.array[o + 5] = color[2];
    this.array[o + 6] = pr / 255;
    this.array[o + 7] = pg / 255;
    this.array[o + 8] = pb / 255;
  }
}
