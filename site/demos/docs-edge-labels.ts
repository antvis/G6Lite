import { Graph, type EdgeLabelPlacement } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const rows = ['start', 'center', 'end'] as const;
  const graph = new Graph({
    container,
    data: {
      nodes: rows.flatMap((id, index) => [
        { id: id + '-s', x: 100, y: 50 + index * 90 },
        { id: id + '-t', x: 440, y: 80 + index * 90 },
      ]),
      edges: rows.map((id) => ({ id, source: id + '-s', target: id + '-t', data: { placement: id } })),
    },
    node: { style: { size: 20 } },
    edge: {
      type: 'line',
      style: {
        lineWidth: 2,
        hitAreaWidth: 12,
        label: (_s, _t, edge) => String(edge.id),
        labelPlacement: (_s, _t, edge) => edge.data?.placement as EdgeLabelPlacement,
        labelFontSize: 12,
        labelColor: '#334155',
        labelBackground: '#eef2ff',
        labelBackgroundPadding: 4,
        labelAutoRotate: true,
      },
      stateStyles: { selected: { stroke: '#873bf4' } },
    },
    label: { hideOnCollision: false, hideOnLowZoom: false },
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
