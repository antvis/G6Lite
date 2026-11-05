import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('documentation deployment URLs', () => {
  it('keeps root deployments unchanged', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com');
    const { absoluteSiteUrl } = await import('../../../site/src/lib/seo.ts');
    expect(absoluteSiteUrl('/en/docs/api')).toBe('https://example.com/en/docs/api');
  });
  it('prefixes canonical and image paths exactly once', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/G6Lite');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com');
    const { absoluteSiteUrl } = await import('../../../site/src/lib/seo.ts');
    expect(absoluteSiteUrl('/docs/api')).toBe('https://example.com/G6Lite/docs/api');
    expect(absoluteSiteUrl('/G6Lite/og/docs/image.png')).toBe(
      'https://example.com/G6Lite/og/docs/image.png',
    );
  });
  it('accepts an existing prefix in the configured public URL', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/G6Lite');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com/G6Lite');
    const { absoluteSiteUrl } = await import('../../../site/src/lib/seo.ts');
    expect(absoluteSiteUrl('/docs')).toBe('https://example.com/G6Lite/docs');
  });
});
