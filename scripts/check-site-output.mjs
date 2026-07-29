import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const docsRoot = path.join(root, 'site/content/docs');
const outRoot = path.join(root, 'site/out');
const failures = [];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function fail(message) {
  failures.push(message);
}

function requireFile(relativePath) {
  const file = path.join(root, relativePath);
  if (!existsSync(file)) fail(`Missing static output: ${relativePath}`);
  return file;
}

function relativeOutputPath(file) {
  return path.relative(outRoot, file).replace(/\\/g, '/');
}

function getAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`, 'i'));
  return match?.[1] ?? null;
}

function getTags(html, tagName) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'gi')) ?? [];
}

function getMetaContent(html, name) {
  const tag = getTags(html, 'meta').find(
    (candidate) => getAttribute(candidate, 'name')?.toLowerCase() === name.toLowerCase(),
  );
  return tag ? getAttribute(tag, 'content') : null;
}

function getMetaProperty(html, property) {
  const tag = getTags(html, 'meta').find(
    (candidate) => getAttribute(candidate, 'property')?.toLowerCase() === property.toLowerCase(),
  );
  return tag ? getAttribute(tag, 'content') : null;
}

function getLinkTags(html, rel) {
  return getTags(html, 'link').filter((tag) =>
    (getAttribute(tag, 'rel') ?? '')
      .toLowerCase()
      .split(/\s+/)
      .includes(rel.toLowerCase()),
  );
}

function stripHtml(html) {
  return html
    .replace(/<(script|style|svg|noscript)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|#160);/gi, ' ')
    .replace(/&(?:amp|#38);/gi, '&')
    .replace(/&(?:lt|#60);/gi, '<')
    .replace(/&(?:gt|#62);/gi, '>')
    .replace(/&(?:quot|#34);/gi, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function outputRoute(relativePath) {
  if (relativePath === 'index.html') return '/';
  return `/${relativePath.replace(/\.html$/, '').replace(/\/index$/, '')}`;
}

function collectSchemaTypes(value, types = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectSchemaTypes(item, types);
    return types;
  }
  if (!value || typeof value !== 'object') return types;

  const type = value['@type'];
  if (Array.isArray(type)) {
    for (const item of type) if (typeof item === 'string') types.add(item);
  } else if (typeof type === 'string') {
    types.add(type);
  }

  for (const nested of Object.values(value)) collectSchemaTypes(nested, types);
  return types;
}

function getJsonLdTypes(html, relativePath) {
  const types = new Set();
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (getAttribute(match[1], 'type')?.toLowerCase() !== 'application/ld+json') continue;
    try {
      collectSchemaTypes(JSON.parse(match[2]), types);
    } catch (error) {
      fail(`${relativePath} contains invalid JSON-LD: ${error.message}`);
    }
  }
  return types;
}

function expectedLocalizedRoutes(route) {
  if (route === '/en') return { zh: '/', en: '/en' };
  if (route.startsWith('/en/')) return { zh: route.slice(3), en: route };
  return { zh: route, en: route === '/' ? '/en' : `/en${route}` };
}

function addToValueMap(map, value, relativePath) {
  if (!value) return;
  const files = map.get(value) ?? [];
  files.push(relativePath);
  map.set(value, files);
}

for (const file of [
  'site/out/index.html',
  'site/out/en.html',
  'site/out/sitemap.xml',
  'site/out/robots.txt',
  'site/out/manifest.webmanifest',
  'site/out/icon.svg',
  'site/out/playground/index.html',
  'site/out/en/og/docs/image.png',
  'site/out/en/llms.mdx/docs/content.md',
]) {
  requireFile(file);
}

for (const file of walk(docsRoot).filter((item) => item.endsWith('.mdx'))) {
  const relative = path.relative(docsRoot, file).replace(/\\/g, '/');
  const [locale, ...segments] = relative.split('/');
  if (locale !== 'zh' && locale !== 'en') {
    fail(`Documentation file is outside a locale directory: ${path.relative(root, file)}`);
    continue;
  }
  const localized = segments.join('/').replace(/\.mdx$/, '');
  const route =
    localized === 'index'
      ? 'docs'
      : localized.endsWith('/index')
        ? `docs/${localized.slice(0, -6)}`
        : `docs/${localized}`;
  const output = path.join(outRoot, locale === 'en' ? 'en' : '', `${route}.html`);
  if (!existsSync(output)) fail(`Missing static document route: ${path.relative(root, output)}`);
}

const htmlFiles = walk(outRoot).filter((file) => file.endsWith('.html'));
const siteHtmlFiles = htmlFiles.filter((file) => {
  const relative = relativeOutputPath(file);
  return !relative.startsWith('playground/') && !['404.html', '_not-found.html'].includes(relative);
});
const pageReports = [];
const canonicalFiles = new Map();
const titleFiles = new Map();
const descriptionFiles = new Map();

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const relative = relativeOutputPath(file);
  if (/aria-label="Search"|\/api\/search|搜索文档|Search documentation/.test(html)) {
    fail(`Search UI or endpoint leaked into ${path.relative(root, file)}`);
  }
  if (/本地运行|Run locally/.test(html)) {
    fail(`Unavailable local-run action leaked into ${path.relative(root, file)}`);
  }

  if (!siteHtmlFiles.includes(file)) continue;

  const robots = getMetaContent(html, 'robots')?.toLowerCase() ?? '';
  const canonicalTags = getLinkTags(html, 'canonical');
  const canonical = canonicalTags.length === 1 ? getAttribute(canonicalTags[0], 'href') : null;
  const title = stripHtml(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  const description = getMetaContent(html, 'description')?.trim() ?? '';
  const route = outputRoute(relative);
  const indexable = !robots.includes('noindex');

  pageReports.push({ relative, route, indexable, canonical, robots });

  if (!indexable) continue;

  const lang = html.match(/<html\b[^>]*\slang=["']([^"']+)["']/i)?.[1] ?? null;
  const expectedLang = route === '/en' || route.startsWith('/en/') ? 'en' : 'zh-CN';
  if (lang !== expectedLang) fail(`${relative} declares html lang=${lang ?? 'missing'}, expected ${expectedLang}`);

  if (!title) fail(`${relative} has no title`);
  if (!description) fail(`${relative} has no meta description`);
  if (canonicalTags.length !== 1 || !canonical) {
    fail(`${relative} must contain exactly one canonical link`);
  } else {
    try {
      const canonicalUrl = new URL(canonical);
      const canonicalPath = canonicalUrl.pathname.replace(/\/$/, '') || '/';
      if (canonicalUrl.protocol !== 'https:') fail(`${relative} canonical is not HTTPS: ${canonical}`);
      if (canonicalPath !== route) {
        fail(`${relative} canonical path ${canonicalPath} does not match output route ${route}`);
      }
    } catch {
      fail(`${relative} canonical is not an absolute URL: ${canonical}`);
    }
  }

  const alternateLinks = getLinkTags(html, 'alternate')
    .map((tag) => ({
      language: getAttribute(tag, 'hreflang'),
      href: getAttribute(tag, 'href'),
    }))
    .filter(({ language }) => language);
  const localizedRoutes = expectedLocalizedRoutes(route);
  const canonicalBase = canonical && route !== '/' ? canonical.slice(0, -route.length) : canonical;
  const expectedAlternates = {
    'zh-CN': `${canonicalBase}${localizedRoutes.zh === '/' ? '' : localizedRoutes.zh}`,
    en: `${canonicalBase}${localizedRoutes.en}`,
    'x-default': `${canonicalBase}${localizedRoutes.zh === '/' ? '' : localizedRoutes.zh}`,
  };
  for (const [language, expectedHref] of Object.entries(expectedAlternates)) {
    const matches = alternateLinks.filter((alternate) => alternate.language === language);
    if (matches.length !== 1 || matches[0].href !== expectedHref) {
      fail(`${relative} has invalid ${language} alternate; expected ${expectedHref}`);
    }
  }

  const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)]
    .map((match) => stripHtml(match[1]))
    .filter(Boolean);
  if (headings.length === 0) fail(`${relative} has no non-empty H1 in its HTML source`);

  const main = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? '';
  const sourceText = stripHtml(main);
  if (sourceText.length < 100) {
    fail(`${relative} has only ${sourceText.length} readable characters in its static <main>`);
  }

  const jsonLdTypes = getJsonLdTypes(html, relative);
  const requiredTypes = route === '/' || route === '/en'
    ? ['WebSite', 'SoftwareApplication']
    : ['TechArticle', 'BreadcrumbList'];
  for (const type of requiredTypes) {
    if (!jsonLdTypes.has(type)) fail(`${relative} JSON-LD is missing ${type}`);
  }

  const openGraph = {
    title: getMetaProperty(html, 'og:title'),
    description: getMetaProperty(html, 'og:description'),
    url: getMetaProperty(html, 'og:url'),
    siteName: getMetaProperty(html, 'og:site_name'),
    type: getMetaProperty(html, 'og:type'),
    image: getMetaProperty(html, 'og:image'),
  };
  for (const [property, value] of Object.entries(openGraph)) {
    if (!value) fail(`${relative} is missing Open Graph ${property}`);
  }
  if (openGraph.url && canonical && openGraph.url !== canonical) {
    fail(`${relative} Open Graph URL ${openGraph.url} does not match canonical ${canonical}`);
  }

  const twitter = {
    card: getMetaContent(html, 'twitter:card'),
    title: getMetaContent(html, 'twitter:title'),
    description: getMetaContent(html, 'twitter:description'),
    image: getMetaContent(html, 'twitter:image'),
  };
  for (const [property, value] of Object.entries(twitter)) {
    if (!value) fail(`${relative} is missing Twitter ${property}`);
  }

  addToValueMap(canonicalFiles, canonical, relative);
  addToValueMap(titleFiles, title, relative);
  addToValueMap(descriptionFiles, description, relative);
}

for (const [canonical, files] of canonicalFiles) {
  if (files.length > 1) fail(`Duplicate canonical ${canonical}: ${files.join(', ')}`);
}
for (const [title, files] of titleFiles) {
  if (files.length > 1) fail(`Duplicate page title ${JSON.stringify(title)}: ${files.join(', ')}`);
}
for (const [description, files] of descriptionFiles) {
  if (files.length > 1) {
    fail(`Duplicate meta description ${JSON.stringify(description)}: ${files.join(', ')}`);
  }
}

const previewPage = pageReports.find((page) => page.relative === 'preview/home-v2.html');
if (previewPage && (!previewPage.robots.includes('noindex') || !previewPage.robots.includes('nofollow'))) {
  fail('preview/home-v2.html must declare noindex, nofollow');
}

const indexablePages = pageReports.filter((page) => page.indexable);
const indexableCanonicals = new Set(indexablePages.map((page) => page.canonical).filter(Boolean));
const sitemapPath = path.join(outRoot, 'sitemap.xml');
if (existsSync(sitemapPath)) {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const sitemapUrlSet = new Set(sitemapUrls);

  if (sitemapUrlSet.size !== sitemapUrls.length) fail('Sitemap contains duplicate URLs');
  if (/<lastmod>/.test(sitemap)) {
    fail('Sitemap contains build-time lastModified values without a reliable content update source');
  }
  for (const canonical of indexableCanonicals) {
    if (!sitemapUrlSet.has(canonical)) fail(`Sitemap is missing indexable page ${canonical}`);
  }
  for (const sitemapUrl of sitemapUrlSet) {
    if (!indexableCanonicals.has(sitemapUrl)) fail(`Sitemap contains non-indexable URL ${sitemapUrl}`);
  }
  if (!/hreflang="x-default"/.test(sitemap)) fail('Sitemap has no x-default language alternates');

  const excludedCanonicals = new Set(
    pageReports.filter((page) => !page.indexable).map((page) => page.canonical).filter(Boolean),
  );
  for (const excluded of excludedCanonicals) {
    if (sitemapUrlSet.has(excluded)) fail(`Sitemap contains noindex page ${excluded}`);
  }
}

const homeCanonical = pageReports.find((page) => page.relative === 'index.html')?.canonical;
const robotsPath = path.join(outRoot, 'robots.txt');
if (homeCanonical && existsSync(robotsPath)) {
  const robots = readFileSync(robotsPath, 'utf8');
  const expectedSitemap = `Sitemap: ${homeCanonical.replace(/\/$/, '')}/sitemap.xml`;
  if (!robots.includes(expectedSitemap)) fail(`robots.txt is missing ${expectedSitemap}`);
}

if (failures.length > 0) {
  console.error(failures.map((message) => `- ${message}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Checked ${htmlFiles.length} static HTML files, ${indexablePages.length} indexable pages, localized source content, and sitemap parity.`,
  );
}
