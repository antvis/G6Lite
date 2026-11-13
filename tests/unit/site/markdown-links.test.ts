import { describe, expect, it } from 'vitest';
import { prefixMarkdownLinks } from '../../../site/src/lib/markdown-links.ts';

describe('static documentation URL prefixing', () => {
  it('prefixes links and images once while retaining external and relative URLs', () => {
    const input =
      '[API](/docs/api) ![demo](/examples/a.png) [en](/en/docs) [site](https://example.com) [local](./a) [prefixed](/G6Lite/docs)';
    expect(prefixMarkdownLinks(input, '/G6Lite')).toBe(
      '[API](/G6Lite/docs/api) ![demo](/G6Lite/examples/a.png) [en](/G6Lite/en/docs) [site](https://example.com) [local](./a) [prefixed](/G6Lite/docs)',
    );
  });
  it('leaves fenced and inline runnable code unchanged, including indented fences', () => {
    const input = [
      '[API](/docs)',
      '```ts',
      'const text = "[API](/docs)";',
      '```',
      '  ~~~html',
      '<a href="/docs">code</a>',
      '  ~~~',
      '`[API](/docs)` <a href="/docs">prose</a>',
    ].join('\n');
    const expected = input
      .replace('[API](/docs)', '[API](/G6Lite/docs)')
      .replace('href="/docs">prose', 'href="/G6Lite/docs">prose');
    expect(prefixMarkdownLinks(input, '/G6Lite')).toBe(expected);
    expect(prefixMarkdownLinks(input, '')).toBe(input);
  });
});
