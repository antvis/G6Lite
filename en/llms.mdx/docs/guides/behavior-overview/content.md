# Interaction overview (/en/docs/guides/behavior-overview)





## What is a behavior? [#what-is-a-behavior]

A behavior defines how the graph responds to user input. For example, drag empty space to pan, use the wheel to zoom, or click a node to select it.

## Built-in behaviors [#built-in-behaviors]

Add built-in behaviors directly to `behaviors`. Open a behavior to see its options and example.

| Category    | Behavior                                                           | Type              | Description                                                                                  |
| ----------- | ------------------------------------------------------------------ | ----------------- | -------------------------------------------------------------------------------------------- |
| Navigation  | [Drag canvas](/en/docs/guides/behavior-drag-canvas)                | `drag-canvas`     | Drag empty space to pan the graph.                                                           |
| Navigation  | [Zoom canvas](/en/docs/guides/behavior-zoom-canvas)                | `zoom-canvas`     | Use the mouse wheel to zoom around the canvas center.                                        |
| Selection   | [Click to select](/en/docs/guides/behavior-click-select)           | `click-select`    | Click a node or edge to toggle selection. Click empty canvas to clear it.                    |
| Selection   | [Brush select](/en/docs/guides/behavior-brush-select)              | `brush-select`    | Drag a rectangle to select nodes whose centers fall inside it.                               |
| Selection   | [Lasso select](/en/docs/guides/behavior-lasso-select)              | `lasso-select`    | Trace a freehand outline to select nodes whose centers fall inside it.                       |
| Editing     | [Drag nodes and combos](/en/docs/guides/behavior-drag-node)        | `drag-node`       | Drag a node, or drag empty space within a combo to move the entire combo.                    |
| Editing     | [Drag edge endpoints](/en/docs/guides/behavior-drag-edge)          | `drag-edge`       | Drag an endpoint of an existing edge and use the drop event to read the proposed connection. |
| Exploration | [Highlight on node hover](/en/docs/guides/behavior-highlight-node) | `highlight-node`  | Hover a node to emphasize it, its immediate neighbors, and their connecting edges.           |
| Exploration | [Highlight on edge hover](/en/docs/guides/behavior-highlight-edge) | `highlight-edge`  | Hover an edge to emphasize it and its two endpoints.                                         |
| Exploration | [Highlight neighbors](/en/docs/guides/behavior-hover-highlight)    | `hover-highlight` | Highlight a node’s neighborhood or an edge and its endpoints on hover.                       |
| Exploration | [Tooltip](/en/docs/guides/behavior-tooltip)                        | `tooltip`         | Show details for a node or edge on hover or click.                                           |

## Custom behaviors [#custom-behaviors]

Wrap reusable event handlers in a custom behavior, then register it and enable it by name. [See custom behaviors](/en/docs/guides/custom-behavior)

## Configuration and usage [#configuration-and-usage]

### Basic configuration [#basic-configuration]

Pass a `behaviors` array to `new Graph()`. A name uses the default settings. Omitting `behaviors` enables wheel zoom and canvas panning.

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container,
  data,
  behaviors: ['drag-canvas', 'zoom-canvas', 'click-select'],
});

await graph.render();
```

### Configure behavior options [#configure-behavior-options]

Set the behavior name in `type` and put its options alongside it. In the example, click to select, Shift-click to add, or drag from empty space to select a rectangle.



```ts
const behaviors = [
  { type: 'zoom-canvas', minZoom: 0.5, maxZoom: 2 },
  'drag-node',
  { type: 'click-select', multiple: true, trigger: 'shift' },
  { type: 'brush-select', key: null },
] satisfies Array<BehaviorName | BuiltInBehaviorConfig>;
```

**Complete runnable code**

```ts
import { Graph, type BehaviorName, type BuiltInBehaviorConfig } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  // #region behavior-options
  const behaviors = [
    { type: 'zoom-canvas', minZoom: 0.5, maxZoom: 2 },
    'drag-node',
    { type: 'click-select', multiple: true, trigger: 'shift' },
    { type: 'brush-select', key: null },
  ] satisfies Array<BehaviorName | BuiltInBehaviorConfig>;
  // #endregion behavior-options
  const graph = new Graph({
    container,
    data: {
      nodes: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((id, i) => ({
        id, x: (i % 4) * 120, y: Math.floor(i / 4) * 100,
      })),
      edges: [{ id: 'A-B', source: 'A', target: 'B' }, { id: 'D-H', source: 'D', target: 'H' }],
    },
    node: {
      style: { size: 30, label: (node) => node.id, labelOffsetY: 8 },
      stateStyles: { selected: { fill: '#873BF4', stroke: '#5B21B6', strokeWidth: 2, haloWidth: 12 } },
    },
    behaviors,
    autoFit: { padding: 60, maxZoom: 1 },
  });
  const status = document.createElement('div');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;z-index:20;background:white;color:#334155;padding:6px 10px;border-radius:6px;font:12px system-ui;';
  status.setAttribute('role', 'status');
  const updateStatus = () => {
    status.textContent = `selected nodes: ${graph.findNodesByState('selected').join(', ') || 'none'}`;
  };
  graph.on('node:selectchange', updateStatus);
  graph.on('selection:clear', updateStatus);
  graph.on('brush:end', updateStatus);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { status.remove(); destroy(); };
  try {
    await graph.render();
    updateStatus();
    container.append(status);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```



### Update behaviors at runtime [#update-behaviors-at-runtime]

Use `setBehaviors()` to replace the full list at runtime. Include every behavior you want to enable.

```ts
graph.setBehaviors(['drag-canvas', { type: 'zoom-canvas', sensitivity: 0.5 }]);
```

[Try switching behaviors](/en/docs/guides/behaviors#switch-behaviors)

### Remove behaviors [#remove-behaviors]

Pass an empty array to disable all behaviors. Omit the argument to restore default panning and zooming.

```ts
graph.setBehaviors([]);
```

## Behaviors and events [#behaviors-and-events]

Use `graph.on()` to listen for `node:click` when a click should update your application UI. Unsubscribe with the same handler on unmount.

```ts
const onNodeClick = ({ nodeId }: { nodeId: string }) => console.log(nodeId);
graph.on('node:click', onNodeClick);

// On component unmount
graph.off('node:click', onNodeClick);
```

[Common behavior options](/en/docs/guides/behaviors) · [Event guide](/en/docs/guides/events)
