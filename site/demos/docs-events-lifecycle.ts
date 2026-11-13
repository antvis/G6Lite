import { Graph, type GraphData, type GraphEventMap } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: HTMLElement) {
  const initialData = (): GraphData => ({
    nodes: ['A', 'B', 'C'].map((id) => ({ id, data: { edits: 0 } })),
    edges: [{ id: 'A-B', source: 'A', target: 'B' }],
  });
  const fit = { padding: [70, 40, 140, 40] as [number, number, number, number], maxZoom: 1 };
  const graph = new Graph({
    container,
    data: initialData(),
    layout: { type: 'grid', rows: 1, width: 320, height: 80 },
    node: { style: { size: 30, label: (node) => `${node.id}: ${node.data?.edits ?? 0}`, labelOffsetY: 8 } },
    behaviors: [],
    autoFit: fit,
  });
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;bottom:12px;left:12px;right:12px;background:white;color:#334155;padding:6px 10px;font:12px/1.4 system-ui;white-space:pre-line;pointer-events:none;z-index:20;';
  const lines: string[] = [];
  const push = (line: string) => {
    lines.push(line);
    status.textContent = lines.slice(-6).join('\n');
  };
  // #region lifecycle
  const events = [
    'beforelayout', 'layout:start', 'layout:end', 'afterlayout',
    'beforerender', 'afterrender', 'datachange',
    'afteradditem', 'afterremoveitem', 'afterupdateitem',
  ] as const;
  const cleanups: Array<() => void> = [];
  const watch = <K extends keyof GraphEventMap>(name: K) => {
    const handler = () => push(name);
    graph.on(name, handler);
    cleanups.push(() => graph.off(name, handler));
  };
  for (const event of events) watch(event); // Before render: capture initial events.
  // #endregion lifecycle
  let disposed = false;
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    disposed = true;
    for (const cleanup of cleanups) cleanup();
    ui.destroy();
    status.remove();
    destroy();
  };
  try {
    await graph.render();
    const buttons: ReturnType<typeof ui.addAction>[] = [];
    const addButton = (label: string, action: () => void | Promise<void>) => {
      const button = ui.addAction(label, async () => {
        for (const item of buttons) item.disable();
        lines.length = 0;
        push(`> ${label}`);
        try {
          await action();
          if (!disposed) { graph.fitView(fit); push('operation complete'); }
        } catch {
          if (!disposed) push('operation failed');
        } finally {
          if (!disposed) for (const item of buttons) item.enable();
        }
      });
      buttons.push(button);
    };
    addButton('Update A', () => {
      const edits = Number(graph.getNodeData('A')?.data?.edits ?? 0) + 1;
      graph.updateNodeData('A', { edits });
    });
    addButton('Add D', () => {
      if (!graph.getNodePosition('D')) graph.addNode({ id: 'D', x: 320, y: 100 });
    });
    addButton('Remove D', () => {
      if (graph.getNodePosition('D')) graph.removeNode('D');
    });
    addButton('Replace data', () => graph.setData(initialData(), { fitView: false }));
    addButton('Layout', () => graph.layout());
    container.append(status);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
