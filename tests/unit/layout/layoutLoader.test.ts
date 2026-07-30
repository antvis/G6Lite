import { describe, expect, it, vi } from 'vitest';

class FakeLayout {
  async execute(): Promise<void> {}
  forEachNode(): void {}
}

vi.mock('@antv/layout/lib/algorithm/dagre/index.js', () => ({ DagreLayout: FakeLayout }));
vi.mock('@antv/layout/lib/algorithm/mds/index.js', () => ({ MDSLayout: FakeLayout }));
vi.mock('@antv/layout/lib/algorithm/radial/index.js', () => ({ RadialLayout: FakeLayout }));
vi.mock('@antv/layout/lib/algorithm/random/index.js', () => ({ RandomLayout: FakeLayout }));

const { loadLayout } = await import('@src/layout/layoutLoader.js');

describe('layoutLoader', () => {
  it('loads dagre without explicit enablement', async () => {
    await expect(loadLayout('dagre')).resolves.toBe(FakeLayout);
  });

  it('loads mds and radial without explicit enablement', async () => {
    await expect(loadLayout('mds')).resolves.toBe(FakeLayout);
    await expect(loadLayout('radial')).resolves.toBe(FakeLayout);
  });

  it('preserves the random fallback for unknown layout names', async () => {
    await expect(loadLayout('unknown-layout')).resolves.toBe(FakeLayout);
  });
});
