# Layout overview (/en/docs/guides/layout-overview)





## What is a layout? [#what-is-a-layout]

A layout determines where nodes go. A workflow can run left to right, while a force-directed layout can bring connected nodes together. Omit `layout` to use the nodes’ existing `x` and `y` coordinates.

## Choose a layout [#choose-a-layout]

| Type                                                  | Description                                                               | Example configuration                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [`grid`](/en/docs/guides/layout-grid)                 | Arrange nodes in rows and columns.                                        | `{ type: 'grid', cols: 3 }`                                       |
| [`circular`](/en/docs/guides/layout-circular)         | Arrange nodes along a circle.                                             | `{ type: 'circular', radius: 100 }`                               |
| [`dagre`](/en/docs/guides/layout-dagre)               | Arrange steps or dependencies in layers.                                  | `{ type: 'dagre', rankdir: 'LR', ranksep: 80 }`                   |
| [`force`](/en/docs/guides/layout-force)               | Bring linked nodes closer while spacing nodes apart.                      | `{ type: 'force', linkDistance: 100 }`                            |
| [`d3-force`](/en/docs/guides/layout-d3-force)         | Arrange a network with D3 force simulation.                               | `{ type: 'd3-force', linkDistance: 100 }`                         |
| [`force-atlas2`](/en/docs/guides/layout-force-atlas2) | Use force simulation to reveal network clusters.                          | `{ type: 'force-atlas2', kr: 8, kg: 2 }`                          |
| [`fruchterman`](/en/docs/guides/layout-fruchterman)   | Spread nodes using attraction and repulsion.                              | `{ type: 'fruchterman', gravity: 12 }`                            |
| [`radial`](/en/docs/guides/layout-radial)             | **Optional.** Arrange nodes in rings by graph distance from a focal node. | `{ type: 'radial', focusNode: '0', unitRadius: 68 }`              |
| [`concentric`](/en/docs/guides/layout-concentric)     | Arrange nodes in concentric rings by degree.                              | `{ type: 'concentric', sortBy: 'degree' }`                        |
| [`mds`](/en/docs/guides/layout-mds)                   | **Optional.** Approximate graph distances in two dimensions.              | `{ type: 'mds', linkDistance: 80 }`                               |
| [`indented`](/en/docs/guides/layout-indented)         | **Optional.** Arrange a tree as an indented list.                         | `{ type: 'indented', indent: 80, rowHeight: 40 }`                 |
| [`mindmap`](/en/docs/guides/layout-mindmap)           | **Optional.** Arrange a tree as mind map branches.                        | `{ type: 'mindmap', levelGap: 120, nodeGap: 30 }`                 |
| [`fishbone`](/en/docs/guides/layout-fishbone)         | **Optional.** Arrange categories and items along a fishbone spine.        | `{ type: 'fishbone', categoryGap: 180 }`                          |
| [`random`](/en/docs/guides/layout-random)             | **Optional.** Scatter nodes randomly within an area.                      | `{ type: 'random', width: 800, height: 600, center: [400, 300] }` |

Pass these configuration objects to `layout`. See [Common layout options](/en/docs/guides/layout) for more parameters and previews.

## Optional layouts [#optional-layouts]

Indented, Mindmap, Fishbone, Radial, MDS, and Random require registration. With npm, import the layout from its own subpath, register it, and set `layout.type`.

```ts
import { register } from '@antv/g6-lite';
import radial from '@antv/g6-lite/layouts/radial';

register('layout', 'radial', radial);

const layout = { type: 'radial', focusNode: '0', unitRadius: 68 };
```

When using UMD from a CDN, load the same version of `dist/g6-lite-layouts.min.js` after the main script. The layout extensions are available on `G6LiteLayouts`.

```html
<script src="https://cdn.jsdelivr.net/npm/@antv/g6-lite@0.1.0/dist/g6-lite.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@antv/g6-lite@0.1.0/dist/g6-lite-layouts.min.js"></script>
<script>
  G6Lite.register('layout', 'radial', G6LiteLayouts.radial);
</script>
```

Registered layouts run on the main thread.

## Configuration and example [#configuration-and-example]

Set the algorithm with `layout.type`. This example uses Dagre to arrange three steps from left to right.

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: '#container',
  data: {
    nodes: [{ id: 'Submit' }, { id: 'Review' }, { id: 'Publish' }],
    edges: [
      { source: 'Submit', target: 'Review' },
      { source: 'Review', target: 'Publish' },
    ],
  },
  layout: { type: 'dagre', rankdir: 'LR', ranksep: 80 },
  node: { style: { label: (node) => node.id } },
});

await graph.render();
```

Use **Layout** below to compare Grid, Circular, and Dagre on the same data. See [Network layouts](/en/docs/guides/layout-networks) for force-directed layouts.



```ts
const layouts: Record<string, LayoutConfig> = {
  grid: { type: 'grid', rows: 2, cols: 3, width: 360, height: 160 },
  circular: { type: 'circular', radius: 100 },
  dagre: { type: 'dagre', rankdir: 'LR', nodesep: 64, ranksep: 96, nodeSize: 28 },
};
```

**Complete runnable code**

```ts
import { Graph, type LayoutConfig } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  // #region layout-options
  const layouts: Record<string, LayoutConfig> = {
    grid: { type: 'grid', rows: 2, cols: 3, width: 360, height: 160 },
    circular: { type: 'circular', radius: 100 },
    dagre: { type: 'dagre', rankdir: 'LR', nodesep: 64, ranksep: 96, nodeSize: 28 },
  };
  // #endregion layout-options
  const graph = new Graph({
    container,
    data: {
      nodes: ['A', 'B', 'C', 'D', 'E', 'F'].map((id) => ({ id })),
      edges: [
        { source: 'A', target: 'B' }, { source: 'A', target: 'C' },
        { source: 'B', target: 'D' }, { source: 'C', target: 'E' },
        { source: 'D', target: 'F' }, { source: 'E', target: 'F' },
      ],
    },
    layout: layouts.grid,
    node: { style: { size: 28, label: (node) => node.id, labelOffsetY: 8 } },
    behaviors: [],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  let generation = 0;
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { generation++; ui.destroy(); destroy(); };
  try {
    await graph.render();
    ui.setStatus('grid ready');
    ui.addChoice('Layout', Object.keys(layouts), 'grid', async (value) => {
      const current = ++generation;
      ui.setStatus('Running…');
      graph.setLayout(layouts[value]);
      try {
        await graph.layout();
        if (current !== generation || graph.destroyed) return;
        graph.fitView({ padding: 56, maxZoom: 1 });
        ui.setStatus(`${value} ready`);
      } catch {
        if (current === generation && !graph.destroyed) ui.setStatus('Layout failed');
      }
    });
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



See [Common layout options](/en/docs/guides/layout) for parameters and runtime changes, or [Custom layouts](/en/docs/guides/custom-layout) to calculate your own coordinates.
