import { docs } from 'collections/server';
import { loader } from 'fumadocs-core/source';
import { readApiReferenceMarkdown } from './api-reference-source';
import { i18n, localizedDocsPath, type Locale } from './i18n';
import { docsContentRoute, docsImageRoute, withBasePath } from './shared';

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  i18n,
  url: (slugs, locale) => localizedDocsPath(slugs, (locale ?? 'zh') as Locale),
  plugins: [],
});

export function getPageImage(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'image.png'];
  const locale = (page.locale ?? 'zh') as Locale;

  return {
    segments,
    // metadataBase already includes the deployed site subpath (for example
    // https://antvis.github.io/G6Lite). Prefixing NEXT_PUBLIC_BASE_PATH here as
    // well would produce /G6Lite/G6Lite in the generated absolute OG URL.
    url: `${docsImageRoute(locale)}/${segments.join('/')}`,
  };
}

export function getPageMarkdownUrl(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'content.md'];
  const locale = (page.locale ?? 'zh') as Locale;

  return {
    segments,
    url: withBasePath(`${docsContentRoute(locale)}/${segments.join('/')}`),
  };
}

export async function getLLMText(page: (typeof source)['$inferPage']) {
  const processed =
    page.slugs.length === 1 && page.slugs[0] === 'api'
      ? readApiReferenceMarkdown()
      : await page.data.getText('processed');

  return `# ${page.data.title} (${page.url})

${processed}`;
}
