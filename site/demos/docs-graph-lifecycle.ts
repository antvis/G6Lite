import { Graph } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: HTMLElement) {
  let enlarged = false;
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 220, y: 0 }],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }],
    },
    node: {
      style: { size: 28, fill: '#5366ad', label: (node) => node.id, labelOffsetY: 10 },
      stateStyles: { selected: { stroke: '#6D28D9', strokeWidth: 3 } },
    },
    behaviors: [],
    autoFit: { padding: [84, 50, 130, 50], maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
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
  const toggleSize = () => {
    enlarged = !enlarged;
    graph.updateOptions({ node: { style: { size: enlarged ? 46 : 28 } } });
  };
  const renderAgain = async () => { await graph.render(); };
  // #endregion updates
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    disposed = true;
    destroy();
    ui.destroy(); status.remove();
  };
  try {
    // #region initialize
    await graph.render();
    if (graph.destroyed) return graph;
    graph.setItemState('A', 'selected', true);
    // #endregion initialize
    push('await render resolved; selected A');
    const buttons: ReturnType<typeof ui.addAction>[] = [];
    const add = (label: string, action: () => void | Promise<void>) => {
      const button = ui.addAction(label, async () => {
        for (const item of buttons) item.disable();
        lines.length = 0;
        try {
          await action();
          if (!disposed) push(`${label} complete`);
        } catch {
          if (!disposed) push(`${label} failed`);
        } finally {
          if (!disposed) for (const item of buttons) item.enable();
        }
      });
      buttons.push(button);
    };
    add('Update style', update);
    add('Toggle node size', toggleSize);
    add('Select A', () => graph.setItemState('A', 'selected', true));
    add('Render again', renderAgain);
    // This demo keeps its final report visible; the shared Reset example creates a new instance.
    buttons.push(ui.addAction('Destroy graph', () => {
      lines.length = 0;
      graph.destroy();
      push(`destroy returned | graph canvases=${container.querySelectorAll('canvas').length}`);
      container.append(status);
    }));
    container.append(status);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
