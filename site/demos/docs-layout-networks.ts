import { Graph, register, type LayoutConfig } from '@antv/g6-lite';
import mds from '@antv/g6-lite/layouts/mds';
import radial from '@antv/g6-lite/layouts/radial';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: HTMLElement) {
  register('layout', 'mds', mds);
  register('layout', 'radial', radial);
  // #region network-options
  const layouts: Record<string, LayoutConfig> = {
    radial: { type: 'radial', focusNode: '0', unitRadius: 68 },
    concentric: { type: 'concentric', sortBy: 'degree', nodeSize: 24 },
    force: { type: 'force', linkDistance: 100 },
    'd3-force': { type: 'd3-force', linkDistance: 100 },
    'force-atlas2': { type: 'force-atlas2', kr: 8, kg: 2 },
    fruchterman: { type: 'fruchterman', gravity: 12 },
    mds: { type: 'mds', linkDistance: 80 },
  };
  // #endregion network-options
  const connections = [
    ['0', '1'], ['0', '2'], ['0', '3'], ['1', '2'], ['1', '4'], ['1', '5'],
    ['2', '5'], ['2', '6'], ['3', '7'], ['3', '8'], ['3', '9'],
    ['7', '8'], ['8', '9'], ['4', '10'], ['4', '11'], ['10', '11'],
  ];
  const graph = new Graph({
    container,
    data: {
      nodes: Array.from({ length: 12 }, (_, index) => ({ id: String(index) })),
      edges: connections.map(([source, target]) => ({ source, target })),
    },
    layout: layouts.radial,
    node: {
      style: {
        size: 24,
        label: (node) => node.id,
        labelPlacement: 'center',
        labelColor: '#fff',
        fill: (node) => node.id === '0' ? '#6d28d9' : '#1677ff',
      },
    },
    edge: { style: { lineWidth: 2 } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 48, maxZoom: 1 },
  });
  const panel = createDemoPanel(container);
  let revision = 0;
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    revision++;
    panel.destroy();
    destroy();
  };

  try {
    await graph.render();
    panel.setStatus('radial ready');
    panel.addChoice('Layout', Object.keys(layouts), 'radial', async (type) => {
      const current = ++revision;
      panel.setStatus('Running…');
      graph.setLayout(layouts[type]);
      try {
        await graph.layout();
        if (current !== revision || graph.destroyed) return;
        graph.fitView({ padding: 48, maxZoom: 1 });
        panel.setStatus(`${type} ready`);
      } catch {
        if (current === revision && !graph.destroyed) panel.setStatus('Layout failed');
      }
    });
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
