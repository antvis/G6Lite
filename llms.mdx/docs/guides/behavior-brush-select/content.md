# 框选 (/docs/guides/behavior-brush-select)





拖出矩形，选中中心落在矩形内的节点。

## 配置方式 [#配置方式]

启动框选的按键用 `key` 设置。示例中从空白处按住 Shift 拖动，直接拖动仍可平移画布。

## 示例 [#示例]



```ts
const behaviors: BehaviorOption[] = ['drag-canvas', { type: 'brush-select', key: 'shift' }];
```

**完整运行代码**

```ts
import { Graph, type BehaviorOption } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  // #region behavior-config
  const behaviors: BehaviorOption[] = ['drag-canvas', { type: 'brush-select', key: 'shift' }];
  // #endregion behavior-config

  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'A', x: 0, y: 0 },
        { id: 'B', x: 120, y: -65 },
        { id: 'C', x: 120, y: 65 },
        { id: 'D', x: 240, y: 0 },
        { id: 'E', x: 360, y: 0 },
      ],
      edges: [
        { id: 'A-B', source: 'A', target: 'B' },
        { id: 'A-C', source: 'A', target: 'C' },
        { id: 'B-D', source: 'B', target: 'D' },
        { id: 'C-D', source: 'C', target: 'D' },
        { id: 'D-E', source: 'D', target: 'E' },
      ],
    },
    node: {
      style: { size: 30, label: (node) => node.id, labelOffsetY: 8 },
      stateStyles: { selected: { fill: '#8050d2', haloWidth: 10 } },
    },
    edge: {
      style: { lineWidth: 2, hitAreaWidth: 14, endArrow: false },
      stateStyles: { selected: { stroke: '#8050d2', lineWidth: 4 } },
    },
    behaviors,
    autoFit: { padding: 48, maxZoom: 1 },
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```



[参数与默认值](/docs/api/options#选择)
