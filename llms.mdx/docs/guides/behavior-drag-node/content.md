# 拖动节点与分组 (/docs/guides/behavior-drag-node)





拖动节点，或从分组空白处拖动整个分组。

## 配置方式 [#配置方式]

拖动已选节点时，其他已选节点会一起移动。分组归属可通过分组 API 单独更新。

## 示例 [#示例]



```ts
behaviors: [
  'zoom-canvas',
  'drag-canvas',
  { type: 'click-select', multiple: true, trigger: 'shift' },
  'drag-node',
],
```

**完整运行代码**

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



[参数与默认值](/docs/api/options#导航与拖拽) · [动态调整分组归属](/docs/guides/combo#动态调整归属)
