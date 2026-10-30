/**
 * Demo: listen to click, drag, and selection events.
 */
import { Graph } from '../../src/index.ts';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: 'a', data: { label: 'A' }, x: 140, y: 180 },
        { id: 'b', data: { label: 'B' }, x: 320, y: 100 },
        { id: 'c', data: { label: 'C' }, x: 320, y: 260 },
        { id: 'd', data: { label: 'D' }, x: 500, y: 180 },
      ],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'a', target: 'c' },
        { source: 'b', target: 'd' },
        { source: 'c', target: 'd' },
      ],
    },
    node: {
      style: {
        size: 36,
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'center',
        labelColor: '#fff',
      },
    },
    behaviors: ['zoom-canvas', 'drag-canvas', 'click-select', 'drag-node'],
  });
  await graph.render();

  const ui = createDemoPanel(container, '事件', '点击或拖拽节点，查看最近的公开事件。', '');
  const lines: string[] = ['点击或拖拽节点'];
  const push = (line: string) => {
    lines.unshift(line);
    ui.setStatus(lines.slice(0, 4).join('\n'));
  };
  graph.on('node:click', ({ nodeId }) => push(`node:click ${nodeId}`));
  graph.on('node:dragend', ({ nodeId }) => push(`node:dragend ${nodeId}`));
  graph.on('node:selectchange', ({ nodeId, selected }) => push(`node:selectchange ${nodeId} ${selected}`));
  ui.setStatus(lines[0]);

  return {
    fitView: () => graph.fitView(),
    destroy() {
      graph.destroy();
      ui.panel.remove();
    },
  };
}
