# 包体积 (/docs/metrics/bundle-size)



G6Lite 使用 [limit-size](https://github.com/yutingzhao1991/limit-size) 对构建产物做体积门禁，门槛配置在根目录 `package.json` 的 `limit-size` 字段。ESM 入口 `dist/index.js` 保持 &#x2A;*100 KB（gzip）** 门槛，浏览器直引的 UMD 产物 `dist/g6-lite.min.js` 保持 &#x2A;*200 KB（gzip）** 门槛。

## 测量口径 [#测量口径]

* 入口：`dist/index.js`，对应 `import { Graph } from '@antv/g6-lite'`。
* 范围：核心引擎与运行时依赖；布局算法不内联，由内部动态 import 按类型加载，用户无需手动注册。
* 处理：`npm run size` 直接对构建产物执行 gzip 压缩后与门槛比较。
* 门槛：`package.json#limit-size` 分别约束 `dist/index.js` 和 `dist/g6-lite.min.js`。

## 复现 [#复现]

```bash
npm run build
npm run size
```

2026-11-03 当前工作区结果为：`dist/index.js` **93.5 KB / 100 KB**；`dist/g6-lite.min.js` **166.8 KB / 200 KB**。最新结果以当前 checkout 执行 `npm run size` 为准。

## 使用建议 [#使用建议]

* 从包根导入公开 API，让业务打包器可以正确分析依赖。
* 使用支持 tree-shaking 的 Vite、Rollup、esbuild 或等价工具；包已声明 `sideEffects: false`。
* 生产 CDN 开启 brotli 或 gzip，并以业务最终 bundle analyzer 结果评估真实增量。
* 不把 G6Lite 与功能范围、依赖口径不同的图库做未经复现的体积倍数比较。

体积门槛是工程约束，不代表所有业务只增加同等下载量；业务打包器版本、去重策略和已有共享依赖都会影响最终结果。
