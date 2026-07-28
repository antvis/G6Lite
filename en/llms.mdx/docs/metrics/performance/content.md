# Benchmark and performance metrics (/en/docs/metrics/performance)



G6-GL uses one repository runner for Node microbenchmarks and browser scenarios. Results are comparable only when version, commit, hardware, runtime, data, configuration, and sampling mode match.

```bash
npm run benchmark -- --suite all --mode quick
```

* `--suite node` covers DataModel and layout microbenchmarks.
* `--suite browser` covers public Graph API updates, first render, viewport interaction, picking, and memory trends.
* `--mode quick` validates the runner and release path.
* `--mode full` expands workloads and samples for reviewed baselines.

Reports are written to `performance/` as JSON and Markdown. Raw local reports are not committed by default. Public comparisons must record the G6-GL version and Git state, Node and Chromium versions, operating system, CPU, user agent, viewport, DPR, data scale, layout configuration, sample count, RME, and warnings.

Quick results are smoke evidence, not marketing baselines. Use realistic data and target devices before making a product decision. See [performance tuning](/en/docs/metrics/performance-tuning).
