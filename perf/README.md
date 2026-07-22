# G6Lite Performance Benchmarks

The performance workspace separates two measurement layers:

- Benchmark.js microbenchmarks for repeatable CPU and API operations.
- Browser scenarios for first render, frame pacing, Long Tasks, and memory.

## Commands

```bash
npm run bench:micro
npm run bench:scenario
npm run bench:full
npm run bench:browser
npm run bench:compare -- performance/current.json performance/baseline.json
```

`bench:micro` builds the package before importing internal compiled modules. It
writes JSON and Markdown reports to the ignored `performance/` directory.

`bench:scenario` starts an isolated Vite server, runs the Benchmark.js browser
suite and the quick scenario matrix in Headless Chrome, then writes the same
report formats. `bench:browser` opens the interactive page for manual analysis.

The scheduled GitHub Actions workflow runs `bench:full` with Node 20 and a fixed
Chromium installation. Pull requests run only the quick Node microbenchmark and
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
