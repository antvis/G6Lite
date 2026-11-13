import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'api', x: 0, y: 0 },
        { id: 'db', x: 200, y: -55 },
        { id: 'cache', x: 200, y: 55 },
      ],
      edges: [
        { id: 'api-db', source: 'api', target: 'db', states: ['selected'] },
        { id: 'api-cache', source: 'api', target: 'cache' },
      ],
    },
    node: { style: { size: 20 } },
    // #region state-styles
    edge: {
      style: { stroke: '#64748B', lineWidth: 2, hitAreaWidth: 14 },
      stateStyles: {
        selected: { stroke: '#7C3AED', lineWidth: 5 },
      },
    },
    behaviors: ['click-select'],
    // #endregion state-styles
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
