import { Graph, type ElementState } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0, states: ['selected'] }, { id: 'B', x: 220, y: 0 }],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }],
    },
    node: {
      style: { size: 34, label: (node) => node.id, labelOffsetY: 10 },
      stateStyles: {
        selected: { stroke: '#6D28D9', strokeWidth: 3 },
        review: { fill: '#F59E0B' },
        highlight: { fill: '#00A876', stroke: '#005C41', strokeWidth: 2 },
      },
    },
    behaviors: [],
    autoFit: { padding: 60, maxZoom: 1 },
  });
  // #region states
  const toggle = (state: ElementState) => {
    const enabled = graph.getItemStates('A').includes(state);
    graph.setItemState('A', state, !enabled);
  };
  const replace = () => graph.setElementStates('A', ['highlight']);
  const clear = () => graph.clearItemStates('A');
  // #endregion states
  const controls = document.createElement('div');
  controls.style.cssText = 'position:absolute;left:12px;top:12px;right:150px;display:flex;flex-wrap:wrap;gap:6px;z-index:20;';
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.6 system-ui;pointer-events:none;z-index:20;';
  const update = () => {
    status.textContent = `A: [${graph.getItemStates('A').join(', ')}] | B: [${graph.getItemStates('B').join(', ')}]`;
  };
  const actions: Array<[string, () => void]> = [
    ['Toggle selected', () => toggle('selected')],
    ['Toggle review', () => toggle('review')],
    ['Replace with highlight', replace],
    ['Clear A', clear],
  ];
  const buttons = actions.map(([label, action]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.style.cssText = 'padding:5px 10px;border:1px solid #cbd5e1;border-radius:6px;background:white;color:#334155;font:12px system-ui;cursor:pointer;';
    button.onclick = () => { action(); update(); };
    controls.append(button);
    return button;
  });
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    for (const button of buttons) button.onclick = null;
    controls.remove();
    status.remove();
    destroy();
  };
  try {
    await graph.render();
    update();
    container.append(controls, status);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
