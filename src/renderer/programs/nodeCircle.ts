/**
 * NodeCircle: renders nodes as GL_POINTS with circle discard.
 * Supports fill, stroke, opacity, and halo.
 * Stride: 15 floats per vertex.
 */

import { encodeId } from '../picking.js';
import type { AttributeLayout, RenderParams } from './program.js';
import { Program } from './program.js';
import { fragmentShader } from './shaders/nodeCircle.frag.js';
import { vertexShader } from './shaders/nodeCircle.vert.js';

const FLOATS_PER_VERTEX = 15;

export class NodeCircleProgram extends Program {
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
    return 1;
  }
  getDrawMethod() {
    return this.gl.POINTS;
  }

  getAttributeLayout(): AttributeLayout[] {
    return [
      { name: 'a_position', size: 2 },
      { name: 'a_size', size: 1 },
      { name: 'a_color', size: 3 },
      { name: 'a_pickingColor', size: 3 },
      { name: 'a_strokeWidth', size: 1 },
      { name: 'a_strokeColor', size: 3 },
      { name: 'a_opacity', size: 1 },
      { name: 'a_haloWidth', size: 1 },
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
    x: number,
    y: number,
    size: number,
    color: [number, number, number],
    pickingIndex: number,
    strokeWidth: number = 0,
    strokeColor: [number, number, number] = [1, 1, 1],
    opacity: number = 1,
    haloWidth: number = 0,
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
    this.array[o + 9] = strokeWidth;
    this.array[o + 10] = strokeColor[0];
    this.array[o + 11] = strokeColor[1];
    this.array[o + 12] = strokeColor[2];
    this.array[o + 13] = opacity;
    this.array[o + 14] = haloWidth;
  }

  /**
   * Fast path for static config: copies a pre-built template then writes only
   * the per-node varying fields (x, y, pickingColor). Reduces 15 writes to
   * 1 TypedArray.set + 5 writes per node.
   */
  processNodeStatic(
    index: number,
    x: number,
    y: number,
    pickingIndex: number,
    template: Float32Array,
  ): void {
    const o = index * FLOATS_PER_VERTEX;
    this.array.set(template, o);
    this.array[o] = x;
    this.array[o + 1] = y;
    const [pr, pg, pb] = encodeId(pickingIndex);
    this.array[o + 6] = pr / 255;
    this.array[o + 7] = pg / 255;
    this.array[o + 8] = pb / 255;
  }

  /** Build a template Float32Array for processNodeStatic(). */
  static buildTemplate(
    size: number,
    color: [number, number, number],
    strokeWidth: number,
    strokeColor: [number, number, number],
    opacity: number,
    haloWidth: number,
  ): Float32Array {
    const t = new Float32Array(FLOATS_PER_VERTEX);
    t[2] = size;
    t[3] = color[0];
    t[4] = color[1];
    t[5] = color[2];
    t[9] = strokeWidth;
    t[10] = strokeColor[0];
    t[11] = strokeColor[1];
    t[12] = strokeColor[2];
    t[13] = opacity;
    t[14] = haloWidth;
    return t;
  }

  /** Return the full rendered diameter (node size + halo on both sides) in graph coords. */
  getNodeExtent(index: number): number {
    const offset = index * FLOATS_PER_VERTEX;
    return this.array[offset + 2] + this.array[offset + 14] * 2;
  }

  getNodeSize(index: number): number {
    return this.array[index * FLOATS_PER_VERTEX + 2];
  }

  getNodeHaloWidth(index: number): number {
    return this.array[index * FLOATS_PER_VERTEX + 14];
  }

  /** Patch style attributes for a single node without full reprocess. */
  patchNodeStyle(
    index: number,
    patch: {
      color?: [number, number, number];
      size?: number;
      strokeWidth?: number;
      strokeColor?: [number, number, number];
      opacity?: number;
      haloWidth?: number;
    },
  ): void {
    if (patch.color) this.patchAttribute(index, 'a_color', patch.color);
    if (patch.size !== undefined) this.patchAttribute(index, 'a_size', [patch.size]);
    if (patch.strokeWidth !== undefined)
      this.patchAttribute(index, 'a_strokeWidth', [patch.strokeWidth]);
    if (patch.strokeColor) this.patchAttribute(index, 'a_strokeColor', patch.strokeColor);
    if (patch.opacity !== undefined) this.patchAttribute(index, 'a_opacity', [patch.opacity]);
    if (patch.haloWidth !== undefined) this.patchAttribute(index, 'a_haloWidth', [patch.haloWidth]);
  }
}
