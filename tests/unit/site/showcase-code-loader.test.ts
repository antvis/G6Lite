import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('homepage example code requests', () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.unstubAllGlobals());

  it('deduplicates requests while keeping each language, tab and theme separate', async () => {
    const fetchCode = vi.fn((url: string) =>
      Promise.resolve(new Response(JSON.stringify({ source: url, html: `<pre>${url}</pre>` }))),
    );
    vi.stubGlobal('fetch', fetchCode);
    const { loadShowcaseCode } =
      await import('../../../site/src/components/homepage/showcase-code-loader');
    const first = loadShowcaseCode('zh', 'mindmap', 'dark');
    expect(loadShowcaseCode('zh', 'mindmap', 'dark')).toBe(first);
    expect((await first).source).toContain('/zh/mindmap/dark/');
    expect(loadShowcaseCode('zh', 'mindmap', 'dark')).toBe(first);
    await loadShowcaseCode('en', 'mindmap', 'dark');
    await loadShowcaseCode('zh', 'mindmap', 'light');
    await loadShowcaseCode('zh', 'fishbone', 'dark');
    expect(fetchCode).toHaveBeenCalledTimes(4);
  });

  it('retries after an HTTP failure or an invalid payload', async () => {
    const fetchCode = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ source: 123, html: '' })))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ source: 'correct code', html: '<pre>correct code</pre>' })),
      );
    vi.stubGlobal('fetch', fetchCode);
    const { loadShowcaseCode } =
      await import('../../../site/src/components/homepage/showcase-code-loader');
    await expect(loadShowcaseCode('en', 'org-chart', 'light')).rejects.toThrow('503');
    await expect(loadShowcaseCode('en', 'org-chart', 'light')).rejects.toThrow('Invalid');
    expect((await loadShowcaseCode('en', 'org-chart', 'light')).source).toBe('correct code');
    expect(fetchCode).toHaveBeenCalledTimes(3);
  });
});
