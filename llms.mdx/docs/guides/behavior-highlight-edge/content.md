# 悬停高亮边 (/docs/guides/behavior-highlight-edge)





悬停边时，突出这条边及其两端节点。

## 配置方式 [#配置方式]

鼠标移开后恢复原样。需要同时处理节点和边悬停时，可用邻域高亮。

## 示例 [#示例]



```ts
const behaviors: BehaviorOption[] = ['highlight-edge'];
```

**完整运行代码**

```ts
import { Graph, type BehaviorOption } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  // #region behavior-config
  const behaviors: BehaviorOption[] = ['highlight-edge'];
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



[试用同时处理节点和边的邻域高亮](/docs/guides/behavior-hover-highlight#示例) · [高亮规则](/docs/api/options#高亮)
