# 包体积 (/docs/metrics/bundle-size)



G6Lite 与主流图表、图可视化库的包体积对比如下：

| 库        |       Minified | Minified + Gzip |
| -------- | -------------: | --------------: |
| G6Lite   | **202.5 KB** ⭐ |   **95.7 KB** ⭐ |
| G6       |     1,400.9 KB |        399.8 KB |
| ECharts  |     1,114.8 KB |        368.0 KB |
| Sigma.js |       375.2 KB |         96.7 KB |

数据截至 2026-11-03：G6Lite 0.1.0-beta.27 为 `dist/index.js` 构建产物实测（初始入口，布局按需加载，不计入初始体积）；G6 5.1.1、ECharts 6.1.0、Sigma.js 4.0.4 数据来自 Bundlephobia。
