# ForceAtlas2 力导向布局 (/docs/guides/layout-force-atlas2)





## 概述 [#概述]

相连的节点互相吸引，同时受斥力和中心引力影响。

## 使用场景 [#使用场景]

适合观察关系密集的群组和群组之间的连接。

## 基本用法 [#基本用法]

布局类型通过 `layout.type` 指定。

```ts
const graph = new Graph({
  container,
  data,
  layout: { type: 'force-atlas2' },
});
```

## 配置项 [#配置项]

| 参数               | 描述                     | 类型        | 默认值                      |
| ---------------- | ---------------------- | --------- | ------------------------ |
| `kr`             | 节点间的斥力系数。              | `number`  | `5`                      |
| `kg`             | 将节点拉向中心的引力系数。          | `number`  | `1`                      |
| `preventOverlap` | 按节点尺寸计算斥力，减少重叠。        | `boolean` | `false`                  |
| `nodeSize`       | 碰撞计算使用的节点尺寸。           | `number`  | `10`                     |
| `barnesHut`      | 是否用 Barnes–Hut 近似计算斥力。 | `boolean` | `true`                   |
| `maxIteration`   | 布局的最大迭代次数。             | `number`  | `100`，超过 5000 个节点时为 `50` |

[布局通用配置项](/docs/guides/layout) · [布局参数参考](/docs/api/options#config-library-layout-fields)

## 代码示例 [#代码示例]

示例使用固定的初始坐标，增强斥力、减弱中心引力，并按节点尺寸减少重叠。颜色标记三个相连的群组。



```ts
import { Graph, register, type GraphOptions, type LayoutConfig } from '@antv/g6-lite';

type ExampleOptions = Pick<GraphOptions, 'data' | 'node' | 'edge'>;

function network(type: string): ExampleOptions {
  const links = [
    [0, 1], [0, 2], [0, 3], [1, 2], [1, 4], [1, 5],
    [2, 5], [2, 6], [3, 7], [3, 8], [3, 9],
    [7, 8], [8, 9], [4, 10], [4, 11], [10, 11],
  ];
  const showClusters = type === 'force-atlas2' || type === 'fruchterman';
  // Seed the three groups around distinct centers so rerunning starts from the same layout.
  const clusters = [
    { ids: [3, 7, 8, 9], x: 90, y: 120, color: '#2468d8' },
    { ids: [0, 1, 5, 2, 6], x: 240, y: 205, color: '#7755c7' },
    { ids: [4, 10, 11], x: 390, y: 120, color: '#0c8177' },
  ];
  const nodes = showClusters
    ? clusters.flatMap(({ ids, x, y, color }, clusterIndex) => {
        const startAngle = type === 'fruchterman' && clusterIndex === 1 ? 3 * Math.PI / 2 : 0;
        return ids.map((id, index) => {
          const angle = startAngle + 2 * Math.PI * index / ids.length;
          return { id: String(id), x: x + 34 * Math.cos(angle), y: y + 34 * Math.sin(angle), data: { color } };
        });
      })
    : Array.from({ length: 12 }, (_, index) => ({ id: String(index) }));

  return {
    data: {
      nodes,
      edges: links.map(([source, target]) => ({ source: String(source), target: String(target) })),
    },
    node: {
      style: {
        size: 24,
        label: (node) => node.id,
        labelColor: '#fff',
        labelPlacement: 'center',
        fill: (node) => String(node.data?.color ?? (type === 'radial' && node.id === '0' ? '#6d28d9' : '#1677ff')),
      },
    },
    edge: { style: showClusters ? { lineWidth: 1.6, stroke: '#8494b0', endArrow: false } : { lineWidth: 2 } },
  };
}

async function render(container: HTMLElement, layout: LayoutConfig, options: ExampleOptions) {
  const graph = new Graph({
    container,
    ...options,
    layout,
    behaviors: ['drag-canvas', 'zoom-canvas'],
    autoFit: { padding: 36 },
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
    type: 'force-atlas2',
    center: [240, 150],
    kr: 12,
    kg: 0.5,
    preventOverlap: true,
    nodeSize: 24,
    maxIteration: 200,
  };
  return render(container, layout, network(layout.type));
}
```



[对比关系网络布局](/docs/guides/layout-networks)
