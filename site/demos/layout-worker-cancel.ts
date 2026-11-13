import { Graph, type GraphData } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

function createData(): GraphData {
  const nodes = Array.from({ length: 240 }, (_, index) => ({ id: String(index) }));
  const edges = Array.from({ length: 480 }, (_, index) => ({
    id: `e-${index}`,
    source: String(index % nodes.length),
    target: String((index * 17 + 11) % nodes.length),
  })).filter((edge) => edge.source !== edge.target);
  return { nodes, edges };
}

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: createData(),
    layout: { type: 'grid', rows: 15, cols: 16 },
    node: { style: { size: 7 } },
    edge: { style: { stroke: '#cbd5e1', opacity: 0.45 } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
  });
  await graph.render();
  graph.fitView({ padding: 40 });

  const ui = createDemoPanel(container);

  let generation = 0;
  const runLayout = async (config: Record<string, unknown>, label: string) => {
    const current = ++generation;
    graph.setLayout(config as { type: string });
    ui.setStatus(`${label}: running…`);
    await graph.layout();
    if (current !== generation) return;
    graph.fitView({ padding: 40 });
    ui.setStatus(`${label}: complete`);
  };

  let cancelTimer: number | undefined;
  ui.addAction('Worker ForceAtlas2', () => {
    clearTimeout(cancelTimer);
    void runLayout({ type: 'force-atlas2', worker: true, maxIteration: 80, barnesHut: true, prune: false }, 'worker');
  });
  ui.addAction('启动后取消', () => {
    clearTimeout(cancelTimer);
    void runLayout({ type: 'force-atlas2', worker: true, maxIteration: 200, barnesHut: true, prune: false }, 'cancel test');
    cancelTimer = window.setTimeout(() => {
      graph.cancelLayout();
      void runLayout({ type: 'grid', rows: 15, cols: 16 }, 'cancelled → grid');
    }, 20);
  });
  ui.addAction('恢复 Grid', () => {
    clearTimeout(cancelTimer);
    graph.cancelLayout();
    void runLayout({ type: 'grid', rows: 15, cols: 16 }, 'grid');
  });

  ui.setStatus('grid ready');
  return { destroy: () => { generation++; clearTimeout(cancelTimer); graph.cancelLayout(); graph.destroy(); ui.destroy(); } };
}
