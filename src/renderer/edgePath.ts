import type { GraphEdge, LayoutNode } from '../types.js';

export interface Point {
  x: number;
  y: number;
}

export interface QuadraticEdgePath {
  type: 'quadratic';
  p0: Point;
  cp: Point;
  p1: Point;
}

export interface LineEdgePath {
  type: 'line';
  p0: Point;
  p1: Point;
}

export interface CubicEdgePath {
  type: 'cubic';
  p0: Point;
  cp1: Point;
  cp2: Point;
  p1: Point;
}

export type EdgePath = LineEdgePath | QuadraticEdgePath | CubicEdgePath;

export interface BoundarySample {
  point: Point;
  tangent: Point;
  t: number;
}

export interface RectBoundary {
  halfWidth: number;
  halfHeight: number;
}

/** A circle radius, or the half-extents of an axis-aligned rectangle. */
export type NodeBoundary = number | RectBoundary;

interface ParallelLike {
  groupSize: number;
  offset: number;
  directionSign: 1 | -1;
}

export function getParallelEdgeCurvature(
  edge: GraphEdge,
  source: LayoutNode,
  target: LayoutNode,
  fallback: number,
): number {
  const parallel = (edge as GraphEdge & { parallel?: ParallelLike }).parallel;
  if (!parallel) return fallback;
  if (parallel.groupSize <= 1) return 0;
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const length = Math.hypot(dx, dy);
  if (length <= 1e-6) return 0;
  return (parallel.offset * parallel.directionSign) / length;
}

export function createQuadraticPath(
  source: Point,
  target: Point,
  curvature: number,
): QuadraticEdgePath {
  const mx = (source.x + target.x) * 0.5;
  const my = (source.y + target.y) * 0.5;
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  return {
    type: 'quadratic',
    p0: source,
    cp: {
      x: mx - dy * curvature,
      y: my + dx * curvature,
    },
    p1: target,
  };
}

export function createLinePath(source: Point, target: Point): LineEdgePath {
  return { type: 'line', p0: source, p1: target };
}

export function createCubicPath(p0: Point, cp1: Point, cp2: Point, p1: Point): CubicEdgePath {
  return { type: 'cubic', p0, cp1, cp2, p1 };
}

export function sampleEdgePath(path: EdgePath, t: number): { point: Point; tangent: Point } {
  const tt = Math.max(0, Math.min(1, t));
  if (path.type === 'line') {
    return {
      point: {
        x: path.p0.x + (path.p1.x - path.p0.x) * tt,
        y: path.p0.y + (path.p1.y - path.p0.y) * tt,
      },
      tangent: {
        x: path.p1.x - path.p0.x,
        y: path.p1.y - path.p0.y,
      },
    };
  }

  if (path.type === 'cubic') {
    const mt = 1 - tt;
    return {
      point: {
        x:
          mt * mt * mt * path.p0.x +
          3 * mt * mt * tt * path.cp1.x +
          3 * mt * tt * tt * path.cp2.x +
          tt * tt * tt * path.p1.x,
        y:
          mt * mt * mt * path.p0.y +
          3 * mt * mt * tt * path.cp1.y +
          3 * mt * tt * tt * path.cp2.y +
          tt * tt * tt * path.p1.y,
      },
      tangent: {
        x:
          3 * mt * mt * (path.cp1.x - path.p0.x) +
          6 * mt * tt * (path.cp2.x - path.cp1.x) +
          3 * tt * tt * (path.p1.x - path.cp2.x),
        y:
          3 * mt * mt * (path.cp1.y - path.p0.y) +
          6 * mt * tt * (path.cp2.y - path.cp1.y) +
          3 * tt * tt * (path.p1.y - path.cp2.y),
      },
    };
  }

  const mt = 1 - tt;
  return {
    point: {
      x: mt * mt * path.p0.x + 2 * mt * tt * path.cp.x + tt * tt * path.p1.x,
      y: mt * mt * path.p0.y + 2 * mt * tt * path.cp.y + tt * tt * path.p1.y,
    },
    tangent: {
      x: 2 * mt * (path.cp.x - path.p0.x) + 2 * tt * (path.p1.x - path.cp.x),
      y: 2 * mt * (path.cp.y - path.p0.y) + 2 * tt * (path.p1.y - path.cp.y),
    },
  };
}

function isRectBoundary(boundary: NodeBoundary): boundary is RectBoundary {
  return typeof boundary !== 'number';
}

/**
 * Distance from a node center to its boundary along `direction`.
 *
 * Rectangles use the ray/AABB intersection formula. Keeping this in graph
 * coordinates lets edge shaders apply zoom without rebuilding their buffers.
 */
export function getBoundaryDistance(direction: Point, boundary: NodeBoundary): number {
  if (!isRectBoundary(boundary)) return Math.max(0, boundary);

  return getRectBoundaryDistance(direction.x, direction.y, boundary.halfWidth, boundary.halfHeight);
}

/** Numeric hot-path variant used while filling edge buffers. */
export function getRectBoundaryDistance(
  directionX: number,
  directionY: number,
  halfWidth: number,
  halfHeight: number,
): number {
  const length = Math.hypot(directionX, directionY);
  if (length <= 1e-6) return 0;

  halfWidth = Math.max(0, halfWidth);
  halfHeight = Math.max(0, halfHeight);
  if (halfWidth <= 0 || halfHeight <= 0) return 0;

  const ux = directionX / length;
  const uy = directionY / length;
  const inverseDistance = Math.max(Math.abs(ux) / halfWidth, Math.abs(uy) / halfHeight);
  return inverseDistance > 1e-12 ? 1 / inverseDistance : 0;
}

function boundaryLevel(point: Point, center: Point, boundary: NodeBoundary): number {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  if (!isRectBoundary(boundary)) {
    const radius = Math.max(0, boundary);
    return radius > 0 ? Math.hypot(dx, dy) / radius : Infinity;
  }

  const halfWidth = Math.max(0, boundary.halfWidth);
  const halfHeight = Math.max(0, boundary.halfHeight);
  if (halfWidth <= 0 || halfHeight <= 0) return Infinity;
  return Math.max(Math.abs(dx) / halfWidth, Math.abs(dy) / halfHeight);
}

function normalizeOrFallback(tangent: Point, fallback: Point): Point {
  const len = Math.hypot(tangent.x, tangent.y);
  if (len > 1e-6) return { x: tangent.x / len, y: tangent.y / len };
  const fallbackLen = Math.hypot(fallback.x, fallback.y);
  if (fallbackLen > 1e-6) return { x: fallback.x / fallbackLen, y: fallback.y / fallbackLen };
  return { x: 1, y: 0 };
}

function fallbackBoundarySample(
  path: EdgePath,
  center: Point,
  boundary: NodeBoundary,
  end: 'source' | 'target',
): BoundarySample {
  const t = end === 'target' ? 1 : 0;
  const sample = sampleEdgePath(path, t);
  const unit = normalizeOrFallback(sample.tangent, {
    x: path.type === 'line' ? path.p1.x - path.p0.x : path.p1.x - path.p0.x,
    y: path.type === 'line' ? path.p1.y - path.p0.y : path.p1.y - path.p0.y,
  });
  const sign = end === 'target' ? -1 : 1;
  const distance = getBoundaryDistance({ x: unit.x * sign, y: unit.y * sign }, boundary);
  return {
    point: {
      x: center.x + unit.x * distance * sign,
      y: center.y + unit.y * distance * sign,
    },
    tangent: sample.tangent,
    t,
  };
}

/**
 * Finds where an edge path exits a node boundary near either endpoint.
 *
 * Arc edges are rendered center-to-center and visually clipped by the node fill.
 * For high-curvature or very short parallel edges, projecting the endpoint
 * tangent by a scalar radius can miss the actual visible curve. This returns
 * the nearest path/boundary intersection to the requested endpoint. A number
 * keeps the legacy circular-node behavior; rect half-extents support
 * axis-aligned rectangular nodes.
 */
export function findPathBoundarySample(
  path: EdgePath,
  center: Point,
  boundary: NodeBoundary,
  end: 'source' | 'target',
): BoundarySample {
  const hasBoundary = isRectBoundary(boundary)
    ? boundary.halfWidth > 0 && boundary.halfHeight > 0
    : boundary > 0;
  if (!hasBoundary) {
    const t = end === 'target' ? 1 : 0;
    return { ...sampleEdgePath(path, t), t };
  }

  const steps = 64;
  let insideT = end === 'target' ? 1 : 0;
  let outsideT: number | null = null;

  if (end === 'target') {
    for (let step = steps - 1; step >= 0; step--) {
      const t = step / steps;
      const sample = sampleEdgePath(path, t);
      if (boundaryLevel(sample.point, center, boundary) >= 1) {
        outsideT = t;
        break;
      }
      insideT = t;
    }
  } else {
    for (let step = 1; step <= steps; step++) {
      const t = step / steps;
      const sample = sampleEdgePath(path, t);
      if (boundaryLevel(sample.point, center, boundary) >= 1) {
        outsideT = t;
        break;
      }
      insideT = t;
    }
  }

  if (outsideT === null) {
    return fallbackBoundarySample(path, center, boundary, end);
  }

  let low = end === 'target' ? outsideT : insideT;
  let high = end === 'target' ? insideT : outsideT;
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) * 0.5;
    const level = boundaryLevel(sampleEdgePath(path, mid).point, center, boundary);
    if (end === 'target') {
      if (level >= 1) low = mid;
      else high = mid;
    } else if (level >= 1) {
      high = mid;
    } else {
      low = mid;
    }
  }

  const t = (low + high) * 0.5;
  return { ...sampleEdgePath(path, t), t };
}
