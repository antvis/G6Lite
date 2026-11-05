import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const originalWidth = container.style.width;
  const originalOutline = container.style.outline;
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 800, y: 0 }],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }],
    },
    node: { style: { size: 32, label: (node) => node.id, labelOffsetY: 10 } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    // #region auto-fit
    autoFit: { padding: [84, 40, 100, 40], maxZoom: 1 },
    // #endregion auto-fit
  });
  // ResizeObserver detects these CSS width changes; no setSize or render call.
  const narrow = () => { container.style.width = '65%'; };
  const wide = () => { container.style.width = '100%'; };
  const controls = document.createElement('div');
  controls.style.cssText = 'position:absolute;left:12px;top:12px;right:150px;display:flex;flex-wrap:wrap;gap:6px;z-index:20;';
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.5 system-ui;white-space:pre-line;pointer-events:none;z-index:20;';
  let resizeCount = 0;
  let frame = 0;
  let disposed = false;
  const update = () => {
    const camera = graph.getCamera();
    status.textContent = `container ${Math.round(container.getBoundingClientRect().width)} CSS px | resize events: ${resizeCount}\nzoom ${graph.getZoom().toFixed(2)} | camera (${camera.x.toFixed(1)}, ${camera.y.toFixed(1)})`;
  };
  const schedule = () => {
    if (disposed || frame) return;
    frame = requestAnimationFrame(() => { frame = 0; if (!disposed) update(); });
  };
  const resized = () => { resizeCount++; update(); };
  const actions: Array<[string, () => void]> = [
    ['Width 65%', narrow], ['Width 100%', wide],
    ['Zoom ×1.5', () => graph.zoomBy(1.5)],
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
  const events = ['node:pointermove', 'edge:pointermove', 'canvas:pointermove', 'canvas:pointerup'] as const;
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    disposed = true;
    cancelAnimationFrame(frame);
    graph.off('resize', resized);
    for (const event of events) graph.off(event, schedule);
    window.removeEventListener('click', schedule);
    window.removeEventListener('wheel', schedule);
    for (const button of buttons) button.onclick = null;
    controls.remove(); status.remove();
    destroy();
    container.style.width = originalWidth;
    container.style.outline = originalOutline;
  };
  try {
    await graph.render();
    if (graph.destroyed) return graph;
    graph.on('resize', resized);
    for (const event of events) graph.on(event, schedule);
    window.addEventListener('click', schedule);
    window.addEventListener('wheel', schedule, { passive: true });
    container.style.outline = '1px dashed #cbd5e1';
    container.append(controls, status);
    update();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
