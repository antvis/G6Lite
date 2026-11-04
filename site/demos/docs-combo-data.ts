import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'web', x: 100, y: 120, comboId: 'client' },
        { id: 'mobile', x: 220, y: 120, comboId: 'client' },
        { id: 'old-a', x: 420, y: 100, comboId: 'archive' },
        { id: 'old-b', x: 500, y: 140, comboId: 'archive' },
        { id: 'outside', x: 300, y: 260 },
      ],
      edges: [
        { id: 'live', source: 'mobile', target: 'outside' },
        { id: 'archived', source: 'old-a', target: 'outside' },
      ],
      combos: [
        { id: 'platform', data: { name: 'Platform' }, style: { padding: 24 } },
        { id: 'client', parentId: 'platform', data: { name: 'Client (selected)' }, states: ['selected'] },
        { id: 'archive', collapsed: true, data: { name: 'Archive (collapsed)' } },
      ],
    },
    node: { style: { size: 22, label: (node) => node.id } },
    edge: { style: { lineWidth: 2, endArrow: true } },
    combo: {
      style: {
        padding: 30,
        label: (combo) => String(combo.data?.name ?? combo.id),
        labelPlacement: 'top',
        collapsedType: 'rect',
        collapsedSize: [150, 44],
        stateStyles: { selected: { stroke: '#873bf4', strokeWidth: 2 } },
      },
    },
    behaviors: [],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
