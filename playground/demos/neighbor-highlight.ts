/**
 * Demo: hover a node to highlight its neighbors, or an edge to highlight its endpoints.
 */
import { Graph } from '../../src/index.ts';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFitOnResize: true,
    container,
    data: {
      nodes: ['hub', 'a', 'b', 'c', 'd', 'e', 'f'].map((id) => ({ id, data: { label: id.toUpperCase() } })),
      edges: [
        { source: 'hub', target: 'a' },
        { source: 'hub', target: 'b' },
        { source: 'hub', target: 'c' },
        { source: 'a', target: 'd' },
        { source: 'b', target: 'e' },
        { source: 'c', target: 'f' },
        { source: 'd', target: 'e' },
      ],
    },
    node: {
      style: {
        size: (node) => (node.id === 'hub' ? 36 : 24),
        fill: (node) => (node.id === 'hub' ? '#E86452' : '#5B8FF9'),
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'bottom',
      },
    },
    edge: { style: { stroke: '#C5CEDB', lineWidth: 2 } },
    layout: { type: 'radial', unitRadius: 120, linkDistance: 100 },
    behaviors: ['zoom-canvas', 'drag-canvas', 'highlight-node', 'highlight-edge'],
  });
  await graph.render();
  return graph;
}
