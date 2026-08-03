# Bundle size (/en/docs/metrics/bundle-size)



G6Lite measures the initial `dist/index.js` payload and each real layout usage path with size-limit. The initial entry has a **90 kB minified and brotli-compressed budget**; the initial entry plus any one official layout keeps the existing **120 kB budget**.

```bash
npm run build
npm run size
```

The 2026-07-30 workspace result is **83.17 kB / 90 kB** before a layout is loaded. The official layout paths range from **86.70 kB to 119.48 kB / 120 kB**, with Dagre currently the largest. Layout algorithms are selected through internal dynamic imports; users do not need separate registration calls. Run the command on the current checkout for the latest result.

Import from the package root, use a tree-shaking bundler, enable production compression, and inspect the final application bundle. Do not compare libraries unless feature scope and dependency boundaries are equivalent.
