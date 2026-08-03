# 从 G6 v5 迁移 (/docs/compatibility/g6-v5-migration)



G6Lite 沿用了 G6 的许多配置心智，但不是 `@antv/g6` 的兼容构建，也不承诺配置和实例 API 原样运行。本页以 `@antv/g6@5.1.1` 与 `@antv/g6-lite@0.1.0-beta.22` 为基线，核对日期为 **2026-08-03**。

## 先判断是否应该迁移 [#先判断是否应该迁移]

适合迁移的项目通常同时满足：目标浏览器稳定支持 WebGL；瓶颈集中在大图渲染后的拾取、状态和批量更新；主要使用 circle / rect、常用边、标签、Combo 和基础交互；能够接受 G6Lite `0.1.x` beta 的 API 稳定性边界。

以下场景不建议直接迁移：依赖 G6 v5 的多 renderer、Node.js 服务端渲染、React 节点、3D、完整动画编排、丰富内置插件、图算法，或大量任意 Canvas/SVG 场景图形状。先阅读[常用图库能力对比](/docs/compatibility/library-comparison)，再用真实数据做并行验证。

## 安装与导入 [#安装与导入]

```bash
npm install @antv/g6-lite
```

```ts
// G6 v5
import { Graph, NodeEvent } from '@antv/g6';

// G6Lite：只从包根导入公开 API
import { Graph, register, extensionFactory } from '@antv/g6-lite';
import type { GraphData, GraphEventMap, GraphOptions } from '@antv/g6-lite';
```

不要把 `@antv/g6/lib/...` 或 G6Lite 的 `src/...` 深层路径作为迁移目标。G6Lite 的公开契约只包括 `package.json#exports` 和包根导出。

## 最小配置对照 [#最小配置对照]

G6 v5：

```ts
import { Graph } from '@antv/g6';

const graph = new Graph({
  container: 'container',
  data: {
    nodes: [
      { id: 'a', data: { label: 'A' } },
      { id: 'b', data: { label: 'B' } },
    ],
    edges: [{ id: 'a-b', source: 'a', target: 'b' }],
  },
  node: {
    type: 'circle',
    style: {
      size: 24,
      fill: '#1783FF',
      labelText: (datum) => String(datum.data?.label ?? datum.id),
    },
  },
  edge: { type: 'line', style: { stroke: '#B8C2D1', endArrow: true } },
  layout: { type: 'force', linkDistance: 100 },
  behaviors: ['zoom-canvas', 'drag-canvas', 'drag-element', 'click-select'],
});

await graph.render();
```

等价的 G6Lite 起点：

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: 'container',
  data: {
    nodes: [
      { id: 'a', data: { label: 'A' } },
      { id: 'b', data: { label: 'B' } },
    ],
    edges: [{ id: 'a-b', source: 'a', target: 'b' }],
  },
  node: {
    type: 'circle',
    style: {
      size: 24,
      fill: '#1783FF',
      label: (node) => String(node.data?.label ?? node.id),
    },
  },
  edge: { type: 'line', style: { stroke: '#B8C2D1', endArrow: true } },
  layout: { type: 'force', linkDistance: 100 },
  behaviors: [
    { type: 'zoom-canvas', sensitivity: 0.0015, minZoom: 0.1, maxZoom: 20 },
    'drag-canvas',
    'drag-node',
    'click-select',
  ],
});

await graph.render();
```

关键差异是 `labelText` 改为 `label`、`drag-element` 改为 `drag-node`，并且 G6Lite 的节点、边和扩展样式字段需要按其公开类型重新核对。

## GraphOptions 对照 [#graphoptions-对照]

| 配置                        | G6 v5                  | G6Lite 迁移方式                                                  |
| ------------------------- | ---------------------- | ------------------------------------------------------------ |
| `container`               | 支持字符串或容器               | 同样支持字符串或 `HTMLElement`                                       |
| `data`                    | nodes / edges / combos | 同样使用 nodes / edges / combos，但 G6Lite 要求 `nodes`、`edges` 数组存在 |
| `node` / `edge` / `combo` | 完整元素配置                 | 均支持，但类型、样式字段和扩展机制不是逐字段兼容                                     |
| `layout`                  | 内置与自定义布局               | 支持 14 个内置布局和注册布局；具体算法选项需逐项验证                                 |
| `behaviors`               | Behavior 名称或配置         | 支持字符串或对象；名称和选项见下方映射                                          |
| `transforms`              | 内置和自定义 Transform       | 支持 `process-parallel-edges` 与注册 Transform，但生命周期契约不同          |
| `plugins`                 | 丰富内置与自定义插件             | 支持注册 Plugin 生命周期；当前内置插件与生态较少                                 |
| `theme`                   | 主题与 palette 体系         | 支持 `light` / `dark` 和有限 `ThemeTokens` 覆盖，字段不兼容               |
| `animation`               | 通用动画配置                 | 当前没有等价的 GraphOptions 动画体系                                    |
| `width` / `height`        | 构造配置和 resize           | 由容器尺寸驱动，运行时使用 `graph.setSize(width, height)`                 |
| renderer                  | Canvas / SVG / WebGL 等 | 不可切换；节点与边走 WebGL，标签与 Combo 走 Canvas 2D                       |

`graph.updateOptions()` 当前只接受 `node`、`edge`、`theme` 的局部更新。Behavior、Plugin、Transform 或 Layout 变化不要假设能通过 G6 v5 的 `setOptions()` 方式热替换；布局使用 `setLayout()`，其他配置应按当前公开生命周期重建或更新 Graph。

## 数据字段映射 [#数据字段映射]

| G6 v5 字段                 | G6Lite                                | 注意事项                             |
| ------------------------ | ------------------------------------- | -------------------------------- |
| `GraphData.nodes`        | `GraphData.nodes`                     | G6Lite 中必填，即使为空也传 `[]`           |
| `GraphData.edges`        | `GraphData.edges`                     | G6Lite 中必填                       |
| `GraphData.combos`       | `GraphData.combos?`                   | 支持，但折叠、嵌套和运行时归组在 beta 阶段仍是实验能力   |
| `node.id`                | `node.id`                             | 必填且唯一                            |
| `node.data`              | `node.data`                           | 放业务字段；不要依赖 G6 v5 内部模型字段          |
| `node.style`             | `options.node.style`                  | 将通用样式移到 GraphOptions；差异化样式使用函数映射 |
| `node.states`            | `node.states`                         | 支持初始状态；运行时通过状态 API 修改            |
| `node.combo` / `comboId` | `node.comboId`                        | 统一迁移为 `comboId`                  |
| `node.x` / `node.y`      | `node.x` / `node.y`                   | 不配置 layout 时用于初始坐标               |
| `edge.id`                | `edge.id?`                            | 建议显式保留稳定 id，便于状态和更新 API 定位       |
| `edge.source` / `target` | 同名                                    | 必须引用已存在节点 id                     |
| `edge.data`              | `edge.data`                           | 业务字段；差异化样式通过函数映射读取               |
| `combo.parentId`         | `combo.parentId`                      | 用于嵌套 Combo                       |
| `combo.style`            | `combo.style` 或 `options.combo.style` | 单个 Combo 覆盖与全局配置均支持              |

初次 `GraphData` 中节点可以省略坐标并交给 layout；运行时 `addNode()` 则需要提供 `x`、`y`。迁移批量创建逻辑时，应选择一次 `setData()` 加布局，或先计算坐标后使用 `addNode(s)`。

## Node、Edge 与 Combo 配置 [#nodeedge-与-combo-配置]

G6Lite 内置节点为 `circle`、`rect`，内置边为 `line`、`arc`、`polyline`、`cubic`。`NodeConfig.type` 和 `EdgeConfig.type` 也接受已注册名称，但自定义扩展复用内置 WebGL 基型和 overlay，不提供任意 G6 场景图形状树。

常见字段迁移：

* 节点文本：G6 v5 `labelText` 迁移为 G6Lite `node.style.label`。
* 节点尺寸：G6Lite circle 常用 `size`；rect 可使用 `width`、`height` 和 `borderRadius`。
* 边箭头：使用 `startArrow`、`endArrow`、`arrowSize`。
* 边曲线：quadratic 等类型不能照搬；根据效果改用 `arc`、`cubic` 或 `polyline`，并配置 `curvature`、`curveOffset`、`radius` 或 `router`。
* 标签：节点和边都支持背景、字号、颜色和位置；复杂绘制注册 `label` 扩展，不直接访问内部 Canvas 图层。
* 状态样式：使用 `node.stateStyles`、`edge.stateStyles`；Combo 状态样式位于 `combo.style.stateStyles`。
* 多重边：优先启用 `edge.parallelEdges` 或 `process-parallel-edges` Transform。

Combo 数据、折叠、嵌套、运行时归组、状态和整体拖拽均已支持，详见 [Combo](/docs/guides/combo)。不要继续沿用早期“G6Lite 无 Combo”的迁移结论。

## Behavior 映射 [#behavior-映射]

| G6 v5 常见 Behavior | G6Lite            | 迁移说明                                                                    |
| ----------------- | ----------------- | ----------------------------------------------------------------------- |
| `zoom-canvas`     | `zoom-canvas`     | 同名；G6Lite 可配置 `sensitivity`、`minZoom`、`maxZoom`                         |
| `drag-canvas`     | `drag-canvas`     | 同名；未配置 behaviors 时与 zoom 默认启用                                           |
| `drag-element`    | `drag-node`       | 拖动节点；命中 Combo 时也支持整体拖动                                                  |
| `click-select`    | `click-select`    | 支持单选和组合键多选配置，payload 需重接                                                |
| `hover-activate`  | `hover-highlight` | 也可按需使用 `highlight-node` / `highlight-edge`                              |
| `brush-select`    | `brush-select`    | 支持 shift / ctrl 触发配置                                                    |
| `lasso-select`    | `lasso-select`    | 支持 shift / ctrl 触发配置                                                    |
| `collapse-expand` | 无同名 Behavior      | 调用 `collapseCombo()` / `expandCombo()` / `toggleCombo()`，或注册业务 Behavior |
| `create-edge`     | 无直接等价             | `drag-edge` 只重连已有边端点；创建新边需业务交互后调用 `addEdge()`                           |
| `focus-element`   | 无同名 Behavior      | 在业务事件中调用 `focusItem()`                                                  |
| `shortcuts-call`  | 无同名 Behavior      | 使用应用快捷键层或自定义 Behavior                                                   |

G6Lite 当前 11 个内置 Behavior 为：`zoom-canvas`、`drag-canvas`、`highlight-node`、`highlight-edge`、`hover-highlight`、`drag-node`、`click-select`、`drag-edge`、`brush-select`、`lasso-select`、`tooltip`。

当 `behaviors` 完全省略时，G6Lite 默认启用 `zoom-canvas` 和 `drag-canvas`；显式传 `behaviors: []` 才会关闭默认画布导航。这一点与迁移代码中“空数组等于使用默认值”的假设相反。

## Layout 迁移 [#layout-迁移]

G6Lite 当前支持：`force`、`d3-force`、`force-atlas2`、`fruchterman`、`circular`、`concentric`、`radial`、`grid`、`dagre`、`mds`、`random`、`mindmap`、`indented`、`fishbone`。

```ts
graph.setLayout({ type: 'dagre', rankdir: 'LR', nodesep: 40, ranksep: 80 });
await graph.layout();

// 启动新布局或销毁 Graph 时也会取消旧布局；可主动取消。
graph.cancelLayout();
```

相同布局名不代表所有选项和默认值相同。迁移时固定节点尺寸、中心、方向、迭代次数和 link distance，用真实数据逐一核对。大图可尝试 `worker: true`，但仍需分别记录布局时间和纯渲染时间。

自定义布局使用 `register('layout', name, extensionFactory(...))`，实现 `init → execute → destroy`，并在耗时循环中响应 `AbortSignal`。它不是 G6 v5 `BaseLayout` 子类的直接复制。

## 事件迁移 [#事件迁移]

G6Lite 不导出 `NodeEvent`、`EdgeEvent`、`CanvasEvent`、`ComboEvent` 或 `GraphEvent` 枚举，直接使用字符串事件名，并通过 `GraphEventMap` 获得精确 payload 类型。

```ts
import type { GraphEventMap } from '@antv/g6-lite';

const onNodeClick = ({ nodeId, data, nativeEvent }: GraphEventMap['node:click'][0]) => {
  console.log(nodeId, data, nativeEvent.clientX);
};

graph.on('node:click', onNodeClick);
graph.once('afterrender', ({ nodeCount, edgeCount }) => console.log(nodeCount, edgeCount));
graph.off('node:click', onNodeClick);
```

常见事件名仍包括 `node:click`、`edge:click`、`canvas:click`、`afterrender`、`afterlayout`，但 payload 不应复用 G6 v5 类型：节点使用 `nodeId`，边包含 `edgeId` / `edgeIndex` / `source` / `target`，Combo 使用 `comboId`；原生事件位于 `nativeEvent`。选择、拖拽、框选和套索的派生事件只有启用对应 Behavior 后才会发出。

## Graph API 映射 [#graph-api-映射]

| G6 v5 常见 API                      | G6Lite                                                              | 差异                                   |
| --------------------------------- | ------------------------------------------------------------------- | ------------------------------------ |
| `render()` / `draw()`             | `render()`                                                          | 返回 `Promise<void>`                   |
| `getData()`                       | `getData()` / `toData()`                                            | 获取当前图数据                              |
| `setData(data)`                   | `await setData(data, options?)`                                     | 可用 `fitView` 选项控制替换后视口               |
| `getNodeData(id?)`                | `getNodeData(id)` / `getNodes()`                                    | 单个和列表拆分                              |
| `getEdgeData(id?)`                | `getEdgeData(id)` / `getEdges()`                                    | 单个和列表拆分                              |
| `getElementData(id)`              | `getElementData(id)`                                                | 返回 node / edge / combo 只读模型          |
| `addNodeData()`                   | `addNode()` / `addNodes()`                                          | 运行时新增节点需坐标                           |
| `updateNodeData()`                | `updateNodeData()` / `updateNodePosition(s)`                        | 业务数据和坐标分开                            |
| `removeNodeData()`                | `removeNode()` / `removeNodes()`                                    | 删除节点会处理相连边                           |
| `addEdgeData()`                   | `addEdge()` / `addEdges()`                                          | 建议使用稳定 edge id                       |
| `updateEdgeData()`                | `updateEdgeData()`                                                  | 可更新 data、source、target               |
| `removeEdgeData()`                | `removeEdge()` / `removeEdges()`                                    | 按 edge id 定位                         |
| `setElementState()`               | `setElementStates()` 或 `setItemState()`                             | 前者替换状态数组，后者切换单个状态                    |
| `getElementState()`               | `getItemStates()`                                                   | 返回状态数组                               |
| 按状态查询                             | `findNodesByState()` / `findEdgesByState()` / `findCombosByState()` | 返回 id 数组                             |
| `hideElement()` / `showElement()` | `hideItem()` / `showItem()`                                         | 名称不同                                 |
| `focusElement()`                  | `focusItem()`                                                       | 支持单 id 或 id 数组                       |
| `fitView()` / `fitCenter()`       | 同名                                                                  | `fitView` 接受 padding、minZoom、maxZoom |
| `getZoom()` / `zoomTo()`          | 同名，另有 `zoomBy()`                                                    | 可通过 center 固定屏幕坐标                    |
| 相机 API                            | `getCamera()` / `setCamera()` / `resetCamera()`                     | 直接管理相机                               |
| `resize()`                        | `setSize()`                                                         | 同时应更新容器 CSS 尺寸                       |
| `setLayout()` / `layout()`        | 同名，另有 `cancelLayout()`                                              | 布局执行可取消                              |
| `setOptions()`                    | `updateOptions()`                                                   | 仅更新 node、edge、theme                  |
| `destroy()` / destroyed           | `destroy()` / `destroyed` / `isDestroyed()`                         | 销毁后公开 API 有安全边界                      |

G6Lite 还提供 `batchSetState()`、`setElementStates(stateMap)`、邻居与邻接边查询、Combo 生命周期和屏幕/图坐标转换。以 [API 文档](/docs/api) 与包根类型为准，不要使用内部 `getCanvas()`、`updateData()` 等未列入包根契约的实现细节作为新业务依赖。

## Extension、Transform 与 Plugin [#extensiontransform-与-plugin]

G6Lite 当前支持八类扩展：`node`、`edge`、`label`、`decoration`、`layout`、`behavior`、`transform`、`plugin`。推荐使用 `extensionFactory()` 创建有状态实例：

```ts
import { extensionFactory, register } from '@antv/g6-lite';

register(
  'behavior',
  'business-select',
  extensionFactory(() => ({
    init(context) {
      // 只保存公开 ExtensionContext。
    },
    getEvents() {
      return { 'node:click': ({ nodeId }) => console.log(nodeId) };
    },
    destroy() {},
  })),
);
```

迁移原则：

* 自定义 Node / Edge 不继承 G6 场景图类，改为内置基型、函数式样式和受控 overlay。
* Label / Decoration Renderer 只负责测量和绘制；定位、旋转、碰撞、裁剪与刷新由引擎管理。
* Behavior、Transform、Plugin 只能通过 `ExtensionContext` 的 data、state、viewport 和 `requestRender()` 修改 Graph。
* Transform 每个 Graph、每个配置位置拥有实例；Plugin 在挂载时创建、销毁时清理。当前没有 G6 v5 `getPluginInstance()` 的等价公开 API。
* 扩展异常会被隔离并记录；不要直接访问 Renderer、DataModel、WebGL context 或深层源码。

详见[扩展体系](/docs/guides/extensions)和[自定义 Behavior](/docs/guides/custom-behavior)。

## 当前不支持与替代方式 [#当前不支持与替代方式]

* **通用动画编排**：保留 G6 v5 实现，或在业务层对数据/相机分帧更新；不要假设 `animation` 配置可迁移。
* **完整图算法**：在业务层使用 `@antv/algorithm` 或其他独立算法包，再把结果写入 G6Lite 数据和状态。
* **多 renderer、SSR、3D**：G6Lite Graph 必须在真实 DOM、Canvas 和 WebGL 的客户端生命周期创建；这些场景优先继续使用 G6 v5。
* **React/DOM 节点与任意场景图形状**：将视觉收敛到 G6Lite 基型与扩展协议，无法收敛时不要迁移该页面。
* **成熟内置插件**：Toolbar、Minimap、History 等需要业务 Plugin、外部组件或保留 G6 v5。
* **未列出的 Behavior**：用业务事件与 Graph API 组合，或注册自定义 Behavior；不要用 `drag-edge` 代替创建边。

## 迁移验收清单 [#迁移验收清单]

1. 固定 G6 v5 与 G6Lite 版本，保留原实现作为可回退基线。
2. 将数据归一化为显式 `nodes`、`edges`、可选 `combos`，为边保留稳定 id。
3. 逐项迁移 node / edge / combo 类型、样式函数、标签、箭头和状态，不复制未知字段。
4. 按映射替换 Behavior，并验证空数组、默认缩放、组合键和派生事件语义。
5. 重新绑定事件 payload 类型，检查 nodeId、edgeId、comboId、坐标与 nativeEvent。
6. 覆盖 setData、增删改、批量状态、显隐、聚焦、视口、重新布局和销毁流程。
7. 对自定义元素、Behavior、Transform 和 Plugin 做生命周期与错误隔离测试。
8. 用真实数据分别记录布局、纯渲染、拖拽、缩放、拾取、高亮、批量更新和内存趋势。
9. 在目标浏览器、DPR、GPU、CSP 和容器尺寸下验证，不用单一开发机替代兼容性验收。
10. 只有视觉、交互、数据一致性和性能验收全部通过后，才移除 G6 v5 回退链路。

可运行的兼容示例见 Playground 的 `g6-v5-compat`，默认主题与状态基线见[默认主题示例](/docs/examples/default-theme)。
