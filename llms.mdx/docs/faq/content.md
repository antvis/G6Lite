# 常见问题 (/docs/faq)



## G6-GL 和 G6 v5 怎么选？ [#g6-gl-和-g6-v5-怎么选]

G6-GL 聚焦 WebGL 渲染、高频状态更新和受控能力边界；G6 v5 提供更完整的插件、动画、元素与通用图可视化生态。请用真实数据验证目标场景，不按未经复现的绝对跑分或体积倍数选型。

如果核心问题是大规模关系图的浏览器渲染和分析交互，可以优先评估 G6-GL；如果重度依赖完整插件生态、复杂动画或图论能力，应优先评估 G6 v5。

## 力导向布局首屏慢怎么办？ [#力导向布局首屏慢怎么办]

首屏耗时通常由数据准备和布局计算主导。可按以下顺序排查：

* 已有坐标时直接传入 `x` / `y`，省略重复布局。
* 控制 force 系布局的迭代次数，并评估 `worker: true`。
* 大图总览优先使用 grid、circular 等确定性布局。
* 使用 [Benchmark 运行器](/docs/metrics/performance) 区分布局与渲染耗时。

## 高亮或选中卡顿怎么办？ [#高亮或选中卡顿怎么办]

使用 `setItemState()` 或 `batchSetState()` 表达运行时状态，不要为了高亮而替换整份数据。批量位置和业务数据更新也应优先使用批量 API，避免同一帧触发大量独立调度。

## 浏览器和 WebGL 要求是什么？ [#浏览器和-webgl-要求是什么]

G6-GL 需要 WebGL 1.0、Canvas 2D 和现代 ESM/ES2020 浏览器环境，不要求 WebGL 2.0。最低版本、移动端注意事项和硬件加速边界见 [浏览器与运行环境](/docs/compatibility/browser)。

## 能在 Node.js 或 SSR 阶段直接运行吗？ [#能在-nodejs-或-ssr-阶段直接运行吗]

不能。`Graph` 依赖真实 DOM、Canvas 和 WebGL 上下文。在 Next.js、Nuxt 等框架中应只在客户端生命周期创建实例，并在组件卸载时调用 `destroy()`。

## TypeScript 类型从哪里导入？ [#typescript-类型从哪里导入]

值和类型都从包根导入：

```ts
import { Graph } from '@antv/g6-gl';
import type { EdgeConfig, GraphData, GraphOptions, NodeConfig } from '@antv/g6-gl';
```

`src/` 深层路径不是公开 API。详细边界见 [API 稳定性](/docs/compatibility/api-stability)。

## Combo 可以使用吗？ [#combo-可以使用吗]

Combo 已支持分组容器、嵌套、折叠和运行时归组，但这些能力在 `0.1.x` 仍标记为 experimental。正式使用前需要覆盖真实嵌套层级、增量更新和折叠交互回归。

## 示例能在线运行吗？ [#示例能在线运行吗]

官网示例链接到随静态站点一起部署的 Playground，并与 `playground/demos/catalog.json`、源码、截图和 Release profile 检查共用同一份案例清单。入口见 [示例](/docs/examples)。
