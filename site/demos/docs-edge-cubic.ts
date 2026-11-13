import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const rows = [{ id: 'offset 30', y: 40, offset: 30 }, { id: 'offset 120', y: 180, offset: 120 }];
  const graph = new Graph({
    container,
    data: {
      nodes: rows.flatMap((row) => [
        { id: row.id + '-s', x: 100, y: row.y, data: { label: row.id } },
        { id: row.id + '-t', x: 440, y: row.y + 80 },
      ]),
      edges: rows.map((row) => ({ id: row.id, source: row.id + '-s', target: row.id + '-t', data: row })),
    },
    node: { type: 'rect', style: { width: 70, height: 28, label: (node) => String(node.data?.label ?? '') } },
    edge: {
      type: 'cubic',
      style: { curveOffset: (_s, _t, edge) => Number(edge.data?.offset ?? 60), lineWidth: 2, hitAreaWidth: 12 },
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
