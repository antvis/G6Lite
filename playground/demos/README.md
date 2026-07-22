# G6-GL Demos

This directory holds the runnable examples that power the G6-GL playground. There are **32 demos** in total; the table below marks **8 featured demos (⭐)** curated as the external showcase for the 0.1.0 release.

Every demo is a standalone ES module exporting a single `run(container)` function:

```ts
export async function run(container: string | HTMLElement): Promise<{ destroy?: () => void }>;
```

They are registered in [`index.ts`](./index.ts), which also imports each file with Vite's `?raw` suffix so the playground can show the source side-by-side.

## Running the demos

From the repository root:

```bash
npm install
npm run dev          # starts the Vite dev server (auto-opens the browser)
```

The playground opens at **http://localhost:5173** with a G6-website-style layout: demo list on the left, live preview in the center, source code on the right. Click any demo in the sidebar (or use the `#<id>` URL hash, e.g. `http://localhost:5173/#fishbone`) to run it.

## Featured demos (external showcase — 8)

| ⭐ | id | Name | What it shows |
| --- | --- | --- | --- |
| ⭐ | `basic` | 最简示例 | Minimal graph: nodes + edges + default layout. The 5-line "hello world". |
| ⭐ | `large-labeled` | 5000 节点 + 标签 | Large-scale rendering (5K nodes) with labels — WebGL performance + label renderer. |
| ⭐ | `layouts` | 布局切换 | Switching between force / grid / circular / radial layouts at runtime. |
| ⭐ | `theme` | 主题切换 | Light / dark themes and per-token theme overrides. |
| ⭐ | `combo` | Combo 分组容器 | Combo grouping containers with collapse/expand. |
| ⭐ | `mindmap` | 思维导图 | Mindmap tree layout. |
| ⭐ | `fishbone` | 鱼骨图 | Fishbone (Ishikawa) diagram layout. |
| ⭐ | `behaviors` | 交互高亮 | Built-in behaviors: zoom, drag, hover/click highlight, and Shift+drag brush-select (`brushSelect`). |

> Note: brush/lasso selection ships as the `brushSelect` / `lassoSelect` behaviors (see `src/behaviors/brushSelect.ts`). The `behaviors` demo wires up `{ type: 'brush-select', key: 'shift' }` so plain drag pans the canvas while Shift+drag selects nodes — exercised inline rather than on a standalone page.

## All demos

### Getting started
- `basic` — 最简示例 ⭐
- `set-data` — `setData` + `layout()` lifecycle
- `incremental-nodes` — 使用 `addNodes()` 增量新增可见、可选择的孤立节点
- `drag-node-threshold` — 验证单击不触发拖拽，超过阈值才发出 drag 事件
- `brush-click-select` — 验证 Shift 框选结果不会被同一手势的 click 清空
- `fit-incremental-nodes` — 验证完整替换后的增量节点参与 `fitView()`
- `batch-node-positions` — 使用 `updateNodePositions()` 批量同步坐标
- `set-data-fit-options` — 验证 `setData()` 的 `maxZoom` 与 `fitView:false`
- `self-loop-labels` — 验证自环标签沿真实曲线定位
- `shapes` — 图形类型 (circle / rect / …)

### Nodes
- `node-style` — 节点样式
- `node-states` — 节点状态 (6 态)
- `breathing-node` — 呼吸节点
- `node-border` — 节点边框 + 圆角
- `labels` — 标签 + 图标
- `custom-label-renderer` — 节点和边共用的自定义 Label Renderer
- `custom-node-extension` — 函数式自定义节点 + 显式边 ID：统一 register、Combo 状态

### Edges
- `edge-types` — 边类型 (直线 / 虚线 / 弧线)
- `edge-colors` — 边颜色 (分类色板)
- `edge-arrows` — 箭头方向
- `edge-states` — 边状态 + 权重矩阵
- `edge-loops` — 自环边 (嵌套)
- `parallel-edges` — 平行边自动错开

### Layouts & diagrams
- `layouts` — 布局切换 ⭐
- `mindmap` — 思维导图 ⭐
- `fishbone` — 鱼骨图 ⭐
- `flowchart` — 流程图 (决策树)
- `org-chart` — 组织架构图
- `indented-tree` — 缩进树 (目录结构)
- `relationship` — 人物关系网络图

### Interaction
- `behaviors` — 交互高亮 (zoom / drag / highlight / brush-select) ⭐
- `hover` — Hover 高亮
- `tooltip` — Tooltip 浮层

### Theming & grouping
- `theme` — 主题切换 (light / dark) ⭐
- `combo` — Combo 分组容器 ⭐

### Scale & performance
- `large` — 较大规模 (200 节点)
- `large-labeled` — 5000 节点 + 标签 ⭐
- `performance` — 性能测试 (1K / 5K / … 分档基准)
- `real-dataset` — 真实数据集 (sigma 同款 8.8K 节点)

## Adding a new demo

1. Create `playground/demos/<my-demo>.ts` exporting `run(container)`.
2. Register it in [`index.ts`](./index.ts): add the module import, the `?raw` source import, and an entry in the `demos` array.
3. It appears in the playground sidebar automatically.
