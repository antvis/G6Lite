# 力导向布局 Force (/docs/guides/layout-force)





## 概述 [#概述]

边的引力拉近相连的节点，节点间的斥力把它们分开。

## 使用场景 [#使用场景]

适合探索社交关系、服务依赖等网络的连接结构。

## 基本用法 [#基本用法]

布局类型通过 `layout.type` 指定。

```ts
const graph = new Graph({
  container,
  data,
  layout: { type: 'force' },
});
```

## 配置项 [#配置项]

| 参数             | 描述           | 类型       | 默认值    |
| -------------- | ------------ | -------- | ------ |
| `linkDistance` | 相连节点之间的目标距离。 | `number` | `200`  |
| `nodeStrength` | 节点间的斥力强度。    | `number` | `1000` |
| `edgeStrength` | 边的引力强度。      | `number` | `50`   |
| `maxIteration` | 布局的最大迭代次数。   | `number` | 按节点数计算 |

[布局通用配置项](/docs/guides/layout) · [布局参数参考](/docs/api/options#config-library-layout-fields)

## 代码示例 [#代码示例]

示例将相连节点的目标距离设为 100。



```ts
import { Graph, register, type GraphOptions, type LayoutConfig } from '@antv/g6-lite';

type ExampleOptions = Pick<GraphOptions, 'data' | 'node' | 'edge'>;

function network(type: string): ExampleOptions {
  const links = [
    [0, 1], [0, 2], [0, 3], [1, 2], [1, 4], [1, 5],
    [2, 5], [2, 6], [3, 7], [3, 8], [3, 9],
    [7, 8], [8, 9], [4, 10], [4, 11], [10, 11],
  ];
  return {
    data: {
      nodes: Array.from({ length: 12 }, (_, index) => ({ id: String(index) })),
      edges: links.map(([source, target]) => ({ source: String(source), target: String(target) })),
    },
    node: {
      style: {
        size: 24,
        label: (node) => node.id,
        labelColor: '#fff',
        labelPlacement: 'center',
        fill: (node) => type === 'radial' && node.id === '0' ? '#6d28d9' : '#1677ff',
      },
    },
    edge: { style: { lineWidth: 2 } },
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
  const layout: LayoutConfig = { type: 'force', linkDistance: 100 };
  return render(container, layout, network(layout.type));
}
```



[对比关系网络布局](/docs/guides/layout-networks)
