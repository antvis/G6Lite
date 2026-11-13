# More layout examples (/en/docs/examples/layout-gallery)





Compare radial, concentric, ForceAtlas2, fruchterman, MDS, and random layouts.

## Try it

Choose layouts from the toolbar and inspect how the same data changes.

## Data

Use a fixed small network to compare six layout algorithms.

## Complete runnable code

```ts
// Local presentation helpers in this repository are used only for the example controls.
import { Graph, register, type LayoutConfig } from '@antv/g6-lite';
import mds from '@antv/g6-lite/layouts/mds';
import radial from '@antv/g6-lite/layouts/radial';
import random from '@antv/g6-lite/layouts/random';
import { createDemoPanel } from './demo-panel.ts';

const NODES = Array.from({ length: 18 }, (_, index) => ({ id: String(index), data: { label: String(index) } }));
const EDGES = Array.from({ length: 17 }, (_, index) => ({ id: `e-${index}`, source: String(Math.floor(index / 2)), target: String(index + 1) }));

const LAYOUTS: Array<{ label: string; config: LayoutConfig }> = [
  { label: 'Radial', config: { type: 'radial', unitRadius: 68, linkDistance: 60 } },
  { label: 'Concentric', config: { type: 'concentric', nodeSize: 28, minNodeSpacing: 18 } },
  { label: 'ForceAtlas2', config: { type: 'force-atlas2', maxIteration: 60, barnesHut: true, prune: false } },
  { label: 'Fruchterman', config: { type: 'fruchterman', maxIteration: 80, gravity: 8, speed: 5 } },
  { label: 'MDS', config: { type: 'mds', linkDistance: 70 } },
  { label: 'Random', config: { type: 'random' } },
];

export async function run(container: string | HTMLElement) {
  register('layout', 'mds', mds);
  register('layout', 'radial', radial);
  register('layout', 'random', random);
  const graph = new Graph({
    autoFit: true,
    container,
    data: { nodes: NODES, edges: EDGES },
    layout: LAYOUTS[0].config,
    node: { style: { size: 24, label: (node) => String(node.data?.label ?? node.id), labelPlacement: 'center', labelColor: '#fff' } },
    edge: { style: { stroke: '#94a3b8', endArrow: true } },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node'],
  });
  await graph.render();
  graph.fitView({ padding: 72 });

  const ui = createDemoPanel(container);
  const labels = LAYOUTS.map(({ label }) => label);
  ui.addChoice('布局', labels, labels[0], async (label) => {
    const layout = LAYOUTS[labels.indexOf(label)];
    ui.setStatus(`running ${label}…`);
    graph.setLayout(layout.config);
    await graph.layout();
    graph.fitView({ padding: 72 });
    ui.setStatus(`${label} complete\nnodes=${graph.getNodeCount()} edges=${graph.getEdgeCount()}`);
  });

  ui.setStatus('Radial complete');
  return {
    getData: () => graph.getData(),
    fitView: () => graph.fitView({ padding: 64 }),
    destroy: () => {
      graph.destroy();
      ui.destroy();
    },
  };
}
```


## Related documentation

- [Layout selection](/en/docs/guides/layout)
- [Layout reference](/en/docs/api/options#options-layout)