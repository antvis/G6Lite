import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const packed = { nodes: [0, 0, 1, 100, 100, 2], edges: [0, 1] };

describe('homepage graph resource loading', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false })),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('shares a pending download and builds fresh data for every graph instance', async () => {
    const fetchData = vi.fn().mockResolvedValue(new Response(JSON.stringify(packed)));
    vi.stubGlobal('fetch', fetchData);
    const { loadHeroGraphResources } =
      await import('../../../site/src/components/homepage/hero-graph-loader');
    const [first, second] = await Promise.all([loadHeroGraphResources(), loadHeroGraphResources()]);
    expect(fetchData).toHaveBeenCalledTimes(1);
    const firstGraph = first.createHeroGraph();
    firstGraph.nodes[0].x = 999;
    expect(second.createHeroGraph().nodes[0].x).toBe(0);
    await loadHeroGraphResources();
    expect(fetchData).toHaveBeenCalledTimes(1);
  });

  it('allows a fresh request after a failed download instead of caching its rejection', async () => {
    const fetchData = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(packed)));
    vi.stubGlobal('fetch', fetchData);
    const { loadHeroGraphResources } =
      await import('../../../site/src/components/homepage/hero-graph-loader');
    await expect(loadHeroGraphResources()).rejects.toThrow('503');
    const recovered = await loadHeroGraphResources();
    expect(recovered.createHeroGraph().edges).toHaveLength(1);
    expect(fetchData).toHaveBeenCalledTimes(2);
  });
});
