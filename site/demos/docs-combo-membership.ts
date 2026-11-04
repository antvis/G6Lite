import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'web', x: 120, y: 100, comboId: 'client' },
        { id: 'mobile', x: 200, y: 180, comboId: 'client' },
        { id: 'api', x: 460, y: 100, comboId: 'service' },
      ],
      edges: [{ id: 'request', source: 'mobile', target: 'api' }],
      combos: [
        { id: 'client', style: { label: 'Client' } },
        { id: 'service', style: { label: 'Service', stroke: '#f6903d' } },
      ],
    },
    node: { style: {
      size: 24, label: (node) => node.id,
      fill: (node) => node.id === 'mobile' ? '#f6903d' : '#1783ff',
    } },
    combo: { style: { padding: 40, strokeWidth: 2 } },
    behaviors: ['drag-node', 'drag-canvas', 'zoom-canvas'],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  graph.on('node:click', ({ nodeId }) => {
    if (nodeId !== 'mobile') return;
    const target = graph.getNodeCombo(nodeId) === 'client' ? 'service' : 'client';
    graph.addToCombo(nodeId, target);
    // Membership changes do not move nodes; position this example explicitly.
    graph.updateNodePosition(nodeId, target === 'client' ? 200 : 380, 180);
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
