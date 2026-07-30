import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const docsRoot = path.join(root, 'site/content/docs');
const localeRoots = {
  zh: path.join(docsRoot, 'zh'),
  en: path.join(docsRoot, 'en'),
};
const failures = [];

function fail(message) {
  failures.push(message);
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function relativeFiles(locale, suffix) {
  return walk(localeRoots[locale])
    .filter((file) => file.endsWith(suffix))
    .map((file) => path.relative(localeRoots[locale], file).replace(/\\/g, '/'));
}

const topLevelEntries = readdirSync(docsRoot, { withFileTypes: true });
for (const entry of topLevelEntries) {
  if (!entry.isDirectory() || !Object.hasOwn(localeRoots, entry.name)) {
    fail(`Unexpected documentation root entry: site/content/docs/${entry.name}`);
  }
}

const zhMdxFiles = relativeFiles('zh', '.mdx');
const enMdxFiles = relativeFiles('en', '.mdx');
const zhMetaFiles = relativeFiles('zh', 'meta.json');
const enMetaFiles = relativeFiles('en', 'meta.json');
const zhMdxSet = new Set(zhMdxFiles);
const enMdxSet = new Set(enMdxFiles);
const zhMetaSet = new Set(zhMetaFiles);
const enMetaSet = new Set(enMetaFiles);

for (const relative of zhMdxFiles.filter((file) => !file.startsWith('api/'))) {
  if (!enMdxSet.has(relative)) fail(`Missing English document: site/content/docs/en/${relative}`);
}
for (const relative of enMdxFiles.filter((file) => !file.startsWith('api/'))) {
  if (!zhMdxSet.has(relative)) fail(`Missing Chinese document: site/content/docs/zh/${relative}`);
}
for (const relative of zhMetaFiles) {
  if (!enMetaSet.has(relative)) fail(`Missing English metadata: site/content/docs/en/${relative}`);
}
for (const relative of enMetaFiles) {
  if (!zhMetaSet.has(relative)) fail(`Missing Chinese metadata: site/content/docs/zh/${relative}`);
}

const allDocsFiles = [...walk(localeRoots.zh), ...walk(localeRoots.en)];
for (const file of allDocsFiles) {
  if (file.endsWith('.en.mdx') || file.endsWith('meta.en.json')) {
    fail(`Legacy locale suffix remains: ${path.relative(root, file)}`);
  }
}

const forbiddenRoutes = [
  '/docs/guide/',
  '/docs/layouts/',
  '/docs/interactions/',
  '/docs/advanced/',
];
for (const file of [...allDocsFiles, ...walk(path.join(root, 'site/src'))]) {
  if (!/\.(?:mdx|ts|tsx)$/.test(file)) continue;
  const content = readFileSync(file, 'utf8');
  for (const route of forbiddenRoutes) {
    if (content.includes(route)) fail(`Stale route ${route} in ${path.relative(root, file)}`);
  }
}

for (const relative of enMdxFiles) {
  const file = path.join(localeRoots.en, relative);
  const content = readFileSync(file, 'utf8');
  if (/(?:href=["']|\]\()\/docs\//.test(content)) {
    fail(`English document links to the Chinese route: ${path.relative(root, file)}`);
  }
}

function routeExists(route) {
  const locale = route === '/en/docs' || route.startsWith('/en/docs/') ? 'en' : 'zh';
  const withoutLocale = locale === 'en' ? route.slice(3) : route;
  const suffix = withoutLocale.replace(/^\/docs\/?/, '');
  const localeRoot = localeRoots[locale];
  const candidates = suffix
    ? [path.join(localeRoot, `${suffix}.mdx`), path.join(localeRoot, suffix, 'index.mdx')]
    : [path.join(localeRoot, 'index.mdx')];
  return candidates.some((candidate) => existsSync(candidate));
}

for (const file of allDocsFiles.filter((item) => item.endsWith('.mdx'))) {
  const content = readFileSync(file, 'utf8');
  const routes = content.match(/\/(?:en\/)?docs(?:\/[a-zA-Z0-9._~/-]+)?/g) ?? [];
  for (const route of new Set(routes.map((item) => item.replace(/\/$/, '')))) {
    if (!routeExists(route))
      fail(`Broken documentation route ${route} in ${path.relative(root, file)}`);
  }
}

const requiredSiteFiles = [
  'site/src/app/sitemap.ts',
  'site/src/app/robots.ts',
  'site/src/app/manifest.ts',
  'site/src/app/icon.svg',
  'site/src/app/en/(home)/page.tsx',
  'site/src/app/en/docs/[[...slug]]/page.tsx',
  'site/src/app/en/og/docs/[...slug]/route.tsx',
  'site/src/app/en/llms.mdx/docs/[[...slug]]/route.ts',
  'site/src/app/en/llms.txt/route.ts',
  'site/src/app/en/llms-full.txt/route.ts',
  'playground/dist/index.html',
];
for (const file of requiredSiteFiles) {
  if (!existsSync(path.join(root, file))) fail(`Missing required site artifact: ${file}`);
}

for (const removedFile of ['site/src/components/search.tsx', 'site/src/app/api/search/route.ts']) {
  if (existsSync(path.join(root, removedFile))) fail(`Search surface still exists: ${removedFile}`);
}

const sitePackage = JSON.parse(read('site/package.json'));
for (const dependency of ['@orama/orama', 'flexsearch']) {
  if (sitePackage.dependencies?.[dependency])
    fail(`Search-only dependency still exists: ${dependency}`);
}

const catalog = JSON.parse(read('playground/demos/catalog.json'));
const docsGroups = new Set([
  'getting-started',
  'data-and-lifecycle',
  'node-edge-label-combo',
  'layout',
  'interaction-state-viewport',
  'extension',
  'scenario-and-dataset',
]);
for (const demo of catalog.filter((item) => item.audiences.includes('site'))) {
  if (!docsGroups.has(demo.docsGroup)) fail(`Site demo ${demo.id} has no valid docsGroup`);
  for (const file of [
    `site/content/docs/zh/examples/${demo.id}.mdx`,
    `site/content/docs/en/examples/${demo.id}.mdx`,
    `site/public/examples/${demo.id}.png`,
    `site/public/example-sources/${demo.id}.txt`,
  ]) {
    if (!existsSync(path.join(root, file))) fail(`Site demo ${demo.id} is missing ${file}`);
  }

  const publicSourcePath = `site/public/example-sources/${demo.id}.txt`;
  if (existsSync(path.join(root, publicSourcePath))) {
    const publicSource = read(publicSourcePath);
    if (publicSource.includes('../../src/')) {
      fail(`Site demo ${demo.id} exposes a source-deep import`);
    }
    if (!publicSource.includes("from '@antv/g6-gl")) {
      fail(`Site demo ${demo.id} does not expose a public package import`);
    }
  }
}

function extractMinimalExample(relativePath) {
  const content = read(relativePath);
  const match = content.match(
    /import \{ Graph \} from '@antv\/g6-gl';[\s\S]*?await graph\.render\(\);/,
  );
  if (!match) {
    fail(`Cannot find the minimal Graph example in ${relativePath}`);
    return '';
  }
  return match[0].replace(/\r\n/g, '\n').trim();
}

const snippetFiles = [
  'site/content/docs/zh/getting-started/quick-start.mdx',
  'site/content/docs/en/getting-started/quick-start.mdx',
  'site/src/components/home-page.tsx',
];
const snippets = snippetFiles.map((file) => [file, extractMinimalExample(file)]);
const canonicalSnippet = snippets[0][1];
for (const [file, snippet] of snippets.slice(1)) {
  if (snippet !== canonicalSnippet) fail(`Minimal Graph example differs in ${file}`);
}

if (failures.length > 0) {
  console.error(failures.map((message) => `- ${message}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Checked ${zhMdxFiles.length} Chinese and ${enMdxFiles.length} English documentation pages across locale directories.`,
  );
}
