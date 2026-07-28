# Performance tuning (/en/docs/metrics/performance-tuning)



* Reuse backend coordinates when available and omit layout.
* Control iterations for force layouts and consider `worker: true`.
* Prefer deterministic layouts for large overview screens.
* Use state and batch update APIs for high-frequency interaction.
* Keep functional style callbacks inexpensive and precompute complex mappings.
* Limit initial labels; reveal more by zoom, focus, or selection.

```bash
npm run benchmark -- --suite all --mode quick
npm run benchmark -- --suite browser --mode full
```

Compare only equivalent environments and configurations. Desktop Headless Chrome cannot replace real mobile or low-end device testing.
