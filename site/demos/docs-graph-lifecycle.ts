import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  let enlarged = false;
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 220, y: 0 }],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }],
    },
    node: {
      style: { size: () => enlarged ? 46 : 28, fill: '#5366ad', label: (node) => node.id, labelOffsetY: 10 },
      stateStyles: { selected: { stroke: '#6D28D9', strokeWidth: 3 } },
    },
    behaviors: [],
    autoFit: { padding: [84, 50, 130, 50], maxZoom: 1 },
  });
  const controls = document.createElement('div');
  controls.style.cssText = 'position:absolute;left:12px;top:12px;right:150px;display:flex;flex-wrap:wrap;gap:6px;z-index:20;';
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.5 system-ui;white-space:pre-line;pointer-events:none;z-index:20;';
  const lines: string[] = [];
  let renders = 0;
  let disposed = false;
  const report = () => {
    status.textContent = [
      `destroyed=${graph.destroyed} | render events=${renders} | A states=[${graph.destroyed ? 'n/a' : graph.getItemStates('A').join(', ')}]`,
      ...lines.slice(-4),
    ].join('\n');
  };
  const push = (line: string) => { lines.push(line); report(); };
  graph.on('beforerender', () => push('beforerender'));
  graph.on('afterrender', () => { renders++; push('afterrender'); });
  graph.on('destroy', () => push(`destroy event: destroyed=${graph.destroyed}`));
  // #region updates
  const update = () => graph.updateOptions({ node: { style: { fill: '#F59E0B' } } });
  const refresh = () => {
    enlarged = !enlarged; // External input read by the size callback.
    graph.refresh();
  };
  const renderAgain = async () => { await graph.render(); };
  // #endregion updates
  const buttons: HTMLButtonElement[] = [];
  const add = (label: string, action: () => void | Promise<void>) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.style.cssText = 'padding:5px 10px;border:1px solid #cbd5e1;border-radius:6px;background:white;color:#334155;font:12px system-ui;cursor:pointer;';
    button.onclick = async () => {
      for (const item of buttons) item.disabled = true;
      lines.length = 0;
      try {
        await action();
        if (!disposed) push(`${label} complete`);
      } catch {
        if (!disposed) push(`${label} failed`);
      } finally {
        if (!disposed) for (const item of buttons) item.disabled = false;
      }
    };
    buttons.push(button); controls.append(button);
    return button;
  };
  add('Update style', update);
  add('External + refresh', refresh);
  add('Select A', () => graph.setItemState('A', 'selected', true));
  add('Render again', renderAgain);
  const stop = add('Destroy graph', () => {});
  // This demo keeps its final report visible; the shared Reset example creates a new instance.
  stop.onclick = () => {
    lines.length = 0;
    graph.destroy();
    push(`destroy returned | graph canvases=${container.querySelectorAll('canvas').length}`);
    container.append(status);
  };
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    disposed = true;
    destroy();
    for (const button of buttons) button.onclick = null;
    controls.remove(); status.remove();
  };
  try {
    // #region initialize
    await graph.render();
    if (graph.destroyed) return graph;
    graph.setItemState('A', 'selected', true);
    // #endregion initialize
    push('await render resolved; selected A');
    container.append(controls, status);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
