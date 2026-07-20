/**
 * EdgeArc: renders curved edges as tessellated GL_LINES (quadratic bezier).
 * CPU computes curve points; each edge → SEGMENTS line segments → SEGMENTS*2 vertices.
 * Stride: 9 floats per vertex (position.xy, color.rgb, pickingColor.rgb, opacity).
 */

import { encodeId } from '../picking.js';
import type { AttributeLayout, RenderParams } from './program.js';
import { Program } from './program.js';
import { fragmentShader } from './shaders/edgeArc.frag.js';
import { vertexShader } from './shaders/edgeArc.vert.js';

const FLOATS_PER_VERTEX = 9;
const SEGMENTS = 16;
const VERTICES_PER_ITEM = SEGMENTS * 2;

export class EdgeArcProgram extends Program {
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
    return this.gl.LINES;
  }

  getAttributeLayout(): AttributeLayout[] {
    return [
      { name: 'a_position', size: 2 },
      { name: 'a_color', size: 3 },
      { name: 'a_pickingColor', size: 3 },
      { name: 'a_opacity', size: 1 },
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
    curvature: number,
    opacity = 1,
  ): void {
    const [pr, pg, pb] = encodeId(pickingIndex);
    const pR = pr / 255,
      pG = pg / 255,
      pB = pb / 255;

    // Quadratic bezier control point: perpendicular offset from midpoint
    const mx = (sx + tx) * 0.5;
    const my = (sy + ty) * 0.5;
    const dx = tx - sx;
    const dy = ty - sy;
    // Perpendicular direction
    const cpx = mx - dy * curvature;
    const cpy = my + dx * curvature;

    const base = index * VERTICES_PER_ITEM * FLOATS_PER_VERTEX;

    for (let i = 0; i < SEGMENTS; i++) {
      const t0 = i / SEGMENTS;
      const t1 = (i + 1) / SEGMENTS;

      const x0 = bezier(sx, cpx, tx, t0);
      const y0 = bezier(sy, cpy, ty, t0);
      const x1 = bezier(sx, cpx, tx, t1);
      const y1 = bezier(sy, cpy, ty, t1);

      const o = base + i * 2 * FLOATS_PER_VERTEX;
      // Start vertex
      this.array[o] = x0;
      this.array[o + 1] = y0;
      this.array[o + 2] = color[0];
      this.array[o + 3] = color[1];
      this.array[o + 4] = color[2];
      this.array[o + 5] = pR;
      this.array[o + 6] = pG;
      this.array[o + 7] = pB;
      this.array[o + 8] = opacity;
      // End vertex
      this.array[o + 9] = x1;
      this.array[o + 10] = y1;
      this.array[o + 11] = color[0];
      this.array[o + 12] = color[1];
      this.array[o + 13] = color[2];
      this.array[o + 14] = pR;
      this.array[o + 15] = pG;
      this.array[o + 16] = pB;
      this.array[o + 17] = opacity;
    }
  }
}

/** Quadratic bezier: (1-t)^2 * a + 2(1-t)t * cp + t^2 * b */
function bezier(a: number, cp: number, b: number, t: number): number {
  const mt = 1 - t;
  return mt * mt * a + 2 * mt * t * cp + t * t * b;
}
