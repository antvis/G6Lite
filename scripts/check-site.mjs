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
  'site/src/app/(zh)/(home)/page.tsx',
  'site/src/app/(zh)/(home)/ai/page.tsx',
  'site/src/app/en/(home)/page.tsx',
  'site/src/app/en/(home)/ai/page.tsx',
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

for (const removedFile of [
  'site/src/components/search.tsx',
  'site/src/app/api/search/route.ts',
  'site/src/app/(zh)/(home)/legacy-home-page.tsx',
  'site/src/app/(zh)/(home)/legacy-home.css',
  'site/src/app/(zh)/(home)/legacy-code-block.tsx',
]) {
  if (existsSync(path.join(root, removedFile))) fail(`Search surface still exists: ${removedFile}`);
}

const homeRoutes = [
  ['site/src/app/(zh)/(home)/page.tsx', '<Homepage locale="zh" />'],
  ['site/src/app/en/(home)/page.tsx', '<Homepage locale="en" />'],
];
for (const [file, expectedUsage] of homeRoutes) {
  const source = read(file);
  if (!source.includes(expectedUsage)) fail(`Homepage route ${file} does not use ${expectedUsage}`);
  if (!source.includes("from '@/components/homepage/homepage'"))
    fail(`Homepage route ${file} must directly import the shared homepage component`);
  if (/preview\//.test(source)) fail(`Homepage route ${file} must not depend on a preview route`);
  if (/LegacyHomePage|legacy-home/.test(source))
    fail(`Homepage route still uses legacy code: ${file}`);
}

if (existsSync(path.join(root, 'site/src/app/(zh)/(preview)/preview/ava-home/page.tsx')))
  fail('The temporary AVA homepage preview route must not remain');

const homepageSource = read('site/src/components/homepage/homepage.tsx');
for (const staleMetric of ['~0ms', '0.1ms', '5k']) {
  if (homepageSource.includes(staleMetric)) {
    fail(`Homepage contains the unsupported historical metric ${staleMetric}`);
  }
}

const sitePackage = JSON.parse(read('site/package.json'));
for (const dependency of ['@orama/orama', 'flexsearch']) {
  if (sitePackage.dependencies?.[dependency])
    fail(`Search-only dependency still exists: ${dependency}`);
}

const catalog = JSON.parse(read('playground/demos/catalog.json'));
const exampleRuntimeSource = read('site/src/lib/example-runtime.ts');
const runtimeLoaderById = new Map(
  [
    ...exampleRuntimeSource.matchAll(
      /^\s*(?:'([^']+)'|([a-z0-9]+(?:-[a-z0-9]+)*)):\s*\(\)\s*=>\s*import\('([^']+)'\),?$/gm,
    ),
  ].map((match) => [match[1] ?? match[2], match[3]]),
);
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
  const expectedRuntimeImport = `../../../playground/demos/${demo.file}`;
  const actualRuntimeImport = runtimeLoaderById.get(demo.id);
  if (!actualRuntimeImport) {
    fail(`Site demo ${demo.id} has no runtime loader in site/src/lib/example-runtime.ts`);
  } else if (actualRuntimeImport !== expectedRuntimeImport) {
    fail(
      `Site demo ${demo.id} runtime loader points to ${actualRuntimeImport}, expected ${expectedRuntimeImport}`,
    );
  }
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
    if (!publicSource.includes("from '@antv/g6-lite")) {
      fail(`Site demo ${demo.id} does not expose a public package import`);
    }
  }
}

function extractMinimalExample(relativePath) {
  const content = read(relativePath);
  const match = content.match(
    /import \{ Graph \} from '@antv\/g6-lite';[\s\S]*?await graph\.render\(\);/,
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
  'site/src/components/homepage/homepage.tsx',
];
const snippets = snippetFiles.map((file) => [file, extractMinimalExample(file)]);
const canonicalSnippet = snippets[0][1];
for (const [file, snippet] of snippets.slice(1)) {
  if (snippet !== canonicalSnippet) fail(`Minimal Graph example differs in ${file}`);
}

const aiArchitectureFiles = [
  'site/src/app/(zh)/(home)/ai/page.tsx',
  'site/src/app/en/(home)/ai/page.tsx',
  'site/src/components/ai-workspace.tsx',
  'site/src/components/ai-native-graph.tsx',
  'site/src/components/ai-workspace.module.css',
  'site/src/lib/ai-workspace-mock.ts',
  'site/content/docs/zh/ai.mdx',
  'site/content/docs/en/ai.mdx',
  'site/content/docs/zh/concepts/architecture.mdx',
  'site/content/docs/en/concepts/architecture.mdx',
  'site/src/components/architecture-diagram.tsx',
  'skills/antv-g6lite-graph/SKILL.md',
  'skills/antv-g6lite-graph/agents/openai.yaml',
];
for (const file of aiArchitectureFiles) {
  if (!existsSync(path.join(root, file))) fail(`Missing AI or architecture artifact: ${file}`);
}

for (const locale of ['zh', 'en']) {
  const rootMetaPath = `site/content/docs/${locale}/meta.json`;
  const rootMeta = JSON.parse(read(rootMetaPath));
  if (!rootMeta.pages?.includes('ai')) fail(`${rootMetaPath} does not expose the AI page`);

  const conceptsMetaPath = `site/content/docs/${locale}/concepts/meta.json`;
  const conceptsMeta = JSON.parse(read(conceptsMetaPath));
  if (!conceptsMeta.pages?.includes('architecture')) {
    fail(`${conceptsMetaPath} does not expose the architecture page`);
  }

  const routePrefix = locale === 'en' ? '/en' : '';
  const indexPath = `site/content/docs/${locale}/index.mdx`;
  const indexSource = read(indexPath);
  for (const route of [`${routePrefix}/docs/ai`, `${routePrefix}/docs/concepts/architecture`]) {
    if (!indexSource.includes(route)) fail(`${indexPath} does not link to ${route}`);
  }

  const aiPath = `site/content/docs/${locale}/ai.mdx`;
  if (existsSync(path.join(root, aiPath))) {
    const aiSource = read(aiPath);
    for (const requiredReference of [
      'https://github.com/antvis/G6Lite/tree/master/skills/antv-g6lite-graph',
      'https://sive.antv.antgroup.com/qa?message=',
      '<ArchitectureDiagram',
    ]) {
      if (!aiSource.includes(requiredReference)) {
        fail(`${aiPath} does not include ${requiredReference}`);
      }
    }
  }

  const architecturePath = `site/content/docs/${locale}/concepts/architecture.mdx`;
  if (
    existsSync(path.join(root, architecturePath)) &&
    !read(architecturePath).includes(`<ArchitectureDiagram locale="${locale}" />`)
  ) {
    fail(`${architecturePath} does not render the shared ArchitectureDiagram`);
  }
}

const layoutSource = read('site/src/lib/layout.shared.tsx');
if (!layoutSource.includes("localizedPath('/ai', locale)")) {
  fail('The shared top navigation does not include the localized AI route');
}
if (layoutSource.includes("{ text: text.ai, url: localizedPath('/docs/ai', locale) }")) {
  fail('The shared top navigation still points AI to the documentation page');
}

const aiWorkspaceSource = read('site/src/components/ai-workspace.tsx');
const aiMockSource = read('site/src/lib/ai-workspace-mock.ts');
const aiNativeGraphSource = read('site/src/components/ai-native-graph.tsx');
for (const requiredSignal of [
  'In-site prototype · Mock',
  'G6Lite 原生 AI 画布',
  '<AiNativeGraph',
  'needsMockPromptClarification',
  'serializeMockGraph(result.graph)',
  'buildMockCode(result.graph)',
]) {
  if (!aiWorkspaceSource.includes(requiredSignal)) {
    fail(`The AI workspace does not include ${requiredSignal}`);
  }
}
for (const requiredNativeSignal of [
  "import('../../../src/index.ts')",
  'new GraphConstructor',
  'await instance.render()',
  'await instance.setData',
  'instance.fitView',
  'instance?.destroy()',
  "mount.dataset.graphEngine = 'g6lite'",
]) {
  if (!aiNativeGraphSource.includes(requiredNativeSignal)) {
    fail(`The native AI graph does not include ${requiredNativeSignal}`);
  }
}
if (existsSync(path.join(root, 'site/src/components/ai-graph-preview.tsx'))) {
  fail('The legacy SVG AI graph preview still exists');
}
for (const forbiddenIntegration of [
  'sive.antv.antgroup.com',
  '/api/chat/',
  'OPENROUTER_API_KEY',
  '<iframe',
]) {
  if (
    aiWorkspaceSource.includes(forbiddenIntegration) ||
    aiMockSource.includes(forbiddenIntegration) ||
    aiNativeGraphSource.includes(forbiddenIntegration)
  ) {
    fail(`The in-site AI prototype contains forbidden integration ${forbiddenIntegration}`);
  }
}

const sitemapSource = read('site/src/app/sitemap.ts');
for (const route of ["absoluteSiteUrl('/ai')", "absoluteSiteUrl('/en/ai')"]) {
  if (!sitemapSource.includes(route)) fail(`The sitemap does not include ${route}`);
}

const skillPath = 'skills/antv-g6lite-graph/SKILL.md';
if (existsSync(path.join(root, skillPath))) {
  const skillSource = read(skillPath);
  if (!/^name: antv-g6lite-graph$/m.test(skillSource)) {
    fail(`${skillPath} has an unexpected Skill name`);
  }
  if (!skillSource.includes('@antv/g6-lite')) {
    fail(`${skillPath} does not identify the @antv/g6-lite package`);
  }
  const deepImports = [
    ...skillSource.matchAll(
      /(?:from\s+|import\s*\(|require\s*\()(['"])(@antv\/g6-lite\/(?:src|dist)\/[^'"]+)\1/g,
    ),
  ];
  if (deepImports.length > 0) {
    fail(`${skillPath} contains a deep package import: ${deepImports[0][2]}`);
  }
}

if (failures.length > 0) {
  console.error(failures.map((message) => `- ${message}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Checked ${zhMdxFiles.length} Chinese and ${enMdxFiles.length} English documentation pages across locale directories.`,
  );
}
