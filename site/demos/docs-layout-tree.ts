import { Graph, type LayoutConfig } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const layouts: Record<string, LayoutConfig> = {
    mindmap: { type: 'mindmap', direction: 'LR', levelGap: 64, nodeGap: 24, getWidth: () => 32, getHeight: () => 28 },
    indented: { type: 'indented', indent: 72, rowHeight: 36, rootId: 'Root' },
    fishbone: { type: 'fishbone', categoryGap: 180, categoryDistance: 130, itemHStep: 50, getWidth: () => 32 },
  };
  const graph = new Graph({
    container,
    data: {
      nodes: ['Root', 'A', 'B', 'A1', 'A2', 'B1', 'B2'].map((id) => ({ id })),
      edges: [
        { source: 'Root', target: 'A' }, { source: 'Root', target: 'B' },
        { source: 'A', target: 'A1' }, { source: 'A', target: 'A2' },
        { source: 'B', target: 'B1' }, { source: 'B', target: 'B2' },
      ],
    },
    layout: layouts.mindmap,
    node: { style: { size: 24, label: (node) => node.id, labelOffsetY: 6 } },
    label: { hideOnLowZoom: false },
    behaviors: [],
    autoFit: { padding: 48, maxZoom: 1 },
  });
  const controls = document.createElement('div');
  controls.style.cssText = 'position:absolute;left:12px;bottom:12px;z-index:20;background:white;color:#334155;padding:6px 10px;border-radius:6px;font:12px system-ui;';
  const select = document.createElement('select');
  select.setAttribute('aria-label', 'Tree layout');
  for (const name of Object.keys(layouts)) select.add(new Option(name, name));
  const status = document.createElement('span');
  status.setAttribute('role', 'status');
  status.textContent = ' mindmap ready';
  let generation = 0;
  select.addEventListener('change', async () => {
    const current = ++generation;
    graph.setLayout(layouts[select.value]);
    try {
      await graph.layout();
      if (current !== generation || graph.destroyed) return;
      graph.fitView({ padding: 48, maxZoom: 1 });
      status.textContent = ` ${select.value} ready`;
    } catch {
      if (current === generation && !graph.destroyed) status.textContent = ' layout failed';
    }
  });
  controls.append('Tree ', select, status);
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
