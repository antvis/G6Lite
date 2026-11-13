import { Graph, type EdgeConfig } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  // #region dash-options
  const rows = [
    { id: 'Solid', y: 0, dash: [] },
    { id: 'Short dashes', y: 75, dash: [4, 4] },
    { id: 'Long dashes', y: 150, dash: [8, 8] },
  ];
  const edge: EdgeConfig = {
    type: 'line',
    style: {
      lineWidth: 3,
      endArrow: false,
      lineDash: (_source, _target, edge) => (edge.data?.dash as number[] | undefined) ?? [],
    },
  };
  // #endregion dash-options
  const graph = new Graph({
    container,
    data: {
      nodes: rows.flatMap(({ id, y }) => [
        { id: id + '-source', x: 0, y },
        { id: id + '-target', x: 320, y },
      ]),
      edges: rows.map(({ id, dash }) => ({
        id,
        source: id + '-source',
        target: id + '-target',
        data: { dash },
      })),
    },
    node: { style: { size: 16 } },
    edge: {
      ...edge,
      style: { ...edge.style, label: (_source, _target, edge) => edge.id ?? '', labelFontSize: 12 },
    },
    autoFit: { padding: 48, maxZoom: 1 },
    behaviors: [],
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
