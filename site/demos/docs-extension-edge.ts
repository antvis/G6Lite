import { Graph, register, type EdgeExtension } from '@antv/g6-lite';
import { buttonStyle } from './demo-panel.ts';

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
    edge: { type: 'docs-weighted-edge', style: { label: (_s, _t, edge) => edge.id ?? '' } },
    behaviors: ['click-select', 'zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 64, maxZoom: 1 },
  });
  const button = document.createElement('button');
  button.type = 'button'; button.textContent = 'Toggle heavy weight';
  button.style.cssText = 'position:absolute;left:12px;top:12px;z-index:20;' + buttonStyle;
  button.addEventListener('click', () => {
    const weight = graph.getEdgeData('heavy')?.data?.weight === 4 ? 1 : 4;
    graph.updateEdgeData('heavy', { weight });
  });
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { button.remove(); destroy(); };
  try { await graph.render(); container.append(button); return graph; }
  catch (error) { graph.destroy(); throw error; }
}
