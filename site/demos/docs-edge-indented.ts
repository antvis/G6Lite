import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: ['Root', 'Group', 'Item', 'Other'].map((id) => ({ id })),
      edges: [
        { id: 'root-group', source: 'Root', target: 'Group' },
        { id: 'group-item', source: 'Group', target: 'Item' },
        { id: 'root-other', source: 'Root', target: 'Other' },
      ],
    },
    node: {
      type: 'rect',
      style: { width: 80, height: 28, borderRadius: 5, label: (node) => node.id, labelPlacement: 'center', labelColor: '#fff' },
    },
    // #region routing
    layout: { type: 'indented', direction: 'LR', indent: 160, rowHeight: 70 },
    edge: {
      type: 'polyline',
      style: { router: 'indented', indentTarget: 'left', radius: 10, lineWidth: 2, hitAreaWidth: 12 },
      stateStyles: { selected: { stroke: '#873bf4' } },
    },
    // #endregion routing
    behaviors: ['click-select'],
    autoFit: { padding: 48, maxZoom: 1 },
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
