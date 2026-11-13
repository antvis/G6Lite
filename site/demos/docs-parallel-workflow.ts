import { Graph, type EdgeConfig } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: HTMLElement) {
  // #region separation
  const selfLoop = { id: 'bb', source: 'B', target: 'B' };
  const parallelEdges = { enabled: true, offset: 48, includeReverse: true, maxOffset: 100 };
  const edge: EdgeConfig = {
    type: 'line',
    parallelEdges,
    style: {
      endArrow: true,
      lineWidth: 2,
      stroke: (_source, _target, edge) => {
        if (edge.source === edge.target) return '#7c3aed';
        return edge.source === 'D' ? '#f6903d' : '#1783ff';
      },
    },
  };
  // #endregion separation
  let { enabled, offset, includeReverse } = parallelEdges;
  const options = () => ({ ...parallelEdges, enabled, offset, includeReverse });
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
        selfLoop,
        { id: 'cd', source: 'C', target: 'D' },
        { id: 'dc', source: 'D', target: 'C' },
      ],
    },
    node: { style: { size: 26, label: (node) => node.id, labelPlacement: 'bottom' } },
    edge,
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node'],
    autoFit: { padding: [90, 64, 64, 64], maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:10px;background:#fff;color:#334155;padding:4px 8px;font:12px system-ui;pointer-events:none;';
  const applySeparationOptions = () => {
    // #region update
    graph.updateOptions({ edge: { parallelEdges: options() } });
    // #endregion update
  };
  const updateStatus = () => {
    status.textContent = `enabled: ${enabled} · offset: ${offset} · includeReverse: ${includeReverse} · A→B: ${graph.getEdges().filter((edge) => edge.source === 'A').length}`;
  };
  const actions: Array<[string, () => void]> = [
    ['Toggle separation', () => {
      enabled = !enabled;
      applySeparationOptions();
    }],
    ['Spacing 24 / 64', () => {
      offset = offset === 24 ? 64 : 24;
      applySeparationOptions();
    }],
    ['Toggle reverse group', () => {
      includeReverse = !includeReverse;
      applySeparationOptions();
    }],
    // #region mutation
    ['Add ab4', () => { if (!graph.getEdgeData('ab4')) graph.addEdge({ id: 'ab4', source: 'A', target: 'B' }); }],
    ['Remove ab4', () => { graph.removeEdge('ab4'); }],
    // #endregion mutation
  ];
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    ui.destroy(); status.remove(); destroy();
  };
  try {
    await graph.render();
    if (graph.destroyed) return graph;
    for (const [label, action] of actions) {
      ui.addAction(label, () => { action(); updateStatus(); });
    }
    container.append(status);
    updateStatus();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
