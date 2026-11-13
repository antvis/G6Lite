# Common layout switching (/en/docs/examples/layouts)





Switch between circular, force, grid, and dagre with the same data.

## Try it

Use the preview buttons to compare four layout results.

## Data

Hierarchical relationship data with 10 nodes and 11 edges.

## Complete runnable code

```ts
// Local presentation helpers in this repository are used only for the example controls.
/**
 * Demo: 布局 — 同一数据切换 circular / force / grid / dagre
 */
import { Graph } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

const data = {
  nodes: [
    { id: '0' }, { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' },
    { id: '5' }, { id: '6' }, { id: '7' }, { id: '8' }, { id: '9' },
  ],
  edges: [
    { source: '0', target: '1' }, { source: '0', target: '2' }, { source: '1', target: '3' },
    { source: '2', target: '4' }, { source: '3', target: '5' }, { source: '4', target: '5' },
    { source: '5', target: '6' }, { source: '6', target: '7' }, { source: '6', target: '8' },
    { source: '7', target: '9' }, { source: '8', target: '9' },
  ],
};

const LAYOUTS = [
  { type: 'circular', radius: 180 },
  { type: 'force', linkDistance: 80 },
  { type: 'grid', rows: 2, cols: 5 },
  { type: 'dagre', rankdir: 'TB', nodesep: 30, ranksep: 40 },
] as const;

export async function run(container: string | HTMLElement) {
  let currentGraph: Graph | null = null;
  const wrapper = typeof container === 'string'
    ? document.querySelector<HTMLElement>(container)!
    : container;
  wrapper.replaceChildren();
  wrapper.style.cssText = 'position:relative;width:100%;height:100%;min-height:0;';

  const canvasParent = document.createElement('div');
  canvasParent.style.cssText = 'position:absolute;inset:0;';
  wrapper.appendChild(canvasParent);

  async function renderLayout(index: number) {
    currentGraph?.destroy();
    const layout = LAYOUTS[index];
    currentGraph = new Graph({
      autoFit: true,
      container: canvasParent,
      data,
      node: { type: 'circle', style: { size: 10 } },
      edge: { type: 'line', style: { endArrow: true } },
      layout: { ...layout },
      behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node'],
      theme: 'light',
    });
    await currentGraph.render();
  }

  await renderLayout(0);

  const ui = createDemoPanel(wrapper);
  const labels = ['Circular', 'Force', 'Grid', 'Dagre'];
  ui.addChoice('布局', labels, labels[0], (value) => {
    void renderLayout(labels.indexOf(value));
  });

  return {
    getData: () => currentGraph?.getData(),
    fitView: () => currentGraph?.fitView({ padding: 64 }),
    destroy: () => {
      currentGraph?.destroy();
      currentGraph = null;
      ui.destroy();
    },
  };
}
```


## Related documentation

- [Layout selection](/en/docs/guides/layout)
- [Layout reference](/en/docs/api/options#options-layout)