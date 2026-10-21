# Usable APIs (/en/docs/api)



Application code imports only from the `@antv/g6-lite` package root. This page lists the functions, classes, and types you can call directly. Configuration recipes, interaction examples, and extension tutorials stay in the guides.

```ts
import { Graph, register, extensionFactory, runLayout, resolveTheme } from '@antv/g6-lite';
import type {
  GraphData,
  GraphOptions,
  GraphEventMap,
  NodeModel,
  ElementState,
} from '@antv/g6-lite';
```

The package is ESM-only. A CommonJS app crosses the client boundary with a dynamic import:

```js
const { Graph } = await import('@antv/g6-lite');
```

`Graph` needs a real DOM, Canvas, and WebGL context. It cannot be constructed in an environment without a canvas.

## Call order [#call-order]

```ts
const graph = new Graph({
  container: document.getElementById('container')!,
  data: { nodes: [{ id: 'a' }, { id: 'b' }], edges: [{ source: 'a', target: 'b' }] },
  layout: { type: 'force' },
});

graph.on('node:click', (event) => {
  graph.setItemState(event.nodeId, 'selected', true);
});

await graph.render();

graph.destroy();
```

`new Graph()` stores the options and prepares the canvas. Layout, drawing, and later data changes wait for `await graph.render()`. Calling `setData()`, `addNode()`, `setItemState()`, or `layout()` before that throws `Graph must be rendered before calling data operations`.

Queries before the first render describe an empty graph: `getNodes()` is `[]` and `getNodeData()` is `undefined`. `graph.on()` can be registered before `render()`.

## Entries you can call [#entries-you-can-call]

| Entry                                                                | Use                                                                                        | Reference                             |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------- |
| `Graph`                                                              | Create a graph, read and write data, set state, control the viewport, and listen to events | [Graph](/en/docs/api/graph)           |
| `GraphOptions` and the node, edge, layout, behavior, and theme types | Declare the initial configuration                                                          | [Options](/en/docs/api/options)       |
| `register()`                                                         | Register a custom node, edge, label, decoration, layout, behavior, transform, or plugin    | [Extensions](/en/docs/api/extensions) |
| `extensionFactory()`                                                 | Give a stateful extension its own instance on every Graph                                  | [Extensions](/en/docs/api/extensions) |
| `runLayout()`                                                        | Compute node positions without creating a Graph                                            | [Extensions](/en/docs/api/extensions) |
| `resolveTheme()`                                                     | Turn `'light'`, `'dark'`, or a partial token object into a complete `ThemeTokens`          | [Options](/en/docs/api/options)       |

These types are also exported from the package root: `GraphData`, `GraphNode`, `GraphEdge`, `ComboData`, `NodeModel`, `EdgeModel`, `ComboModel`, `ElementState`, `GraphEventMap`, `FitViewOptions`, `ZoomOptions`, `SetDataOptions`, `LayoutConfig`, `LabelOptions`, `ThemeOption`, and `BehaviorOption`.

## Query results are read-only [#query-results-are-read-only]

`getNodeData()`, `getEdgeData()`, and `getComboData()` return read-only views. Change position, payload, and state through the write methods:

```ts
const node = graph.getNodeData('a');
if (node) {
  graph.updateNodeData(node.id, { ...node.data, highlighted: true });
  graph.updateNodePosition(node.id, node.x + 20, node.y);
  graph.setItemState(node.id, 'selected', true);
}
```

Assigning `node.x`, or calling `node.states.add()`, does not update the canvas. The type checker rejects those writes.

## Engine-only members [#engine-only-members]

These `Graph` members exist for rendering and interaction dispatch. Application code uses the public entry in the right column.

| Engine member                         | Application entry                                   |
| ------------------------------------- | --------------------------------------------------- |
| `eventEmitter`                        | `graph.on()` / `graph.off()` / `graph.once()`       |
| `getCanvas()`                         | The canvas DOM stays inside the engine              |
| `getLayoutNodes()` / `getNodeIndex()` | `getNodes()` / `getNodeData()`                      |
| `pickAt()` / `pickComboAt()`          | `nodeId`, `edgeId`, and `comboId` on element events |
| `setHighlight()` / `clearHighlight()` | `setItemState()` with the `highlight` state         |
| `updateData()` / `scheduleRender()`   | The data methods and `refresh()`                    |

`EventEmitter` and `Handler` are exported as the event-transport types. Subscribe to graph events with `graph.on()`.

## Compatibility entries [#compatibility-entries]

New code uses the current entry. The symbols below can still be imported and will be removed according to [API stability](/en/docs/compatibility/api-stability).

| Compatibility entry                                           | Current entry                                              |
| ------------------------------------------------------------- | ---------------------------------------------------------- |
| `BaseNode`, `BreathingNode`, `registerNode()`                 | `register('node', name, extension)`                        |
| `graph.isDestroyed()`                                         | `graph.destroyed`                                          |
| `graph.toData()`                                              | `graph.getData()`                                          |
| `graph.getNodePosition()`                                     | `graph.getElementPosition()`                               |
| `setComboState()` / `clearComboStates()` / `getComboStates()` | `setItemState()` / `clearItemStates()` / `getItemStates()` |
| Event field `event`                                           | `nativeEvent`                                              |
| `context.graph` and the flat coordinate methods               | `context.data`, `context.state`, `context.viewport`        |
