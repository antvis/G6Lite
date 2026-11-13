import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'Default', x: 0, y: 0 },
        { id: 'Active', x: 140, y: 0, states: ['active'] },
        { id: 'Selected', x: 280, y: 0, states: ['selected'] },
      ],
      edges: [],
    },
    node: {
      style: { size: 40, label: (node) => node.id, labelOffsetY: 22 },
      // #region halo-options
      stateStyles: {
        active: { haloWidth: 8 },
        selected: { haloWidth: 22 },
      },
      // #endregion halo-options
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
