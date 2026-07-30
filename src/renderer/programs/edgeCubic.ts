/**
 * EdgeCubic: renders cubic bezier edges as tessellated GL_LINES.
 * Used for mind map S-curve edges.
 * CPU computes curve points; each edge → SEGMENTS line segments → SEGMENTS*2 vertices.
 * Stride: 9 floats per vertex (position.xy, color.rgb, pickingColor.rgb, opacity).
 */

import { encodeId } from '../picking';
import type { AttributeLayout } from './program';
import { Program } from './program';
import { fragmentShader } from './shaders/edgeCubic.frag';
import { vertexShader } from './shaders/edgeCubic.vert';

const FLOATS_PER_VERTEX = 9;
const SEGMENTS = 16;
const VERTICES_PER_ITEM = SEGMENTS * 2;

export class EdgeCubicProgram extends Program {
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
    return 'lines' as const;
  }

  getAttributeLayout(): AttributeLayout[] {
    return [
      { name: 'a_position', size: 2 },
      { name: 'a_color', size: 3 },
      { name: 'a_pickingColor', size: 3 },
      { name: 'a_opacity', size: 1 },
    ];
  }

  processEdge(
    index: number,
    sx: number,
    sy: number,
    tx: number,
    ty: number,
    color: [number, number, number],
    pickingIndex: number,
    curveOffset: number,
    direction: 'LR' | 'RL' = 'LR',
    opacity = 1,
  ): void {
    const [pr, pg, pb] = encodeId(pickingIndex);
    const pR = pr / 255,
      pG = pg / 255,
      pB = pb / 255;

    // Cubic bezier control points for S-curve
    let cpx1: number, cpy1: number, cpx2: number, cpy2: number;

    if (direction === 'LR') {
      cpx1 = sx + curveOffset;
      cpy1 = sy;
      cpx2 = tx - curveOffset;
      cpy2 = ty;
    } else {
      cpx1 = sx - curveOffset;
      cpy1 = sy;
      cpx2 = tx + curveOffset;
      cpy2 = ty;
    }

    const base = index * VERTICES_PER_ITEM * FLOATS_PER_VERTEX;

    for (let i = 0; i < SEGMENTS; i++) {
      const t0 = i / SEGMENTS;
      const t1 = (i + 1) / SEGMENTS;

      const x0 = cubicBezier(sx, cpx1, cpx2, tx, t0);
      const y0 = cubicBezier(sy, cpy1, cpy2, ty, t0);
      const x1 = cubicBezier(sx, cpx1, cpx2, tx, t1);
      const y1 = cubicBezier(sy, cpy1, cpy2, ty, t1);

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

/** Cubic bezier: B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3 */
function cubicBezier(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;
  return mt3 * p0 + 3 * mt2 * t * p1 + 3 * mt * t2 * p2 + t3 * p3;
}
