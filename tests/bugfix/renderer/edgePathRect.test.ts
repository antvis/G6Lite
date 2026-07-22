import { describe, expect, it } from 'vitest';
import {
  createCubicPath,
  createQuadraticPath,
  findPathBoundarySample,
  getRectBoundaryDistance,
  sampleEdgePath,
} from '@src/renderer/edgePath.js';

describe('cubic edge paths', () => {
  it('samples a self-loop away from its node center', () => {
    const path = createCubicPath(
      { x: -5, y: 0 },
      { x: -20, y: -30 },
      { x: 20, y: -30 },
      { x: 5, y: 0 },
    );

    const sample = sampleEdgePath(path, 0.5);
    expect(sample.point.y).toBeLessThan(0);
    expect(sample.point).not.toEqual({ x: 0, y: 0 });
  });
});

describe('rectangular node edge boundaries', () => {
  it('computes horizontal, vertical, and diagonal ray intersections', () => {
    expect(getRectBoundaryDistance(5, 0, 40, 20)).toBeCloseTo(40);
    expect(getRectBoundaryDistance(0, -3, 40, 20)).toBeCloseTo(20);
    expect(getRectBoundaryDistance(1, 1, 40, 20)).toBeCloseTo(20 * Math.SQRT2);
  });

  it('samples a curved edge on the rectangular target boundary', () => {
    const target = { x: 0, y: 0 };
    const boundary = { halfWidth: 40, halfHeight: 10 };
    const path = createQuadraticPath({ x: 0, y: 80 }, target, 0.5);

    const sample = findPathBoundarySample(path, target, boundary, 'target');
    const boundaryLevel = Math.max(
      Math.abs(sample.point.x - target.x) / boundary.halfWidth,
      Math.abs(sample.point.y - target.y) / boundary.halfHeight,
    );

    expect(sample.t).toBeGreaterThan(0);
    expect(sample.t).toBeLessThan(1);
    expect(boundaryLevel).toBeCloseTo(1, 5);
    expect(Math.abs(sample.point.y - target.y)).toBeCloseTo(boundary.halfHeight, 5);
    expect(Math.abs(sample.point.x - target.x)).toBeLessThan(boundary.halfWidth);
  });
});
