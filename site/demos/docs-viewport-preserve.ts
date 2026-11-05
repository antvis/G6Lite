import { Graph, type FitViewOptions, type GraphData } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const fit: FitViewOptions = { padding: [76, 48, 100, 48], maxZoom: 1 };
  const data = (wide: boolean): GraphData => ({
    nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: wide ? 800 : 240, y: 0 }],
    edges: [{ id: 'A-B', source: 'A', target: 'B' }],
  });
  const graph = new Graph({
    container, data: data(false), autoFit: false,
    node: { style: { size: 32, label: (node) => node.id, labelOffsetY: 10 } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
  });
  let wide = false;
  let disposed = false;
  let frame = 0;
  let lastAction = 'Initial view';
  const reload = async (keepView: boolean) => {
    const before = graph.getCamera();
    const next = !wide;
    // #region preserve-view
    await graph.setData(data(next), {
      fitView: keepView ? false : fit,
    });
    // #endregion preserve-view
    if (graph.destroyed) return;
    wide = next;
    const after = graph.getCamera();
    const unchanged = before.x === after.x && before.y === after.y && before.zoom === after.zoom;
    lastAction = `Last reload (${keepView ? 'keep view' : 'refit'}): camera ${unchanged ? 'unchanged' : 'changed'}`;
  };
  const controls = document.createElement('div');
  controls.style.cssText = 'position:absolute;left:12px;top:12px;right:150px;display:flex;flex-wrap:wrap;gap:6px;z-index:20;';
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.5 system-ui;white-space:pre-line;pointer-events:none;z-index:20;';
  const update = () => {
    const camera = graph.getCamera();
    status.textContent = `A (0, 0), B (${wide ? 800 : 240}, 0) | ${lastAction}\ncamera (${camera.x.toFixed(1)}, ${camera.y.toFixed(1)}) | zoom ${camera.zoom.toFixed(2)}`;
  };
  const schedule = () => {
    if (disposed || frame) return;
    frame = requestAnimationFrame(() => { frame = 0; if (!disposed) update(); });
  };
  const actions: Array<[string, () => void | Promise<void>]> = [
    ['Reload + keep view', () => reload(true)],
    ['Reload + fit', () => reload(false)],
    ['Focus A', () => { graph.focusItem('A'); lastAction = 'Focused A'; }],
  ];
  const buttons = actions.map(([label, action]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.style.cssText = 'padding:5px 10px;border:1px solid #cbd5e1;border-radius:6px;background:white;color:#334155;font:12px system-ui;cursor:pointer;';
    button.onclick = async () => {
      for (const item of buttons) item.disabled = true;
      try {
        await action();
        if (!disposed) update();
      } catch {
        if (!disposed) { lastAction = 'Update failed'; update(); }
      } finally {
        if (!disposed) for (const item of buttons) item.disabled = false;
      }
    };
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
    for (const button of buttons) button.onclick = null;
    controls.remove(); status.remove();
    destroy();
  };
  try {
    await graph.render();
    if (graph.destroyed) return graph;
    graph.fitView(fit);
    for (const event of events) graph.on(event, schedule);
    window.addEventListener('click', schedule);
    window.addEventListener('wheel', schedule, { passive: true });
    container.append(controls, status);
    update();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
