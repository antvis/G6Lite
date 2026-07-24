# P5 发布口径冻结记录

## 命名

- 产品与官网品牌：G6-GL
- npm 包：`@antv/g6-gl`
- GitHub 仓库：`antvis/G6Lite`
- 正式域名：`https://g6-gl.antv.vision`
- 中文定位：基于 WebGL 的高性能轻量图可视化引擎
- 英文定位：A lightweight, high-performance WebGL graph visualization engine

`G6Lite` 仅用于仓库名、历史脚本标识和性能报告文件名，不作为对外产品品牌。

## 公开 API

- 公开边界：`package.json#exports` 与 `src/index.ts` 包根导出。
- 推荐入口：`Graph`、`register()`、`extensionFactory()`、`runLayout()` 及包根配置类型。
- deprecated：`BaseNode`、`BreathingNode`、`registerNode()`、`context.graph`、ExtensionContext 平铺坐标方法、`Graph#getAllData()`、旧事件 `originalEvent`。
- experimental：Combo 的折叠、嵌套和运行时归组能力。
- 2026-07-24 已执行 `npm run typecheck`，公开 API 与包消费类型契约通过。

## Benchmark

- 唯一运行入口：`npm run benchmark -- --suite <node|browser|all> --mode <quick|full>`。
- 公开结果必须包含版本、commit、运行时、操作系统、CPU、浏览器、视口、DPR、数据规模和配置。
- 首页不展示跨机器不可比较的绝对跑分；只展示 WebGL 1.0、15+ 布局和 120 kB brotli 体积预算等稳定事实。
- 2026-07-24 quick Node + Browser 基线已成功运行；当前包体积为 115.49 kB brotli，低于 120 kB 门槛。
- quick 报告用于运行链路验收，不作为跨机器营销数据。

## 案例

- `playground/demos/catalog.json` 是唯一案例清单。
- 2026-07-24 已执行 Release profile，46 个发布案例全部通过。
- 官网只展示 `audiences` 包含 `site` 的学习案例；回归和性能检查默认只保留在 Playground。
- 官网分类通过 `docsGroup` 表达，不改变 P4 已建立的 `category`、`kind` 和 `releaseCheck`。
