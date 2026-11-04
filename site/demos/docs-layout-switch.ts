import { Graph, type LayoutConfig } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const layouts: Record<string, LayoutConfig> = {
    grid: { type: 'grid', rows: 2, cols: 3, width: 360, height: 160 },
    circular: { type: 'circular', radius: 100 },
    dagre: { type: 'dagre', rankdir: 'LR', nodesep: 32, ranksep: 64 },
    force: { type: 'force', worker: false, linkDistance: 100, maxIteration: 60 },
  };
  const graph = new Graph({
    container,
    data: {
      nodes: ['A', 'B', 'C', 'D', 'E', 'F'].map((id) => ({ id })),
      edges: [
        { source: 'A', target: 'B' }, { source: 'A', target: 'C' },
        { source: 'B', target: 'D' }, { source: 'C', target: 'E' },
        { source: 'D', target: 'F' }, { source: 'E', target: 'F' },
      ],
    },
    layout: layouts.grid,
    node: { style: { size: 28, label: (node) => node.id, labelOffsetY: 8 } },
    behaviors: [],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  const controls = document.createElement('div');
  controls.style.cssText = 'position:absolute;left:12px;bottom:12px;z-index:20;background:white;color:#334155;padding:6px 10px;border-radius:6px;font:12px system-ui;';
  const select = document.createElement('select');
  select.setAttribute('aria-label', 'Layout');
  for (const name of Object.keys(layouts)) select.add(new Option(name, name));
  const status = document.createElement('span');
  status.setAttribute('role', 'status');
  status.textContent = ' grid ready';
  let generation = 0;
  select.addEventListener('change', async () => {
    const current = ++generation;
    status.textContent = ' running';
    graph.setLayout(layouts[select.value]);
    try {
      await graph.layout();
      if (current !== generation || graph.destroyed) return;
      graph.fitView({ padding: 56, maxZoom: 1 });
      status.textContent = ` ${select.value} ready`;
    } catch {
      if (current === generation && !graph.destroyed) status.textContent = ' layout failed';
    }
  });
  controls.append('Layout ', select, status);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { generation++; controls.remove(); destroy(); };
  try {
    await graph.render();
    container.append(controls);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
