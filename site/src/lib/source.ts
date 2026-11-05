import { docs } from 'collections/server';
import { loader } from 'fumadocs-core/source';
import { i18n, localizedDocsPath, localizedPath, type Locale } from './i18n';
import { docsContentRoute, docsImageRoute, withBasePath } from './shared';
import { expandNodeDocExamples } from './node-doc-example-source';
import { getSiteExample, localizedText } from './site-examples';

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
  const processed = await page.data.getText('processed');
  const locale = (page.locale ?? 'zh') as Locale;
  const example = page.slugs[0] === 'examples' ? getSiteExample(page.slugs[1] ?? '') : undefined;
  const links = example?.documentation?.map((link) =>
    `- [${localizedText(link.title, locale)}](${withBasePath(localizedPath(link.href, locale))})`,
  ).join('\n');
  const related = links ? `\n\n## ${locale === 'zh' ? '继续阅读' : 'Related documentation'}\n\n${links}` : '';

  return `# ${page.data.title} (${page.url})

${expandNodeDocExamples(processed)}${related}`;
}
