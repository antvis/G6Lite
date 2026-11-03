import { readFileSync } from 'node:fs';
import path from 'node:path';

import type { Locale } from '@/lib/i18n';
import { getSiteExample } from '@/lib/site-examples';

import { ExampleDetailClient } from './example-detail-client';

// Prepended when a demo imports the repository-local presentation helpers, so
// copied sources keep the hint that they exist only for the site UI.
function helperNote(source: string): string {
  if (/from\s+['"]\.\/demo-panel\.ts['"]/.test(source)) {
    return '// Local presentation helpers in this repository are used only for the example controls.\n';
  }
  if (/from\s+['"]\.\/tooling\.ts['"]/.test(source)) {
    return '// Local presentation helpers in this repository provide example label overlays.\n';
  }
  return '';
}

// Server component: reads the exact demo file at build time and inlines it as
// a prop, so the code panel never depends on generated artifacts or runtime
// fetches. The preview and editor both work on this same source.
export function ExampleDetail({ id, locale }: { id: string; locale: Locale }) {
  const example = getSiteExample(id);
  let initialSource = '';
  if (example) {
    try {
      // `next build` runs from the site root, so cwd anchors the demos dir;
      // import.meta.url would point at the compiled output instead.
      const file = path.join(process.cwd(), 'demos', example.file);
      const source = readFileSync(file, 'utf8').replace(/\r\n/g, '\n').trim();
      initialSource = `${helperNote(source)}${source}\n`;
    } catch {
      // The editor stays empty; the live preview still runs.
    }
  }
  return <ExampleDetailClient id={id} locale={locale} initialSource={initialSource} />;
}
