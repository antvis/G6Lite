# 自环边 (/docs/examples/edge-loops)





展示一个节点上的单条和多层嵌套自环。

## 如何体验

观察单条自环和叠在一起的多层自环。

## 数据说明

三个节点分别带有 1、3、5 条自环。

## 完整运行代码

```ts
/**
 * Demo: Self-loop edges - single / nested multiple
 */
import { Graph } from '@antv/g6-lite';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: 'a', name: 'Single', x: 150, y: 180 },
        { id: 'b', name: '3 nested', x: 400, y: 180 },
        { id: 'c', name: '5 nested', x: 650, y: 180 },
      ],
      edges: [
        { source: 'a', target: 'a' },
        { source: 'b', target: 'b' },
        { source: 'b', target: 'b' },
        { source: 'b', target: 'b' },
        { source: 'c', target: 'c' },
        { source: 'c', target: 'c' },
        { source: 'c', target: 'c' },
        { source: 'c', target: 'c' },
        { source: 'c', target: 'c' },
      ],
    },
    node: {
      type: 'circle',
      style: {
        fill: '#5B8FF9',
        size: 36,
        label: (node) => node.name ?? node.id,
        labelPlacement: 'bottom',
      },
    },
    edge: {
      type: 'line',
      style: { stroke: '#99ADD1', lineWidth: 2 },
    },
    theme: 'light',
  });

  await graph.render();
  return {
    getData: () => graph.getData(),
    fitView: () => graph.fitView(),
    destroy: () => graph.destroy(),
  };
}
```


## 继续阅读

- [平行边与自环](/docs/guides/edge#parallel-edges)
- [边参考](/docs/api/options#options-edge)