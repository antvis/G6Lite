# Highlight neighbors (/en/docs/guides/behavior-hover-highlight)





Highlight a node’s neighborhood or an edge and its endpoints on hover.

## Configuration [#configuration]

Set the neighborhood depth with `degree` and dim other elements with `inactiveState`. Hover B to see its one-hop neighborhood.

```ts
behaviors: [{ type: 'hover-highlight', degree: 1, inactiveState: 'inactive' }],
```

## Example [#example]



```ts
behaviors: ['zoom-canvas', 'drag-canvas', { type: 'hover-highlight', degree: 1, inactiveState: 'inactive' }],
```

**Complete runnable code**

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



[Run the example and view the full code](/en/docs/examples/neighbor-highlight) · [Options and defaults](/en/docs/api/options#highlighting)
