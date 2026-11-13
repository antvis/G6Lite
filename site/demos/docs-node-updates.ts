import { Graph } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'API', x: 0, y: 0, data: { status: 'healthy' } },
        { id: 'DB', x: 190, y: 0, data: { status: 'degraded' } },
      ],
      edges: [{ source: 'API', target: 'DB' }],
    },
    node: {
      type: 'rect',
      style: {
        size: 40,
        width: 88,
        height: 36,
        borderRadius: 6,
        fill: (node) => node.data?.status === 'degraded' ? '#D97706' : '#0F766E',
        label: (node) => `${node.id}: ${node.data?.status}`,
        labelOffsetY: 4,
      },
    },
    autoFit: { padding: 64, maxZoom: 1 },
    behaviors: [],
  });
  const ui = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    ui.destroy();
    destroy();
  };
  try {
    await graph.render();
    // #region runtime-updates
    ui.addAction('Restore DB', () => {
      graph.updateNodeData('DB', { status: 'healthy' });
    });
    ui.addAction('Labels on top', () => {
      graph.updateOptions({ node: { style: { labelPlacement: 'top', labelOffsetY: -4 } } });
    });
    // #endregion runtime-updates
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
