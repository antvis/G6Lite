# 更新日志 (/docs/changelog)



本页是 G6-GL 的变更入口。

> **关于发布机制**：G6-GL 当前处于 `0.1.0-beta` 阶段，发布说明暂按主题维护。正式版的版本发布与 Release Notes 自动化流程将在稳定版前单独确定。
>
> 下方汇总 beta 阶段已落地的重要变更，便于了解能力演进脉络。

## Beta 阶段变更脉络 [#beta-阶段变更脉络]

### API、扩展体系与公开边界重新基线（2026-07-21 ～ 2026-07-22） [#api扩展体系与公开边界重新基线2026-07-21--2026-07-22]

* `new Graph(options)` 继续作为唯一推荐且长期保留的创建入口，核心有状态模块继续使用 class。
* 新增统一 `register()` + `extensionFactory()` 范式；Behavior、Layout、Transform、Plugin 使用独立实例和一致的 `init / update / destroy` 生命周期。
* `ExtensionContext` 新增受控的 `data`、`state`、`viewport` 与 `requestRender()`；`context.graph` 和平铺坐标方法只保留 beta 兼容。
* 扩展数据查询返回只读快照；旧对象实例只做尽力克隆，有状态扩展通过 `extensionFactory()` 获得确定的实例隔离。
* 自定义 Node、Edge、Label、Decoration 和 Layout 统一采用 function / factory / config；`BaseNode`、`BreathingNode`、`registerNode()` 仅保留 beta deprecated 兼容层。
* 查询 API 使用只读 `NodeModel`、`EdgeModel`、`ComboModel` 和 `ElementModel`；`Internal*`、`DataModel`、`RenderScheduler`、`RefreshLevel`、`RendererData` 不再属于包根公开契约。
* `mindmap`、`indented`、`fishbone` 已改为无状态布局 executor；原有 layout 配置无需迁移，`worker: true` 也不会退化为其他布局。
* 补齐渲染与布局重入取消、Worker 请求隔离、Combo 关系清理、Label 异步销毁及 Node/Edge 扩展错误隔离。
* 当前包保持 ESM-only。源码相对 import 的 `.js` 后缀服务于 Node ESM 产物解析，本轮不删除。

从 G6 v5 迁移的项目可参考 [G6 v5 迁移说明](/docs/advanced/g6-v5-migration)。

### 交互事件统一调度（2026-06-10） [#交互事件统一调度2026-06-10]

新增统一的**交互调度层**做唯一命中检测与事件分发，所有发事件的 behavior 收敛为消费者；在此基础上新增 `tooltip` behavior，开箱即用。

* 事件名对齐 G6 的 `pointer*` 规范（`node:pointerover` / `pointermove` / `pointerleave` 等）。
* **破坏性**：旧事件名（`node:hover` / `node:mouseleave`）已废弃，监听方需迁移。
* 单次 `pickAt` 全局共享，消除重复 picking 与潜在双发。

### Combo 分组（2026-05-20 起，含 06-10 指针事件补齐） [#combo-分组2026-05-20-起含-06-10-指针事件补齐]

* 节点分组容器，支持嵌套、折叠 / 展开与整体拖拽。
* 补齐 `combo:click` / `combo:contextmenu` / `combo:dragend` 等指针事件。
* 标注为 experimental，API 在 0.1.x 内可能微调。

### 首屏渲染与性能优化（2026-05-26 ～ 06-04） [#首屏渲染与性能优化2026-05-26--06-04]

* 分级刷新调度（`RefreshLevel`）+ GPU patch，高亮 / 状态变更增量更新近零成本。
* 静态样式优先（static style priority）路径，减少冗余样式解析。
* 消除首屏冗余 draw call；力导向 / fa2 大图崩溃修复。
* DataModel Array / 列存化，Float32Array 指数增长缓冲，降低 GC 压力。

### 数据 / 事件 API 升级（P0 + P1，2026-05-19） [#数据--事件-api-升级p0--p12026-05-19]

* 数据查询：`getNodeData` / `getEdgeData`（O(1)）、`getNeighborNodes` / `getAdjacentEdges`。
* 数据变更：`addNode(s)` / `removeNode(s)` / `updateNodeData` / `setData`。
* 生命周期 / 数据事件：`afterrender`、`afteradditem` / `afterremoveitem` / `afterupdateitem`。
* 状态：`setItemState` / `batchSetState` / `getItemStates` / `findNodesByState`。

### 视觉升级（0.4.0 里程碑，2026-04-15） [#视觉升级040-里程碑2026-04-15]

* 边箭头改为飞镖 / 燕尾形，尖端停在目标节点边缘，边体在箭头凹口处截断避免重叠。
* 默认节点尺寸调整为 24px，对齐设计稿。

### 治理与官网（2026-06 起） [#治理与官网2026-06-起]

* 治理文件齐备：`CONTRIBUTING` / `CODE_OF_CONDUCT` / Issue & PR 模板。
* 官网站点（Next.js + Fumadocs）+ 三份指标文档（包大小 / 浏览器兼容 / 性能）。
* CI 接入覆盖率门槛与 size-limit 体积门禁。

## 相关链接 [#相关链接]

* [项目介绍](/docs/guide/introduction)
* [常见问题](/docs/faq)
* [性能指标](/docs/metrics/performance)
