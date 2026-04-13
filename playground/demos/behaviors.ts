/**
 * Demo: 交互 — 缩放、拖拽、节点/边高亮
 */
import { Graph } from '../../src/index.ts';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: '0', data: { cluster: 'a' } },
        { id: '1', data: { cluster: 'b' } },
        { id: '2', data: { cluster: 'a' } },
        { id: '3', data: { cluster: 'b' } },
        { id: '4', data: { cluster: 'a' } },
      ],
      edges: [
        { source: '0', target: '1' },
        { source: '0', target: '2' },
        { source: '1', target: '3' },
        { source: '2', target: '4' },
        { source: '3', target: '4' },
      ],
    },
    node: {
      type: 'circle',
      style: {
        fill: (d) => (d.data?.cluster === 'a' ? '#5B8FF9' : '#61DDAA'),
        size: 12,
      },
    },
    edge: { type: 'line', style: { lineWidth: 2 } },
    layout: { type: 'circular', radius: 150 },
    behaviors: ['zoom-canvas', 'drag-canvas', 'highlight-node', 'highlight-edge'],
    theme: 'light',
  });
  await graph.render();
  return graph;
}
