import { Graph } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

const BASE_DATA = {
  nodes: [
    { id: 'center-a', x: 0, y: 0, data: { label: '中心 A' } },
    { id: 'center-b', x: 140, y: 0, data: { label: '中心 B' } },
  ],
  edges: [{ id: 'center-edge', source: 'center-a', target: 'center-b' }],
};

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: BASE_DATA,
    node: {
      style: {
        size: 30,
        fill: '#1677ff',
        label: (node) => String(node.data?.label),
        labelPlacement: 'bottom',
      },
    },
    edge: { style: { stroke: '#94a3b8', lineWidth: 2 } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
  });
  await graph.render();

  const ui = createDemoPanel(container, '先完整替换，再新增远处节点；fitView() 应包含全部当前节点。');
  const render = (action: string) => {
    const camera = graph.getCamera();
    ui.setStatus(
      `${action}\n节点数: ${graph.getNodeCount()}\nzoom: ${camera.zoom.toFixed(3)}\n远处节点: ${graph.hasNode('far-node') ? '存在' : '不存在'}`,
    );
  };
  ui.addAction('1. setData 重置', async () => {
    await graph.setData(BASE_DATA, { fitView: { padding: 48, maxZoom: 2 } });
    render('已完成完整替换');
  });
  ui.addAction('2. 远处新增节点', () => {
    if (!graph.hasNode('far-node')) {
      graph.addNodes([{ id: 'far-node', x: 1100, y: 500, data: { label: '远处增量节点' } }]);
    }
    render('已调用 addNodes()');
  });
  ui.addAction('3. 适配全部节点', () => {
    graph.fitView({ padding: 64, maxZoom: 2 });
    render('已调用 fitView()；全部节点同时可见即 PASS');
  });
  ui.addAction('删除远处节点', () => {
    graph.removeNode('far-node');
    graph.fitView({ padding: 64, maxZoom: 2 });
    render('已删除远处节点并重新 fit');
  });
  render('请按 1 → 2 → 3 操作');

  return { destroy: () => { graph.destroy(); ui.destroy(); } };
}
