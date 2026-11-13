import { Graph } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: 'base-a', x: 390, y: 250, data: { label: 'A' } },
        { id: 'base-b', x: 530, y: 250, data: { label: 'B' } },
      ],
      edges: [{ id: 'base-edge', source: 'base-a', target: 'base-b' }],
    },
    node: {
      style: {
        size: 28,
        fill: '#1677ff',
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'bottom',
      },
    },
    edge: { style: { stroke: '#94a3b8', lineWidth: 2 } },
    behaviors: [
      'zoom-canvas',
      'drag-canvas',
      { type: 'click-select', multiple: true },
      { type: 'brush-select', key: 'shift' },
    ],
  });
  await graph.render();

  const ui = createDemoPanel(container, '每次通过 addNodes() 新增一个没有边的节点。节点应立即显示并可选择。');
  let count = 0;
  const updateStatus = (lastId = '无') => {
    ui.setStatus(`节点总数: ${graph.getNodeCount()}\n最近新增: ${lastId}\n结果: ${lastId === '无' || graph.hasNode(lastId) ? 'PASS' : 'FAIL'}`);
  };
  ui.addAction('新增孤立节点', () => {
    count++;
    const id = `isolated-${count}`;
    graph.addNodes([
      {
        id,
        x: 350 + ((count - 1) % 4) * 110,
        y: 350 + Math.floor((count - 1) / 4) * 80,
        data: { label: `孤立 ${count}` },
      },
    ]);
    updateStatus(id);
  });
  ui.addAction('适配视口', () => graph.fitView({ padding: 48 }));
  updateStatus();

  return { destroy: () => { graph.destroy(); ui.destroy(); } };
}
