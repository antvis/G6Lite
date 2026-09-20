import { readFile } from 'node:fs/promises';
import process from 'node:process';

const [currentPath, baselinePath] = process.argv.slice(2);
const force = process.argv.includes('--force');

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

if (!currentPath || !baselinePath) {
  console.error('Usage: node tests/perf/compare.js <current.json> <baseline.json>');
  process.exitCode = 1;
} else {
  const [current, baseline] = await Promise.all([
    readFile(currentPath, 'utf8').then(JSON.parse),
    readFile(baselinePath, 'utf8').then(JSON.parse),
  ]);
  const comparableEnvironmentFields =
    current.environment.runtime === 'browser'
      ? ['runtime', 'mode', 'userAgent', 'viewport', 'devicePixelRatio']
      : ['runtime', 'mode', 'nodeVersion', 'platform', 'architecture', 'cpuModel'];
  const mismatches = comparableEnvironmentFields.filter(
    (field) =>
      stableStringify(current.environment[field]) !== stableStringify(baseline.environment[field]),
  );
  if (mismatches.length > 0 && !force) {
    console.error(`Benchmark environments differ: ${mismatches.join(', ')}`);
    console.error('Use --force only when the difference is intentional.');
    process.exitCode = 1;
  } else {
    const baselineById = new Map(baseline.micro.map((result) => [result.id, result]));
    let compared = 0;
    const configurationMismatches = [];
    for (const result of current.micro) {
      const previous = baselineById.get(result.id);
      if (!previous || !previous.hz) continue;
      if (stableStringify(result.config ?? {}) !== stableStringify(previous.config ?? {})) {
        configurationMismatches.push(result.id);
        if (!force) continue;
      }
      compared++;
      const change = ((result.hz - previous.hz) / previous.hz) * 100;
      const label = change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
      console.log(`${result.id}: ${label} ops/sec`);
    }
    if (configurationMismatches.length > 0 && !force) {
      console.error(`Benchmark configurations differ: ${configurationMismatches.join(', ')}`);
      console.error('Use --force only when the configuration difference is intentional.');
      process.exitCode = 1;
    }
    if (compared === 0) {
      console.error('No matching benchmark IDs were found.');
      process.exitCode = 1;
    }
  }
}
