import { Graph, type BehaviorOption } from '@antv/g6-lite';

export const configurations = {
  // #region demo-drag-canvas
  'drag-canvas': [{ type: 'drag-canvas', ignoreModifierKeys: true }],
  // #endregion demo-drag-canvas
  // #region demo-click-select
  'click-select': [{ type: 'click-select', multiple: true, trigger: 'shift' }],
  // #endregion demo-click-select
  // #region demo-brush-select
  'brush-select': ['drag-canvas', { type: 'brush-select', key: 'shift' }],
  // #endregion demo-brush-select
  // #region demo-lasso-select
  'lasso-select': ['drag-canvas', { type: 'lasso-select', key: 'ctrl' }],
  // #endregion demo-lasso-select
  // #region demo-highlight-node
  'highlight-node': ['highlight-node'],
  // #endregion demo-highlight-node
  // #region demo-highlight-edge
  'highlight-edge': ['highlight-edge'],
  // #endregion demo-highlight-edge
} satisfies Record<string, BehaviorOption[]>;

export async function run(container: HTMLElement, behaviors: BehaviorOption[]) {
  // #region render-graph
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'A', x: 0, y: 0 },
        { id: 'B', x: 120, y: -65 },
        { id: 'C', x: 120, y: 65 },
        { id: 'D', x: 240, y: 0 },
        { id: 'E', x: 360, y: 0 },
      ],
      edges: [
        { id: 'A-B', source: 'A', target: 'B' },
        { id: 'A-C', source: 'A', target: 'C' },
        { id: 'B-D', source: 'B', target: 'D' },
        { id: 'C-D', source: 'C', target: 'D' },
        { id: 'D-E', source: 'D', target: 'E' },
      ],
    },
    node: {
      style: { size: 30, label: (node) => node.id, labelOffsetY: 8 },
      stateStyles: { selected: { fill: '#8050d2', haloWidth: 10 } },
    },
    edge: {
      style: { lineWidth: 2, hitAreaWidth: 14, endArrow: false },
      stateStyles: { selected: { stroke: '#8050d2', lineWidth: 4 } },
    },
    behaviors,
    autoFit: { padding: 48, maxZoom: 1 },
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
  // #endregion render-graph
}
