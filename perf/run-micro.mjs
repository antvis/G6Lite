import path from 'node:path';
import process from 'node:process';
import { runBenchmarkSuite } from './core/benchmark-runner.mjs';
import { collectNodeEnvironment } from './core/environment.mjs';
import { writeJsonReport } from './reporters/json.mjs';
import { writeMarkdownReport } from './reporters/markdown.mjs';
import { createDataModelSuite } from './suites/data-model.bench.mjs';
import { createLayoutSuite } from './suites/layout.bench.mjs';

function readArgument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] ?? fallback : fallback;
}

const mode = readArgument('--mode', 'quick');
if (!['quick', 'full'].includes(mode)) {
  throw new Error(`Unsupported benchmark mode: ${mode}`);
}
const outputDirectory = path.resolve(readArgument('--output-dir', 'performance'));
const environment = await collectNodeEnvironment(mode);
const suites = await Promise.all([createDataModelSuite(mode), createLayoutSuite(mode)]);
const micro = [];

for (const suite of suites) {
  console.log(`\n[benchmark] ${suite.name}`);
  const suiteResults = await runBenchmarkSuite({
    ...suite,
    mode,
    onCycle(_result, formatted) {
      console.log(`  ${formatted}`);
    },
  });
  micro.push(...suiteResults);
}

const warnings = micro
  .filter((result) => result.status !== 'pass')
  .map((result) => `${result.id}: ${result.error ?? `RME ${result.rme.toFixed(2)}%`}`);
const report = {
  schemaVersion: 1,
  environment,
  micro,
  scenarios: [],
  warnings,
};
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const basename = `g6lite-benchmark-${mode}-${stamp}`;
const [jsonPath, markdownPath] = await Promise.all([
  writeJsonReport(report, outputDirectory, basename),
  writeMarkdownReport(report, outputDirectory, basename),
]);

console.log(`\nJSON report: ${jsonPath}`);
console.log(`Markdown report: ${markdownPath}`);

if (micro.some((result) => result.status === 'invalid')) process.exitCode = 1;
