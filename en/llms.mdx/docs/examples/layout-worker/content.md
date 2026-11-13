# Worker layout (/en/docs/examples/layout-worker)





Request a worker force layout and display the returned node positions.

## Try it

Pan the canvas after the force layout finishes.

## Data

80 nodes and 79 edges request background computation with worker: true. Verify actual worker execution in Network/Performance; failures may fall back.

## Complete runnable code

```ts
// Local presentation helpers in this repository are used only for the example controls.
/**
 * Demo: run a force layout in a Web Worker.
 */
import { Graph } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

function createNetwork(count: number) {
  const nodes = Array.from({ length: count }, (_, index) => ({
    id: `n${index}`,
    data: { group: index % 4 },
  }));
  const edges = nodes.slice(1).map((node, index) => ({
    source: `n${index % 8}`,
    target: node.id,
  }));
  return { nodes, edges };
}

export async function run(container: string | HTMLElement) {
  const host = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  host.style.position = 'relative';
  const started = performance.now();
  const graph = new Graph({
    autoFit: true,
    container: host,
    data: createNetwork(80),
    node: {
      style: {
        size: 10,
        fill: (node) => ['#5B8FF9', '#5AD8A6', '#F6BD16', '#E86452'][Number(node.data?.group ?? 0)],
      },
    },
    edge: { style: { stroke: '#D0D7E2', lineWidth: 1 } },
    layout: { type: 'force', worker: true, linkDistance: 48, maxIteration: 80 },
    behaviors: ['zoom-canvas', 'drag-canvas'],
  });
  await graph.render();

  const ui = createDemoPanel(host);
  ui.setStatus(`force · worker requested · ${Math.round(performance.now() - started)} ms\nWorker success requires a Network/Performance check; failure may fall back.`);

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

- [Worker guide](/en/docs/guides/layout-worker)
- [Layout methods](/en/docs/api/graph#graph-layout)