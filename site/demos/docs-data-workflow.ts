import { Graph } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'A', x: 0, y: 0, data: { score: 1 } },
        { id: 'B', x: 200, y: -50 }, { id: 'C', x: 200, y: 70 },
      ],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }, { id: 'A-C', source: 'A', target: 'C' }],
    },
    node: { style: {
      size: (node) => node.id === 'A' ? 28 + Number(node.data?.score ?? 1) * 2 : 28,
      label: (node) => node.id === 'A' ? `A: ${node.data?.score}` : node.id, labelOffsetY: 10,
    } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: [76, 48, 120, 48], maxZoom: 1 },
  });
  // #region query
  const inspect = () => ({
    node: graph.getNodeData('A'),
    neighbors: graph.getNeighborNodes('A'),
    edges: graph.getAdjacentEdges('A'),
    snapshot: graph.getData(),
  });
  // #endregion query
  // #region mutation
  const update = () => graph.updateNodeData('A', {
    score: Number(graph.getNodeData('A')?.data?.score ?? 0) + 1,
  });
  const add = () => {
    if (graph.hasNode('D')) return;
    graph.addNode({ id: 'D', x: 360, y: 70 });
    graph.addEdge({ id: 'C-D', source: 'C', target: 'D' });
  };
  const remove = () => graph.removeNode('D'); // Also removes C-D.
  // #endregion mutation
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.5 system-ui;white-space:pre-line;pointer-events:none;z-index:20;';
  let last = 'Ready';
  const report = () => {
    const result = inspect();
    status.textContent = [
      `${last} | nodes=${graph.getNodeCount()}, edges=${graph.getEdgeCount()}`,
      `A score=${result.node?.data?.score} | neighbors=${result.neighbors.join(', ')}`,
      `adjacent=${result.edges.map((edge) => edge.id).join(', ')}`,
    ].join('\n');
  };
  const copy = () => {
    const snapshot = graph.getData();
    snapshot.nodes[0].data = { ...snapshot.nodes[0].data, score: 999 };
    last = `snapshot score=999; graph score=${graph.getNodeData('A')?.data?.score}`;
  };
  const actions: Array<[string, () => void]> = [
    ['Inspect A', () => { last = 'Inspected'; }], ['Edit snapshot', copy],
    ['Update A', () => { update(); last = 'Updated A'; }],
    ['Add D', () => { add(); last = 'Added D'; }],
    ['Remove D', () => { remove(); last = 'Removed D'; }],
  ];
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    ui.destroy(); status.remove(); destroy();
  };
  try {
    await graph.render();
    if (graph.destroyed) return graph;
    for (const [label, action] of actions) {
      ui.addAction(label, () => { action(); report(); });
    }
    container.append(status); report(); return graph;
  } catch (error) { graph.destroy(); throw error; }
}
