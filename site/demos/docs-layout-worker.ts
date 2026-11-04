import { Graph, type LayoutConfig } from '@antv/g6-lite';

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
  const controls = document.createElement('div');
  controls.style.cssText = 'position:absolute;left:12px;bottom:12px;z-index:20;background:white;color:#334155;padding:6px 10px;border-radius:6px;font:12px system-ui;display:flex;gap:8px;flex-wrap:wrap;';
  const status = document.createElement('span');
  status.setAttribute('role', 'status');
  status.textContent = 'grid ready';
  let generation = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const arrange = async (config: LayoutConfig, name: string) => {
    const current = ++generation;
    status.textContent = `${name} running`;
    graph.setLayout(config);
    try {
      await graph.layout();
      if (current !== generation || graph.destroyed) return;
      graph.fitView({ padding: 48, maxZoom: 1 });
      status.textContent = `${name} ready`;
    } catch {
      if (current === generation && !graph.destroyed) status.textContent = 'layout failed';
    }
  };
  const force = (maxIteration: number): LayoutConfig => ({
    type: 'force-atlas2', worker: true, maxIteration, barnesHut: true, prune: false,
  });
  for (const name of ['Run Worker', 'Start + cancel', 'Grid']) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = name;
    button.addEventListener('click', () => {
      clearTimeout(timer);
      if (name === 'Run Worker') void arrange(force(80), 'worker requested');
      if (name === 'Grid') {
        graph.cancelLayout();
        void arrange(grid, 'grid');
      }
      if (name === 'Start + cancel') {
        void arrange(force(2000), 'worker requested');
        timer = setTimeout(() => {
          graph.cancelLayout();
          void arrange(grid, 'cancelled → grid');
        }, 20);
      }
    });
    controls.append(button);
  }
  controls.append(status);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { generation++; clearTimeout(timer); controls.remove(); destroy(); };
  try {
    await graph.render();
    container.append(controls);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
