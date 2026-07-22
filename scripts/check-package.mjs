import { access, readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const rootExport = packageJson.exports?.['.'];
const publishedDirectories = [...(packageJson.files ?? [])].sort();

if (
  packageJson.type !== 'module' ||
  packageJson.main !== 'dist/index.js' ||
  packageJson.module !== 'dist/index.js' ||
  rootExport?.import !== './dist/index.js' ||
  Object.hasOwn(rootExport ?? {}, 'require')
) {
  throw new Error('Package root must expose dist/index.js as ESM-only');
}

if (JSON.stringify(publishedDirectories) !== JSON.stringify(['dist', 'src'])) {
  throw new Error('Package files must publish both dist and src');
}

// Resolve through package.json#exports so this exercises the published root entry.
const publicApi = await import('@antv/g6-gl');
const expectedRuntimeExports = [
  'BaseNode',
  'BreathingNode',
  'EventEmitter',
  'Graph',
  'extensionFactory',
  'register',
  'registerNode',
  'resolveTheme',
  'runLayout',
];
const actualRuntimeExports = Object.keys(publicApi).sort();

if (JSON.stringify(actualRuntimeExports) !== JSON.stringify(expectedRuntimeExports)) {
  throw new Error(
    `Public runtime exports changed:\nexpected ${expectedRuntimeExports.join(
      ', ',
    )}\nactual   ${actualRuntimeExports.join(', ')}`,
  );
}

await access(new URL('../dist/layout/layoutWorker.js', import.meta.url));
await access(new URL('../src/index.ts', import.meta.url));
