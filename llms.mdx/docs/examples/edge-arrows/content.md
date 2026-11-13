# 边与箭头方向 (/docs/examples/edge-arrows)





比较无箭头、单向、双向和粗边箭头。

## 如何体验

直接对照不同边样式和方向表达。

## 数据说明

4 组边分别映射不同方向和宽度。

## 完整运行代码

```ts
/**
 * Demo: Arrow directions - none / forward / bidirectional
 */
import { Graph } from '@antv/g6-lite';

export async function runGraph(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: 'n1', name: 'No arrow', x: 80, y: 120 },
        { id: 't1', name: '', x: 280, y: 120 },
        { id: 'n2', name: 'Forward', x: 400, y: 120 },
        { id: 't2', name: '', x: 600, y: 120 },
        { id: 'n3', name: 'Bidirectional', x: 80, y: 280 },
        { id: 't3', name: '', x: 280, y: 280 },
        { id: 'n4', name: 'Thick + arrow', x: 400, y: 280 },
        { id: 't4', name: '', x: 600, y: 280 },
      ],
      edges: [
        { source: 'n1', target: 't1', data: { dir: 'none' } },
        { source: 'n2', target: 't2', data: { dir: 'forward' } },
        { source: 'n3', target: 't3', data: { dir: 'both' } },
        { source: 'n4', target: 't4', data: { dir: 'forward', lw: 6 } },
      ],
    },
    node: { type: 'circle', style: { fill: '#5B8FF9', size: 24, label: (node) => node.name ?? '' } },
    // #region arrow-options
    edge: {
      type: 'line',
      style: {
        stroke: '#99ADD1',
        lineWidth: (_source, _target, edge) => Number(edge.data?.lw ?? 2),
        endArrow: (_source, _target, edge) => edge.data?.dir !== 'none',
        startArrow: (_source, _target, edge) => edge.data?.dir === 'both',
      },
    },
    // #endregion arrow-options
    theme: 'light',
  });

  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}

export async function run(container: string | HTMLElement) {
  const graph = await runGraph(container);
  return {
    getData: () => graph.getData(),
    fitView: () => graph.fitView({ padding: 64 }),
    destroy: () => graph.destroy(),
  };
}
```


## 继续阅读

- [边配置](/docs/guides/edge)
- [边参考](/docs/api/options#options-edge)