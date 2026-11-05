import { Graph } from '@antv/g6-lite';

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
  const controls = document.createElement('div');
  controls.style.cssText = 'position:absolute;left:12px;top:12px;right:150px;display:flex;flex-wrap:wrap;gap:6px;z-index:20;';
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.5 system-ui;white-space:pre-line;pointer-events:none;z-index:20;';
  const point = ({ x, y }: { x: number; y: number }) => `${Math.round(x * 10) / 10}, ${Math.round(y * 10) / 10}`;
  let frame = 0;
  let disposed = false;
  const update = () => {
    const camera = graph.getCamera();
    const rect = container.getBoundingClientRect();
    const client = graph.graphToScreen(0, 0);
    const canvas = { x: client.x - rect.left, y: client.y - rect.top };
    const back = graph.screenToGraph(client.x, client.y);
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
  ];
  const buttons = actions.map(([label, action]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.style.cssText = 'padding:5px 10px;border:1px solid #cbd5e1;border-radius:6px;background:white;color:#334155;font:12px system-ui;cursor:pointer;';
    button.onclick = () => { action(); schedule(); };
    controls.append(button);
    return button;
  });
  const events = ['node:pointermove', 'edge:pointermove', 'canvas:pointermove', 'canvas:pointerup', 'resize'] as const;
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    disposed = true;
    cancelAnimationFrame(frame);
    for (const event of events) graph.off(event, schedule);
    window.removeEventListener('click', schedule);
    window.removeEventListener('wheel', schedule);
    window.removeEventListener('scroll', schedule, true);
    for (const button of buttons) button.onclick = null;
    controls.remove();
    status.remove();
    destroy();
  };
  try {
    await graph.render();
    for (const event of events) graph.on(event, schedule);
    // Refresh after interaction and page scrolling, including the shared toolbar.
    window.addEventListener('click', schedule);
    window.addEventListener('wheel', schedule, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true, capture: true });
    container.append(controls, status);
    update();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
