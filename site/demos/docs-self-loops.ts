import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    // #region loops
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 220, y: 0 }],
      edges: [
        { id: 'a1', source: 'A', target: 'A' },
        { id: 'b1', source: 'B', target: 'B' },
        { id: 'b2', source: 'B', target: 'B' },
        { id: 'b3', source: 'B', target: 'B' },
      ],
    },
    // #endregion loops
    node: { style: { size: 32, label: (node) => node.id, labelPlacement: 'bottom' } },
    edge: {
      type: 'line',
      parallelEdges: false,
      style: {
        endArrow: true, stroke: '#7c3aed', lineWidth: 2,
        label: (_source, _target, edge) => edge.id ?? '',
        labelBackground: '#fff', labelBackgroundPadding: 3,
      },
    },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'click-select'],
    autoFit: { padding: 64, maxZoom: 1 },
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
