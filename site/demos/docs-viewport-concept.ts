import { Graph, type Camera } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 240, y: 80 }],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }],
    },
    node: { style: { size: 32, label: (node) => node.id === 'A' ? 'A (0, 0)' : 'B (240, 80)', labelOffsetY: 10 } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: [70, 50, 110, 50], maxZoom: 1 },
  });
  // #region camera
  const zoom = () => graph.zoomBy(1.5, { maxZoom: 4 });
  const pan = () => {
    const camera = graph.getCamera();
    graph.setCamera({ x: camera.x + 80 });
  };
  const center = () => graph.fitCenter();
  const fit = () => graph.fitView({ padding: [70, 50, 110, 50], maxZoom: 1 });
  const reset = () => graph.resetCamera();
  // #endregion camera
  let saved: Camera;
  // #region saved-view
  const save = () => { saved = graph.getCamera(); };
  const restore = () => graph.setCamera(saved);
  const focus = () => graph.focusItem('B', 32);
  // #endregion saved-view
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.5 system-ui;white-space:pre-line;pointer-events:none;z-index:20;';
  const point = ({ x, y }: { x: number; y: number }) => `${Math.round(x * 10) / 10}, ${Math.round(y * 10) / 10}`;
  let frame = 0;
  let disposed = false;
  const update = () => {
    const camera = graph.getCamera();
    // #region coordinates
    const rect = container.getBoundingClientRect();
    const client = graph.graphToScreen(0, 0);
    const canvas = { x: client.x - rect.left, y: client.y - rect.top };
    const back = graph.screenToGraph(client.x, client.y);
    // #endregion coordinates
    status.textContent = [
      `A graph (0, 0) | camera (${point(camera)}) | zoom ${camera.zoom.toFixed(2)}`,
      `A canvas (${point(canvas)}) | A client (${point(client)})`,
      `screenToGraph(A client) = (${point(back)})`,
    ].join('\n');
  };
  const schedule = () => {
    if (disposed || frame) return;
    frame = requestAnimationFrame(() => { frame = 0; if (!disposed) update(); });
  };
  const actions: Array<[string, () => void]> = [
    ['Zoom ×1.5', zoom], ['Pan right', pan], ['Center', center], ['Fit', fit], ['Reset camera', reset],
    ['Save view', save], ['Restore view', restore], ['Focus B', focus],
  ];
  const events = ['node:pointermove', 'edge:pointermove', 'canvas:pointermove', 'canvas:pointerup', 'resize'] as const;
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    disposed = true;
    cancelAnimationFrame(frame);
    for (const event of events) graph.off(event, schedule);
    window.removeEventListener('click', schedule);
    window.removeEventListener('wheel', schedule);
    window.removeEventListener('scroll', schedule, true);
    ui.destroy();
    status.remove();
    destroy();
  };
  try {
    await graph.render();
    if (graph.destroyed) return graph;
    save();
    for (const event of events) graph.on(event, schedule);
    // Refresh after interaction and page scrolling, including the shared toolbar.
    window.addEventListener('click', schedule);
    window.addEventListener('wheel', schedule, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true, capture: true });
    for (const [label, action] of actions) {
      ui.addAction(label, () => { action(); schedule(); });
    }
    container.append(status);
    update();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
