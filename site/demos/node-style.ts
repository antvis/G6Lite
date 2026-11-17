/**
 * Demo: 节点样式 — 按 data 用函数设置 fill、size
 */
import { Graph } from '@antv/g6-lite';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: '0', name: 'A', x: 0, y: 96, data: { cluster: 'a', role: 'lead' } },
        { id: '1', name: 'B', x: 124, y: 26, data: { cluster: 'b' } },
        { id: '2', name: 'C', x: 190, y: 160, data: { cluster: 'a' } },
        { id: '3', name: 'D', x: 254, y: 26, data: { cluster: 'b' } },
        { id: '4', name: 'E', x: 380, y: 96, data: { cluster: 'a' } },
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
        size: (d) => (d.data?.role === 'lead' ? 36 : 24),
        label: (d) => d.name ?? d.id,
        labelPlacement: 'bottom',
        labelFontSize: 13,
      },
    },
    label: { scaleWithZoom: false },
    edge: { type: 'line', style: { lineWidth: 3, stroke: '#8b9ec2' } },
    behaviors: ['zoom-canvas', 'drag-canvas', 'highlight-node', 'highlight-edge'],
    theme: 'light',
  });
  await graph.render();
  return graph;
}
