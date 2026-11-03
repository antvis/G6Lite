# Homepage bundle measurement snapshot

Measured on 2026-11-03 from core sources at `a36fa95b`, version `0.1.0-beta.27`.
The root core sources and limit-size configuration had no local changes during measurement.

```sh
npm run build
npm run size
```

The initial-entry result was `95,726 bytes` (deterministic `gzip -9 -n` of `dist/index.js`), with all configured limits passing.
This is minified + Gzip size with layouts excluded, using the `limit-size` setup in `package.json`.
Both homepages display decimal kB (`1000 bytes`), rounded to one decimal: **95.7 kB**.
It is not the npm tarball size, a browser speed score, or a guarantee of the incremental network cost in every application.

When the core, dependencies or measurement configuration change, rebuild and rerun the same command before updating `bundle-measurement.json`.
Do not replace the measurement with its 100 KB budget; preserve existing size gates.
