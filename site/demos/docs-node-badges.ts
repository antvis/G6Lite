import { Graph, type NodeBadgeItem } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: { nodes: [{ id: 'Orders', x: 120, y: 100 }], edges: [] },
    node: {
      style: { size: 64, fill: '#1783FF', label: (node) => node.id },
      // #region badge-options
      decorations: [{
        renderer: 'builtin-badge',
        placement: 'right',
        attachment: 'boundary',
        anchor: 'start',
        boundaryOverlap: 'half-badge',
        layout: 'stack',
        items: [
          { kind: 'count', value: 12 },
          { kind: 'warning' },
          { kind: 'text', text: 'VIP' },
          { kind: 'lock' },
          { kind: 'favorite' },
        ] satisfies NodeBadgeItem[],
        maxVisible: 3,
        overflow: 'hover-expand',
        overflowData: { kind: 'text', text: '···' },
      }],
      // #endregion badge-options
    },
    autoFit: { padding: 48, maxZoom: 1 },
    behaviors: [],
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
