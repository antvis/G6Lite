import { describe, expect, it, vi } from 'vitest';

class FakeLayout {
  async execute(): Promise<void> {}
  forEachNode(): void {}
}

vi.mock('@antv/layout/lib/algorithm/dagre/index.js', () => ({ DagreLayout: FakeLayout }));
vi.mock('@antv/layout/lib/algorithm/random/index.js', () => ({ RandomLayout: FakeLayout }));

const { loadLayout } = await import('@src/layout/layoutLoader.js');

describe('layoutLoader', () => {
  it('requires explicit enablement for heavyweight optional layouts', () => {
    expect(() => loadLayout('dagre')).toThrow(/enable function.*@antv\/g6-gl\/layouts\/dagre/);
  });

  it('loads an optional layout after its public enable function is called', async () => {
    const { enableDagreLayout } = await import('@src/layout/optional/dagre.js');
    enableDagreLayout();

    await expect(loadLayout('dagre')).resolves.toBe(FakeLayout);
  });

  it('preserves the random fallback for unknown non-optional layout names', async () => {
    await expect(loadLayout('unknown-layout')).resolves.toBe(FakeLayout);
  });
});
