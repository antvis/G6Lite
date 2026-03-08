## 背景

AntV 无论是 G2 还是 G6，因为基于最新版本 G，带来的性能问题，一直在上层无法弥补和解决，结合 AI 下开源的技术发展趋势，长期来看，G 这一层会慢慢淡化掉，只有基于可视化技术封装的场景解决方案，对应的就是 G2、S2、G6、X6、L7、Infographic、T8、AVA 等。

过去要做这样的事情，成本巨高，而现在利用 AI 可以帮我们解决大量的维护工作，我们需要做的就是设计好技术、产品架构，让开源项目更利于 AI 维护。

G6 引入了大量复杂节点、边，甚至于 html、react、vue 节点，让其自定义能力很强，这就造成了 G6 自身的问题：

1. G6 和 X6 怎么区分和选型，G6 的定位怎么才是最为精准的。
2. G6 的性能不可能提升到百万节点边的渲染和分析。

所以设计 `G6Lite` 就是想解决这个问题，逐步纠正 G6 的定位。

## 规划

首先定位上确定清晰，只基于 WebGL、WebCPU，只面向超大数据的图数据分析和可视化。对于节点丰富样式，定制样式，均不在考虑之内，转移到 X6。

> `G6Lite`: A high-performance graph analysis engine based on WebGL, designed for large-scale graph data analysis.


## 功能和设计

按照需要实现的功能，整理成列表，每一个功能，都有对应的期望的代码写法。

### 1. 渲染能力

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: 'container',
  data: { nodes: [], edges: [] },
  node: {},
  edge: {},
  layout: {
    type: 'force',
    ...layoutConfig
  },
  behaviors: ['zoom-canvas', 'drag-canvas'],
  theme: 'dark',
});

graph.render();
```

其中 data 是图数据结构，使用 nodes 和 edges 表达，举个例子：

```ts
{
  "nodes": [
    {
      "id": "0",
      "name": "node 0",
      "data": {
        "cluster": "a"
      }
    },
    {
      "id": "1",
      "name": "node 1",
      "data": {  // 节点扩展数据
        "cluster": "b"
      }
    },
  ],
  "edges": [
    {
      "source": "0",
      "target": "1",
      "data": {},                                       // 边扩展数据
    },
  ]
}
```

节点和边的样式设置，需要结合 WebGL 能力来看需要开放哪些！

```ts
const graph = new Graph({
  node: {
    type: 'rect',                                    // rect, circle 等常见图形
    style: {
      fill: (d) => 'red',
      // ...                                              // 还有哪些，结合 WebGL 可视化能力添加
    }
  },
  edge: {
    type: 'line',                                    // line, arc 等常见边样式
    style: {
      fill: (node) => 'red',
      lineWidth: (node1, node2, edge) => 3,
      // ...                                              // 还有哪些，结合 WebGL 可视化能力添加
    }
  },
});
```

### 2. 布局能力

基于 AntV [Layout](https://github.com/antvis/layout) 布局库的能力封装和透传。例如：

```ts
import { CircularLayout } from '@antv/layout';
const layout = new CircularLayout({ center: [200, 200], radius: 150 });
```

那么在 G6Lite 中使用的时候：

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: 'container', layout: {
    type: 'circular',
    center: [200, 200],
    radius: 150,
    // ...
  },
});
```

需要覆盖 AntV Layout 的所有布局能力。

### 3. 交互能力

类似于 G6，我们在 G6Lite 中依然使用 behaviors 来表达交互。

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: 'container',
  behaviors: ['zoom-canvas', 'drag-canvas'],
});
```

可以先内置一些交互，后续在按需追加和扩展。

    - zoom-canvas：画布的缩放交互
    - drag-canvas：画布的拖拽交互
    - highlight-edge：hover 到边上的时候，高亮边以及对应的起止节点
    - highlight-node：hover 到节点上的时候，高亮节点以及相邻的第一层节点和边

对于主题 theme，可以包含一些常见的主题 token，形成主题，内置 light 和 dark。使用上：

```ts
{
  theme: 'light', // 'dark'
}

// or
{
  theme: {
    type: 'light',
    edgeLineWidth: 2,                                       // 覆盖主题中的 token
    // ...
  }
}
```


### 4. 动画能力

暂无，后续考虑。

### 5. 分析能力

暂无，后续考虑。


## 实现

待定。


## 要求

- 基于 TypeScript 开发和编写，源码放到 src 目录
- 在 playground 目录基于 vite 提供功能链路的 demo，便于调试和运行
- 按照不同的技术概念，放到不同的目录，目录层级扁平，要求代码简洁、精炼，尽可能少的依赖库
- 追求极致性能，极致包大小

## 业务中的使用总结
### 1. 概述

GeaMaker-V2 项目广泛使用了 antv/G6 图可视化引擎，用于实现各种图相关的可视化功能。本文档整理了项目中所有使用 G6 的场景及其配置。

### 2. 主要使用场景

#### 2.1 Graphin 组件基础使用
项目主要通过 `@antv/graphin` 组件来使用 G6，封装在 `GraphCanvas` 组件中：

```tsx
import Graphin, { Behaviors } from '@antv/graphin';

const { ActivateRelations, Hoverable, DragCanvas, ZoomCanvas } = Behaviors;

<Graphin
  containerId="graph-canvas"
  style={{
    background: '#F6F8FF',
    minHeight: 200,
  }}
  animate={false}
>
  <ActivateRelations />
  <Hoverable bindType="node" />
  <Hoverable bindType="edge" />
  <DragCanvas enableOptimize />
  <ZoomCanvas enableOptimize />
</Graphin>
```

#### 2.2 原生 G6 使用场景

##### 2.2.1 图分析画布 (G6GraphCanvas)
核心图可视化展示组件，支持丰富的交互和样式配置：

```tsx
const graph = new Graph({
  behaviors: [
    'zoom-canvas',
    'drag-canvas',
    'drag-element',
    'click-select',
    {
      type: 'hover-activate',
      degree: 1,
      state: 'highlight',
      inactiveState: 'dim',
      enable: true,
    },
  ],
  node: {
    state: {
      highlight: { fill: '#FF5733' },
    },
  },
  edge: {
    style: {
      labelBackgroundFill: '#FFF',
      labelBackground: true,
      endArrow: true,
    },
    state: {
      highlight: { stroke: '#FF5733' },
      dim: { strokeOpacity: 0.05 },
    },
  },
  transforms: [
    'process-parallel-edges',
    { type: 'map-node-size', scale: 'linear' },
  ],
});
```

##### 2.2.2 DSL 任务流程图
用于展示 DSL 任务的依赖关系：

```tsx
const g6GraphConfig = (width: number, height: number): GraphOptions => {
  return {
    layout: { type: 'dagre', nodesep: 50, ranksep: 15 },
    node: {
      type: 'preview-depend-flow-chart',
      style: { size: [160, 32], stroke: '#5B8FF9' },
      state: {
        selected: { stroke: '#1583ff', lineWidth: 3 },
        hover: { shadowBlur: 20, shadowColor: '#5B8FF9' },
      },
    },
    edge: {
      type: 'polyline',
      style: { radius: 20, endArrow: true, lineWidth: 2 },
    },
    behaviors: ['drag-canvas', 'zoom-canvas', 'click-select'],
  };
};
```

##### 2.2.3 数据同步流程图
用于展示数据同步任务的流程：

```tsx
const g6GraphConfig = (width: number, height: number): GraphOptions => {
  return {
    layout: { type: 'dagre', rankdir: 'TB', align: 'UL' },
    node: {
      type: 'sync-data-flow-chart',
      style: { size: [160, 32], stroke: '#5B8FF9' },
    },
    edge: { type: 'polyline' },
    behaviors: ['drag-canvas', 'zoom-canvas', 'click-select'],
  };
};
```

##### 2.2.4 GeaFlow 实现计划图
用于展示 GeaFlow 任务的实现计划，支持组合布局：

```tsx
const graph = new Graph({
  layout: {
    type: 'combo-combined',
    innerLayout: new DagreLayout({ nodeSize: [280, 80] }),
    outerLayout: new DagreLayout(),
  },
  node: {
    type: 'implementation-plan',
    style: { size: [280, 80], stroke: '#1783ff' },
  },
  combo: {
    type: 'rect',
    style: { labelText: (d) => d?.label as string },
  },
});
```

##### 2.2.5 ER 图建模
用于数据模型设计的 ER 图：

```tsx
const graph = new Graph({
  layout: { type: 'dagre', nodeSep: 200, rankSep: 100, rankdir: 'LR' },
  node: { type: 'react' },
  edge: { type: 'line', style: { endArrow: true } },
  plugins: ['contextmenu', 'tooltip', 'fullscreen'],
  behaviors: ['drag-canvas', 'drag-element', 'hover-activate'],
});
```

##### 2.2.6 进度流程图
用于展示任务进度：

```tsx
const graph = new Graph({
  layout: { type: 'dagre', rankdir: 'UL', align: 'DL' },
  node: { type: 'sync-data-flow-chart' },
  edge: {
    type: 'polyline',
    style: {
      router: { type: 'orth' },
      endArrow: true,
      lineDash: (l) => l?.data?.status === 'FAILED' ? [5, 5] : undefined,
    },
  },
});
```

##### 2.2.7 路径查询图
用于展示图路径查询结果：

```tsx
const graph = new Graph({
  layout: { type: 'dagre' },
  node: {
    type: 'path-query',
    style: { fill: '#1783FF', size: 8 },
  },
  edge: { style: { stroke: '#99add1' } },
});
```

### 3. 自定义节点和边

#### 3.1 自定义节点类
项目实现了多种自定义节点以满足不同业务场景需求：

1. **PreviewDependFlowChartNode** - DSL 任务流程节点
2. **SyncDataFlowChartNode** - 数据同步流程节点
3. **ImplementationPlanNode** - 实现计划节点
4. **PathQueryNode** - 路径查询节点
5. **ErGraphNode** - ER 图节点

#### 3.2 自定义布局
1. **ClusterDagreLayout** - 聚类 Dagre 布局算法
2. **BreathingNode** - 呼吸动画节点

### 4. 样式配置

#### 4.1 Dash 配置样式
```ts
const COMBO_OPTIONS: ComboOptions = {
  type: 'card',
  style: {
    collapsedSize: (d) => [240, d?.groupLevel === 2 && !d?.properties?.length ? 24 : 86],
    radius: 4,
    labelOffsetY: 8,
  },
  state: {
    selected: { halo: true, stroke: '#1B324F' },
    active: { halo: true },
  },
};

const EDGE_OPTIONS: EdgeOptions = {
  type: 'custom-line',
  style: {
    label: (d) => Boolean(d.combo),
    strokeOpacity: 0.25,
    badge: true,
    endArrow: true,
  },
  state: {
    selected: { halo: true },
    dim: { fillOpacity: 0.08 },
  },
};
```

#### 4.2 默认样式配置
```ts
const DEFAULT_NODE_STYLE = { size: 30, color: '#1783FF' };
const DEFAULT_EDGE_STYLE = { color: '#87e8de', width: 2 };
```

### 5. 布局配置

项目支持多种布局算法：

1. **力导向布局 (force)** - 经典力导向布局
2. **同心圆布局 (concentric)** - 节点按同心圆排列
3. **圆形布局 (circular)** - 节点按圆形排列
4. **辐射布局 (radial)** - 节点按辐射状排列
5. **Dagre布局 (dagre)** - 有向无环图布局
6. **聚类Dagre布局 (clusterDagre)** - 自定义聚类Dagre布局
7. **网格布局 (grid)** - 节点按网格排列

### 6. 工具栏和交互

#### 6.1 工具栏组件
```tsx
const Toolbar = ({ graph }) => {
  const zoomIn = () => graph?.zoomBy(1.5);    // 放大
  const zoomOut = () => graph?.zoomBy(0.75);  // 缩小
  const fitRealZoom = () => graph?.zoomTo(1); // 1:1缩放
  const fitView = () => graph?.fitView();     // 适应视图
};
```

#### 6.2 上下文菜单
支持节点和画布的右键菜单功能。

### 7. 总结

GeaMaker-V2 项目中 G6 的使用非常广泛，涵盖了图可视化的核心功能：

1. **多样化的使用场景** - 从基础图展示到复杂业务流程图
2. **丰富的自定义能力** - 自定义节点、边、布局满足业务需求
3. **完整的交互体系** - 拖拽、缩放、选择、菜单等交互功能
4. **灵活的样式配置** - 支持状态样式和个性化视觉效果
5. **多种布局算法** - 满足不同数据结构的展示需求

这些配置为项目提供了强大的图可视化能力，支撑了图分析、任务管理、数据建模等核心功能。



## 附录

- AntV Layout：https://github.com/antvis/layout
- AntV Layout 官网文档：https://layout.antv.vision/zh/guide/introduction
