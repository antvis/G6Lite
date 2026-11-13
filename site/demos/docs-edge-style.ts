import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const rows = [
    { id: 'Plain', y: 60, width: 1.5, color: '#64748b', dash: [], start: false, end: false, opacity: 1 },
    { id: 'Dash', y: 150, width: 3, color: '#f6903d', dash: [8, 8], start: false, end: true, opacity: 0.7 },
    { id: 'Both', y: 240, width: 5, color: '#1783FF', dash: [], start: true, end: true, opacity: 1 },
  ];
  const graph = new Graph({
    container,
    data: {
      nodes: rows.flatMap((row) => [
        { id: `${row.id}-source`, x: 100, y: row.y, data: { label: row.id } },
        { id: `${row.id}-target`, x: 440, y: row.y },
      ]),
      edges: rows.map((row) => ({
        id: row.id, source: `${row.id}-source`, target: `${row.id}-target`, data: row,
      })),
    },
    node: { style: { size: 20, label: (node) => String(node.data?.label ?? '') } },
    // #region edge-options
    edge: {
      type: 'line',
      style: {
        stroke: (_source, _target, edge) => String(edge.data?.color ?? '#99ADD1'),
        lineWidth: (_source, _target, edge) => Number(edge.data?.width ?? 1),
        lineDash: (_source, _target, edge) => (edge.data?.dash as number[]) ?? [],
        opacity: (_source, _target, edge) => Number(edge.data?.opacity ?? 1),
        startArrow: (_source, _target, edge) => edge.data?.start === true,
        endArrow: (_source, _target, edge) => edge.data?.end === true,
        arrowSize: 16,
        hitAreaWidth: 14,
      },
      stateStyles: { selected: { stroke: '#873bf4', lineWidth: 6 } },
    },
    // #endregion edge-options
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
