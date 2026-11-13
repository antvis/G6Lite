# Element states (/en/docs/guides/states)





States record whether an element is selected, highlighted, or marked by your application. One element can have several states, such as selected and awaiting review.

## States, Behaviors, and styles [#states-behaviors-and-styles]

* A **state** records a current flag, such as selected.
* A **Behavior** decides when to change it, such as click-select responding to clicks.
* A **state style** decides its appearance, such as a purple selected outline.

Listening to node:click does not select nodes; defining stateStyles does not create an interaction. Behaviors and application code can both change states.

## Built-in states [#names-and-data]

| State       | Meaning             | Use case                                                                       |
| ----------- | ------------------- | ------------------------------------------------------------------------------ |
| `default`   | Base appearance     | Display an element with its base styles                                        |
| `selected`  | Selection           | Mark nodes, edges, or Combos the user has selected                             |
| `active`    | Activation          | Emphasize the element currently being interacted with                          |
| `highlight` | Highlighting        | Emphasize search results or related paths                                      |
| `inactive`  | De-emphasis         | Dim elements outside the current focus                                         |
| `disabled`  | Disabled appearance | Show an unavailable element and enforce interaction limits in application code |
| `hidden`    | Visibility          | Hide an element temporarily                                                    |

Clear the states to restore base styling. To show elements hidden by a collapsed Combo, expand the Combo. See the [side-by-side state examples](/en/docs/elements/overview#element-states).

## Configure state styles [#where-state-styles-belong]

### Basic configuration [#basic-configuration]

Use `node.stateStyles` for nodes, `edge.stateStyles` for edges, and `combo.style.stateStyles` for Combos. In the `new Graph()` options, set the fields each named state overrides. Other fields keep their base values or values from other applied states.

```ts
const stateOptions = {
  node: { stateStyles: { selected: { stroke: '#6d28d9', strokeWidth: 3 } } },
  edge: { stateStyles: { highlight: { stroke: '#008765', lineWidth: 3 } } },
  combo: { style: { stateStyles: { selected: { stroke: '#6d28d9', strokeWidth: 2 } } } },
};
```

### Custom states [#try-state-changes]

Set `fill` in `node.stateStyles.review` to mark nodes awaiting review in orange. A starts selected. Click **Toggle review** to add an orange fill while keeping its purple outline. **Replace with highlight** switches A to green highlighting. **Clear A** removes its states.



```ts
const toggle = (state: ElementState) => {
  const enabled = graph.getItemStates('A').includes(state);
  graph.setItemState('A', state, !enabled);
};
const replace = () => graph.setElementStates('A', ['highlight']);
const clear = () => graph.clearItemStates('A');
```

**Complete runnable code**

```ts
import { Graph, type ElementState } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0, states: ['selected'] }, { id: 'B', x: 220, y: 0 }],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }],
    },
    node: {
      style: { size: 34, label: (node) => node.id, labelOffsetY: 10 },
      // #region state-styles
      stateStyles: {
        selected: { stroke: '#6D28D9', strokeWidth: 3 },
        review: { fill: '#F59E0B' },
        highlight: { fill: '#00A876', stroke: '#005C41', strokeWidth: 2 },
      },
      // #endregion state-styles
    },
    behaviors: [],
    autoFit: { padding: 60, maxZoom: 1 },
  });
  // #region states
  const toggle = (state: ElementState) => {
    const enabled = graph.getItemStates('A').includes(state);
    graph.setItemState('A', state, !enabled);
  };
  const replace = () => graph.setElementStates('A', ['highlight']);
  const clear = () => graph.clearItemStates('A');
  // #endregion states
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.6 system-ui;pointer-events:none;z-index:20;';
  const update = () => {
    status.textContent = `A: [${graph.getItemStates('A').join(', ')}] | B: [${graph.getItemStates('B').join(', ')}]`;
  };
  const actions: Array<[string, () => void]> = [
    ['Toggle selected', () => toggle('selected')],
    ['Toggle review', () => toggle('review')],
    ['Replace with highlight', replace],
    ['Clear A', clear],
  ];
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    ui.destroy();
    status.remove();
    destroy();
  };
  try {
    await graph.render();
    update();
    for (const [label, action] of actions) {
      ui.addAction(label, () => { action(); update(); });
    }
    container.append(status);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}


export function createDemoPanel(container: string | HTMLElement, description = '') {
  const host = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

  let gui: GUI | undefined;
  const getGui = () => {
    if (!gui) {
      gui = new GUI({ container: host, width: 160 });
      gui.domElement.classList.add('g6lite-demo-controls');
      gui.domElement.dataset.captureIgnore = '';
      Object.assign(gui.domElement.style, {
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: '30',
        maxWidth: 'calc(100% - 20px)',
        maxHeight: 'calc(100% - 20px)',
      });
    }
    return gui;
  };

  let status: HTMLDivElement | undefined;
  const setStatus = (message: string) => {
    if (!status) {
      status = document.createElement('div');
      status.setAttribute('role', 'status');
      status.dataset.role = 'status';
      status.dataset.captureIgnore = '';
      status.style.cssText =
        'position:absolute;left:12px;bottom:10px;z-index:20;max-width:min(28rem,calc(100% - 24px));color:#64748b;font:12px/1.45 system-ui,sans-serif;pointer-events:none;white-space:pre-wrap;';
      host.append(status);
    }
    status.textContent = message;
  };
  if (description) setStatus(description);

  return {
    get gui() {
      return getGui();
    },
    addAction(label: string, action: () => void, folder = getGui()) {
      return folder.add({ [label]: action }, label);
    },
    addChoice<T extends string>(
      label: string,
      choices: readonly T[] | Record<string, T>,
      value: T,
      onChange: (value: T) => void,
    ) {
      const options = Array.isArray(choices) ? [...choices] : choices;
      return getGui().add({ value }, 'value', options).name(label).onChange(onChange);
    },
    setStatus,
    destroy() {
      gui?.destroy();
      status?.remove();
    },
  };
}
```



Nodes and edges can use custom state names for styling. Combo style overrides use the supported built-in states. See [Combo state styles](/en/docs/guides/combo#options-combo-state-styles).

## Set element states [#set-element-states]

### Set initial states in data [#set-initial-states-in-data]

Declare initial states in the `states` array on a node, edge, or Combo. In this example, A and Storage start selected, and the A–B edge starts highlighted.

```ts
const data = {
  nodes: [
    { id: 'A', x: 0, y: 0, states: ['selected'] },
    { id: 'B', x: 160, y: 0, comboId: 'storage' },
  ],
  edges: [{ id: 'A-B', source: 'A', target: 'B', states: ['highlight'] }],
  combos: [{ id: 'storage', states: ['selected'] }],
};
```

### Update states at runtime [#add-business-flags-without-losing-selection]

After the initial `await graph.render()`, use `setItemState()` to add one state and preserve the others. Use `setElementStates()` to replace the complete state set for each supplied element.

```ts
graph.setItemState('A', 'review', true);
graph.setElementStates('A', ['selected', 'review']);
graph.setElementStates({ A: ['selected'], 'A-B': ['highlight'], storage: ['selected'] });
```

### Add or remove states in a batch [#batch-changes-and-combos]

Use `batchSetState()` to update specific states on several elements in one operation. The remaining states stay in place.

```ts
graph.batchSetState([
  { id: 'A', state: 'review', value: true },
  { id: 'A-B', state: 'highlight', value: true },
  { id: 'storage', state: 'selected', value: true },
]);
```

### Combine state styles [#combine-state-styles]

Nodes and edges apply styles in state order. When multiple states define the same field, the later one wins. For example, `['selected', 'review']` can apply a selection outline and a review fill together. Combos use the fixed order `active → highlight → selected → disabled → inactive`. See the [node](/en/docs/guides/node#options-node-state-styles), [edge](/en/docs/guides/edge#options-edge-state-styles), and [Combo](/en/docs/guides/combo#options-combo-state-styles) options.

### Combine click selection and hover highlighting [#combine-click-selection-and-hover-highlighting]

The next example uses `click-select` for selection and `hover-highlight` to emphasize related elements. Click selection uses a purple outline, and hover highlighting uses green. Use a custom state such as `review` for a persistent business flag. See [selection synchronization](/en/docs/guides/events/selection-drag#synchronize-selection) to connect application panels.

### Preserve selection when replacing data [#preserve-selection-when-replacing-data]

Click A, then Shift-click B and the horizontal A–C edge. Choose **Keep selected**. A and A–C stay selected, B is removed with the old data, and the new node D uses its base style. Reset the example, select elements again, and choose **Reload data** to compare a direct replacement.



```ts
const reload = async (keepSelected: boolean) => {
  const nodes = new Set(keepSelected ? graph.findNodesByState('selected') : []);
  const edges = new Set(keepSelected ? graph.findEdgesByState('selected') : []);
  const next = nextData();
  await graph.setData({
    ...next,
    nodes: next.nodes.map((node) => ({
      ...node, states: nodes.has(node.id) ? ['selected'] : [],
    })),
    edges: next.edges.map((edge) => ({
      ...edge, states: edge.id && edges.has(edge.id) ? ['selected'] : [],
    })),
  }, { fitView: false });
};
```

**Complete runnable code**

```ts
import { Graph, type GraphData } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 160, y: 80 }, { id: 'C', x: 320, y: 0 }],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }, { id: 'A-C', source: 'A', target: 'C' }],
    },
    node: {
      style: { size: 32, label: (node) => node.id, labelOffsetY: 10 },
      stateStyles: {
        selected: { stroke: '#6D28D9', strokeWidth: 3 },
        highlight: { fill: '#00A876' },
      },
    },
    edge: {
      style: { hitAreaWidth: 12 },
      stateStyles: {
        selected: { stroke: '#6D28D9', lineWidth: 3 },
        highlight: { stroke: '#00A876', lineWidth: 2 },
      },
    },
    behaviors: [
      { type: 'click-select', multiple: true, trigger: 'shift' },
      { type: 'hover-highlight', degree: 1 },
    ],
    autoFit: { padding: 60, maxZoom: 1 },
  });
  const nextData = (): GraphData => ({
    nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'C', x: 320, y: 0 }, { id: 'D', x: 160, y: 80 }],
    edges: [{ id: 'A-C', source: 'A', target: 'C' }, { id: 'C-D', source: 'C', target: 'D' }],
  });
  // #region preserve-selection
  const reload = async (keepSelected: boolean) => {
    const nodes = new Set(keepSelected ? graph.findNodesByState('selected') : []);
    const edges = new Set(keepSelected ? graph.findEdgesByState('selected') : []);
    const next = nextData();
    await graph.setData({
      ...next,
      nodes: next.nodes.map((node) => ({
        ...node, states: nodes.has(node.id) ? ['selected'] : [],
      })),
      edges: next.edges.map((edge) => ({
        ...edge, states: edge.id && edges.has(edge.id) ? ['selected'] : [],
      })),
    }, { fitView: false });
  };
  // #endregion preserve-selection
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.6 system-ui;white-space:pre-line;pointer-events:none;z-index:20;';
  let version = 1;
  let disposed = false;
  const update = () => {
    status.textContent = `data v${version} | selected nodes: ${graph.findNodesByState('selected').join(', ') || 'none'}\nselected edges: ${graph.findEdgesByState('selected').join(', ') || 'none'}`;
  };
  const events = ['node:selectchange', 'edge:selectchange', 'selection:clear'] as const;
  for (const event of events) graph.on(event, update);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    disposed = true;
    for (const event of events) graph.off(event, update);
    ui.destroy();
    status.remove();
    destroy();
  };
  try {
    await graph.render();
    update();
    const buttons = [false, true].map((keep) => ui.addAction(keep ? 'Keep selected' : 'Reload data', async () => {
        for (const item of buttons) item.disable();
        try {
          await reload(keep);
          if (!disposed) { version++; update(); }
        } catch {
          if (!disposed) status.textContent = 'Reload failed';
        } finally {
          if (!disposed) for (const item of buttons) item.enable();
        }
    }));
    container.append(status);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}


export function createDemoPanel(container: string | HTMLElement, description = '') {
  const host = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

  let gui: GUI | undefined;
  const getGui = () => {
    if (!gui) {
      gui = new GUI({ container: host, width: 160 });
      gui.domElement.classList.add('g6lite-demo-controls');
      gui.domElement.dataset.captureIgnore = '';
      Object.assign(gui.domElement.style, {
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: '30',
        maxWidth: 'calc(100% - 20px)',
        maxHeight: 'calc(100% - 20px)',
      });
    }
    return gui;
  };

  let status: HTMLDivElement | undefined;
  const setStatus = (message: string) => {
    if (!status) {
      status = document.createElement('div');
      status.setAttribute('role', 'status');
      status.dataset.role = 'status';
      status.dataset.captureIgnore = '';
      status.style.cssText =
        'position:absolute;left:12px;bottom:10px;z-index:20;max-width:min(28rem,calc(100% - 24px));color:#64748b;font:12px/1.45 system-ui,sans-serif;pointer-events:none;white-space:pre-wrap;';
      host.append(status);
    }
    status.textContent = message;
  };
  if (description) setStatus(description);

  return {
    get gui() {
      return getGui();
    },
    addAction(label: string, action: () => void, folder = getGui()) {
      return folder.add({ [label]: action }, label);
    },
    addChoice<T extends string>(
      label: string,
      choices: readonly T[] | Record<string, T>,
      value: T,
      onChange: (value: T) => void,
    ) {
      const options = Array.isArray(choices) ? [...choices] : choices;
      return getGui().add({ value }, 'value', options).name(label).onChange(onChange);
    },
    setStatus,
    destroy() {
      gui?.destroy();
      status?.remove();
    },
  };
}
```



Before calling `setData()`, query the selected node and edge IDs separately, then write matching selections to `states` in the incoming data. Edges need explicit stable IDs. The example restores only `selected` and uses `fitView: false` to keep the camera view.

## Clear element states [#clear-element-states]

### Clear all states [#clear-all-states]

Use `clearItemStates()` to clear one element. To clear several elements at once, supply an empty array for each.

```ts
graph.clearItemStates('A');
graph.setElementStates({ A: [], 'A-B': [], storage: [] });
```

### Clear a specific state [#clear-a-specific-state]

Pass `false` as the third argument to `setItemState()` to remove a single state. This example removes `review` and keeps A's selection.

```ts
graph.setItemState('A', 'review', false);
```

### Clear the same state from multiple elements [#clear-the-same-state-from-multiple-elements]

Find the highlighted edges, then use `batchSetState()` to clear their highlights.

```ts
graph.batchSetState(
  graph.findEdgesByState('highlight').map((id) => ({ id, state: 'highlight', value: false })),
);
```

## Query element states [#query-element-states]

### Read and check an element's states [#read-and-check-an-elements-states]

`getItemStates()` returns the states of a node, edge, or Combo as an array. The array is empty when the element has no states. Use `includes()` to check for a particular state.

```ts
const states = graph.getItemStates('A');
const isSelected = states.includes('selected');
```

### Find elements with a specific state [#find-elements-with-a-specific-state]

Query nodes, edges, or Combos by state. Each method returns matching element IDs.

```ts
const selectedNodeIds = graph.findNodesByState('selected');
const highlightedEdgeIds = graph.findEdgesByState('highlight');
const selectedComboIds = graph.findCombosByState('selected');
```

## Common questions [#common-questions]

### Why did adding a state not change appearance? [#why-did-adding-a-state-not-change-appearance]

Check that supported style fields are configured. The node whole-object style function currently skips stateStyles; use per-field configuration for state appearance. See [style functions](/en/docs/guides/node#options-node-style-callbacks).

### Why did setting selected emit no selection event? [#why-did-setting-selected-emit-no-selection-event]

Programmatic state changes do not synthesize node:selectchange; click-select emits it. Synchronize business UI explicitly after programmatic writes. See [selection synchronization](/en/docs/guides/events/selection-drag#synchronize-selection).

### Why is an element still hidden after clearing states? [#why-is-an-element-still-hidden-after-clearing-states]

Check whether it belongs to a collapsed Combo. Expand that structure, then check the business hidden flag.

### Why did clearing highlighting also remove selection? [#why-did-clearing-highlighting-also-remove-selection]

Check for clearItemStates or full replacement without selected. Remove only the state your code owns to preserve others.

### Why were some selected elements not restored? [#why-were-some-selected-elements-not-restored]

Check whether the new dataset still contains their IDs and whether edge IDs are stable. The example deliberately drops removed elements and preserves only selected.

### Do state updates need another render? [#do-state-updates-need-another-render]

No. State methods schedule drawing after initialization; update application UI through queries or your own synchronization logic.

Continue with [state and visibility methods](/en/docs/api/graph#graph-states), [node styles](/en/docs/guides/node#options-node-state-styles), [edge styles](/en/docs/guides/edge#options-edge-state-styles), and [interaction combinations](/en/docs/guides/behaviors).

**Related runnable examples**

* [Click, brush, and lasso selection](/en/docs/examples/selection-behaviors)
