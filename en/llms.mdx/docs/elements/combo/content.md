# Combo overview (/en/docs/elements/combo)





## What is a combo [#what-is-a-combo]

A combo groups related nodes, such as Web and Mobile in a Client group. A combo can also contain other combos. Its expanded outline follows the positions and sizes of its members. When collapsed, it hides member nodes and can appear as a circle or rectangle.

## Data structure [#data-structure]

Define combos in `data.combos`. A node’s `comboId` identifies its combo, and a child combo’s `parentId` identifies its parent combo. Edge endpoints still use node IDs.

| Field       | Type                        | Required | Description                            |
| ----------- | --------------------------- | -------- | -------------------------------------- |
| `id`        | `string`                    | Yes      | Unique combo ID                        |
| `parentId`  | `string`                    | No       | Parent combo ID                        |
| `collapsed` | `boolean`                   | No       | Whether the combo starts collapsed     |
| `states`    | `ElementState[]`            | No       | Initial states, such as `['selected']` |
| `style`     | `Partial<ComboStyleConfig>` | No       | Style for this combo                   |
| `data`      | `Record<string, unknown>`   | No       | Application data, such as a group name |

## Configuration [#configuration]

Set the default style in `combo.style`. To override a field for one combo, set it in that combo’s `style`. Supply node coordinates or let a layout calculate them.

Below, Web and Mobile belong to Client, which is nested in Platform. Archive starts collapsed.



```ts
data: {
  nodes: [
    { id: 'web', x: 100, y: 120, comboId: 'client' },
    { id: 'mobile', x: 220, y: 120, comboId: 'client' },
    { id: 'old-a', x: 420, y: 100, comboId: 'archive' },
    { id: 'old-b', x: 500, y: 140, comboId: 'archive' },
    { id: 'outside', x: 300, y: 260 },
  ],
  edges: [
    { id: 'live', source: 'mobile', target: 'outside' },
    { id: 'archived', source: 'old-a', target: 'outside' },
  ],
  combos: [
    { id: 'platform', data: { name: 'Platform' }, style: { padding: 24 } },
    { id: 'client', parentId: 'platform', data: { name: 'Client (selected)' }, states: ['selected'] },
    { id: 'archive', collapsed: true, data: { name: 'Archive (collapsed)' } },
  ],
},
```

**Complete runnable code**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    // #region graph-data
    data: {
      nodes: [
        { id: 'web', x: 100, y: 120, comboId: 'client' },
        { id: 'mobile', x: 220, y: 120, comboId: 'client' },
        { id: 'old-a', x: 420, y: 100, comboId: 'archive' },
        { id: 'old-b', x: 500, y: 140, comboId: 'archive' },
        { id: 'outside', x: 300, y: 260 },
      ],
      edges: [
        { id: 'live', source: 'mobile', target: 'outside' },
        { id: 'archived', source: 'old-a', target: 'outside' },
      ],
      combos: [
        { id: 'platform', data: { name: 'Platform' }, style: { padding: 24 } },
        { id: 'client', parentId: 'platform', data: { name: 'Client (selected)' }, states: ['selected'] },
        { id: 'archive', collapsed: true, data: { name: 'Archive (collapsed)' } },
      ],
    },
    // #endregion graph-data
    node: { style: { size: 22, label: (node) => node.id } },
    edge: { style: { lineWidth: 2, endArrow: true } },
    combo: {
      style: {
        padding: 30,
        label: (combo) => String(combo.data?.name ?? combo.id),
        labelPlacement: 'top',
        collapsedType: 'rect',
        collapsedSize: [150, 44],
        stateStyles: { selected: { stroke: '#873bf4', strokeWidth: 2 } },
      },
    },
    behaviors: [],
    autoFit: { padding: 56, maxZoom: 1 },
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



See [Common combo options](/en/docs/guides/combo) for styling, collapsing, and dragging.
