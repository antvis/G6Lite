import { readFile } from 'node:fs/promises';

// Package self-reference intentionally resolves through package.json#exports.
// A direct ../dist import would miss a broken published entry point.
const publicApi = await import('@antv/g6-gl');
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const rootExport = packageJson.exports?.['.'];

if (packageJson.type !== 'module' || rootExport?.import !== './dist/index.js') {
  throw new Error('Package must expose ./dist/index.js as its ESM root entry');
}
if (rootExport && 'require' in rootExport) {
  throw new Error('Package is ESM-only and must not publish a separate require condition');
}

for (const internalPath of ['@antv/g6-gl/dataModel', '@antv/g6-gl/dist/dataModel.js']) {
  try {
    await import(internalPath);
    throw new Error(`Internal package path unexpectedly resolved: ${internalPath}`);
  } catch (error) {
    if (error?.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED') throw error;
  }
}

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
    `Built ESM runtime exports changed:\nexpected ${expectedRuntimeExports.join(
      ', ',
    )}\nactual   ${actualRuntimeExports.join(', ')}`,
  );
}
