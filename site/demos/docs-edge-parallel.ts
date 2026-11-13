import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'a', x: 60, y: 80, data: { label: 'Same direction' } },
        { id: 'b', x: 260, y: 80 },
        { id: 'c', x: 380, y: 80, data: { label: 'Both directions' } },
        { id: 'd', x: 580, y: 80 },
        { id: 'loop', x: 320, y: 230, data: { label: 'Self-loops' } },
      ],
      edges: [
        { id: 'ab1', source: 'a', target: 'b' },
        { id: 'ab2', source: 'a', target: 'b' },
        { id: 'ab3', source: 'a', target: 'b' },
        { id: 'cd', source: 'c', target: 'd' },
        { id: 'dc', source: 'd', target: 'c' },
        { id: 'loop1', source: 'loop', target: 'loop' },
        { id: 'loop2', source: 'loop', target: 'loop' },
      ],
    },
    node: { style: { size: 22, label: (node) => String(node.data?.label ?? '') } },
    edge: {
      type: 'arc',
      parallelEdges: { enabled: true, offset: 60, maxOffset: 100, includeReverse: true },
      style: {
        lineWidth: 2,
        hitAreaWidth: 12,
        endArrow: true,
        arrowSize: 12,
        stroke: (_source, _target, edge) => edge.source === 'loop' ? '#16a085'
          : edge.source === 'd' ? '#f6903d' : '#1783FF',
      },
      stateStyles: { selected: { stroke: '#873bf4', lineWidth: 4 } },
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
