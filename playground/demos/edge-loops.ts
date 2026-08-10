/**
 * Demo: Self-loop edges - single / nested multiple
 */
import { Graph } from '../../src/index.ts';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFitOnResize: true,
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
    node: { type: 'circle', style: { fill: '#5B8FF9', size: 24 } },
    edge: {
      type: 'line',
      style: { stroke: '#99ADD1', lineWidth: 2 },
    },
    theme: 'light',
  });

  await graph.render();
  return { destroy: () => graph.destroy() };
}
