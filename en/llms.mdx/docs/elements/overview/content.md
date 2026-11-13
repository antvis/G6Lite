# Element overview (/en/docs/elements/overview)





The three kinds of elements in a G6Lite graph are **nodes**, **edges**, and **Combos**. Labels add names, describe relationships, or identify groups.

## Nodes [#node]

Nodes represent objects such as users, devices, or services. Choose `circle` or `rect` with `node.type`, then set size, fill, and stroke in `node.style`. The examples compare solid and outlined circles, and square and rounded rectangle corners.

[Node overview](/en/docs/elements/node)

## Edges [#edge]

Edges represent relationships such as friendships or service calls. Choose a straight line (`line`), arc (`arc`), cubic curve (`cubic`), or polyline (`polyline`) with `edge.type`. The arc below uses `lineDash`, and the cubic curve and polyline use `endArrow` to show direction.

Use `parallelEdges` to separate multiple relationships between a pair of nodes. Set `source` and `target` to the same node to draw a self-loop.

The polyline above uses the `orth` router. See the [org chart for tree](/en/docs/examples/org-chart), [indented tree for indented](/en/docs/examples/indented-tree), and [fishbone diagram for fishbone](/en/docs/examples/fishbone). See [Edge overview](/en/docs/elements/edge) for types and data structure.

## Combos [#combo]

Combos organize related nodes into groups. Use `comboId` to add a node to a group and `parentId` to nest a group. An expanded Combo draws a boundary around its members. Set `collapsedType` to show a circle or rectangle when collapsed, with a member count or custom text.

[Combo overview](/en/docs/elements/combo)

## Labels [#label]

Set a node name with `node.style.label`, describe a relationship with `edge.style.label`, or add a group title with `combo.style.label`. Use `labelPlacement` to position the text, `labelBackground` to add a background to a node or edge label, and `labelAutoRotate` to rotate a label along its edge.

[Label styling and visibility](/en/docs/guides/label)

## Parts of an element [#element-parts]

A node can combine a circle or rectangle with an `icon`, a `label`, and `node.decorations` such as a badge. An edge combines a path with optional arrows and a label. An expanded Combo can show a title on its boundary.

## Element states [#element-states]

`default` uses the base appearance. The other built-in states are `active`, `selected`, `highlight`, `inactive`, `disabled`, and `hidden`. The hidden preview is blank. The disabled preview shows a muted gray node.

The custom `review` state adds an orange fill. Combined with `selected`, it keeps the selection outline. Set initial states through `states` in the data or call `graph.setItemState()` after rendering. See [element states](/en/docs/guides/states) for how each element combines styles.

## Configure elements [#configure]

Set `node`, `edge`, and `combo` at the same level in `new Graph()`. This example uses `node.style` for the service nodes, `edge.style` for protocol labels and arrows, and `combo.style` for the storage group boundary and title. Click a node to see the outline set in `node.stateStyles.selected`.



```ts
node: {
  type: 'rect',
  style: {
    width: 96,
    height: 38,
    borderRadius: 8,
    fill: '#eef2ff',
    stroke: '#6366f1',
    strokeWidth: 1,
    label: (node) => node.name ?? node.id,
    labelPlacement: 'center',
    labelColor: '#1e293b',
  },
  stateStyles: { selected: { stroke: '#4338ca', strokeWidth: 3 } },
},
edge: {
  style: {
    stroke: '#64748b',
    endArrow: true,
    label: (_source, _target, edge) => String(edge.data?.protocol ?? ''),
    labelColor: '#334155',
    labelBackground: '#fff',
    labelBackgroundPadding: 4,
  },
},
combo: {
  style: {
    label: 'Storage',
    labelPlacement: 'top',
    labelColor: '#065f46',
    padding: 20,
    borderRadius: 12,
    fill: 'rgba(16,185,129,0.08)',
    stroke: '#6ee7b7',
  },
},
```

**Complete runnable code**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'web', name: 'Browser' },
        { id: 'api', name: 'API' },
        { id: 'cache', name: 'Cache', comboId: 'storage' },
        { id: 'db', name: 'Database', comboId: 'storage' },
      ],
      edges: [
        { source: 'web', target: 'api', data: { protocol: 'HTTPS' } },
        { source: 'api', target: 'cache', data: { protocol: 'GET' } },
        { source: 'api', target: 'db', data: { protocol: 'SQL' } },
      ],
      combos: [{ id: 'storage' }],
    },
    // #region element-options
    node: {
      type: 'rect',
      style: {
        width: 96,
        height: 38,
        borderRadius: 8,
        fill: '#eef2ff',
        stroke: '#6366f1',
        strokeWidth: 1,
        label: (node) => node.name ?? node.id,
        labelPlacement: 'center',
        labelColor: '#1e293b',
      },
      stateStyles: { selected: { stroke: '#4338ca', strokeWidth: 3 } },
    },
    edge: {
      style: {
        stroke: '#64748b',
        endArrow: true,
        label: (_source, _target, edge) => String(edge.data?.protocol ?? ''),
        labelColor: '#334155',
        labelBackground: '#fff',
        labelBackgroundPadding: 4,
      },
    },
    combo: {
      style: {
        label: 'Storage',
        labelPlacement: 'top',
        labelColor: '#065f46',
        padding: 20,
        borderRadius: 12,
        fill: 'rgba(16,185,129,0.08)',
        stroke: '#6ee7b7',
      },
    },
    // #endregion element-options
    layout: { type: 'dagre', rankdir: 'LR', ranksep: 84, nodesep: 16, nodeSize: 96 },
    label: { hideOnLowZoom: false, scaleWithZoom: false },
    behaviors: ['click-select', 'drag-canvas', 'zoom-canvas'],
    autoFit: { padding: 36, maxZoom: 1 },
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



## Shape rendering and extensions [#drawing]

Switch examples to see how extensions use `register()` in G6Lite. Each guide includes the runnable source.

* [Custom nodes](/en/docs/guides/custom-node) change the node style by service status and draw an overlay.
* [Custom edges](/en/docs/guides/custom-edge) set arc color and width by edge weight.
* [Custom node decorations](/en/docs/guides/custom-decoration) draw and stack badges next to a node.
* [Custom label renderers](/en/docs/guides/custom-label-renderer) draw multiline text for nodes and edges.
