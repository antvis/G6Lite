import { mkdir, mkdtemp, readdir, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// macOS exposes /var as a symlink to /private/var. Canonicalizing the temp
// directory keeps Vite's root and Rollup's resolved HTML input under the same
// path, so the emitted asset name stays relative to the consumer project.
const tempRoot = await mkdtemp(join(await realpath(tmpdir()), 'g6-gl-vite-smoke-'));

async function listFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relativePath = join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(join(directory, entry.name), relativePath)));
    } else {
      files.push(relativePath);
    }
  }
  return files;
}

try {
  await writeFile(
    join(tempRoot, 'index.html'),
    '<div id="app"></div><script type="module" src="/main.js"></script>',
  );
  await writeFile(
    join(tempRoot, 'main.js'),
    "import { Graph, runLayout } from '@antv/g6-gl'; console.log(Graph, runLayout);",
  );
  const packageScope = join(tempRoot, 'node_modules', '@antv');
  await mkdir(packageScope, { recursive: true });
  // Resolve the package as a consumer would, through package.json#exports.
  // The symlink keeps the smoke test local while still exercising the package
  // boundary instead of aliasing directly to a built file.
  await symlink(root, join(packageScope, 'g6-gl'), 'dir');

  const outDir = join(tempRoot, 'out');
  await build({
    // This is an isolated consumer project. Do not inherit the repository's
    // playground-oriented Vite config (its absolute Rollup inputs would leak
    // into this temporary root).
    configFile: false,
    root: tempRoot,
    logLevel: 'silent',
    build: { outDir, emptyOutDir: true },
  });

  const outputFiles = await listFiles(outDir);
  if (!outputFiles.some((file) => file.includes('layoutWorker'))) {
    throw new Error('Vite package smoke did not emit the layout worker chunk');
  }
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
