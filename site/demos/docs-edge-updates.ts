import { Graph } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'API', x: 0, y: 0 },
        { id: 'DB', x: 230, y: -55 },
        { id: 'Cache', x: 230, y: 55 },
      ],
      edges: [
        { id: 'api-db', source: 'API', target: 'DB', data: { protocol: 'SQL', latency: 120 } },
        { id: 'api-cache', source: 'API', target: 'Cache', data: { protocol: 'TCP', latency: 24 } },
      ],
    },
    node: { style: { size: 24, label: (node) => node.id } },
    edge: {
      style: {
        stroke: '#64748B',
        lineWidth: (_source, _target, edge) => Number(edge.data?.latency ?? 0) >= 100 ? 4 : 2,
        label: (_source, _target, edge) => `${edge.data?.protocol} · ${edge.data?.latency} ms`,
        labelAutoRotate: false,
      },
    },
    autoFit: { padding: 56, maxZoom: 1 },
    behaviors: [],
  });
  const panel = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    panel.destroy();
    destroy();
  };
  try {
    await graph.render();
    // #region edge-updates
    panel.addAction('Lower SQL latency', () => {
      graph.updateEdgeData('api-db', { latency: 60 });
    });
    panel.addAction('Set edge color', () => {
      graph.updateOptions({ edge: { style: { stroke: '#1783FF' } } });
    });
    // #endregion edge-updates
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
