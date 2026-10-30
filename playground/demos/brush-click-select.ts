import { Graph } from '../../src/index.ts';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: string | HTMLElement) {
  const nodes = Array.from({ length: 12 }, (_, index) => ({
    id: `n-${index}`,
    x: 360 + (index % 4) * 100,
    y: 180 + Math.floor(index / 4) * 100,
    data: { label: String(index + 1) },
  }));
  const graph = new Graph({
    autoFit: true,
    container,
    data: { nodes, edges: [] },
    node: {
      style: {
        size: 28,
        fill: '#60a5fa',
        label: (node) => String(node.data?.label),
        labelPlacement: 'center',
        labelColor: '#fff',
      },
      stateStyles: { selected: { fill: '#f97316', haloWidth: 5 } },
    },
    behaviors: [
      'zoom-canvas',
      'drag-canvas',
      { type: 'brush-select', key: 'shift' },
      { type: 'click-select', multiple: true, trigger: 'shift' },
    ],
  });
  await graph.render();

  const ui = createDemoPanel(
    container,
    '框选与点击选择',
    '按住 Shift 拖拽框选。松手后结果必须保留；独立点击空白才清空。',
    '',
  );
  let latest = '等待 Shift 框选';
  const render = () => {
    const selected = graph.findNodesByState('selected');
    ui.setStatus(`已选择: ${selected.join(', ') || '无'}\n最近事件: ${latest}\n框选松手后仍有选择即 PASS`);
  };
  graph.on('brush:end', ({ nodeIds }: { nodeIds: string[] }) => { latest = `brush:end (${nodeIds.length})`; requestAnimationFrame(render); });
  graph.on('node:selectchange', ({ nodeId }: { nodeId: string }) => { latest = `node:selectchange ${nodeId}`; render(); });
  graph.on('selection:clear', () => { latest = 'selection:clear'; render(); });
  render();

  return { destroy: () => { graph.destroy(); ui.panel.remove(); } };
}
