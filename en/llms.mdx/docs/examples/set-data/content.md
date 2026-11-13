# Replace graph data (/en/docs/examples/set-data)





Replace the whole graph with setData, then switch layouts.

## Try it

Data A/B show 5/8 nodes. Then try layout, hiding, and focus. Replacement does not retain elements from the previous dataset.

## Data

The toolbar replaces the nodes and edges, then runs layout again.

## Complete runnable code

```ts
// Local presentation helpers in this repository are used only for the example controls.
/**
 * Demo: setData + layout() 端到端验证
 * 测试运行时整体数据替换和布局切换
 */
import { Graph } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

const DATA_A = {
  nodes: [
    { id: 'a1' },
    { id: 'a2' },
    { id: 'a3' },
    { id: 'a4' },
    { id: 'a5' },
  ],
  edges: [
    { source: 'a1', target: 'a2' },
    { source: 'a1', target: 'a3' },
    { source: 'a2', target: 'a4' },
    { source: 'a3', target: 'a5' },
    { source: 'a4', target: 'a5' },
  ],
};

const DATA_B = {
  nodes: [
    { id: 'b1' },
    { id: 'b2' },
    { id: 'b3' },
    { id: 'b4' },
    { id: 'b5' },
    { id: 'b6' },
    { id: 'b7' },
    { id: 'b8' },
  ],
  edges: [
    { source: 'b1', target: 'b2' },
    { source: 'b1', target: 'b3' },
    { source: 'b2', target: 'b4' },
    { source: 'b3', target: 'b5' },
    { source: 'b4', target: 'b6' },
    { source: 'b5', target: 'b7' },
    { source: 'b6', target: 'b8' },
    { source: 'b7', target: 'b8' },
  ],
};

export async function run(container: string | HTMLElement) {
  const el = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;

  el.style.position = 'relative';

  const graph = new Graph({
    autoFit: true,
    container: el,
    data: DATA_A,
    layout: { type: 'circular', radius: 120 },
    behaviors: [
      'zoom-canvas',
      'drag-canvas',
      'drag-node',
      { type: 'click-select', multiple: true, trigger: 'shift' },
      'highlight-node',
      'highlight-edge',
    ],
    node: { style: { size: 20, fill: '#5B8FF9' } },
    theme: 'light',
  });
  await graph.render();

  const log = (msg: string) => console.log(`[setData demo] ${msg}`);

  graph.on('datachange', (e: any) => log(`datachange: ${e.nodeCount} nodes, ${e.edgeCount} edges`));
  graph.on('layout:start', () => log('layout:start'));
  graph.on('layout:end', (e: any) => log(`layout:end: ${e.duration.toFixed(1)}ms`));

  const ui = createDemoPanel(el);
  ui.addChoice('数据', { 'A · 5 节点': 'a', 'B · 8 节点': 'b' }, 'a', async (value) => {
    const next = value === 'b' ? DATA_B : DATA_A;
    log(`setData → DATA_${value.toUpperCase()}`);
    await graph.setData(next);
    graph.fitView();
    log(`done. nodeCount=${graph.getNodeCount()}`);
  });

  ui.addChoice('布局', ['circular', 'grid', 'force'], 'circular', async (value) => {
    log(`setLayout(${value}) + layout()`);
    if (value === 'grid') graph.setLayout({ type: 'grid' });
    else if (value === 'force') graph.setLayout({ type: 'd3-force' });
    else graph.setLayout({ type: 'circular', radius: 150 });
    await graph.layout();
    graph.fitView();
    log(`${value} done`);
  });

  const updateVisibility = (action: 'hide' | 'show') => {
    const id = graph.hasNode('b1') ? 'b1' : 'a1';
    log(`${action}Item(${id})`);
    if (action === 'hide') graph.hideItem(id);
    else graph.showItem(id);
    log(`states after ${action}: ${JSON.stringify(graph.getItemStates(id))}`);
  };
  ui.addAction('hideItem', () => updateVisibility('hide'));
  ui.addAction('showItem', () => updateVisibility('show'));
  ui.addAction('focusItem', () => {
    const id = graph.hasNode('b8') ? 'b8' : 'a5';
    log(`focusItem(${id})`);
    graph.focusItem(id);
  });

  return {
    getData: () => graph.getData(),
    fitView: () => graph.fitView(),
    destroy() {
      graph.destroy();
      ui.destroy();
    },
  };
}
```


## Related documentation

- [Data updates](/en/docs/guides/data)
- [setData contract](/en/docs/api/graph#graph-data-mutations-setdata)
- [View preservation](/en/docs/guides/viewport)