/**
 * NodeRect: renders nodes as rounded rectangles via 2 triangles (6 vertices).
 * Supports fill, stroke, borderRadius, opacity, and halo via SDF in fragment shader.
 * Stride: 18 floats per vertex.
 */

import { Program } from './program';
import type { RenderParams, AttributeLayout } from './program';
import { vertexShader } from './shaders/nodeRect.vert';
import { fragmentShader } from './shaders/nodeRect.frag';
import { encodeId } from '../picking';

const FLOATS_PER_VERTEX = 19;
const VERTICES_PER_ITEM = 6;

const CORNERS: [number, number][] = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
  [-1, 1],
];

export class NodeRectProgram extends Program {
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
      { name: 'a_center', size: 2 },
      { name: 'a_size', size: 2 },
      { name: 'a_corner', size: 2 },
      { name: 'a_color', size: 3 },
      { name: 'a_pickingColor', size: 3 },
      { name: 'a_strokeWidth', size: 1 },
      { name: 'a_strokeColor', size: 3 },
      { name: 'a_opacity', size: 1 },
      { name: 'a_haloWidth', size: 1 },
      { name: 'a_borderRadius', size: 1 },
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
    width: number,
    height: number,
    color: [number, number, number],
    pickingIndex: number,
    strokeWidth: number = 0,
    strokeColor: [number, number, number] = [1, 1, 1],
    opacity: number = 1,
    haloWidth: number = 0,
    borderRadius: number = 0,
  ): void {
    const [pr, pg, pb] = encodeId(pickingIndex);
    const pR = pr / 255,
      pG = pg / 255,
      pB = pb / 255;

    // Write first vertex fully, then copyWithin + patch corner for rest
    const base = index * VERTICES_PER_ITEM * FLOATS_PER_VERTEX;
    const [c0x, c0y] = CORNERS[0];
    this.array[base] = x;
    this.array[base + 1] = y;
    this.array[base + 2] = width;
    this.array[base + 3] = height;
    this.array[base + 4] = c0x;
    this.array[base + 5] = c0y;
    this.array[base + 6] = color[0];
    this.array[base + 7] = color[1];
    this.array[base + 8] = color[2];
    this.array[base + 9] = pR;
    this.array[base + 10] = pG;
    this.array[base + 11] = pB;
    this.array[base + 12] = strokeWidth;
    this.array[base + 13] = strokeColor[0];
    this.array[base + 14] = strokeColor[1];
    this.array[base + 15] = strokeColor[2];
    this.array[base + 16] = opacity;
    this.array[base + 17] = haloWidth;
    this.array[base + 18] = borderRadius;

    // Copy first vertex to remaining 5 vertices, then patch a_corner
    for (let v = 1; v < VERTICES_PER_ITEM; v++) {
      const dst = base + v * FLOATS_PER_VERTEX;
      this.array.copyWithin(dst, base, base + FLOATS_PER_VERTEX);
      this.array[dst + 4] = CORNERS[v][0];
      this.array[dst + 5] = CORNERS[v][1];
    }
  }

  /** Patch style attributes for a single rect node without full reprocess. */
  patchNodeStyle(
    index: number,
    patch: {
      color?: [number, number, number];
      width?: number;
      height?: number;
      strokeWidth?: number;
      strokeColor?: [number, number, number];
      opacity?: number;
      haloWidth?: number;
      borderRadius?: number;
    },
  ): void {
    if (patch.color) this.patchAttribute(index, 'a_color', patch.color);
    if (patch.width !== undefined && patch.height !== undefined) {
      this.patchAttribute(index, 'a_size', [patch.width, patch.height]);
    }
    if (patch.strokeWidth !== undefined)
      this.patchAttribute(index, 'a_strokeWidth', [patch.strokeWidth]);
    if (patch.strokeColor) this.patchAttribute(index, 'a_strokeColor', patch.strokeColor);
    if (patch.opacity !== undefined) this.patchAttribute(index, 'a_opacity', [patch.opacity]);
    if (patch.haloWidth !== undefined) this.patchAttribute(index, 'a_haloWidth', [patch.haloWidth]);
    if (patch.borderRadius !== undefined)
      this.patchAttribute(index, 'a_borderRadius', [patch.borderRadius]);
  }
}
