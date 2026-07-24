const e=`import { Graph } from '../../src/index.ts';
import { buttonStyle, createDemoPanel } from './demo-panel.ts';

const CLOSE_DATA = {
  nodes: [
    { id: 'close-a', x: 0, y: 0, data: { label: '近 A' } },
    { id: 'close-b', x: 20, y: 20, data: { label: '近 B' } },
  ],
  edges: [{ id: 'close-edge', source: 'close-a', target: 'close-b' }],
};
const WIDE_DATA = {
  nodes: [
    { id: 'wide-a', x: -500, y: -240, data: { label: '远 A' } },
    { id: 'wide-b', x: 500, y: 240, data: { label: '远 B' } },
  ],
  edges: [{ id: 'wide-edge', source: 'wide-a', target: 'wide-b' }],
};

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    container,
    data: WIDE_DATA,
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

  const ui = createDemoPanel(
    container,
    'setData 视口策略',
    '分别验证 maxZoom 上限和 fitView:false 保留 camera。',
    \`<button data-action="limited" style="\${buttonStyle}">maxZoom = 1.2</button>
     <button data-action="preserve" style="\${buttonStyle}">fitView = false</button>
     <button data-action="race" style="\${buttonStyle}">连续替换数据</button>\`,
  );
  let requestedVersion = 0;
  let completedVersion = 0;
  const render = (strategy: string) => {
    const zoom = graph.getZoom();
    ui.setStatus(
      \`策略: \${strategy}\\n请求版本: \${requestedVersion}\\n完成版本: \${completedVersion}\\nzoom: \${zoom.toFixed(3)}\\n\${strategy.includes('maxZoom') ? \`判定: \${zoom <= 1.200001 ? 'PASS' : 'FAIL'}\` : ''}\`,
    );
  };
  ui.controls.querySelector('[data-action="limited"]')!.addEventListener('click', async () => {
    const version = ++requestedVersion;
    await graph.setData(CLOSE_DATA, { fitView: { padding: 24, maxZoom: 1.2 } });
    completedVersion = version;
    render('maxZoom 1.2');
  });
  ui.controls.querySelector('[data-action="preserve"]')!.addEventListener('click', async () => {
    graph.zoomTo(0.7);
    const before = graph.getZoom();
    const version = ++requestedVersion;
    await graph.setData(WIDE_DATA, { fitView: false });
    completedVersion = version;
    render(\`fitView false；之前 \${before.toFixed(3)}\`);
  });
  ui.controls.querySelector('[data-action="race"]')!.addEventListener('click', () => {
    const first = ++requestedVersion;
    void graph.setData(CLOSE_DATA, { fitView: { maxZoom: 1.2 } }).then(() => {
      if (first === requestedVersion) completedVersion = first;
      render('连续替换：第一份');
    });
    const second = ++requestedVersion;
    void graph.setData(WIDE_DATA, { fitView: { padding: 32, maxZoom: 1.2 } }).then(() => {
      if (second === requestedVersion) completedVersion = second;
      render('连续替换：最终应为 wide 数据');
    });
  });
  render('等待操作');

  return { destroy: () => { graph.destroy(); ui.panel.remove(); } };
}
`;export{e as default};
