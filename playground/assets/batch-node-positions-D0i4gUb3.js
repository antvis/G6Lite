const n=`import { Graph } from '../../src/index.ts';
import type { NodePositionUpdate } from '../../src/index.ts';
import { buttonStyle, createDemoPanel } from './demo-panel.ts';

const ORIGINAL: NodePositionUpdate[] = [
  { id: 'a', x: 360, y: 220 },
  { id: 'b', x: 520, y: 220 },
  { id: 'c', x: 680, y: 220 },
];
const SERVER: NodePositionUpdate[] = [
  { id: 'a', x: 390, y: 160 },
  { id: 'b', x: 520, y: 330 },
  { id: 'c', x: 650, y: 160 },
];

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: ORIGINAL.map((node) => ({ ...node, data: { label: node.id.toUpperCase(), stable: true } })),
      edges: [
        { id: 'ab', source: 'a', target: 'b' },
        { id: 'bc', source: 'b', target: 'c' },
      ],
    },
    node: {
      style: {
        size: 32,
        fill: '#1677ff',
        label: (node) => String(node.data?.label),
        labelPlacement: 'center',
        labelColor: '#fff',
      },
    },
    edge: { style: { stroke: '#64748b', lineWidth: 2 } },
  });
  await graph.render();

  const ui = createDemoPanel(
    container,
    '批量更新节点坐标',
    '通过 updateNodePositions() 同步相同 ID 节点的新坐标，节点与边应一起移动。',
    \`<button data-action="server" style="\${buttonStyle}">模拟服务端坐标</button>
     <button data-action="undo" style="\${buttonStyle}">撤销坐标</button>\`,
  );
  const render = (action: string) => {
    const lines = ['a', 'b', 'c'].map((id) => {
      const position = graph.getNodePosition(id)!;
      return \`\${id}: (\${position.x.toFixed(0)}, \${position.y.toFixed(0)})\`;
    });
    ui.setStatus(\`\${action}\\n\${lines.join('\\n')}\\ndata.stable: \${String(graph.getNodeData('a')?.data?.stable)}\`);
  };
  ui.controls.querySelector('[data-action="server"]')!.addEventListener('click', () => {
    graph.updateNodePositions(SERVER);
    render('已批量应用服务端坐标');
  });
  ui.controls.querySelector('[data-action="undo"]')!.addEventListener('click', () => {
    graph.updateNodePositions(ORIGINAL);
    render('已批量恢复原坐标');
  });
  render('等待操作');

  return { destroy: () => { graph.destroy(); ui.panel.remove(); } };
}
`;export{n as default};
