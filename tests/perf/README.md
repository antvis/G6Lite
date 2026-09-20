# G6Lite Performance Benchmarks

The performance workspace separates two measurement layers:

- Benchmark.js microbenchmarks for repeatable CPU and API operations.
- Browser scenarios for first render, frame pacing, Long Tasks, and memory.

## Commands

```bash
npm run benchmark
npm run benchmark -- --suite node
npm run benchmark -- --suite browser --mode full
node tests/perf/compare.js performance/current.json performance/baseline.json
```

`benchmark` builds the package and runs the quick Node and browser suites by
default. Use `--suite node`, `--suite browser`, or `--suite all` to select the
runtime, and `--mode quick` or `--mode full` to select the workload. Reports are
written to the ignored `performance/` directory.

The browser suite starts an isolated Vite server, runs the Benchmark.js browser
suite and scenario matrix in Headless Chrome, then writes the same report
formats.

The scheduled GitHub Actions workflow runs the full suite with Node 20 and a
fixed Chromium installation. Pull requests run only the quick Node suite and
upload reports without enforcing a performance threshold.

Microbenchmark results are comparable only when the environment, input tier,
configuration, and benchmark mode match. Browser scenario results must also use
the same browser version, viewport, and device pixel ratio.

## Result interpretation

- `hz`: operations per second; higher is better.
- `meanMs`: average duration of one operation; lower is better.
- `rme`: relative margin of error; lower is more trustworthy.
- `sampleSize`: number of statistical samples collected by Benchmark.js.

The quick mode is intended for smoke checks. The full mode gathers more samples
and includes heavier layout cases.
