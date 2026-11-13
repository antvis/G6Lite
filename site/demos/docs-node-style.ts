import { Graph } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'A', x: 80, y: 100, data: { value: 16, group: 'core' } },
        { id: 'B', x: 240, y: 100, data: { value: 28, group: 'other' } },
        { id: 'C', x: 400, y: 100, data: { value: 40, group: 'core' } },
      ],
      edges: [{ source: 'A', target: 'B' }, { source: 'B', target: 'C' }],
    },
    // #region node-options
    node: {
      type: 'circle',
      style: {
        size: (node) => Number(node.data?.value ?? 24),
        fill: (node) => node.data?.group === 'core' ? '#1783FF' : '#61DDAA',
        label: (node) => `${node.id}: ${node.data?.value}`,
        labelPlacement: 'bottom',
        labelOffsetY: 6,
      },
      stateStyles: {
        selected: { stroke: '#163B65', strokeWidth: 3, haloWidth: 12 },
      },
    },
    // #endregion node-options
    edge: { style: { stroke: '#94a3b8' } },
    autoFit: { padding: 40, maxZoom: 1 },
    behaviors: ['click-select'],
  });
  const ui = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    ui.destroy();
    destroy();
  };
  try {
    await graph.render();
    ui.addAction('B: 28 / 40', () => {
      const value = graph.getNodeData('B')?.data?.value === 28 ? 40 : 28;
      graph.updateNodeData('B', { value });
    });
    ui.addAction('Fill', () => {
      graph.updateOptions({ node: { style: { fill: '#7262FD' } } });
    });
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
