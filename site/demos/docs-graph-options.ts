import { Graph, type GraphOptions } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const options: GraphOptions = {
    container,
    data: {
      nodes: [
        { id: 'web', name: 'Browser' },
        { id: 'api', name: 'API' },
        { id: 'cache', name: 'Cache', comboId: 'storage' },
        { id: 'db', name: 'Database', comboId: 'storage' },
      ],
      edges: [
        { source: 'web', target: 'api', data: { protocol: 'HTTPS' } },
        { source: 'api', target: 'cache', data: { protocol: 'GET' } },
        { source: 'api', target: 'db', data: { protocol: 'SQL' } },
      ],
      combos: [{ id: 'storage' }],
    },
    // #region element-options
    node: {
      type: 'rect',
      style: {
        width: 96,
        height: 38,
        borderRadius: 8,
        fill: '#eef2ff',
        stroke: '#6366f1',
        strokeWidth: 1,
        label: (node) => node.name ?? node.id,
        labelPlacement: 'center',
        labelColor: '#1e293b',
      },
      stateStyles: { selected: { stroke: '#4338ca', strokeWidth: 3 } },
    },
    edge: {
      style: {
        stroke: '#64748b',
        endArrow: true,
        label: (_source, _target, edge) => String(edge.data?.protocol ?? ''),
        labelColor: '#334155',
        labelBackground: '#fff',
        labelBackgroundPadding: 4,
      },
    },
    combo: {
      style: {
        label: 'Storage',
        labelPlacement: 'top',
        labelColor: '#065f46',
        padding: 20,
        borderRadius: 12,
        fill: 'rgba(16,185,129,0.08)',
        stroke: '#6ee7b7',
      },
    },
    // #endregion element-options
    layout: { type: 'dagre', rankdir: 'LR', ranksep: 84, nodesep: 16, nodeSize: 96 },
    label: { hideOnLowZoom: false, scaleWithZoom: false },
    behaviors: ['click-select', 'drag-canvas', 'zoom-canvas'],
    autoFit: { padding: 36, maxZoom: 1 },
  };

  const graph = new Graph(options);
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
