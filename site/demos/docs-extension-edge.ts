import { Graph, register, type EdgeExtension } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

// #region descriptor
const weightedEdge: EdgeExtension = {
  base: 'arc',
  style: { curvature: 0.2, endArrow: true, hitAreaWidth: 14 },
  getStyle(_source, _target, edge) {
    const weight = Number(edge.data?.weight ?? 1);
    return { stroke: weight > 2 ? '#cf1322' : '#5366ad', lineWidth: weight + 1 };
  },
  stateStyles: { selected: { stroke: '#873bf4', lineWidth: 4 } },
};
register('edge', 'docs-weighted-edge', weightedEdge);
// #endregion descriptor

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 190, y: 80 }, { id: 'C', x: 380, y: 0 }],
      edges: [
        { id: 'light', source: 'A', target: 'B', data: { weight: 1 } },
        { id: 'heavy', source: 'B', target: 'C', data: { weight: 4 } },
      ],
    },
    node: { style: { size: 28, label: (node) => node.id } },
    // #region edge-activation
    edge: { type: 'docs-weighted-edge', style: { label: (_s, _t, edge) => edge.id ?? '' } },
    // #endregion edge-activation
    behaviors: ['click-select', 'zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 64, maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { ui.destroy(); destroy(); };
  try {
    await graph.render();
    // #region edge-weight-update
    ui.addAction('Toggle heavy weight', () => {
      const weight = graph.getEdgeData('heavy')?.data?.weight === 4 ? 1 : 4;
      graph.updateEdgeData('heavy', { weight });
    });
    // #endregion edge-weight-update
    return graph;
  }
  catch (error) { graph.destroy(); throw error; }
}
