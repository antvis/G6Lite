/**
 * EdgeRect: renders thick edges as rectangles via 2 triangles (6 vertices).
 * Line width is computed in the vertex shader via normal offset in pixel space.
 * Supports dash pattern and opacity.
 * Stride: 15 floats per vertex (source.xy, target.xy, posCoef, normalCoef, lineWidth, color.rgb, pickingColor.rgb, dashCycle, opacity).
 */

import { Program } from './program.js';
import type { RenderParams, AttributeLayout } from './program.js';
import { vertexShader } from './shaders/edgeRect.vert.js';
import { fragmentShader } from './shaders/edgeRect.frag.js';
import { encodeId } from '../picking.js';

const FLOATS_PER_VERTEX = 17;
const VERTICES_PER_ITEM = 6;

// 6 vertices: (posCoef, normalCoef)
// posCoef: 0=source, 1=target | normalCoef: -1 or +1
const COEFFICIENTS: [number, number][] = [
  [0, -1],
  [1, -1],
  [0, 1],
  [1, -1],
  [1, 1],
  [0, 1],
];

export class EdgeRectProgram extends Program {
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
      { name: 'a_posCoef', size: 1 },
      { name: 'a_normalCoef', size: 1 },
      { name: 'a_lineWidth', size: 1 },
      { name: 'a_color', size: 3 },
      { name: 'a_pickingColor', size: 3 },
      { name: 'a_dashCycle', size: 1 },
      { name: 'a_opacity', size: 1 },
      { name: 'a_clampSource', size: 1 },
      { name: 'a_clampTarget', size: 1 },
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
    sx: number,
    sy: number,
    tx: number,
    ty: number,
    color: [number, number, number],
    pickingIndex: number,
    lineWidth: number,
    dashCycle: number = 0,
    opacity: number = 1,
    clampSource: number = 0,
    clampTarget: number = 0,
  ): void {
    const [pr, pg, pb] = encodeId(pickingIndex);
    const pR = pr / 255,
      pG = pg / 255,
      pB = pb / 255;

    // Write first vertex fully, then copyWithin + patch coefficients for rest
    const base = index * VERTICES_PER_ITEM * FLOATS_PER_VERTEX;
    const [pc0, nc0] = COEFFICIENTS[0];
    this.array[base] = sx;
    this.array[base + 1] = sy;
    this.array[base + 2] = tx;
    this.array[base + 3] = ty;
    this.array[base + 4] = pc0;
    this.array[base + 5] = nc0;
    this.array[base + 6] = lineWidth;
    this.array[base + 7] = color[0];
    this.array[base + 8] = color[1];
    this.array[base + 9] = color[2];
    this.array[base + 10] = pR;
    this.array[base + 11] = pG;
    this.array[base + 12] = pB;
    this.array[base + 13] = dashCycle;
    this.array[base + 14] = opacity;
    this.array[base + 15] = clampSource;
    this.array[base + 16] = clampTarget;

    // Copy first vertex to remaining 5 vertices, then patch a_posCoef and a_normalCoef
    for (let v = 1; v < VERTICES_PER_ITEM; v++) {
      const dst = base + v * FLOATS_PER_VERTEX;
      this.array.copyWithin(dst, base, base + FLOATS_PER_VERTEX);
      this.array[dst + 4] = COEFFICIENTS[v][0];
      this.array[dst + 5] = COEFFICIENTS[v][1];
    }
  }

  /** Patch source and target positions for a single edge. */
  patchEdgeEndpoints(index: number, sx: number, sy: number, tx: number, ty: number): void {
    const baseOffset = index * VERTICES_PER_ITEM * FLOATS_PER_VERTEX;
    for (let v = 0; v < VERTICES_PER_ITEM; v++) {
      const o = baseOffset + v * FLOATS_PER_VERTEX;
      this.array[o] = sx; // a_source.x
      this.array[o + 1] = sy; // a_source.y
      this.array[o + 2] = tx; // a_target.x
      this.array[o + 3] = ty; // a_target.y
    }
  }

  /** Patch style attributes for a single edge. */
  patchEdgeStyle(
    index: number,
    patch: {
      color?: [number, number, number];
      lineWidth?: number;
      dashCycle?: number;
      opacity?: number;
      clampSource?: number;
      clampTarget?: number;
    },
  ): void {
    if (patch.color) this.patchAttribute(index, 'a_color', patch.color);
    if (patch.lineWidth !== undefined) this.patchAttribute(index, 'a_lineWidth', [patch.lineWidth]);
    if (patch.dashCycle !== undefined) this.patchAttribute(index, 'a_dashCycle', [patch.dashCycle]);
    if (patch.opacity !== undefined) this.patchAttribute(index, 'a_opacity', [patch.opacity]);
    if (patch.clampSource !== undefined)
      this.patchAttribute(index, 'a_clampSource', [patch.clampSource]);
    if (patch.clampTarget !== undefined)
      this.patchAttribute(index, 'a_clampTarget', [patch.clampTarget]);
  }
}
