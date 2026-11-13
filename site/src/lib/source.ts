import { docs } from 'collections/server';
import { loader } from 'fumadocs-core/source';
import { i18n, localizedDocsPath, localizedPath, type Locale } from './i18n';
import { docsContentRoute, docsImageRoute, withBasePath } from './shared';
import { expandNodeDocExamples } from './node-doc-example-source';
import { getSiteExample, localizedText } from './site-examples';
import { prefixMarkdownLinks } from './markdown-links';
import { expandSiteExamples } from './site-example-source';
import docsNavigation from '../../docs-navigation.json';

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  i18n,
  url: (slugs, locale) => localizedDocsPath(slugs, (locale ?? 'zh') as Locale),
  plugins: [],
});

const legacyPages: Readonly<Record<string, string>> = docsNavigation.legacyPages;

export function getLegacyDocsTarget(slugs: string[]): string | undefined {
  const slug = slugs.join('/');
  return legacyPages[slug] ?? legacyPages[slug ? `${slug}/index` : 'index'];
}

export function getPrimaryDocsPages(locale: Locale) {
  return source.getPages(locale).filter((page) => !getLegacyDocsTarget(page.slugs));
}

export function getPageImage(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'image.png'];
  const locale = (page.locale ?? 'zh') as Locale;

  return {
    segments,
    // The SEO layer applies the deployment prefix once to canonical and image URLs.
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
  const processed = (await page.data.getText('processed')).replace(/<(?:ElementStyleGallery|ElementExtensionExamples)\b[^>]*\/>\s*/g, '');
  const locale = (page.locale ?? 'zh') as Locale;
  const example = page.slugs[0] === 'examples' ? getSiteExample(page.slugs[1] ?? '') : undefined;
  const links = example?.documentation?.map((link) =>
    `- [${localizedText(link.title, locale)}](${withBasePath(localizedPath(link.href, locale))})`,
  ).join('\n');
  const related = links ? `\n\n## ${locale === 'zh' ? '继续阅读' : 'Related documentation'}\n\n${links}` : '';

  const markdown = `# ${page.data.title} (${withBasePath(page.url)})

${expandSiteExamples(expandNodeDocExamples(processed), locale)}${related}`;
  return prefixMarkdownLinks(markdown, withBasePath('/').replace(/\/$/, ''));
}
