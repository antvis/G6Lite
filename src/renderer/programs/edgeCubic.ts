/**
 * EdgeCubic: renders mind-map S-curves as continuous thick triangle strips.
 * Visual and picking widths are independent, while dash distance remains
 * continuous across the tessellated cubic path.
 */

import type { AttributeLayout } from './program';
import { Program } from './program';
import { EDGE_CURVE_SEGMENTS } from '../edgePath';
import { fragmentShader } from './shaders/edgeArc.frag';
import { vertexShader } from './shaders/edgeArc.vert';

const FLOATS_PER_VERTEX = 14;
export const EDGE_CUBIC_SEGMENTS = EDGE_CURVE_SEGMENTS;
const VERTICES_PER_ITEM = (EDGE_CUBIC_SEGMENTS + 1) * 2 + 2;

function cubicBezier(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

function cubicTangent(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const mt = 1 - t;
  return 3 * mt * mt * (p1 - p0) + 6 * mt * t * (p2 - p1) + 3 * t * t * (p3 - p2);
}

function writeVertex(
  array: Float32Array,
  offset: number,
  x: number,
  y: number,
  normalX: number,
  normalY: number,
  normalCoef: number,
  lineWidth: number,
  dashCycle: number,
  pathDistance: number,
  opacity: number,
  color: [number, number, number],
  pickingIndex: number,
  hitAreaWidth: number,
): void {
  array[offset] = x;
  array[offset + 1] = y;
  array[offset + 2] = normalX;
  array[offset + 3] = normalY;
  array[offset + 4] = normalCoef;
  array[offset + 5] = lineWidth;
  array[offset + 6] = dashCycle;
  array[offset + 7] = pathDistance;
  array[offset + 8] = opacity;
  array[offset + 9] = color[0];
  array[offset + 10] = color[1];
  array[offset + 11] = color[2];
  array[offset + 12] = pickingIndex;
  array[offset + 13] = hitAreaWidth;
}

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
    return 'triangle strip' as const;
  }

  getAttributeLayout(): AttributeLayout[] {
    return [
      { name: 'a_position', size: 2 },
      { name: 'a_normalSide', size: 3 },
      { name: 'a_style', size: 4 },
      { name: 'a_color', size: 3 },
      { name: 'a_pickingIndex', size: 1 },
      { name: 'a_hitAreaWidth', size: 1 },
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
    lineWidth = 1,
    hitAreaWidth = lineWidth,
    dashCycle = 0,
    opacity = 1,
  ): void {
    const directionSign = direction === 'LR' ? 1 : -1;
    const cpx1 = sx + curveOffset * directionSign;
    const cpy1 = sy;
    const cpx2 = tx - curveOffset * directionSign;
    const cpy2 = ty;
    const base = index * VERTICES_PER_ITEM * FLOATS_PER_VERTEX;

    let x = sx;
    let y = sy;
    let pathDistance = 0;
    let tangentX = cubicTangent(sx, cpx1, cpx2, tx, 0);
    let tangentY = cubicTangent(sy, cpy1, cpy2, ty, 0);
    let tangentLength = Math.hypot(tangentX, tangentY);
    if (tangentLength < 1e-8) {
      tangentX = tx - sx;
      tangentY = ty - sy;
      tangentLength = Math.hypot(tangentX, tangentY);
    }
    let normalX = tangentLength > 1e-8 ? -tangentY / tangentLength : 0;
    let normalY = tangentLength > 1e-8 ? tangentX / tangentLength : 1;
    let vertex = 0;

    for (const side of [-1, -1, 1]) {
      writeVertex(
        this.array,
        base + vertex++ * FLOATS_PER_VERTEX,
        x,
        y,
        normalX,
        normalY,
        side,
        lineWidth,
        dashCycle,
        pathDistance,
        opacity,
        color,
        pickingIndex,
        hitAreaWidth,
      );
    }

    for (let segment = 0; segment < EDGE_CUBIC_SEGMENTS; segment++) {
      const t = (segment + 1) / EDGE_CUBIC_SEGMENTS;
      const nextX = cubicBezier(sx, cpx1, cpx2, tx, t);
      const nextY = cubicBezier(sy, cpy1, cpy2, ty, t);
      const segmentX = nextX - x;
      const segmentY = nextY - y;
      pathDistance += Math.hypot(segmentX, segmentY);

      tangentX = cubicTangent(sx, cpx1, cpx2, tx, t);
      tangentY = cubicTangent(sy, cpy1, cpy2, ty, t);
      tangentLength = Math.hypot(tangentX, tangentY);
      if (tangentLength < 1e-8) {
        tangentX = segmentX;
        tangentY = segmentY;
        tangentLength = Math.hypot(tangentX, tangentY);
      }
      if (tangentLength >= 1e-8) {
        normalX = -tangentY / tangentLength;
        normalY = tangentX / tangentLength;
      }

      for (const side of [-1, 1]) {
        writeVertex(
          this.array,
          base + vertex++ * FLOATS_PER_VERTEX,
          nextX,
          nextY,
          normalX,
          normalY,
          side,
          lineWidth,
          dashCycle,
          pathDistance,
          opacity,
          color,
          pickingIndex,
          hitAreaWidth,
        );
      }
      x = nextX;
      y = nextY;
    }

    writeVertex(
      this.array,
      base + vertex * FLOATS_PER_VERTEX,
      x,
      y,
      normalX,
      normalY,
      1,
      lineWidth,
      dashCycle,
      pathDistance,
      opacity,
      color,
      pickingIndex,
      hitAreaWidth,
    );
  }
}
