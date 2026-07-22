import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const { stdout } = await execFileAsync('npm', ['pack', '--json', '--dry-run', '--ignore-scripts'], {
  cwd: new URL('..', import.meta.url),
});
const [packResult] = JSON.parse(stdout);
const files = new Set(packResult.files.map((file) => file.path));

for (const required of ['dist/index.js', 'dist/index.d.ts', 'dist/layout/layoutWorker.js']) {
  if (!files.has(required)) throw new Error(`Packed package is missing ${required}`);
}

for (const path of files) {
  if (path.endsWith('.cjs')) {
    throw new Error(`ESM-only package unexpectedly includes ${path}`);
  }
  if (path.startsWith('src/') || path.startsWith('playground/') || path.startsWith('site/')) {
    throw new Error(`Packed package unexpectedly includes ${path}`);
  }
}
