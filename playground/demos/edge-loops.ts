/**
 * Demo: Self-loop edges - single / nested multiple
 */
import { Graph } from '../../src/index.ts';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: 'a', name: 'Single', x: 150, y: 180 },
        { id: 'b', name: '3 nested', x: 400, y: 180 },
        { id: 'c', name: '5 nested', x: 650, y: 180 },
      ],
      edges: [
        { source: 'a', target: 'a' },
        { source: 'b', target: 'b' },
        { source: 'b', target: 'b' },
        { source: 'b', target: 'b' },
        { source: 'c', target: 'c' },
        { source: 'c', target: 'c' },
        { source: 'c', target: 'c' },
        { source: 'c', target: 'c' },
        { source: 'c', target: 'c' },
      ],
    },
    node: {
      type: 'circle',
      style: {
        fill: '#5B8FF9',
        size: 36,
        label: (node) => node.name ?? node.id,
        labelPlacement: 'bottom',
      },
    },
    edge: {
      type: 'line',
      style: { stroke: '#99ADD1', lineWidth: 2 },
    },
    theme: 'light',
  });

  await graph.render();
  return {
    fitView: () => graph.fitView(),
    destroy: () => graph.destroy(),
  };
}
