import { Graph, runLayout } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const data = {
    nodes: ['Input', 'Parse', 'Validate', 'Output'].map((id) => ({ id })),
    edges: [
      { source: 'Input', target: 'Parse' },
      { source: 'Parse', target: 'Validate' },
      { source: 'Validate', target: 'Output' },
    ],
  };
  const result = await runLayout(data, { type: 'dagre', rankdir: 'LR', ranksep: 72 }, { width: 600, height: 300 });
  // No layout option on Graph: display the coordinates already computed above.
  const graph = new Graph({
    container,
    data: { ...data, nodes: result.nodes },
    node: { style: { size: 28, label: (node) => node.id, labelOffsetY: 8 } },
    behaviors: [],
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
