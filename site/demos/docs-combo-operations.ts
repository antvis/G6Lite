import { Graph } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0, comboId: 'base' }, { id: 'B', x: 240, y: 0 }],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }],
      combos: [{ id: 'base' }],
    },
    node: { style: { size: 28, label: (node) => node.id, labelOffsetY: 10 } },
    combo: { style: { padding: 24, label: (combo) => combo.id, collapsedType: 'rect', collapsedSize: [72, 36] } },
    behaviors: [],
    autoFit: { padding: [84, 60, 120, 60], maxZoom: 1 },
  });
  // #region operations
  const create = () => {
    if (!graph.getComboData('temp')) graph.createCombo({ id: 'temp' }, ['B']);
  };
  const move = () => {
    const target = graph.getNodeCombo('B') === 'base' ? 'temp' : 'base';
    if (graph.getComboData(target)) graph.addToCombo('B', target);
  };
  const collapse = () => graph.collapseCombo('temp');
  const expand = () => graph.expandCombo('temp');
  const remove = () => graph.removeCombo('temp');
  // #endregion operations
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.5 system-ui;white-space:pre-line;pointer-events:none;z-index:20;';
  const report = () => {
    const children = graph.getComboChildren('temp');
    status.textContent = [
      `temp exists=${Boolean(graph.getComboData('temp'))} | B membership=${graph.getNodeCombo('B') ?? 'none'}`,
      `temp direct nodes=[${children.nodes.join(', ')}] | collapsed=${graph.getComboData('temp')?.collapsed ?? false}`,
      `B hidden=${graph.getItemStates('B').includes('hidden')} | nodes=${graph.getNodeCount()}, edges=${graph.getEdgeCount()}`,
    ].join('\n');
  };
  const actions: Array<[string, () => void]> = [
    ['Create temp', create], ['Collapse temp', collapse], ['Expand temp', expand],
    ['Move B', move], ['Remove temp', remove],
  ];
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    ui.destroy(); status.remove(); destroy();
  };
  try {
    await graph.render();
    if (graph.destroyed) return graph;
    for (const [label, action] of actions) {
      ui.addAction(label, () => { action(); report(); });
    }
    container.append(status); report(); return graph;
  } catch (error) { graph.destroy(); throw error; }
}
