const n=`import { Graph } from '../../src/index.ts';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'a', x: 360, y: 250, data: { label: '点击我' } },
        { id: 'b', x: 500, y: 250, data: { label: '轻移我' } },
        { id: 'c', x: 640, y: 250, data: { label: '拖动我' } },
      ],
      edges: [],
    },
    node: {
      style: {
        size: 36,
        fill: '#1677ff',
        label: (node) => String(node.data?.label),
        labelPlacement: 'bottom',
      },
    },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node'],
  });
  await graph.render();

  const ui = createDemoPanel(
    container,
    '节点拖拽阈值',
    '普通点击不应触发拖拽事件；移动超过 3px 后才进入拖拽。',
    '',
  );
  const counts = { dragstart: 0, drag: 0, dragend: 0 };
  let latest = '等待操作';
  const render = () => ui.setStatus(
    \`dragstart: \${counts.dragstart}\\ndrag: \${counts.drag}\\ndragend: \${counts.dragend}\\n最近事件: \${latest}\\n判定: 单击后 dragend 保持不变即 PASS\`,
  );
  graph.on('node:dragstart', ({ nodeId }: { nodeId: string }) => { counts.dragstart++; latest = \`\${nodeId}:dragstart\`; render(); });
  graph.on('node:drag', ({ nodeId }: { nodeId: string }) => { counts.drag++; latest = \`\${nodeId}:drag\`; render(); });
  graph.on('node:dragend', ({ nodeId }: { nodeId: string }) => { counts.dragend++; latest = \`\${nodeId}:dragend\`; render(); });
  render();

  return { destroy: () => { graph.destroy(); ui.panel.remove(); } };
}
`;export{n as default};
