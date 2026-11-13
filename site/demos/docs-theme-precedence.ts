import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'Base style', x: 0, y: 0 },
        { id: 'Selected', x: 180, y: 0, states: ['selected'] },
      ],
      edges: [{ source: 'Base style', target: 'Selected' }],
    },
    theme: {
      type: 'light', nodeFill: '#1783FF',
      nodeStateStyles: { selected: { fill: '#873BF4', stroke: '#873BF4' } },
    },
    node: {
      style: { fill: '#00A876', size: 36, label: (node) => node.id, labelOffsetY: 8 },
      stateStyles: { selected: { stroke: '#F08F56', strokeWidth: 3 } },
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
