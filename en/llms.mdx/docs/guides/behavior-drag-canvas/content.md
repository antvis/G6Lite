# Drag canvas (/en/docs/guides/behavior-drag-canvas)





Drag empty space to pan the graph.

## Configuration [#configuration]

With `ignoreModifierKeys: true`, holding Shift, Ctrl, or Meta leaves the drag gesture available for brush or lasso selection.

## Example [#example]



```ts
const behaviors: BehaviorOption[] = [{ type: 'drag-canvas', ignoreModifierKeys: true }];
```

**Complete runnable code**

```ts
import { Graph, type BehaviorOption } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  // #region behavior-config
  const behaviors: BehaviorOption[] = [{ type: 'drag-canvas', ignoreModifierKeys: true }];
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



[Options and defaults](/en/docs/api/options#navigation-and-dragging)
