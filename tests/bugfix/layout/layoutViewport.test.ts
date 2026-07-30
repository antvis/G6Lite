import { beforeEach, describe, expect, it, vi } from 'vitest';

// ============================================================
// runLayout viewport injection.
//
// @antv/layout's normalizeViewport falls back to window.innerWidth/innerHeight
// (or 0×0 in a worker) when width/height are absent, distorting force/circular/
// radial/etc. by the window aspect ratio. runLayout must inject the CANVAS
// width/height/center, and must NOT override values the user provided.
//
// We mock the lazily loaded @antv/layout algorithms so each class records the opts it was
// constructed with, then assert what runLayout passed through.
// ============================================================

const captured: { opts: Record<string, unknown> | undefined } = { opts: undefined };

class FakeLayout {
  constructor(opts?: Record<string, unknown>) {
    captured.opts = opts;
  }
  async execute(data: { nodes: Array<{ id: string; x: number; y: number }> }) {
    this._nodes = data.nodes;
  }
  forEachNode(fn: (n: { id: string; x: number; y: number }) => void) {
    this._nodes.forEach(fn);
  }
  _nodes: Array<{ id: string; x: number; y: number }> = [];
}

vi.mock('@antv/layout/lib/algorithm/force/index.js', () => ({ ForceLayout: FakeLayout }));
vi.mock('@antv/layout/lib/algorithm/circular/index.js', () => ({ CircularLayout: FakeLayout }));

// Import AFTER the mock is registered.
const { runLayout } = await import('@src/layout/runLayout.js');

const data = {
  nodes: [
    { id: 'a', x: 0, y: 0 },
    { id: 'b', x: 10, y: 10 },
  ],
  edges: [{ source: 'a', target: 'b' }],
};

beforeEach(() => {
  captured.opts = undefined;
});

describe('runLayout viewport injection', () => {
  it('injects canvas width/height/center when the user gave none', async () => {
    await runLayout(data as never, { type: 'force' }, { width: 800, height: 600 });
    expect(captured.opts).toBeDefined();
    expect(captured.opts!.width).toBe(800);
    expect(captured.opts!.height).toBe(600);
    expect(captured.opts!.center).toEqual([400, 300]);
  });

  it('does not override user-provided width/height/center', async () => {
    await runLayout(
      data as never,
      { type: 'force', width: 1000, height: 500, center: [123, 456] },
      { width: 800, height: 600 },
    );
    expect(captured.opts!.width).toBe(1000);
    expect(captured.opts!.height).toBe(500);
    expect(captured.opts!.center).toEqual([123, 456]);
  });

  it('fills only the missing dimension and derives center from the merged size', async () => {
    await runLayout(data as never, { type: 'force', width: 1000 }, { width: 800, height: 600 });
    expect(captured.opts!.width).toBe(1000); // user value kept
    expect(captured.opts!.height).toBe(600); // injected
    expect(captured.opts!.center).toEqual([500, 300]); // [1000/2, 600/2]
  });

  it('leaves opts viewport untouched when no viewport is passed (back-compat)', async () => {
    await runLayout(data as never, { type: 'circular' });
    expect(captured.opts!.width).toBeUndefined();
    expect(captured.opts!.height).toBeUndefined();
    expect(captured.opts!.center).toBeUndefined();
  });

  it('does not leak internal type/worker fields into layout opts', async () => {
    await runLayout(data as never, { type: 'force', worker: false }, { width: 800, height: 600 });
    expect(captured.opts!.type).toBeUndefined();
    expect(captured.opts!.worker).toBeUndefined();
  });
});
