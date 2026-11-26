import { describe, expect, it, vi } from 'vitest';
import { register } from '@src/index.js';
import { getLayoutLoader } from '@src/layout/layoutLoader.js';
import { runLayout } from '@src/layout/runLayout.js';
import mds from '@src/layout/optional/mds.js';
import radial from '@src/layout/optional/radial.js';
import random from '@src/layout/optional/random.js';

const FakeLayout = vi.hoisted(
  () =>
    class FakeLayout {
      async execute(): Promise<void> {}
      forEachNode(callback: (node: { id: string; x: number; y: number }) => void): void {
        callback({ id: 'a', x: 20, y: 30 });
      }
    },
);

vi.mock('@antv/layout/lib/algorithm/force/index.js', () => ({ ForceLayout: FakeLayout }));
vi.mock('@antv/layout/lib/algorithm/mds/index.js', () => ({ MDSLayout: FakeLayout }));
vi.mock('@antv/layout/lib/algorithm/radial/index.js', () => ({ RadialLayout: FakeLayout }));
vi.mock('@antv/layout/lib/algorithm/random/index.js', () => ({ RandomLayout: FakeLayout }));

describe('layoutLoader', () => {
  const data = { nodes: [{ id: 'a' }], edges: [] };

  it('loads built-in force without explicit registration', async () => {
    await expect(getLayoutLoader('force')?.()).resolves.toBe(FakeLayout);
  });

  it('does not bundle non-built-in layout names', () => {
    expect(getLayoutLoader('dagre')).toBeUndefined();
    expect(getLayoutLoader('circular')).toBeUndefined();
  });

  it('runs a custom layout class on the main thread even when worker is requested', async () => {
    await expect(runLayout(data, { type: FakeLayout, worker: true })).resolves.toEqual({
      nodes: [{ id: 'a', x: 20, y: 30 }],
    });
  });

  it.each(Object.entries({ mds, radial, random }))(
    'uses %s after registration',
    async (type, extension) => {
      expect(getLayoutLoader(type)).toBeUndefined();
      await expect(runLayout(data, { type, worker: true })).rejects.toThrow(
        `@antv/g6-lite/layouts/${type}`,
      );
      register('layout', type, extension);
      await expect(runLayout(data, { type, worker: true })).resolves.toEqual({
        nodes: [{ id: 'a', x: 20, y: 30, data: undefined }],
      });
    },
  );

  it('preserves random placement for unknown names independently of the registered layout', async () => {
    const rng = vi.spyOn(Math, 'random').mockReturnValue(0.75);
    try {
      await expect(
        runLayout(data, { type: 'unknown-layout', width: 200, height: 400, center: [10, 20] }),
      ).resolves.toEqual({ nodes: [{ id: 'a', x: 55, y: 110 }] });
    } finally {
      rng.mockRestore();
    }
  });
});
