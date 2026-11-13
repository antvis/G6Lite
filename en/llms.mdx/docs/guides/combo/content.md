# Common combo options (/en/docs/guides/combo)





Set combo appearance through `combo.style`. See the [Combo overview](/en/docs/elements/combo) for membership data and a complete example.

<span id="declare-combos" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="combodata" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## ComboConfig [#comboconfig]

`ComboConfig` is the `combo` option in `new Graph()`. Set defaults in `style` and override fields for an individual combo in `data.combos[].style`.

<span id="basic-appearance-and-local-overrides" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="combo-style" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="style" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## Combo styles [#combo-styles]

### Outline and padding [#basic-style-fields]

Set outline color and width with `stroke` and `strokeWidth`, and background color with `fill`. Use `padding` to adjust the space between the outline and its members. An array applies its largest value to all four sides.

### Label style [#padding-bounds-and-labels]

Set label text with `label` and its position with `labelPlacement`. Use `top` or `bottom` outside the outline, `inside` at the top-left inside it, or `center` in the middle. Set font size and color with `labelFontSize` and `labelColor`.

### Style by data [#callbacks-and-precedence]

Style functions receive the current combo. Read application data from `combo.data` or count direct members with `combo.childNodeIds.size`. Per-combo styles override global defaults, and state styles can override both.

<span id="options-combo-code-and-matching-result" style="{ display: 'block', scrollMarginTop: '8rem' }" />

The left combo uses the defaults. The middle combo overrides its outline with orange. The right combo uses a style function to display its member count. Open **Complete code** for the individual styles.



```ts
combo: { style: {
  fill: 'rgba(23,131,255,0.08)', stroke: '#1783FF', strokeWidth: 2,
  opacity: 1, borderRadius: 12, padding: 40,
  label: (combo) => String(combo.data?.name ?? combo.id),
  labelFontSize: 12, labelColor: '#1e3a8a', labelPlacement: 'top',
} },
```

**Complete runnable code**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const groups = [{ id: 'global', x: 100 }, { id: 'local', x: 320 }, { id: 'callback', x: 540 }];
  const graph = new Graph({
    container,
    data: {
      nodes: groups.flatMap(({ id, x }) => [
        { id: id + '-a', x, y: 100, comboId: id },
        { id: id + '-b', x, y: 160, comboId: id },
      ]),
      edges: [],
      combos: [
        { id: 'global', data: { name: 'Global' } },
        { id: 'local', data: { name: 'Local' }, style: {
          fill: 'rgba(246,144,61,0.15)', stroke: '#f6903d', strokeWidth: 3,
          opacity: 0.75, borderRadius: 0, padding: 32,
          labelFontSize: 14, labelColor: '#7c2d12', labelPlacement: 'inside',
        } },
        { id: 'callback', style: {
          fill: (combo) => combo.childNodeIds.size >= 2 ? 'rgba(135,59,244,0.12)' : 'transparent',
          stroke: '#873bf4', borderRadius: 20, padding: [8, 40, 12, 24],
          label: (combo) => 'Members: ' + combo.childNodeIds.size, labelPlacement: 'bottom',
        } },
      ],
    },
    node: { style: { size: 22 } },
    // #region combo-options
    combo: { style: {
      fill: 'rgba(23,131,255,0.08)', stroke: '#1783FF', strokeWidth: 2,
      opacity: 1, borderRadius: 12, padding: 40,
      label: (combo) => String(combo.data?.name ?? combo.id),
      labelFontSize: 12, labelColor: '#1e3a8a', labelPlacement: 'top',
    } },
    // #endregion combo-options
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



See the [combo style reference](/en/docs/api/options#config-combo-style) for all fields, units, and defaults.

### State styles [#options-combo-state-styles]

Set the selected outline, fill, and other styles in `combo.style.stateStyles.selected`. An individual combo can set its own `style.stateStyles`. Click a combo in the example to toggle selection.



```ts
combo: { style: {
  padding: 28, label: (combo) => combo.id,
  stateStyles: {
    selected: { fill: 'rgba(135,59,244,0.12)', stroke: '#873bf4', strokeWidth: 3 },
    inactive: { opacity: 0.3 },
  },
} },
```

**Complete runnable code**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const groups = [
    { id: 'Base', x: 100 }, { id: 'Selected', x: 270 },
    { id: 'Local', x: 440 }, { id: 'Inactive', x: 610 },
  ];
  const graph = new Graph({
    container,
    data: {
      nodes: groups.flatMap(({ id, x }) => [
        { id: id + '-a', x, y: 100, comboId: id },
        { id: id + '-b', x, y: 160, comboId: id },
      ]),
      edges: [],
      combos: [
        { id: 'Base' },
        { id: 'Selected', states: ['selected'] },
        { id: 'Local', states: ['selected'], style: {
          stateStyles: { selected: { stroke: '#f6903d', labelColor: '#9a3412' } },
        } },
        { id: 'Inactive', states: ['selected', 'inactive'] },
      ],
    },
    node: { style: { size: 22 } },
    // #region state-styles
    combo: { style: {
      padding: 28, label: (combo) => combo.id,
      stateStyles: {
        selected: { fill: 'rgba(135,59,244,0.12)', stroke: '#873bf4', strokeWidth: 3 },
        inactive: { opacity: 0.3 },
      },
    } },
    // #endregion state-styles
    behaviors: [],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  graph.on('combo:click', ({ comboId }) => {
    const selected = graph.getComboData(comboId)?.states.has('selected') ?? false;
    graph.setItemState(comboId, 'selected', !selected);
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



States apply in the order `active → highlight → selected → disabled → inactive`. The last state to set a field wins. See the [state style reference](/en/docs/api/options#config-combo-state-style) for supported overrides.

## Collapse and expand [#collapse-and-expand]

Set `collapsed: true` in the combo data to start collapsed. After rendering, use `collapseCombo()`, `expandCombo()`, or `toggleCombo()`. The example toggles when you click a combo.

```ts
graph.on('combo:click', ({ comboId }) => graph.toggleCombo(comboId));
```

### Collapsed shape and text [#collapsed-appearance]

Set the collapsed shape with `collapsedType` and its size with `collapsedSize`. The text comes from `label` first. When `label` is omitted, the text defaults to the number of descendant nodes. Use `count` to supply your own text.

| Shape                                                | Configuration                                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| <span id="combo-collapsed-circle" />Circle (default) | `collapsedType: 'circle'` and `collapsedSize: 64` draw a circle 64 units across |
| <span id="combo-collapsed-rect" />Rectangle          | `collapsedType: 'rect'` and `collapsedSize: [120, 48]` set the width and height |

From left to right, the combos show the node count, custom count text, and the combo name. Click a combo to see its expanded outline.



```ts
combos: [
  { id: 'circle', collapsed: true },
  { id: 'rect', collapsed: true, style: {
    collapsedType: 'rect', collapsedSize: [120, 48],
    count: (combo) => 'Items: ' + combo.childNodeIds.size,
  } },
  { id: 'label', collapsed: true, style: {
    collapsedType: 'rect', collapsedSize: [120, 48], label: 'Archive',
  } },
],
```

**Complete runnable code**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const groups = [{ id: 'circle', x: 100 }, { id: 'rect', x: 300 }, { id: 'label', x: 500 }];
  const graph = new Graph({
    container,
    data: {
      nodes: groups.flatMap(({ id, x }) => [
        { id: id + '-a', x: x - 24, y: 100, comboId: id },
        { id: id + '-b', x: x + 24, y: 160, comboId: id },
      ]),
      edges: [],
      // #region collapsed-shapes
      combos: [
        { id: 'circle', collapsed: true },
        { id: 'rect', collapsed: true, style: {
          collapsedType: 'rect', collapsedSize: [120, 48],
          count: (combo) => 'Items: ' + combo.childNodeIds.size,
        } },
        { id: 'label', collapsed: true, style: {
          collapsedType: 'rect', collapsedSize: [120, 48], label: 'Archive',
        } },
      ],
      // #endregion collapsed-shapes
    },
    node: { style: { size: 22 } },
    combo: { style: {
      stroke: '#1783ff', strokeWidth: 2, padding: 24,
      collapsedType: 'circle', collapsedSize: 64, count: true,
    } },
    behaviors: [],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  graph.on('combo:click', ({ comboId }) => graph.toggleCombo(comboId));
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```



### Visibility in nested groups [#visibility-in-nested-groups]

Collapsing a parent hides its descendant nodes and their edges. Child combo outlines remain visible. Expanding keeps any existing hidden states on nodes and edges.

## Change membership [#change-membership]

Call `addToCombo(nodeId, comboId)` to move a node into a different combo. The combo outline recalculates. When you click Mobile in the example, `updateNodePosition()` also moves it next to its new group.



```ts
graph.on('node:click', ({ nodeId }) => {
  if (nodeId !== 'mobile') return;
  const target = graph.getNodeCombo(nodeId) === 'client' ? 'service' : 'client';
  graph.addToCombo(nodeId, target);
  // Membership changes do not move nodes; position this example explicitly.
  graph.updateNodePosition(nodeId, target === 'client' ? 200 : 380, 180);
});
```

**Complete runnable code**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'web', x: 120, y: 100, comboId: 'client' },
        { id: 'mobile', x: 200, y: 180, comboId: 'client' },
        { id: 'api', x: 460, y: 100, comboId: 'service' },
      ],
      edges: [{ id: 'request', source: 'mobile', target: 'api' }],
      combos: [
        { id: 'client', style: { label: 'Client' } },
        { id: 'service', style: { label: 'Service', stroke: '#f6903d' } },
      ],
    },
    node: { style: {
      size: 24, label: (node) => node.id,
      fill: (node) => node.id === 'mobile' ? '#f6903d' : '#1783ff',
    } },
    combo: { style: { padding: 40, strokeWidth: 2 } },
    behaviors: ['drag-node', 'drag-canvas', 'zoom-canvas'],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  // #region change-membership
  graph.on('node:click', ({ nodeId }) => {
    if (nodeId !== 'mobile') return;
    const target = graph.getNodeCombo(nodeId) === 'client' ? 'service' : 'client';
    graph.addToCombo(nodeId, target);
    // Membership changes do not move nodes; position this example explicitly.
    graph.updateNodePosition(nodeId, target === 'client' ? 200 : 380, 180);
  });
  // #endregion change-membership
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```



Use `removeFromCombo()` to ungroup a node. Use `createCombo()` to group existing nodes and `removeCombo()` to remove a combo while retaining its nodes. See the [combo methods](/en/docs/api/graph#graph-combo) for signatures.

## Drag groups [#drag-groups]

Enable `drag-node` to drag an entire combo. Drag the empty space inside a combo above to move its members together. To change membership, call `addToCombo()` or `removeFromCombo()`.

```ts
behaviors: ['drag-node', 'drag-canvas'],
```

## Update combo styles [#options-combo-runtime-updates]

To change one combo’s style, edit the data snapshot and apply it with `setData()`. This reruns the configured layout. Set `fitView: false` to retain the current view. Set global combo styles when you create the graph.

```ts
const data = graph.getData();
const combo = data.combos?.find(({ id }) => id === 'local');
if (combo) {
  combo.style = { ...combo.style, stroke: '#16a085' };
  await graph.setData(data, { fitView: false });
}
```

## Queries [#queries]

`getNodeCombo()` returns a node’s combo. `getComboChildren()` returns the direct members. `getComboData()` returns the read-only combo model.

```ts
const groupId = graph.getNodeCombo('mobile');
const members = graph.getComboChildren('client');
const collapsed = graph.getComboData('client')?.collapsed;
```

### ComboModel fields [#read-only-query-model]

| Field                           | Meaning                                       |
| ------------------------------- | --------------------------------------------- |
| `id`, `parentId`                | Combo ID and parent combo ID                  |
| `childNodeIds`, `childComboIds` | IDs of direct member nodes and child combos   |
| `collapsed`, `states`           | Collapsed flag and current element states     |
| `x`, `y`, `width`, `height`     | Center and dimensions of the expanded outline |
| `style`, `data`                 | Per-combo style and application data          |

### Bounds updates and data export [#bounds-updates-and-data-export]

Bounds are recalculated during rendering. `getData()` exports the current membership and collapsed state. For JSON export, save or recreate style functions separately.

## Common questions [#common-questions]

### Why is there no group outline or title? [#why-is-there-no-group-outline-or-title]

Members need a valid `comboId` and positions. Empty combos have no outline. Set a title with `label`.

### Why does content remain after hiding or collapsing a parent? [#why-does-content-remain-after-hiding-or-collapsing-a-parent]

`hidden` hides the combo itself. For collapse behavior, see [Visibility in nested groups](#visibility-in-nested-groups).

### Why do some nodes stay hidden after expanding? [#why-do-some-nodes-stay-hidden-after-expanding]

Check node and edge `hidden` states and whether an ancestor remains collapsed.

### Why does dragging not change membership or selection? [#why-does-dragging-not-change-membership-or-selection]

Dragging changes positions. Set membership through the [combo methods](/en/docs/api/graph#graph-combo) and selection through the [state methods](/en/docs/api/graph#graph-states).

### Why can updateOptions not change Combo appearance? [#why-can-updateoptions-not-change-combo-appearance]

Update the data to change a per-combo style. See [Update combo styles](#options-combo-runtime-updates).

<span id="options-combo-related-entries" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## Related [#related]

* [Combo configuration reference](/en/docs/api/options#options-combo)
* [Complete combo example](/en/docs/examples/combo)
