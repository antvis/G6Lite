import { Graph, type LabelPlacement } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'api', name: 'API', x: 100, y: 100, data: { placement: 'left' } },
        { id: 'Database', x: 260, y: 100 },
        { id: 'cache', name: 'Cache', x: 420, y: 100, data: { placement: 'right' } },
        { id: 'worker', name: 'Worker', x: 580, y: 100, data: { hideLabel: true } },
      ],
      edges: [],
    },
    // #region label-style
    node: {
      style: {
        size: 40,
        fill: '#1783FF',
        label: (node) => node.data?.hideLabel ? false : (node.name ?? node.id),
        labelPlacement: (node) => (node.data?.placement as LabelPlacement | undefined) ?? 'bottom',
        labelFontSize: 14,
        labelFontWeight: '600',
      },
    },
    // #endregion label-style
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
