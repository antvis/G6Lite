import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'narrow-source', x: 100, y: 80, data: { label: 'Width 2' } },
        { id: 'narrow-target', x: 440, y: 80 },
        { id: 'wide-source', x: 100, y: 200, data: { label: 'Width 24' } },
        { id: 'wide-target', x: 440, y: 200 },
      ],
      edges: [
        { id: 'narrow', source: 'narrow-source', target: 'narrow-target', data: { hitWidth: 2 } },
        { id: 'wide', source: 'wide-source', target: 'wide-target', data: { hitWidth: 24 } },
      ],
    },
    node: { style: { size: 20, label: (node) => String(node.data?.label ?? '') } },
    edge: {
      type: 'line',
      style: {
        stroke: '#64748b',
        lineWidth: 1.5,
        endArrow: false,
        hitAreaWidth: (_source, _target, edge) => Number(edge.data?.hitWidth ?? 1.5),
      },
      stateStyles: { selected: { stroke: '#873bf4' } },
    },
    behaviors: ['click-select'],
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
