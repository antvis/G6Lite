# Node and edge mutations (/en/docs/examples/data-mutations)





Demonstrate individual and batch node and edge additions, updates, and removals.

## Try it

Choose addNode then addEdge: counts change from 3/2 to 4/3. removeNode also removes its adjacent edge; reset restores initial data.

## Data

Apply incremental updates to a small business relationship dataset.

## Complete runnable code

```ts
// Local presentation helpers in this repository are used only for the example controls.
import { Graph, type GraphData } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

const INITIAL_DATA: GraphData = {
  nodes: [
    { id: 'a', x: 120, y: 160, data: { label: 'A', color: '#5B8FF9' } },
    { id: 'b', x: 300, y: 90, data: { label: 'B', color: '#5AD8A6' } },
    { id: 'c', x: 300, y: 230, data: { label: 'C', color: '#F6BD16' } },
  ],
  edges: [
    { id: 'e-a-b', source: 'a', target: 'b', data: { weight: 1 } },
    { id: 'e-a-c', source: 'a', target: 'c', data: { weight: 2 } },
  ],
};

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: INITIAL_DATA,
    node: {
      type: 'circle',
      style: {
        size: 34,
        fill: (node) => String(node.data?.color ?? '#5B8FF9'),
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'center',
        labelColor: '#fff',
      },
    },
    edge: {
      type: 'line',
      style: {
        stroke: '#94a3b8',
        lineWidth: (_source, _target, edge) => Number(edge.data?.weight ?? 1) + 1,
        endArrow: true,
      },
    },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node'],
  });
  await graph.render();
  graph.fitView({ padding: 80 });

  const ui = createDemoPanel(container);

  let lastEvent = 'ready';
  let sequence = 0;
  const renderStatus = () => {
    const snapshot = graph.getData();
    ui.setStatus(
      `nodes=${graph.getNodeCount()} edges=${graph.getEdgeCount()}\n` +
        `ids=${snapshot.nodes.map((node) => node.id).join(', ')}\n` +
        `last=${lastEvent}`,
    );
  };

  for (const event of ['afteradditem', 'afterupdateitem', 'afterremoveitem'] as const) {
    graph.on(event, (payload: { type: string; id: string; action?: string }) => {
      lastEvent = `${event}: ${payload.type}:${payload.id}${payload.action ? ` (${payload.action})` : ''}`;
      renderStatus();
    });
  }

  ui.addAction('addNode', () => {
    if (!graph.hasNode('d')) graph.addNode({ id: 'd', x: 480, y: 160, data: { label: 'D', color: '#E8684A' } });
    renderStatus();
  });
  ui.addAction('addEdge', () => {
    if (graph.hasNode('d') && !graph.hasEdge('e-c-d')) {
      graph.addEdge({ id: 'e-c-d', source: 'c', target: 'd', data: { weight: 3 } });
    }
    renderStatus();
  });
  ui.addAction('updateNodeData', () => {
    sequence++;
    graph.updateNodeData('b', {
      label: `B${sequence}`,
      color: sequence % 2 ? '#9270CA' : '#5AD8A6',
    });
    renderStatus();
  });
  ui.addAction('updateEdgeData', () => {
    graph.updateEdgeData([{ id: 'e-a-c', data: { weight: (sequence % 4) + 1 } }]);
    renderStatus();
  });
  ui.addAction('批量新增', () => {
    if (!graph.hasNode('e')) {
      graph.addNodes([
        { id: 'e', x: 480, y: 70, data: { label: 'E', color: '#6DC8EC' } },
        { id: 'f', x: 480, y: 250, data: { label: 'F', color: '#FF9D4D' } },
      ]);
      graph.addEdges([
        { id: 'e-b-e', source: 'b', target: 'e', data: { weight: 1 } },
        { id: 'e-c-f', source: 'c', target: 'f', data: { weight: 1 } },
      ]);
    }
    renderStatus();
  });
  ui.addAction('removeEdge', () => {
    const edgeId = graph.hasEdge('e-c-d') ? 'e-c-d' : graph.hasEdge('e-a-c') ? 'e-a-c' : '';
    if (edgeId) graph.removeEdge(edgeId);
    renderStatus();
  });
  ui.addAction('removeNode', () => {
    const nodeId = graph.hasNode('d') ? 'd' : graph.hasNode('f') ? 'f' : '';
    if (nodeId) graph.removeNode(nodeId);
    renderStatus();
  });
  ui.addAction('重置', async () => {
    await graph.setData(INITIAL_DATA, { fitView: { padding: 80 } });
    lastEvent = 'datachange: reset';
    renderStatus();
  });

  renderStatus();
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

- [Mutation methods](/en/docs/api/graph#graph-data-mutations)
- [Query models](/en/docs/api/graph#graph-data)
- [Data ingestion and updates](/en/docs/guides/data)