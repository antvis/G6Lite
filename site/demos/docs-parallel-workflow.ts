import { Graph } from '@antv/g6-lite';
import { buttonStyle } from './demo-panel.ts';

export async function run(container: HTMLElement) {
  let enabled = true;
  let offset = 48;
  let includeReverse = true;
  const options = () => ({ enabled, offset, includeReverse, maxOffset: 100 });
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'A', x: 0, y: 0 }, { id: 'B', x: 260, y: 0 },
        { id: 'C', x: 0, y: 150 }, { id: 'D', x: 260, y: 150 },
      ],
      edges: [
        { id: 'ab1', source: 'A', target: 'B' },
        { id: 'ab2', source: 'A', target: 'B' },
        { id: 'ab3', source: 'A', target: 'B' },
        { id: 'cd', source: 'C', target: 'D' },
        { id: 'dc', source: 'D', target: 'C' },
      ],
    },
    node: { style: { size: 26, label: (node) => node.id, labelPlacement: 'bottom' } },
    // #region separation
    edge: {
      type: 'line',
      parallelEdges: options(),
      style: {
        endArrow: true, lineWidth: 2,
        stroke: (_source, _target, edge) => edge.source === 'D' ? '#f6903d' : '#1783ff',
      },
    },
    // #endregion separation
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node'],
    autoFit: { padding: [90, 64, 64, 64], maxZoom: 1 },
  });
  const controls = document.createElement('div');
  controls.style.cssText = 'position:absolute;left:12px;top:12px;right:60px;z-index:20;display:flex;flex-wrap:wrap;gap:6px;';
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:10px;background:#fff;color:#334155;padding:4px 8px;font:12px system-ui;pointer-events:none;';
  const update = () => {
    // #region update
    graph.updateOptions({ edge: { parallelEdges: options() } });
    // #endregion update
    status.textContent = `enabled: ${enabled} · offset: ${offset} · includeReverse: ${includeReverse} · A→B: ${graph.getEdges().filter((edge) => edge.source === 'A').length}`;
  };
  const actions: Array<[string, () => void]> = [
    ['Toggle separation', () => { enabled = !enabled; }],
    ['Spacing 24 / 64', () => { offset = offset === 24 ? 64 : 24; }],
    ['Toggle reverse group', () => { includeReverse = !includeReverse; }],
    // #region mutation
    ['Add ab4', () => { if (!graph.getEdgeData('ab4')) graph.addEdge({ id: 'ab4', source: 'A', target: 'B' }); }],
    ['Remove ab4', () => { graph.removeEdge('ab4'); }],
    // #endregion mutation
  ];
  for (const [label, action] of actions) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.style.cssText = buttonStyle;
    button.onclick = () => { action(); update(); };
    controls.append(button);
  }
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    for (const button of controls.querySelectorAll('button')) button.onclick = null;
    controls.remove(); status.remove(); destroy();
  };
  try {
    await graph.render();
    if (graph.destroyed) return graph;
    container.append(controls, status);
    update();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
