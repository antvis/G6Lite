import { execFileSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

function readArgument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? (process.argv[index + 1] ?? fallback) : fallback;
}

const mode = readArgument('--mode', 'quick');
const suite = readArgument('--suite', 'all');
const outputDirectory = readArgument('--output-dir', 'performance');

if (!['quick', 'full'].includes(mode)) {
  throw new Error(`Unsupported benchmark mode: ${mode}`);
}
if (!['node', 'browser', 'all'].includes(suite)) {
  throw new Error(`Unsupported benchmark suite: ${suite}`);
}

function run(script) {
  execFileSync(
    process.execPath,
    [path.resolve(`tests/perf/${script}`), '--mode', mode, '--output-dir', outputDirectory],
    { stdio: 'inherit' },
  );
}

if (suite === 'node' || suite === 'all') run('run-micro.js');
if (suite === 'browser' || suite === 'all') run('run-browser.js');
