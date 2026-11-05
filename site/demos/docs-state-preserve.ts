import { Graph, type GraphData } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 160, y: 80 }, { id: 'C', x: 320, y: 0 }],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }, { id: 'A-C', source: 'A', target: 'C' }],
    },
    node: {
      style: { size: 32, label: (node) => node.id, labelOffsetY: 10 },
      stateStyles: {
        selected: { stroke: '#6D28D9', strokeWidth: 3 },
        highlight: { fill: '#00A876' },
      },
    },
    edge: {
      style: { hitAreaWidth: 12 },
      stateStyles: {
        selected: { stroke: '#6D28D9', lineWidth: 3 },
        highlight: { stroke: '#00A876', lineWidth: 2 },
      },
    },
    behaviors: [
      { type: 'click-select', multiple: true, trigger: 'shift' },
      { type: 'hover-highlight', degree: 1 },
    ],
    autoFit: { padding: 60, maxZoom: 1 },
  });
  const nextData = (): GraphData => ({
    nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'C', x: 320, y: 0 }, { id: 'D', x: 160, y: 80 }],
    edges: [{ id: 'A-C', source: 'A', target: 'C' }, { id: 'C-D', source: 'C', target: 'D' }],
  });
  // #region preserve-selection
  const reload = async (keepSelected: boolean) => {
    const nodes = new Set(keepSelected ? graph.findNodesByState('selected') : []);
    const edges = new Set(keepSelected ? graph.findEdgesByState('selected') : []);
    const next = nextData();
    await graph.setData({
      ...next,
      nodes: next.nodes.map((node) => ({
        ...node, states: nodes.has(node.id) ? ['selected'] : [],
      })),
      edges: next.edges.map((edge) => ({
        ...edge, states: edge.id && edges.has(edge.id) ? ['selected'] : [],
      })),
    }, { fitView: false });
  };
  // #endregion preserve-selection
  const controls = document.createElement('div');
  controls.style.cssText = 'position:absolute;left:12px;top:12px;display:flex;gap:6px;z-index:20;';
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.6 system-ui;white-space:pre-line;pointer-events:none;z-index:20;';
  let version = 1;
  let disposed = false;
  const update = () => {
    status.textContent = `data v${version} | selected nodes: ${graph.findNodesByState('selected').join(', ') || 'none'}\nselected edges: ${graph.findEdgesByState('selected').join(', ') || 'none'}`;
  };
  const buttons = [false, true].map((keep) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = keep ? 'Keep selected' : 'Reload data';
    button.style.cssText = 'padding:5px 10px;border:1px solid #cbd5e1;border-radius:6px;background:white;color:#334155;font:12px system-ui;cursor:pointer;';
    button.onclick = async () => {
      for (const item of buttons) item.disabled = true;
      try {
        await reload(keep);
        if (!disposed) { version++; update(); }
      } catch {
        if (!disposed) status.textContent = 'Reload failed';
      } finally {
        if (!disposed) for (const item of buttons) item.disabled = false;
      }
    };
    controls.append(button);
    return button;
  });
  const events = ['node:selectchange', 'edge:selectchange', 'selection:clear'] as const;
  for (const event of events) graph.on(event, update);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    disposed = true;
    for (const event of events) graph.off(event, update);
    for (const button of buttons) button.onclick = null;
    controls.remove();
    status.remove();
    destroy();
  };
  try {
    await graph.render();
    update();
    container.append(controls, status);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
