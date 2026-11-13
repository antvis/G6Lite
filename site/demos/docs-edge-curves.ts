import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const rows = [
    { id: 'curvature -0.35', y: 60, curvature: -0.35 },
    { id: 'curvature 0', y: 150, curvature: 0 },
    { id: 'curvature 0.35', y: 240, curvature: 0.35 },
  ];
  const graph = new Graph({
    container,
    data: {
      nodes: rows.flatMap((row) => [
        { id: row.id + '-s', x: 100, y: row.y, data: { label: row.id } },
        { id: row.id + '-t', x: 440, y: row.y },
      ]),
      edges: rows.map((row) => ({ id: row.id, source: row.id + '-s', target: row.id + '-t', data: row })),
    },
    node: { style: { size: 20, label: (node) => String(node.data?.label ?? '') } },
    edge: {
      type: 'arc',
      style: { curvature: (_s, _t, edge) => Number(edge.data?.curvature ?? 0), lineWidth: 2, hitAreaWidth: 12 },
      stateStyles: { selected: { stroke: '#873bf4' } },
    },
    behaviors: ['click-select'],
    autoFit: { padding: 48, maxZoom: 1 },
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
