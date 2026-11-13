import { Graph } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export function runZoomTo(container: HTMLElement) {
  return run(container, 'zoomTo(1.5)', (graph) => {
    // #region zoom-to
    const anchor = graph.getElementPosition('A');
    if (!anchor) return;
    const center = graph.graphToScreen(anchor.x, anchor.y);
    graph.zoomTo(1.5, { center });
    // #endregion zoom-to
  });
}

export function runZoomBy(container: HTMLElement) {
  return run(container, 'zoomBy(1.5)', (graph) => {
    // #region zoom-by
    graph.zoomBy(1.5, { maxZoom: 4 });
    // #endregion zoom-by
  });
}

async function run(container: HTMLElement, label: string, changeZoom: (graph: Graph) => void) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'A', x: -28, y: 12 },
        { id: 'B', x: 0, y: -20 },
        { id: 'C', x: 28, y: 12 },
      ],
      edges: [
        { id: 'A-B', source: 'A', target: 'B' },
        { id: 'B-C', source: 'B', target: 'C' },
        { id: 'A-C', source: 'A', target: 'C' },
      ],
    },
    node: { style: { size: 14, label: (node) => node.id } },
    behaviors: [],
  });

  const panel = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    panel.destroy();
    destroy();
  };

  try {
    await graph.render();
    graph.zoomTo(2);

    const updateStatus = () => panel.setStatus(`zoom = ${graph.getZoom()}`);
    panel.addAction(label, () => {
      changeZoom(graph);
      updateStatus();
    });
    updateStatus();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
