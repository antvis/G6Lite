# 邻域高亮 (/docs/guides/behavior-hover-highlight)





悬停时高亮节点的邻域，或高亮边及其两端节点。

## 配置方式 [#配置方式]

邻域范围用 `degree` 设置，其余元素可通过 `inactiveState` 弱化。悬停 B 可看到它的一度邻域。

```ts
behaviors: [{ type: 'hover-highlight', degree: 1, inactiveState: 'inactive' }],
```

## 示例 [#示例]



```ts
behaviors: ['zoom-canvas', 'drag-canvas', { type: 'hover-highlight', degree: 1, inactiveState: 'inactive' }],
```

**完整运行代码**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'A', x: 0, y: 0 }, { id: 'B', x: 120, y: 0 },
        { id: 'C', x: 240, y: 0 }, { id: 'D', x: 360, y: 0 },
        { id: 'E', x: 120, y: 100 }, { id: 'Isolated', x: 360, y: 100 },
      ],
      edges: [
        { source: 'A', target: 'B' }, { source: 'B', target: 'C' },
        { source: 'C', target: 'D' }, { source: 'B', target: 'E' },
      ],
    },
    node: {
      style: { size: 30, label: (node) => node.id, labelOffsetY: 8 },
      stateStyles: { highlight: { fill: '#00A876', stroke: '#005C41', strokeWidth: 2 } },
    },
    edge: { style: { hitAreaWidth: 12 }, stateStyles: { highlight: { stroke: '#00A876', lineWidth: 2 } } },
    // #region highlight
    behaviors: ['zoom-canvas', 'drag-canvas', { type: 'hover-highlight', degree: 1, inactiveState: 'inactive' }],
    // #endregion highlight
    autoFit: { padding: 60, maxZoom: 1 },
  });
  const status = document.createElement('div');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;z-index:20;background:white;color:#334155;padding:6px 10px;border-radius:6px;font:12px system-ui;';
  status.setAttribute('role', 'status');
  const updateStatus = () => {
    status.textContent = `highlight: ${graph.findNodesByState('highlight').join(', ') || 'none'}`;
  };
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { status.remove(); destroy(); };
  try {
    await graph.render();
    graph.on('node:pointerover', updateStatus);
    graph.on('node:pointerleave', updateStatus);
    graph.on('edge:pointerover', updateStatus);
    graph.on('edge:pointerleave', updateStatus);
    updateStatus();
    container.append(status);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```



[运行示例与完整代码](/docs/examples/neighbor-highlight) · [参数与默认值](/docs/api/options#高亮)
