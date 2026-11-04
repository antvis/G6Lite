import { Graph, type LabelPlacement } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'API', x: 100, y: 100, data: { placement: 'left', icon: 'A' } },
        { id: 'Database', x: 260, y: 100, data: { placement: 'bottom', icon: 'D' } },
        { id: 'Cache', x: 420, y: 100, data: { placement: 'right', icon: 'C' } },
      ],
      edges: [],
    },
    node: {
      style: {
        size: 40,
        fill: '#1783FF',
        label: (node) => node.id,
        labelPlacement: (node) => node.data?.placement as LabelPlacement,
        labelOffsetY: 0,
        icon: (node) => String(node.data?.icon ?? ''),
        iconType: 'text',
        iconFontSize: 20,
        iconColor: '#fff',
      },
    },
    autoFit: { padding: 48, maxZoom: 1 },
    behaviors: [],
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
