# 200 节点 (/docs/examples/large)





用 200 个节点快速查看中等规模图的渲染和交互。

## 如何体验

缩放、拖拽，并悬停节点查看邻居高亮。

## 数据说明

合成网络包含 200 个节点，每个节点约 4 条边。

## 完整运行代码

```ts
/**
 * Demo: 较大规模 — 较多节点边，验证基础性能
 */
import { Graph } from '@antv/g6-lite';

function generateData(nodeCount: number, edgeFactor: number) {
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: String(i),
    data: { cluster: i % 3 === 0 ? 'a' : i % 3 === 1 ? 'b' : 'c' },
  }));
  const edges: Array<{ source: string; target: string }> = [];
  for (let i = 0; i < nodeCount; i++) {
    const k = Math.min(edgeFactor, nodeCount - 1);
    for (let j = 0; j < k; j++) {
      const t = (i + 1 + j) % nodeCount;
      if (t !== i) edges.push({ source: String(i), target: String(t) });
    }
  }
  return { nodes, edges };
}

export async function run(container: string | HTMLElement) {
  const { nodes, edges } = generateData(200, 4);

  const graph = new Graph({
    autoFit: true,
    container,
    data: { nodes, edges },
    node: {
      type: 'circle',
      style: {
        fill: (d) => {
          const c = (d.data?.cluster as string) ?? 'a';
          return c === 'a' ? '#5B8FF9' : c === 'b' ? '#61DDAA' : '#F6BD16';
        },
        size: 6,
      },
    },
    edge: { type: 'line', style: { lineWidth: 1 } },
    layout: { type: 'force', linkDistance: 60 },
    behaviors: ['zoom-canvas', 'drag-canvas', 'highlight-node'],
    theme: 'light',
  });
  await graph.render();
  return graph;
}
```


## 继续阅读

- [性能测量](/docs/metrics/performance)
- [性能优化](/docs/metrics/performance#performance-tuning)