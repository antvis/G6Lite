import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Benchmark = require('benchmark');

export const BENCHMARK_MODES = {
  quick: {
    initCount: 1,
    minSamples: 3,
    minTime: 0.02,
    maxTime: 0.25,
  },
  full: {
    initCount: 1,
    minSamples: 10,
    minTime: 0.05,
    maxTime: 1.5,
  },
};

function toResult(suiteName, target, metadata) {
  const error = target.error ? String(target.error.stack ?? target.error) : undefined;
  const rme = Number(target.stats?.rme ?? 0);
  return {
    id: `${suiteName}/${target.name}`,
    suite: suiteName,
    name: target.name,
    scope: metadata.scope ?? 'internal',
    tier: metadata.tier,
    operation: metadata.operation,
    config: metadata.config ?? {},
    hz: Number(target.hz ?? 0),
    meanMs: Number(target.stats?.mean ?? 0) * 1000,
    rme,
    sampleSize: target.stats?.sample?.length ?? 0,
    cycles: Number(target.cycles ?? 0),
    status: error ? 'invalid' : rme > 10 ? 'warning' : 'pass',
    error,
  };
}

export function runBenchmarkSuite({ name, cases, mode = 'quick', onCycle }) {
  const defaults = BENCHMARK_MODES[mode] ?? BENCHMARK_MODES.quick;
  const metadataByName = new Map();
  return new Promise((resolve, reject) => {
    const suite = new Benchmark.Suite(name);
    for (const benchmarkCase of cases) {
      metadataByName.set(benchmarkCase.name, benchmarkCase.metadata ?? {});
      suite.add(benchmarkCase.name, benchmarkCase.fn, {
        ...defaults,
        ...(benchmarkCase.options ?? {}),
      });
    }

    const results = [];
    suite.on('cycle', (event) => {
      const target = event.target;
      const result = toResult(name, target, metadataByName.get(target.name) ?? {});
      results.push(result);
      onCycle?.(result, String(target));
    });
    suite.on('error', (event) => {
      const target = event.target;
      if (!target?.error) reject(new Error(`Benchmark suite ${name} failed`));
    });
    suite.on('complete', () => resolve(results));
    suite.run({ async: true, queued: true });
  });
}
