# Migrate from G6 v5 (/en/docs/compatibility/g6-v5-migration)



G6Lite keeps several G6 configuration concepts, but it is not a compatibility build of `@antv/g6` and does not promise source-compatible options or instance methods. This page compares `@antv/g6@5.1.1` with `@antv/g6-lite@0.1.0-beta.22`, checked on **2026-08-03**.

## Decide whether to migrate [#decide-whether-to-migrate]

A strong candidate normally meets all of these conditions: target browsers reliably support WebGL; the bottleneck is picking, state, and batch updates after rendering a large graph; the product mainly uses circle/rect nodes, common edges, labels, combos, and core interaction; and the team can accept the API stability boundary of a `0.1.x` beta.

Do not migrate directly when the application depends on G6 v5 multiple renderers, Node.js server rendering, React nodes, 3D, general animation orchestration, the mature plugin catalog, graph algorithms, or many arbitrary Canvas/SVG scene-graph shapes. Read the [graph library comparison](/en/docs/compatibility/library-comparison) and run both implementations on real data first.

## Installation and imports [#installation-and-imports]

```bash
npm install @antv/g6-lite
```

```ts
// G6 v5
import { Graph, NodeEvent } from '@antv/g6';

// G6Lite: consume the package-root public API only
import { Graph, register, extensionFactory } from '@antv/g6-lite';
import type { GraphData, GraphEventMap, GraphOptions } from '@antv/g6-lite';
```

Do not replace `@antv/g6/lib/...` imports with G6Lite `src/...` paths. The G6Lite public contract is limited to `package.json#exports` and package-root exports.

## Minimal configuration side by side [#minimal-configuration-side-by-side]

G6 v5:

```ts
import { Graph } from '@antv/g6';

const graph = new Graph({
  container: 'container',
  data: {
    nodes: [
      { id: 'a', data: { label: 'A' } },
      { id: 'b', data: { label: 'B' } },
    ],
    edges: [{ id: 'a-b', source: 'a', target: 'b' }],
  },
  node: {
    type: 'circle',
    style: {
      size: 24,
      fill: '#1783FF',
      labelText: (datum) => String(datum.data?.label ?? datum.id),
    },
  },
  edge: { type: 'line', style: { stroke: '#B8C2D1', endArrow: true } },
  layout: { type: 'force', linkDistance: 100 },
  behaviors: ['zoom-canvas', 'drag-canvas', 'drag-element', 'click-select'],
});

await graph.render();
```

Equivalent G6Lite starting point:

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: 'container',
  data: {
    nodes: [
      { id: 'a', data: { label: 'A' } },
      { id: 'b', data: { label: 'B' } },
    ],
    edges: [{ id: 'a-b', source: 'a', target: 'b' }],
  },
  node: {
    type: 'circle',
    style: {
      size: 24,
      fill: '#1783FF',
      label: (node) => String(node.data?.label ?? node.id),
    },
  },
  edge: { type: 'line', style: { stroke: '#B8C2D1', endArrow: true } },
  layout: { type: 'force', linkDistance: 100 },
  behaviors: [
    { type: 'zoom-canvas', sensitivity: 0.0015, minZoom: 0.1, maxZoom: 20 },
    'drag-canvas',
    'drag-node',
    'click-select',
  ],
});

await graph.render();
```

The immediate differences are `labelText` becoming `label`, `drag-element` becoming `drag-node`, and every node, edge, and extension style field needing validation against G6Lite package-root types.

## GraphOptions mapping [#graphoptions-mapping]

| Option                    | G6 v5                            | G6Lite migration                                                                                     |
| ------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `container`               | String or container              | String or `HTMLElement`                                                                              |
| `data`                    | nodes / edges / combos           | Same concepts, but G6Lite requires `nodes` and `edges` arrays to exist                               |
| `node` / `edge` / `combo` | Full element configuration       | All supported, but types, style fields, and extension mechanisms are not field-compatible            |
| `layout`                  | Built-in and custom layouts      | 14 built-ins plus registered layouts; validate algorithm options individually                        |
| `behaviors`               | Behavior names or objects        | Strings or objects; names and options are mapped below                                               |
| `transforms`              | Built-in and custom Transforms   | `process-parallel-edges` and registered Transforms are supported with a different lifecycle contract |
| `plugins`                 | Rich built-in and custom plugins | Registered Plugin lifecycle is supported; built-ins and ecosystem are currently smaller              |
| `theme`                   | Theme and palette system         | `light` / `dark` plus a limited `ThemeTokens` override surface; fields differ                        |
| `animation`               | General animation configuration  | No equivalent GraphOptions animation system                                                          |
| `width` / `height`        | Constructor options and resize   | Container-driven; use `graph.setSize(width, height)` at runtime                                      |
| renderer                  | Canvas / SVG / WebGL and others  | Fixed hybrid path: WebGL for nodes/edges, Canvas 2D for labels/combos                                |

`graph.updateOptions()` currently updates `node`, `edge`, and `theme` only. Do not assume G6 v5 `setOptions()` semantics for replacing Behaviors, Plugins, Transforms, or Layout. Use `setLayout()` for layouts and rebuild or update Graph through the documented lifecycle for other configuration changes.

## Data field mapping [#data-field-mapping]

| G6 v5 field              | G6Lite                                 | Notes                                                                                |
| ------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------ |
| `GraphData.nodes`        | `GraphData.nodes`                      | Required; pass `[]` when empty                                                       |
| `GraphData.edges`        | `GraphData.edges`                      | Required                                                                             |
| `GraphData.combos`       | `GraphData.combos?`                    | Supported, but collapse, nesting, and runtime regrouping remain experimental in beta |
| `node.id`                | `node.id`                              | Required and unique                                                                  |
| `node.data`              | `node.data`                            | Store business fields here; do not rely on G6 v5 internal model fields               |
| `node.style`             | `options.node.style`                   | Move shared styles to GraphOptions and use functions for per-node mapping            |
| `node.states`            | `node.states`                          | Initial states are supported; mutate with runtime state APIs                         |
| `node.combo` / `comboId` | `node.comboId`                         | Normalize to `comboId`                                                               |
| `node.x` / `node.y`      | Same names                             | Initial coordinates when layout is omitted                                           |
| `edge.id`                | `edge.id?`                             | Keep a stable explicit id for state and update APIs                                  |
| `edge.source` / `target` | Same names                             | Must reference existing node ids                                                     |
| `edge.data`              | `edge.data`                            | Business fields consumed by functional style mapping                                 |
| `combo.parentId`         | `combo.parentId`                       | Defines nested combos                                                                |
| `combo.style`            | `combo.style` or `options.combo.style` | Per-combo overrides and global configuration are both supported                      |

Nodes in the initial `GraphData` may omit coordinates when a layout is configured. Runtime `addNode()` requires `x` and `y`; migrate bulk creation to one `setData()` plus layout, or calculate coordinates before calling `addNode(s)`.

## Node, Edge, and Combo configuration [#node-edge-and-combo-configuration]

G6Lite builds in `circle` and `rect` nodes and `line`, `arc`, `polyline`, and `cubic` edges. `NodeConfig.type` and `EdgeConfig.type` also accept registered names, but custom extensions reuse built-in WebGL primitives and overlays rather than arbitrary G6 scene-graph shape trees.

Common mappings:

* Node text: migrate G6 v5 `labelText` to G6Lite `node.style.label`.
* Node size: use `size` for circles; rectangles can use `width`, `height`, and `borderRadius`.
* Edge arrows: use `startArrow`, `endArrow`, and `arrowSize`.
* Edge curves: do not copy quadratic and other type names blindly; choose `arc`, `cubic`, or `polyline` and configure `curvature`, `curveOffset`, `radius`, or `router`.
* Labels: node and edge labels support backgrounds, font styling, and placement; register a `label` extension for complex drawing instead of reaching into internal Canvas layers.
* State styles: use `node.stateStyles` and `edge.stateStyles`; combo state styles live under `combo.style.stateStyles`.
* Parallel edges: enable `edge.parallelEdges` or the `process-parallel-edges` Transform.

Combo declaration, nesting, collapse, runtime regrouping, states, and group drag are supported. See [Combo](/en/docs/guides/combo) and discard older migration notes that claimed G6Lite had no Combo support.

## Behavior mapping [#behavior-mapping]

| Common G6 v5 Behavior | G6Lite                | Migration note                                                                                                    |
| --------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `zoom-canvas`         | `zoom-canvas`         | Same name; G6Lite adds `sensitivity`, `minZoom`, and `maxZoom`                                                    |
| `drag-canvas`         | `drag-canvas`         | Same name; enabled with zoom when behaviors is omitted                                                            |
| `drag-element`        | `drag-node`           | Drags nodes and also drags a hit Combo as a group                                                                 |
| `click-select`        | `click-select`        | Single/multi-select options are supported; rebind payload types                                                   |
| `hover-activate`      | `hover-highlight`     | `highlight-node` and `highlight-edge` are also available                                                          |
| `brush-select`        | `brush-select`        | Shift/ctrl trigger options are supported                                                                          |
| `lasso-select`        | `lasso-select`        | Shift/ctrl trigger options are supported                                                                          |
| `collapse-expand`     | No same-name Behavior | Call `collapseCombo()`, `expandCombo()`, or `toggleCombo()`, or register an application Behavior                  |
| `create-edge`         | No direct equivalent  | `drag-edge` reconnects existing endpoints only; create a new edge in application interaction and call `addEdge()` |
| `focus-element`       | No same-name Behavior | Call `focusItem()` from the application event handler                                                             |
| `shortcuts-call`      | No same-name Behavior | Use the application shortcut layer or a custom Behavior                                                           |

The current 11 built-ins are `zoom-canvas`, `drag-canvas`, `highlight-node`, `highlight-edge`, `hover-highlight`, `drag-node`, `click-select`, `drag-edge`, `brush-select`, `lasso-select`, and `tooltip`.

When `behaviors` is omitted entirely, G6Lite enables `zoom-canvas` and `drag-canvas`. Passing `behaviors: []` disables those defaults. This differs from migration code that treats an empty list as “use defaults.”

## Layout migration [#layout-migration]

G6Lite currently supports `force`, `d3-force`, `force-atlas2`, `fruchterman`, `circular`, `concentric`, `radial`, `grid`, `dagre`, `mds`, `random`, `mindmap`, `indented`, and `fishbone`.

```ts
graph.setLayout({ type: 'dagre', rankdir: 'LR', nodesep: 40, ranksep: 80 });
await graph.layout();

// Starting another layout or destroying Graph also cancels the old run.
graph.cancelLayout();
```

Matching names do not guarantee matching options or defaults. Pin node size, center, direction, iteration limits, and link distance, then compare each layout on real data. Large graphs can try `worker: true`, while still reporting layout and rendering-only time separately.

Custom layouts use `register('layout', name, extensionFactory(...))`, implement `init → execute → destroy`, and respond to `AbortSignal` in long-running work. This is not a direct copy of a G6 v5 `BaseLayout` subclass.

## Event migration [#event-migration]

G6Lite does not export `NodeEvent`, `EdgeEvent`, `CanvasEvent`, `ComboEvent`, or `GraphEvent` enums. Use string event names and derive exact payloads from `GraphEventMap`.

```ts
import type { GraphEventMap } from '@antv/g6-lite';

const onNodeClick = ({ nodeId, data, nativeEvent }: GraphEventMap['node:click'][0]) => {
  console.log(nodeId, data, nativeEvent.clientX);
};

graph.on('node:click', onNodeClick);
graph.once('afterrender', ({ nodeCount, edgeCount }) => console.log(nodeCount, edgeCount));
graph.off('node:click', onNodeClick);
```

Common names still include `node:click`, `edge:click`, `canvas:click`, `afterrender`, and `afterlayout`, but do not reuse G6 v5 payload types. Node events expose `nodeId`; edge events expose `edgeId`, `edgeIndex`, `source`, and `target`; combo events expose `comboId`; and the original event is `nativeEvent`. Selection, drag, brush, and lasso derived events are emitted only when the matching Behavior is active.

## Graph API mapping [#graph-api-mapping]

| Common G6 v5 API                  | G6Lite                                                              | Difference                                                |
| --------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------- |
| `render()` / `draw()`             | `render()`                                                          | Returns `Promise<void>`                                   |
| `getData()`                       | `getData()` / `toData()`                                            | Reads current graph data                                  |
| `setData(data)`                   | `await setData(data, options?)`                                     | Optional `fitView` controls the post-replacement viewport |
| `getNodeData(id?)`                | `getNodeData(id)` / `getNodes()`                                    | Single and list queries are separate                      |
| `getEdgeData(id?)`                | `getEdgeData(id)` / `getEdges()`                                    | Single and list queries are separate                      |
| `getElementData(id)`              | `getElementData(id)`                                                | Returns a read-only node, edge, or combo model            |
| `addNodeData()`                   | `addNode()` / `addNodes()`                                          | Runtime nodes require coordinates                         |
| `updateNodeData()`                | `updateNodeData()` / `updateNodePosition(s)`                        | Business data and coordinates are separate                |
| `removeNodeData()`                | `removeNode()` / `removeNodes()`                                    | Connected edges are handled                               |
| `addEdgeData()`                   | `addEdge()` / `addEdges()`                                          | Prefer stable explicit edge ids                           |
| `updateEdgeData()`                | `updateEdgeData()`                                                  | Can update data, source, and target                       |
| `removeEdgeData()`                | `removeEdge()` / `removeEdges()`                                    | Addressed by edge id                                      |
| `setElementState()`               | `setElementStates()` or `setItemState()`                            | Replace a state array or toggle one state                 |
| `getElementState()`               | `getItemStates()`                                                   | Returns a state array                                     |
| Query by state                    | `findNodesByState()` / `findEdgesByState()` / `findCombosByState()` | Returns id arrays                                         |
| `hideElement()` / `showElement()` | `hideItem()` / `showItem()`                                         | Different names                                           |
| `focusElement()`                  | `focusItem()`                                                       | Accepts one id or an id array                             |
| `fitView()` / `fitCenter()`       | Same names                                                          | `fitView` accepts padding, minZoom, and maxZoom           |
| `getZoom()` / `zoomTo()`          | Same names plus `zoomBy()`                                          | Optional center keeps a screen point fixed                |
| Camera API                        | `getCamera()` / `setCamera()` / `resetCamera()`                     | Direct camera management                                  |
| `resize()`                        | `setSize()`                                                         | Update container CSS dimensions as well                   |
| `setLayout()` / `layout()`        | Same names plus `cancelLayout()`                                    | Layout execution is cancellable                           |
| `setOptions()`                    | `updateOptions()`                                                   | Updates node, edge, and theme only                        |
| `destroy()` / destroyed           | `destroy()` / `destroyed` / `isDestroyed()`                         | Public APIs have defined destroyed-state safety           |

G6Lite also provides `batchSetState()`, `setElementStates(stateMap)`, neighbor and adjacent-edge queries, combo lifecycle APIs, and screen/graph coordinate conversion. Use the [API reference](/en/docs/api) and package-root types; do not create new dependencies on internal methods such as `getCanvas()` or low-level `updateData()` that are outside the reviewed package-root contract.

## Extension, Transform, and Plugin migration [#extension-transform-and-plugin-migration]

G6Lite supports eight categories: `node`, `edge`, `label`, `decoration`, `layout`, `behavior`, `transform`, and `plugin`. Use `extensionFactory()` for stateful instances:

```ts
import { extensionFactory, register } from '@antv/g6-lite';

register(
  'behavior',
  'business-select',
  extensionFactory(() => ({
    init(context) {
      // Keep the public ExtensionContext only.
    },
    getEvents() {
      return { 'node:click': ({ nodeId }) => console.log(nodeId) };
    },
    destroy() {},
  })),
);
```

Migration rules:

* Custom Node and Edge implementations do not inherit G6 scene-graph classes; use built-in primitives, functional styles, and controlled overlays.
* Label and Decoration Renderers own measurement and drawing only. The engine owns placement, rotation, collision, clipping, and refresh scheduling.
* Behavior, Transform, and Plugin code modifies Graph only through `ExtensionContext` data, state, viewport, and `requestRender()` capabilities.
* A Transform instance belongs to one Graph and one configuration position; a Plugin is created on mount and cleaned up on destroy. There is no public equivalent of G6 v5 `getPluginInstance()`.
* Extension failures are isolated and diagnosed. Do not access Renderer, DataModel, WebGL context, or deep source paths directly.

See [Extension system](/en/docs/guides/extensions) and [Custom Behavior](/en/docs/guides/custom-behavior).

## Unsupported capabilities and alternatives [#unsupported-capabilities-and-alternatives]

* **General animation orchestration**: keep the G6 v5 implementation or update data/camera over frames in application code; do not migrate the `animation` option blindly.
* **Complete graph algorithms**: run `@antv/algorithm` or another standalone algorithm package in application code, then write results into G6Lite data and states.
* **Multiple renderers, SSR, and 3D**: G6Lite Graph requires a real DOM, Canvas, and WebGL client lifecycle; prefer G6 v5 for these cases.
* **React/DOM nodes and arbitrary scene-graph shapes**: reduce the visual to G6Lite primitives and extension protocols, or keep that page on G6 v5.
* **Mature built-in plugins**: toolbar, minimap, history, and similar features require an application Plugin, external component, or retained G6 v5 implementation.
* **Unmapped Behaviors**: compose application events with Graph APIs or register a custom Behavior; do not use `drag-edge` as an edge-creation substitute.

## Migration acceptance checklist [#migration-acceptance-checklist]

1. Pin both library versions and keep the G6 v5 implementation as the rollback baseline.
2. Normalize data to explicit `nodes`, `edges`, and optional `combos`, preserving stable edge ids.
3. Migrate node, edge, and combo types, style functions, labels, arrows, and states field by field; drop unknown fields.
4. Replace Behaviors using the mapping and verify empty-list, default zoom, modifier-key, and derived-event semantics.
5. Rebind event payload types and verify nodeId, edgeId, comboId, coordinates, and nativeEvent.
6. Cover setData, mutations, batch state, visibility, focus, viewport, relayout, and destroy workflows.
7. Test lifecycle and error isolation for every custom element, Behavior, Transform, and Plugin.
8. Record layout, rendering-only, drag, zoom, picking, highlight, batch-update, and memory trends with real data.
9. Validate target browsers, DPR, GPU, CSP, and container sizes instead of relying on one development machine.
10. Remove the G6 v5 fallback only after visual, interaction, data-consistency, and performance acceptance all pass.

See the Playground `g6-v5-compat` demo for a runnable compatibility example and the [default theme example](/en/docs/examples/default-theme) for the visual state baseline.
