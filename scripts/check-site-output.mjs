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

for (const [file, lang] of [
  ['site/out/index.html', 'zh-CN'],
  ['site/out/docs.html', 'zh-CN'],
  ['site/out/en.html', 'en'],
  ['site/out/en/docs.html', 'en'],
]) {
  const target = requireFile(file);
  if (!existsSync(target)) continue;
  const html = readFileSync(target, 'utf8');
  if (!html.startsWith(`<!DOCTYPE html><html lang="${lang}"`)) {
    fail(`${file} does not declare html lang=${lang}`);
  }
  if (!html.includes('rel="canonical"')) fail(`${file} has no canonical link`);
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
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  if (/aria-label="Search"|\/api\/search|搜索文档|Search documentation/.test(html)) {
    fail(`Search UI or endpoint leaked into ${path.relative(root, file)}`);
  }
  if (/本地运行|Run locally/.test(html)) {
    fail(`Unavailable local-run action leaked into ${path.relative(root, file)}`);
  }
}

const sitemapPath = path.join(outRoot, 'sitemap.xml');
if (existsSync(sitemapPath)) {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  for (const url of [
    'https://g6-gl.antv.vision/docs',
    'https://g6-gl.antv.vision/en/docs',
    'https://g6-gl.antv.vision/docs/compatibility',
    'https://g6-gl.antv.vision/en/docs/compatibility',
  ]) {
    if (!sitemap.includes(`<loc>${url}</loc>`)) fail(`Sitemap is missing ${url}`);
  }
  if (sitemap.includes('antvis.github.io')) fail('Sitemap contains the legacy GitHub Pages origin');
}

if (failures.length > 0) {
  console.error(failures.map((message) => `- ${message}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Checked ${htmlFiles.length} static HTML files and localized route output.`);
}
