# Network layouts (/en/docs/guides/layout-networks)





## Choose a layout [#choose-a-layout]

| Goal                                  | Layout                                                                                                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bring connected nodes closer          | [`force`](/en/docs/guides/layout-force), [`d3-force`](/en/docs/guides/layout-d3-force), [`force-atlas2`](/en/docs/guides/layout-force-atlas2), [`fruchterman`](/en/docs/guides/layout-fruchterman) |
| Explore connections around one node   | [`radial`](/en/docs/guides/layout-radial), with `focusNode` identifying the center                                                                                                                 |
| Group nodes into rings by degree      | [`concentric`](/en/docs/guides/layout-concentric), with `sortBy: 'degree'`                                                                                                                         |
| Show graph distance in two dimensions | [`mds`](/en/docs/guides/layout-mds), with `linkDistance` setting the distance scale                                                                                                                |

## Configuration and example [#configuration-and-example]

The example starts with a radial layout. Set `focusNode` to `0` to choose its center and `unitRadius` to 68 to space the rings. Use **Layout** to compare all seven layouts on the same network.

Register Radial and MDS before using them. [Optional layouts](/en/docs/guides/layout-overview#optional-layouts)



```ts
const layouts: Record<string, LayoutConfig> = {
  radial: { type: 'radial', focusNode: '0', unitRadius: 68 },
  concentric: { type: 'concentric', sortBy: 'degree', nodeSize: 24 },
  force: { type: 'force', linkDistance: 100 },
  'd3-force': { type: 'd3-force', linkDistance: 100 },
  'force-atlas2': { type: 'force-atlas2', kr: 8, kg: 2 },
  fruchterman: { type: 'fruchterman', gravity: 12 },
  mds: { type: 'mds', linkDistance: 80 },
};
```

**Complete runnable code**

```ts
import { Graph, register, type LayoutConfig } from '@antv/g6-lite';
import mds from '@antv/g6-lite/layouts/mds';
import radial from '@antv/g6-lite/layouts/radial';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  register('layout', 'mds', mds);
  register('layout', 'radial', radial);
  // #region network-options
  const layouts: Record<string, LayoutConfig> = {
    radial: { type: 'radial', focusNode: '0', unitRadius: 68 },
    concentric: { type: 'concentric', sortBy: 'degree', nodeSize: 24 },
    force: { type: 'force', linkDistance: 100 },
    'd3-force': { type: 'd3-force', linkDistance: 100 },
    'force-atlas2': { type: 'force-atlas2', kr: 8, kg: 2 },
    fruchterman: { type: 'fruchterman', gravity: 12 },
    mds: { type: 'mds', linkDistance: 80 },
  };
  // #endregion network-options
  const connections = [
    ['0', '1'], ['0', '2'], ['0', '3'], ['1', '2'], ['1', '4'], ['1', '5'],
    ['2', '5'], ['2', '6'], ['3', '7'], ['3', '8'], ['3', '9'],
    ['7', '8'], ['8', '9'], ['4', '10'], ['4', '11'], ['10', '11'],
  ];
  const graph = new Graph({
    container,
    data: {
      nodes: Array.from({ length: 12 }, (_, index) => ({ id: String(index) })),
      edges: connections.map(([source, target]) => ({ source, target })),
    },
    layout: layouts.radial,
    node: {
      style: {
        size: 24,
        label: (node) => node.id,
        labelPlacement: 'center',
        labelColor: '#fff',
        fill: (node) => node.id === '0' ? '#6d28d9' : '#1677ff',
      },
    },
    edge: { style: { lineWidth: 2 } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 48, maxZoom: 1 },
  });
  const panel = createDemoPanel(container);
  let revision = 0;
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    revision++;
    panel.destroy();
    destroy();
  };

  try {
    await graph.render();
    panel.setStatus('radial ready');
    panel.addChoice('Layout', Object.keys(layouts), 'radial', async (type) => {
      const current = ++revision;
      panel.setStatus('Running…');
      graph.setLayout(layouts[type]);
      try {
        await graph.layout();
        if (current !== revision || graph.destroyed) return;
        graph.fitView({ padding: 48, maxZoom: 1 });
        panel.setStatus(`${type} ready`);
      } catch {
        if (current === revision && !graph.destroyed) panel.setStatus('Layout failed');
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



See the [layout reference](/en/docs/api/options#config-library-layout-fields) for force options, the [Worker guide](/en/docs/guides/layout-worker) for background computation, and the [layout gallery](/en/docs/examples/layout-gallery) for more examples.
