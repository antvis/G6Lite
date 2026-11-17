import { Graph, type FitViewOptions, type NodeConfig } from '@antv/g6-lite';

export function getFitOptions(): FitViewOptions {
  return { padding: 40, maxZoom: 1.4 * Math.min(2, window.devicePixelRatio || 1) };
}

export async function run(container: HTMLElement) {
  const node: NodeConfig = {
    type: 'rect',
    style: {
      size: 32,
      width: 96,
      height: 40,
      borderRadius: 8,
      fill: (item) => item.data?.risk === 'high' ? '#ff4d4f' : '#1783FF',
      stroke: '#fff',
      strokeWidth: 1,
    },
    stateStyles: {
      selected: { stroke: '#163B65', strokeWidth: 2 },
    },
  };
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'high-risk', x: 160, y: 100, data: { risk: 'high' } },
        { id: 'normal-risk', x: 320, y: 100, data: { risk: 'normal' } },
      ],
      edges: [],
    },
    node,
    autoFit: getFitOptions(),
    behaviors: ['click-select'],
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
