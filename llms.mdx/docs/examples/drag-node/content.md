# 拖拽节点与 Combo (/docs/examples/drag-node)





拖拽单个节点，或拖拽 Combo 背景带动其中的节点。

## 如何体验

拖拽节点改变位置，拖拽 Combo 空白处移动整组。

## 数据说明

一个 Combo 包住两个客户端节点，旁边是独立服务节点。

## 完整运行代码

```ts
/**
 * Demo: drag individual nodes, and drag a combo by its background.
 */
import { Graph } from '@antv/g6-lite';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: 'web', data: { label: 'Web' }, x: 160, y: 150, comboId: 'clients' },
        { id: 'app', data: { label: 'App' }, x: 160, y: 250, comboId: 'clients' },
        { id: 'api', data: { label: 'API' }, x: 380, y: 200 },
        { id: 'db', data: { label: 'DB' }, x: 560, y: 140 },
        { id: 'cache', data: { label: 'Cache' }, x: 560, y: 270 },
      ],
      edges: [
        { source: 'web', target: 'api' },
        { source: 'app', target: 'api' },
        { source: 'api', target: 'db' },
        { source: 'api', target: 'cache' },
      ],
      combos: [{ id: 'clients', data: { label: '客户端' } }],
    },
    node: {
      type: 'rect',
      style: {
        fill: '#5B8FF9',
        width: 72,
        height: 32,
        borderRadius: 8,
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'center',
        labelColor: '#fff',
      },
      stateStyles: { selected: { fill: '#8050d2' } },
    },
    combo: {
      style: {
        label: (combo) => String(combo.data?.label ?? combo.id),
        labelPlacement: 'top',
      },
    },
    edge: { style: { endArrow: true, stroke: '#99ADD1' } },
    // #region drag-options
    behaviors: [
      'zoom-canvas',
      'drag-canvas',
      { type: 'click-select', multiple: true, trigger: 'shift' },
      'drag-node',
    ],
    // #endregion drag-options
  });
  try {
    await graph.render();
    graph.fitView({ padding: 48, maxZoom: 1 });
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```


## 继续阅读

- [交互组合](/docs/guides/behaviors)
- [Behavior 参考](/docs/api/options#options-behaviors)