import { Graph, type LayoutConfig } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: HTMLElement) {
  // #region layout-options
  const layouts: Record<string, LayoutConfig> = {
    grid: { type: 'grid', rows: 2, cols: 3, width: 360, height: 160 },
    circular: { type: 'circular', radius: 100 },
    dagre: { type: 'dagre', rankdir: 'LR', nodesep: 64, ranksep: 96, nodeSize: 28 },
  };
  // #endregion layout-options
  const graph = new Graph({
    container,
    data: {
      nodes: ['A', 'B', 'C', 'D', 'E', 'F'].map((id) => ({ id })),
      edges: [
        { source: 'A', target: 'B' }, { source: 'A', target: 'C' },
        { source: 'B', target: 'D' }, { source: 'C', target: 'E' },
        { source: 'D', target: 'F' }, { source: 'E', target: 'F' },
      ],
    },
    layout: layouts.grid,
    node: { style: { size: 28, label: (node) => node.id, labelOffsetY: 8 } },
    behaviors: [],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  let generation = 0;
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { generation++; ui.destroy(); destroy(); };
  try {
    await graph.render();
    ui.setStatus('grid ready');
    ui.addChoice('Layout', Object.keys(layouts), 'grid', async (value) => {
      const current = ++generation;
      ui.setStatus('Running…');
      graph.setLayout(layouts[value]);
      try {
        await graph.layout();
        if (current !== generation || graph.destroyed) return;
        graph.fitView({ padding: 56, maxZoom: 1 });
        ui.setStatus(`${value} ready`);
      } catch {
        if (current === generation && !graph.destroyed) ui.setStatus('Layout failed');
      }
    });
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
