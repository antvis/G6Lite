import { describe, expect, it } from 'vitest';
import type { InternalEdge } from '../dataModel.js';
import { DataModel } from '../dataModel.js';
import {
  createQuadraticPath,
  findPathBoundarySample,
  getParallelEdgeCurvature,
} from '../renderer/edgePath.js';
import {
  processParallelEdges,
  resolveParallelEdgesConfig,
} from '../transforms/processParallelEdges.js';
import type { GraphEdge, LayoutNode, ParallelEdgeMeta } from '../types.js';

function makeDataModel() {
  const dm = new DataModel({ theme: {} });
  dm.replaceData(
    [
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 100, y: 0 },
      { id: 'c', x: 0, y: 100 },
    ],
    [],
  );
  dm.getChanges();
  return dm;
}

describe('processParallelEdges', () => {
  it('keeps a single edge centered', () => {
    const dm = makeDataModel();
    const id = dm.addEdge({ source: 'a', target: 'b' });
    processParallelEdges(
      dm.getEdges() as InternalEdge[],
      resolveParallelEdgesConfig(['process-parallel-edges'], undefined),
    );

    const edge = dm.getEdge(id)!;
    expect(edge.parallel).toMatchObject({ groupSize: 1, groupIndex: 0, offset: 0 });
  });

  it('assigns centered offsets for same-direction parallel edges', () => {
    const dm = makeDataModel();
    dm.addEdges([
      { id: 'e1', source: 'a', target: 'b' },
      { id: 'e2', source: 'a', target: 'b' },
      { id: 'e3', source: 'a', target: 'b' },
    ]);

    processParallelEdges(
      dm.getEdges() as InternalEdge[],
      resolveParallelEdgesConfig(undefined, { parallelEdges: { enabled: true, offset: 20 } }),
    );

    expect(dm.getEdge('e1')!.parallel?.offset).toBe(-20);
    expect(dm.getEdge('e2')!.parallel?.offset).toBe(0);
    expect(dm.getEdge('e3')!.parallel?.offset).toBe(20);
  });

  it('groups reverse edges when includeReverse is enabled', () => {
    const dm = makeDataModel();
    dm.addEdges([
      { id: 'ab', source: 'a', target: 'b' },
      { id: 'ba', source: 'b', target: 'a' },
    ]);

    processParallelEdges(
      dm.getEdges() as InternalEdge[],
      resolveParallelEdgesConfig(undefined, {
        parallelEdges: { enabled: true, offset: 20, includeReverse: true },
      }),
    );

    const ab = dm.getEdge('ab')!.parallel!;
    const ba = dm.getEdge('ba')!.parallel!;
    expect(ab.groupKey).toBe(ba.groupKey);
    expect(ab.groupSize).toBe(2);
    expect(ba.groupSize).toBe(2);
    expect(ab.directionSign).toBe(1);
    expect(ba.directionSign).toBe(-1);
  });

  it('does not group reverse edges when includeReverse is disabled', () => {
    const dm = makeDataModel();
    dm.addEdges([
      { id: 'ab', source: 'a', target: 'b' },
      { id: 'ba', source: 'b', target: 'a' },
    ]);

    processParallelEdges(
      dm.getEdges() as InternalEdge[],
      resolveParallelEdgesConfig(undefined, {
        parallelEdges: { enabled: true, includeReverse: false },
      }),
    );

    expect(dm.getEdge('ab')!.parallel?.groupSize).toBe(1);
    expect(dm.getEdge('ba')!.parallel?.groupSize).toBe(1);
    expect(dm.getEdge('ab')!.parallel?.groupKey).not.toBe(dm.getEdge('ba')!.parallel?.groupKey);
  });
});

describe('parallel edge curvature', () => {
  const a: LayoutNode = { id: 'a', x: 0, y: 0 };
  const b: LayoutNode = { id: 'b', x: 100, y: 0 };

  function edgeWithParallel(
    source: string,
    target: string,
    parallel: Pick<ParallelEdgeMeta, 'groupSize' | 'offset' | 'directionSign'>,
  ): GraphEdge {
    return { source, target, parallel } as GraphEdge & {
      parallel: Pick<ParallelEdgeMeta, 'groupSize' | 'offset' | 'directionSign'>;
    };
  }

  it('returns zero for single-edge groups', () => {
    expect(
      getParallelEdgeCurvature(
        edgeWithParallel('a', 'b', { groupSize: 1, offset: 0, directionSign: 1 }),
        a,
        b,
        0.3,
      ),
    ).toBe(0);
  });

  it('uses directionSign so reverse edges separate instead of sharing the same path', () => {
    const forward = getParallelEdgeCurvature(
      edgeWithParallel('a', 'b', { groupSize: 2, offset: -10, directionSign: 1 }),
      a,
      b,
      0.3,
    );
    const reverse = getParallelEdgeCurvature(
      edgeWithParallel('b', 'a', { groupSize: 2, offset: 10, directionSign: -1 }),
      b,
      a,
      0.3,
    );

    expect(forward).toBeCloseTo(-0.1);
    expect(reverse).toBeCloseTo(-0.1);
  });
});

describe('parallel edge arrow boundary sampling', () => {
  it('uses the visible curve/circle intersection near the target for close nodes', () => {
    const source = { x: 0, y: 48 };
    const target = { x: 0, y: 0 };
    const radius = 34;
    const curvature = 0.55;
    const path = createQuadraticPath(source, target, curvature);

    const sample = findPathBoundarySample(path, target, radius, 'target');

    expect(sample.t).toBeGreaterThan(0);
    expect(sample.t).toBeLessThan(1);
    expect(Math.hypot(sample.point.x - target.x, sample.point.y - target.y)).toBeCloseTo(radius, 4);

    const endTx = path.p1.x - path.cp.x;
    const endTy = path.p1.y - path.cp.y;
    const endLen = Math.hypot(endTx, endTy);
    const endpointTangentProjection = {
      x: target.x - (endTx / endLen) * radius,
      y: target.y - (endTy / endLen) * radius,
    };
    expect(
      Math.hypot(
        sample.point.x - endpointTangentProjection.x,
        sample.point.y - endpointTangentProjection.y,
      ),
    ).toBeGreaterThan(1);
  });
});
