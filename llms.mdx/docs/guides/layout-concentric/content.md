# 同心圆布局 Concentric (/docs/guides/layout-concentric)





## 概述 [#概述]

按排序指标把节点分到不同圆环，指标值较大的节点靠近中心。

## 使用场景 [#使用场景]

适合用连接数突出枢纽节点。

## 基本用法 [#基本用法]

布局类型通过 `layout.type` 指定。

```ts
const graph = new Graph({
  container,
  data,
  layout: { type: 'concentric' },
});
```

## 配置项 [#配置项]

| 参数               | 描述                       | 类型                               | 默认值        |
| ---------------- | ------------------------ | -------------------------------- | ---------- |
| `sortBy`         | 排序依据，`'degree'` 按节点度数排序。 | `'degree'` \| `(node) => number` | `'degree'` |
| `maxLevelDiff`   | 同一圈内排序值之差必须小于这个值。        | `number`                         | 自动计算       |
| `preventOverlap` | 是否根据节点大小和间距避免重叠。         | `boolean`                        | `false`    |
| `nodeSpacing`    | 避让重叠时预留的节点间距。            | `number`                         | `10`       |

[布局通用配置项](/docs/guides/layout) · [布局参数参考](/docs/api/options#config-library-layout-fields)

## 代码示例 [#代码示例]

节点按连接数分圈。紫色节点有 5 条连接，排在中心。蓝色节点各有 3 条连接，围成内圈。绿色节点各有 1 条连接，围成外圈。



```ts
import { Graph, register, type GraphOptions, type LayoutConfig } from '@antv/g6-lite';

type ExampleOptions = Pick<GraphOptions, 'data' | 'node' | 'edge'>;

function concentric(): ExampleOptions {
  const hub = 'Hub';
  const inner = ['A', 'B', 'C', 'D', 'E'];
  const edges = inner.flatMap((id) => [
    { source: hub, target: id },
    { source: id, target: `${id}1` },
    { source: id, target: `${id}2` },
  ]);
  return {
    data: {
      nodes: [{ id: hub }, ...edges.map(({ target }) => ({ id: target }))],
      edges,
    },
    node: {
      style: {
        size: 24,
        fill: (node) => node.id === hub ? '#6d28d9' : inner.includes(node.id) ? '#1677ff' : '#0f766e',
      },
    },
    edge: { style: { endArrow: false, stroke: '#91a5c1', lineWidth: 1.5 } },
  };
}

async function render(container: HTMLElement, layout: LayoutConfig, options: ExampleOptions) {
  const graph = new Graph({
    container,
    ...options,
    layout,
    behaviors: ['drag-canvas', 'zoom-canvas'],
    autoFit: { padding: 36, maxZoom: 1 },
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}

export function run(container: HTMLElement) {
  const layout: LayoutConfig = {
    type: 'concentric',
    sortBy: 'degree',
    maxLevelDiff: 1,
    preventOverlap: true,
    nodeSize: 24,
    nodeSpacing: 28,
  };
  return render(container, layout, concentric());
}
```



[对比关系网络布局](/docs/guides/layout-networks)
