# Highlight on edge hover (/en/docs/guides/behavior-highlight-edge)





Hover an edge to emphasize it and its two endpoints.

## Configuration [#configuration]

Moving the pointer away restores the original appearance. Use neighborhood highlighting to handle both node and edge hover.

## Example [#example]



```ts
const behaviors: BehaviorOption[] = ['highlight-edge'];
```

**Complete runnable code**

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



[Try combined node and edge highlighting](/en/docs/guides/behavior-hover-highlight#example) · [Highlighting rules](/en/docs/api/options#highlighting)
