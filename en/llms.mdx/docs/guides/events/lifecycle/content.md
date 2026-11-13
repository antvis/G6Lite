# Rendering, layout, and data updates (/en/docs/guides/events/lifecycle)





## When can I continue? [#choose-the-right-completion-point]

| Task                                               | What to do                                                       |
| -------------------------------------------------- | ---------------------------------------------------------------- |
| Update the graph after its first render            | Wait for `await graph.render()`, then change data or states.     |
| Read positions after running a layout              | Wait for `await graph.layout()`, then call `getNodePosition()`.  |
| Update the application after each data replacement | Listen for `datachange` to receive the new node and edge counts. |

```ts
await graph.render();

graph.on('datachange', ({ nodeCount, edgeCount }) => {
  console.log('Data replaced', nodeCount, edgeCount);
});
await graph.setData(nextData);

await graph.layout();
const position = graph.getNodePosition('A');
```

To receive a notification for the first render, register `graph.once('afterrender', handler)` before calling `render()`. The `layout:end` and `afterlayout` events fire before positions are written back. Await `graph.layout()` before reading final positions.

## Observe the sequence [#observe-the-sequence]

The log shows the initial layout and render events when the example loads. Use the buttons in the top-right corner to see which events each operation triggers.

| Button                                | What to look for                                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Update A**, **Add D**, **Remove D** | `afterupdateitem`, `afteradditem`, and `afterremoveitem`, respectively. Add D before trying to remove it. |
| **Replace data**                      | Layout events followed by `datachange`, since this graph has a layout configured.                         |
| **Layout**                            | Layout events.                                                                                            |



```ts
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
```

**Complete runnable code**

```ts
import { Graph, type GraphData, type GraphEventMap } from '@antv/g6-lite';
import GUI from 'lil-gui';

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


export function createDemoPanel(container: string | HTMLElement, description = '') {
  const host = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

  let gui: GUI | undefined;
  const getGui = () => {
    if (!gui) {
      gui = new GUI({ container: host, width: 160 });
      gui.domElement.classList.add('g6lite-demo-controls');
      gui.domElement.dataset.captureIgnore = '';
      Object.assign(gui.domElement.style, {
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: '30',
        maxWidth: 'calc(100% - 20px)',
        maxHeight: 'calc(100% - 20px)',
      });
    }
    return gui;
  };

  let status: HTMLDivElement | undefined;
  const setStatus = (message: string) => {
    if (!status) {
      status = document.createElement('div');
      status.setAttribute('role', 'status');
      status.dataset.role = 'status';
      status.dataset.captureIgnore = '';
      status.style.cssText =
        'position:absolute;left:12px;bottom:10px;z-index:20;max-width:min(28rem,calc(100% - 24px));color:#64748b;font:12px/1.45 system-ui,sans-serif;pointer-events:none;white-space:pre-wrap;';
      host.append(status);
    }
    status.textContent = message;
  };
  if (description) setStatus(description);

  return {
    get gui() {
      return getGui();
    },
    addAction(label: string, action: () => void, folder = getGui()) {
      return folder.add({ [label]: action }, label);
    },
    addChoice<T extends string>(
      label: string,
      choices: readonly T[] | Record<string, T>,
      value: T,
      onChange: (value: T) => void,
    ) {
      const options = Array.isArray(choices) ? [...choices] : choices;
      return getGui().add({ value }, 'value', options).name(label).onChange(onChange);
    },
    setStatus,
    destroy() {
      gui?.destroy();
      status?.remove();
    },
  };
}
```



See the [event API reference](/en/docs/api/graph/events#event-lifecycle) for event order, callback arguments, and cancellation behavior. See the [graph lifecycle](/en/docs/api/graph#graph-lifecycle) for cleanup on unmount.
