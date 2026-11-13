import { Graph } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0, states: ['selected'] }, { id: 'B', x: 240, y: 0, comboId: 'group' }],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }],
      combos: [{ id: 'group' }],
    },
    node: {
      style: { size: 34, label: (node) => node.id, labelOffsetY: 10 },
      stateStyles: { selected: { stroke: '#6D28D9', strokeWidth: 3 } },
    },
    behaviors: [],
    autoFit: { padding: [90, 60, 100, 60], maxZoom: 1 },
  });
  // #region visibility
  const hide = () => graph.hideItem('A');
  const show = () => graph.showItem('A');
  const hidePair = () => graph.batchSetState([
    { id: 'A', state: 'hidden', value: true },
    { id: 'A-B', state: 'hidden', value: true },
  ]);
  const clear = () => graph.clearItemStates('A');
  const selectAll = () => graph.setElementStates({
    A: ['selected'], 'A-B': ['selected'], group: ['selected'],
  });
  // #endregion visibility
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.5 system-ui;white-space:pre-line;pointer-events:none;z-index:20;';
  const update = () => {
    const states = (id: string) => graph.getItemStates(id).join(', ') || 'none';
    status.textContent = [
      `A: [${states('A')}] | A-B: [${states('A-B')}] | group: [${states('group')}]`,
      `selected nodes: ${graph.findNodesByState('selected').join(', ') || 'none'}`,
      `selected edges: ${graph.findEdgesByState('selected').join(', ') || 'none'} | selected combos: ${graph.findCombosByState('selected').join(', ') || 'none'}`,
    ].join('\n');
  };
  const actions: Array<[string, () => void]> = [
    ['Hide A', hide], ['Show A', show], ['Hide A + edge', hidePair],
    ['Clear A', clear], ['Select node / edge / combo', selectAll],
  ];
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    ui.destroy(); status.remove();
    destroy();
  };
  try {
    await graph.render();
    if (graph.destroyed) return graph;
    for (const [label, action] of actions) {
      ui.addAction(label, () => { action(); update(); });
    }
    container.append(status);
    update();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
