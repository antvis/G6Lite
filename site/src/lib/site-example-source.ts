import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Locale } from './i18n';
import { getSiteExample, localizedText } from './site-examples';

export function readSiteExampleSource(id: string): string {
  const example = getSiteExample(id);
  if (!example) throw new Error('Unknown site example: ' + id);
  const source = readFileSync(path.join(process.cwd(), 'demos', example.file), 'utf8').replace(/\r\n/g, '\n').trim();
  const note = /from\s+['"]\.\/demo-panel\.ts['"]/.test(source)
    ? '// Local presentation helpers in this repository are used only for the example controls.\n'
    : /from\s+['"]\.\/tooling\.ts['"]/.test(source)
      ? '// Local presentation helpers in this repository provide example label overlays.\n'
      : '';
  return note + source + '\n';
}

// Replace MDX placeholders with the same source shown beside the live canvas.
export function expandSiteExamples(markdown: string, locale: Locale): string {
  return markdown.replace(/<ExampleDetail\b([^>]*)\/>/g, (_match, attributes: string) => {
    const id = /\bid="([a-z-]+)"/.exec(attributes)?.[1];
    const example = id ? getSiteExample(id) : undefined;
    if (!id || !example) throw new Error('Unknown site example in Markdown');
    return [
      localizedText(example.description, locale),
      '## ' + (locale === 'zh' ? '如何体验' : 'Try it'),
      localizedText(example.interaction, locale),
      '## ' + (locale === 'zh' ? '数据说明' : 'Data'),
      localizedText(example.dataDescription, locale),
      '## ' + (locale === 'zh' ? '完整运行代码' : 'Complete runnable code'),
      '```ts\n' + readSiteExampleSource(id).trimEnd() + '\n```',
    ].join('\n\n');
  });
}
