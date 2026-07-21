/**
 * EdgeLine: renders edges as GL_LINES with per-edge color and picking.
 * Each vertex carries BOTH endpoints (a_source/a_target) plus clamp inputs so
 * the shader can inset endpoints toward each other by node radius + arrow size.
 * a_posCoef selects which end this vertex is (0=source, 1=target).
 * Clamping is shader-side (uses u_scale) so it stays correct on zoom.
 * Stride: 16 floats per vertex, 2 vertices per edge.
 */

import { encodeId } from '../picking.js';
import type { AttributeLayout, RenderParams } from './program.js';
import { Program } from './program.js';
import { fragmentShader } from './shaders/edgeLine.frag.js';
import { vertexShader } from './shaders/edgeLine.vert.js';

const FLOATS_PER_VERTEX = 16;

export class EdgeLineProgram extends Program {
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
    return 2;
  }
  getDrawMethod() {
    return this.gl.LINES;
  }

  getAttributeLayout(): AttributeLayout[] {
    return [
      { name: 'a_source', size: 2 },
      { name: 'a_target', size: 2 },
      { name: 'a_posCoef', size: 1 },
      { name: 'a_srcRadius', size: 1 },
      { name: 'a_tgtRadius', size: 1 },
      { name: 'a_srcArrowPx', size: 1 },
      { name: 'a_tgtArrowPx', size: 1 },
      { name: 'a_color', size: 3 },
      { name: 'a_opacity', size: 1 },
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
   * @param srcRadius - source node radius in GRAPH coords (not multiplied by zoom)
   * @param tgtRadius - target node radius in GRAPH coords
   * @param srcArrowPx - fixed pixel inset at source end (arrowSize if startArrow, else 0)
   * @param tgtArrowPx - fixed pixel inset at target end (arrowSize if endArrow, else 0)
   * @param pickingIndex - global picking index for this edge
   */
  processEdge(
    index: number,
    sx: number,
    sy: number,
    tx: number,
    ty: number,
    color: [number, number, number],
    pickingIndex: number,
    srcRadius: number = 0,
    tgtRadius: number = 0,
    srcArrowPx: number = 0,
    tgtArrowPx: number = 0,
    opacity: number = 1,
  ): void {
    const [pr, pg, pb] = encodeId(pickingIndex);
    const pR = pr / 255;
    const pG = pg / 255;
    const pB = pb / 255;

    const base = index * 2 * FLOATS_PER_VERTEX;
    // Vertex 0 (source end, a_posCoef = 0)
    this.array[base] = sx;
    this.array[base + 1] = sy;
    this.array[base + 2] = tx;
    this.array[base + 3] = ty;
    this.array[base + 4] = 0; // a_posCoef
    this.array[base + 5] = srcRadius;
    this.array[base + 6] = tgtRadius;
    this.array[base + 7] = srcArrowPx;
    this.array[base + 8] = tgtArrowPx;
    this.array[base + 9] = color[0];
    this.array[base + 10] = color[1];
    this.array[base + 11] = color[2];
    this.array[base + 12] = opacity;
    this.array[base + 13] = pR;
    this.array[base + 14] = pG;
    this.array[base + 15] = pB;
    // Vertex 1 (target end): identical except a_posCoef = 1
    const v1 = base + FLOATS_PER_VERTEX;
    this.array[v1] = sx;
    this.array[v1 + 1] = sy;
    this.array[v1 + 2] = tx;
    this.array[v1 + 3] = ty;
    this.array[v1 + 4] = 1; // a_posCoef
    this.array[v1 + 5] = srcRadius;
    this.array[v1 + 6] = tgtRadius;
    this.array[v1 + 7] = srcArrowPx;
    this.array[v1 + 8] = tgtArrowPx;
    this.array[v1 + 9] = color[0];
    this.array[v1 + 10] = color[1];
    this.array[v1 + 11] = color[2];
    this.array[v1 + 12] = opacity;
    this.array[v1 + 13] = pR;
    this.array[v1 + 14] = pG;
    this.array[v1 + 15] = pB;
  }

  /** Patch source and target positions for a single edge (both vertices). */
  patchEdgeEndpoints(index: number, sx: number, sy: number, tx: number, ty: number): void {
    const base = index * 2 * FLOATS_PER_VERTEX;
    for (let v = 0; v < 2; v++) {
      const o = base + v * FLOATS_PER_VERTEX;
      this.array[o] = sx; // a_source.x
      this.array[o + 1] = sy; // a_source.y
      this.array[o + 2] = tx; // a_target.x
      this.array[o + 3] = ty; // a_target.y
    }
    this.markItemDirty(index);
  }

  /** Patch style attributes for a single edge. */
  patchEdgeStyle(
    index: number,
    patch: {
      color?: [number, number, number];
      opacity?: number;
      srcRadius?: number;
      tgtRadius?: number;
      srcArrowPx?: number;
      tgtArrowPx?: number;
    },
  ): void {
    if (patch.color) this.patchAttribute(index, 'a_color', patch.color);
    if (patch.opacity !== undefined) this.patchAttribute(index, 'a_opacity', [patch.opacity]);
    if (patch.srcRadius !== undefined) this.patchAttribute(index, 'a_srcRadius', [patch.srcRadius]);
    if (patch.tgtRadius !== undefined) this.patchAttribute(index, 'a_tgtRadius', [patch.tgtRadius]);
    if (patch.srcArrowPx !== undefined)
      this.patchAttribute(index, 'a_srcArrowPx', [patch.srcArrowPx]);
    if (patch.tgtArrowPx !== undefined)
      this.patchAttribute(index, 'a_tgtArrowPx', [patch.tgtArrowPx]);
  }
}
