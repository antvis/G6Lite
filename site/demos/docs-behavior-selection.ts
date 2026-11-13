import { Graph, type BehaviorName, type BuiltInBehaviorConfig } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  // #region behavior-options
  const behaviors = [
    { type: 'zoom-canvas', minZoom: 0.5, maxZoom: 2 },
    'drag-node',
    { type: 'click-select', multiple: true, trigger: 'shift' },
    { type: 'brush-select', key: null },
  ] satisfies Array<BehaviorName | BuiltInBehaviorConfig>;
  // #endregion behavior-options
  const graph = new Graph({
    container,
    data: {
      nodes: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((id, i) => ({
        id, x: (i % 4) * 120, y: Math.floor(i / 4) * 100,
      })),
      edges: [{ id: 'A-B', source: 'A', target: 'B' }, { id: 'D-H', source: 'D', target: 'H' }],
    },
    node: {
      style: { size: 30, label: (node) => node.id, labelOffsetY: 8 },
      stateStyles: { selected: { fill: '#873BF4', stroke: '#5B21B6', strokeWidth: 2, haloWidth: 12 } },
    },
    behaviors,
    autoFit: { padding: 60, maxZoom: 1 },
  });
  const status = document.createElement('div');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;z-index:20;background:white;color:#334155;padding:6px 10px;border-radius:6px;font:12px system-ui;';
  status.setAttribute('role', 'status');
  const updateStatus = () => {
    status.textContent = `selected nodes: ${graph.findNodesByState('selected').join(', ') || 'none'}`;
  };
  graph.on('node:selectchange', updateStatus);
  graph.on('selection:clear', updateStatus);
  graph.on('brush:end', updateStatus);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { status.remove(); destroy(); };
  try {
    await graph.render();
    updateStatus();
    container.append(status);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
