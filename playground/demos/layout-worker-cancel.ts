import { Graph, type GraphData } from '../../src/index.ts';
import { buttonStyle, createDemoPanel } from './demo-panel.ts';

function createData(): GraphData {
  const nodes = Array.from({ length: 240 }, (_, index) => ({ id: String(index) }));
  const edges = Array.from({ length: 480 }, (_, index) => ({
    id: `e-${index}`,
    source: String(index % nodes.length),
    target: String((index * 17 + 11) % nodes.length),
  })).filter((edge) => edge.source !== edge.target);
  return { nodes, edges };
}

const button = (action: string, label: string) =>
  `<button data-action="${action}" style="${buttonStyle}">${label}</button>`;

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFitOnResize: true,
    container,
    data: createData(),
    layout: { type: 'grid', rows: 15, cols: 16 },
    node: { style: { size: 7 } },
    edge: { style: { stroke: '#cbd5e1', opacity: 0.45 } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
  });
  await graph.render();
  graph.fitView({ padding: 40, maxZoom: 1.2 });

  const ui = createDemoPanel(
    container,
    'Worker 布局与取消',
    '运行 Worker ForceAtlas2，或在启动后立即取消并切换到 Grid，验证竞态保护。',
    [button('worker', 'Worker ForceAtlas2'), button('cancel', '启动后取消'), button('grid', '恢复 Grid')].join(''),
  );

  let generation = 0;
  const runLayout = async (config: Record<string, unknown>, label: string) => {
    const current = ++generation;
    graph.setLayout(config as { type: string });
    ui.setStatus(`${label}: running…`);
    await graph.layout();
    if (current !== generation) return;
    graph.fitView({ padding: 40, maxZoom: 1.2 });
    ui.setStatus(`${label}: complete`);
  };

  ui.controls.addEventListener('click', (event) => {
    const action = (event.target as HTMLElement).dataset.action;
    if (action === 'worker') {
      void runLayout({ type: 'force-atlas2', worker: true, maxIteration: 80, barnesHut: true, prune: false }, 'worker');
    } else if (action === 'cancel') {
      const pending = runLayout({ type: 'force-atlas2', worker: true, maxIteration: 200, barnesHut: true, prune: false }, 'cancel test');
      window.setTimeout(() => {
        generation++;
        graph.cancelLayout();
        void runLayout({ type: 'grid', rows: 15, cols: 16 }, 'cancelled → grid');
      }, 20);
      void pending;
    } else if (action === 'grid') {
      graph.cancelLayout();
      void runLayout({ type: 'grid', rows: 15, cols: 16 }, 'grid');
    }
  });

  ui.setStatus('grid ready');
  return { destroy: () => { generation++; graph.cancelLayout(); graph.destroy(); ui.panel.remove(); } };
}
