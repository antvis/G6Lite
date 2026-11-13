import { Graph, type LayoutConfig } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: HTMLElement) {
  const grid: LayoutConfig = { type: 'grid', rows: 10, cols: 16, width: 400, height: 200, worker: false };
  const graph = new Graph({
    container,
    data: {
      nodes: Array.from({ length: 160 }, (_, i) => ({ id: String(i) })),
      edges: Array.from({ length: 320 }, (_, i) => ({
        source: String(i % 160), target: String((i * 17 + 11) % 160),
      })).filter((edge) => edge.source !== edge.target),
    },
    layout: grid,
    node: { style: { size: 6 } },
    edge: { style: { endArrow: false, opacity: 0.2 } },
    behaviors: [],
    autoFit: { padding: 48, maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  let generation = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const arrange = async (config: LayoutConfig, name: string) => {
    const current = ++generation;
    ui.setStatus(`${name} running`);
    graph.setLayout(config);
    try {
      await graph.layout();
      if (current !== generation || graph.destroyed) return;
      graph.fitView({ padding: 48, maxZoom: 1 });
      ui.setStatus(`${name} ready`);
    } catch {
      if (current === generation && !graph.destroyed) ui.setStatus('layout failed');
    }
  };
  const force = (maxIteration: number): LayoutConfig => ({
    type: 'force-atlas2', worker: true, maxIteration, barnesHut: true, prune: false,
  });
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { generation++; clearTimeout(timer); ui.destroy(); destroy(); };
  try {
    await graph.render();
    ui.setStatus('grid ready');
    ui.addAction('Run Worker', () => {
      clearTimeout(timer);
      void arrange(force(80), 'worker requested');
    });
    ui.addAction('Start + cancel', () => {
      clearTimeout(timer);
      void arrange(force(2000), 'worker requested');
      timer = setTimeout(() => {
        graph.cancelLayout();
        void arrange(grid, 'cancelled → grid');
      }, 20);
    });
    ui.addAction('Grid', () => {
      clearTimeout(timer);
      graph.cancelLayout();
      void arrange(grid, 'grid');
    });
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
