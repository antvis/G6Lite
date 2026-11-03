# Bundle size (/en/docs/metrics/bundle-size)



Bundle size comparison between G6Lite and mainstream charting and graph visualization libraries:

| Library      |   Minified | Minified + Gzip |
| ------------ | ---------: | --------------: |
| **G6Lite** ⭐ |   202.5 KB |     **95.7 KB** |
| G6           | 1,400.9 KB |        399.8 KB |
| ECharts      | 1,114.8 KB |        368.0 KB |
| Sigma.js     |   375.2 KB |         96.7 KB |

As of 2026-11-03: G6Lite 0.1.0-beta.27 is measured from the built `dist/index.js` (initial entry; layouts load on demand and are not counted). G6 5.1.1, ECharts 6.1.0, and Sigma.js 4.0.4 are measured via Bundlephobia.
