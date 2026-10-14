# Homepage bundle measurement snapshot

Measured on 2026-10-13 from core sources at `74bb73dc`, version `0.1.0-beta.27`.
The root core sources and size-limit configuration had no local changes during measurement.

```sh
npm run build
npm run size -- --json
```

The initial-entry result was `83,780 bytes`, with all configured limits passing.
This is minified + Brotli size with layouts excluded, using the existing `.size-limit.mjs` setup.
Both homepages display decimal kB (`1000 bytes`), rounded to one decimal: **83.8 kB**.
It is not the npm tarball size, a browser speed score, or a guarantee of the incremental network cost in every application.

When the core, dependencies or measurement configuration change, rebuild and rerun the same command before updating `bundle-measurement.json`.
Do not replace the measurement with its 90 kB budget; preserve existing size gates.
