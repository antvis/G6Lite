# Data (/en/docs/guides/data)



This page covers data ingestion and runtime updates. See [Data model](/en/docs/concepts/data-model) for node, edge, and Combo relationships, and [Options](/en/docs/api/options#graph-data) for complete fields.

## Map application data [#map-application-data]

Map entities to nodes and relationships to edges. Put application fields in `data` so style callbacks, tooltips, and application logic can read them:

```ts
import type { GraphData } from '@antv/g6-lite';

const users = [
  { id: 'alice', name: 'Alice', team: 'design' },
  { id: 'bob', name: 'Bob', team: 'engineering' },
];

const data: GraphData = {
  nodes: users.map((user) => ({
    id: user.id,
    data: { name: user.name, team: user.team },
  })),
  edges: [{ source: 'alice', target: 'bob' }],
};
```

Pass the result as the `data` option in `new Graph({ container, data })`. See [Quick start](/en/docs/getting-started/quick-start) for a complete creation and rendering example.

## Validate data [#validate-data]

* Node `id` values must be unique within the graph and remain stable across updates.
* Edge `source` and `target` must refer to existing nodes.
* When using Combo, a node's `comboId` should refer to a declared group.
* Without a configured layout, provide node `x` / `y` positions so nodes do not share the default coordinates.
* Update graph data through public methods instead of directly modifying returned Models.

## Replace all data [#replace-all-data]

Run the following operations after the first `await graph.render()` completes.

Use `setData()` when filters change, datasets switch, or a request returns a complete result:

```ts
await graph.setData(nextData);
```

A configured layout runs again, and the viewport fits the data by default. To preserve the user's current zoom and pan:

```ts
await graph.setData(nextData, { fitView: false });
```

This `fitView` option controls fitting after this data replacement. Container resize fitting is controlled separately by [`autoFit`](/en/docs/api/options#autofit).

## Incremental updates [#incremental-updates]

For a small number of element changes, use add, update, and remove methods:

```ts
graph.addNode({ id: 'carol', x: 120, y: 80, data: { name: 'Carol' } });
graph.addEdge({ source: 'alice', target: 'carol' });
graph.updateNodeData('carol', { name: 'Carol Chen' });
graph.removeNode('bob');
```

New nodes require positions; incremental methods do not automatically rerun layout. To rearrange the graph, call `layout()` as described in [Runtime relayout](/en/docs/guides/layout). Batch methods reduce repeated refreshes when updating multiple elements.

Use [State and visibility APIs](/en/docs/api/graph#state-visibility-and-focus) for selection, highlighting, or hiding instead of replacing all data.

## Related references [#related-references]

* [Graph lifecycle](/en/docs/concepts/graph-lifecycle): update after initialization and destroy on unmount.
* [Graph data API](/en/docs/api/graph#changing-nodes-and-edges): element mutations, batch operations, and parameters.
* [Node configuration](/en/docs/guides/node): map application fields to colors, sizes, and labels.
