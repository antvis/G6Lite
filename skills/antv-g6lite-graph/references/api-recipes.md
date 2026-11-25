# API recipes

Use these recipes with the installed public types. Complete starting points are in [standalone.html](templates/standalone.html) and [react-graph.tsx](templates/react-graph.tsx). Snippets using `graph` assume an initialized instance after `await graph.render()`.

## Normalize business data

Keep application attributes under `data`; node `name` is optional display text. Check duplicate IDs and dangling endpoints before layout. String conversion must not silently merge distinct business IDs such as numeric `1` and string `'1'`.

```ts
import type { GraphData } from '@antv/g6-lite';

const data: GraphData = {
  nodes: [
    { id: 'gateway', name: 'Gateway', data: { kind: 'entry' } },
    { id: 'api', name: 'API', data: { kind: 'service' } },
    { id: 'db', name: 'Database', data: { kind: 'storage' } },
  ],
  edges: [
    { id: 'gateway-api', source: 'gateway', target: 'api', data: { label: 'calls' } },
    { id: 'api-db', source: 'api', target: 'db', data: { label: 'reads' } },
  ],
};
const ids = new Set(data.nodes.map((node) => node.id));
if (ids.size !== data.nodes.length) throw new Error('Duplicate node IDs');
if (data.edges.some((edge) => !ids.has(edge.source) || !ids.has(edge.target))) {
  throw new Error('Edge references a missing node');
}
```

Preserve supplied node `x`/`y` by omitting `layout`. Incremental `addNode()`/`addNodes()` require coordinates; they do not automatically position newly added nodes using the configured layout.

## Style labels, arrows, and states together

Node field callbacks receive `(node)`. Edge field callbacks receive `(sourceNode, targetNode, edge)`; the first argument is not the edge. Put these options inside `new Graph({ container, data, ... })`:

```ts
import type { GraphOptions } from '@antv/g6-lite';

const appearance = {
  node: {
    type: 'circle',
    style: {
      size: 32,
      fill: (node) => node.data?.kind === 'storage' ? '#0f766e' : '#2563eb',
      stroke: '#ffffff',
      strokeWidth: 2,
      label: (node) => node.name ?? node.id,
      labelPlacement: 'bottom',
      labelOffsetY: 8,
      labelColor: '#334155',
      labelFontSize: 12,
    },
    stateStyles: {
      selected: { stroke: '#7c3aed', strokeWidth: 3 },
      highlight: { stroke: '#f59e0b', strokeWidth: 3 },
      inactive: { opacity: 0.2 },
    },
  },
  edge: {
    style: {
      stroke: '#94a3b8',
      lineWidth: 1.5,
      endArrow: true,
      arrowSize: 6,
      label: (_source, _target, edge) => String(edge.data?.label ?? ''),
      labelColor: '#475569',
      labelFontSize: 10,
    },
    stateStyles: {
      highlight: { stroke: '#f59e0b', lineWidth: 2.5 },
      inactive: { opacity: 0.15 },
    },
  },
  behaviors: [
    'zoom-canvas', 'drag-canvas', 'drag-node', 'click-select',
    { type: 'hover-highlight', inactiveState: 'inactive' },
  ],
} satisfies Partial<GraphOptions>;
```

The whole-object node style function currently skips stateStyles; use per-field callbacks as above when state styling matters. Rectangular cards use `node.type: 'rect'` and style `width`, `height`, and `borderRadius`. See [visual guidance](visual-design.md) for label density and layout spacing.

## Events and business UI

```ts
import type { Graph, NodeGraphEvent } from '@antv/g6-lite';

export function bindNodeDetails(graph: Graph, showDetails: (id: string) => void) {
  const onClick = ({ nodeId }: NodeGraphEvent) => showDetails(nodeId);
  graph.on('node:click', onClick);
  return () => graph.off('node:click', onClick);
}
```

Listening for clicks does not select elements; `click-select` provides selection. Use `node:selectchange` for behavior-driven selection changes, and synchronize application UI yourself after programmatic state changes. Element clicks provide `nodeId` / `edgeId` / `comboId`, `data`, and `client` / `canvas` / `graph` coordinates. Do not assume G6 v5's `event.target.id` payload.

Coordinate choice depends on where the UI is mounted: fixed DOM menus use `client`; absolute overlays inside an unpadded, borderless graph container use `canvas`; new nodes and saved positions use `graph`. `screenToGraph(clientX, clientY)` and `graphToScreen(x, y)` convert graph/client coordinates without manual DPR scaling.

Lifecycle and drag payloads differ from click payloads. `node:dragend` supplies `nodeId` and `nodeIds` without promising a native MouseEvent. Read positions after dragging with `getElementPosition(id)`. `layout:end` / `afterlayout` fire before positions are committed; query after `await graph.layout()` and check `graph.destroyed` or an application generation guard.

## States, visibility, and search

```ts
graph.setItemState('api', 'selected', true); // Add one state, retain others.
graph.batchSetState([
  { id: 'api', state: 'highlight', value: true },
  { id: 'api-db', state: 'highlight', value: true },
]);
graph.setItemState('api', 'highlight', false); // Clear only the state you own.
graph.setElementStates('api', ['selected']); // Replace its complete state set.
graph.hideItem('db');
graph.showItem('db');
graph.focusItem('api');
```

Use `findNodesByState()` / `findEdgesByState()` for queries. Avoid `clearItemStates()` when you only intend to clear hover; it also removes selection and custom states. For persistent search feedback alongside hover, define an application state such as `search` instead of competing for the behavior-owned `highlight` state. Pair focus with a details panel or result list when requested.

## Choose the update operation

| Change | Public operation | Important behavior |
| --- | --- | --- |
| Replace the entire graph | `await graph.setData(next, { fitView: false })` | Runs configured layout; preserves camera, not selection |
| Refresh and show all content | `await graph.setData(next, { fitView: { padding: 48 } })` | Uses explicit fit options for this replacement |
| Change business attributes | `graph.updateNodeData('api', { status: 'healthy' })` | Style callbacks can use the new data |
| Add positioned nodes | `graph.addNodes([{ id: 'cache', x: 200, y: 100 }])` | No automatic layout execution |
| Add an edge | `graph.addEdge({ id: 'api-cache', source: 'api', target: 'cache' })` | Add its endpoints first |
| Remove elements | `graph.removeEdge('api-cache')`, `graph.removeNode('cache')` | Verify application references to removed elements |
| Move many nodes | `graph.updateNodePositions([{ id: 'api', x: 80, y: 120 }])` | Position patches avoid full data replacement |
| Change visual options | `graph.updateOptions({ node: { style: { labelFontSize: 13 } } })` | Not an arbitrary GraphOptions setter |
| Replace interactions | `graph.setBehaviors(['zoom-canvas', 'drag-canvas'])` | Replaces the behavior list |
| Switch layout | `graph.setLayout(config); await graph.layout()` | Fit afterward only when desired |

These incremental APIs schedule drawing; do not recreate Graph or call `render()` after each write. On data replacement, preserve selected IDs explicitly by querying the old selection and adding `states: ['selected']` to matching incoming nodes/edges. Merge with any incoming states the application also owns. Stable edge IDs are required.

Serialize pending initialization/data updates or use request generations so stale async application work cannot overwrite newer results. The [React template](templates/react-graph.tsx) waits for initialization, skips superseded pending updates, preserves the view after the first data load, and destroys its instance on cleanup.

## Combo grouping

Use top-level `data.combos`, node `comboId`, and Combo `parentId` for nesting. This small dataset can be passed to Graph:

```ts
const groupedData = {
  nodes: [
    { id: 'api', x: 0, y: 0, comboId: 'backend' },
    { id: 'db', x: 180, y: 0, comboId: 'backend' },
  ],
  edges: [{ id: 'api-db', source: 'api', target: 'db' }],
  combos: [{ id: 'backend', data: { name: 'Backend' } }],
};
```

Combo state styles live under `combo.style.stateStyles`, unlike node/edge state styles. Hiding a child through a collapsed Combo is distinct from its own `hidden` state; showing it may require expanding the Combo. See [Combo guide](https://g6lite.antv.vision/en/docs/guides/combo).

Full references: [Graph methods](https://g6lite.antv.vision/en/docs/api/graph), [configuration](https://g6lite.antv.vision/en/docs/api/options), [events](https://g6lite.antv.vision/en/docs/guides/events), [states](https://g6lite.antv.vision/en/docs/guides/states).
