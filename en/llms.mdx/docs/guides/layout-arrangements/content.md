# Grid, circular, and layered layouts (/en/docs/guides/layout-arrangements)





## Choose a layout [#choose-a-layout]

| Type                                          | Description                                   | Example configuration                |
| --------------------------------------------- | --------------------------------------------- | ------------------------------------ |
| [`grid`](/en/docs/guides/layout-grid)         | Arrange nodes in two rows and three columns.  | `{ type: 'grid', rows: 2, cols: 3 }` |
| [`circular`](/en/docs/guides/layout-circular) | Arrange nodes in a ring with radius 100.      | `{ type: 'circular', radius: 100 }`  |
| [`dagre`](/en/docs/guides/layout-dagre)       | Arrange dependency layers from left to right. | `{ type: 'dagre', rankdir: 'LR' }`   |

## Compare layouts [#compare-layouts]

Use **Layout** to switch between `grid`, `circular`, and `dagre` on the same graph. The code shows the full configuration for all three.



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



## Adjust layer spacing [#adjust-layer-spacing]

In Dagre, `nodesep` sets the spacing within a layer, and `ranksep` sets the spacing between layers. Set `rankdir` to `LR` for left to right or `TB` for top to bottom.

See the [layout reference](/en/docs/api/options#config-library-layout-fields) for more parameters, or try the [flowchart example](/en/docs/examples/flowchart).
