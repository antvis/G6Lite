# Bundle size (/en/docs/metrics/bundle-size)



G6-GL measures the `dist/index.js` package entry and all reachable dependencies with size-limit. The repository budget is **120 kB after minification and brotli compression**.

```bash
npm run build
npm run size
```

The 2026-07-24 verification result for this workspace was **115.49 kB brotli**, below the budget. Treat that number as version-specific acceptance evidence; run the command on the current checkout for the latest value.

Import from the package root, use a tree-shaking bundler, enable production compression, and inspect the final application bundle. Do not compare libraries unless feature scope and dependency boundaries are equivalent.
