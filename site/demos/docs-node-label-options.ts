import { Graph, type NodeConfig } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  // #region node-label
  const node: NodeConfig = {
    style: {
      size: 40,
      label: (item) => String(item.data?.name ?? item.id),
      labelPlacement: 'bottom',
      labelMaxWidth: 120,
      labelBackground: (item) => item.id === 'db' ? '#fff1b8' : '#e6f4ff',
      labelBackgroundPadding: 6,
      labelFontWeight: '600',
    },
  };
  // #endregion node-label
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'api', x: 120, y: 100, data: { name: 'API Server' } },
        { id: 'db', x: 360, y: 100, data: { name: 'Database with a very long name' } },
      ],
      edges: [],
    },
    node,
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
