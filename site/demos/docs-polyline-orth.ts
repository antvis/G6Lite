import { Graph, type EdgeConfig, type LayoutConfig } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: HTMLElement) {
  // #region routing
  const layout = {
    type: 'dagre', rankdir: 'LR',
    nodesep: 40, ranksep: 96, nodeSize: [84, 32],
  } satisfies LayoutConfig;
  const edge: EdgeConfig = {
    type: 'polyline',
    style: { router: 'orth', radius: 16, endArrow: true, lineWidth: 2 },
  };
  // #endregion routing
  const graph = new Graph({
    container,
    data: {
      nodes: ['A', 'B', 'C', 'D'].map((id) => ({ id })),
      edges: [
        { id: 'A-B', source: 'A', target: 'B' },
        { id: 'A-C', source: 'A', target: 'C' },
        { id: 'B-D', source: 'B', target: 'D' },
        { id: 'C-D', source: 'C', target: 'D' },
      ],
    },
    node: {
      type: 'rect',
      style: { width: 84, height: 32, borderRadius: 5, label: (node) => node.id, labelPlacement: 'center', labelColor: '#fff' },
    },
    layout,
    edge,
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 48, maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { ui.destroy(); destroy(); };
  try {
    await graph.render();
    ui.addChoice('Radius', ['0', '16'], '16', (value) => {
      const radius = Number(value);
      // #region rounding
      graph.updateOptions({ edge: { style: { radius } } });
      // #endregion rounding
    });
    ui.addChoice<'LR' | 'TB'>('Direction', ['LR', 'TB'], 'LR', async (rankdir) => {
      try {
        graph.setLayout({ ...layout, rankdir });
        await graph.render();
      } catch {
        if (!graph.destroyed) ui.setStatus('Layout failed');
      }
    });
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
