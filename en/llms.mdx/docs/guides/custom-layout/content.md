# Custom layouts (/en/docs/guides/custom-layout)





Use a `LayoutExtension` to calculate node positions from graph data. This example arranges nodes in a row with equal spacing. See the [Layout overview](/en/docs/guides/layout-overview) for built-in layouts.

## Implement and execute [#implement-and-execute]

Read current data and runtime.options, retain node IDs/business fields, and return finite x/y. Reading options from runtime also supports standalone execution without init.



```ts
export function createColumnLayout(): LayoutExtension<ColumnOptions> {
  let context: ExtensionContext | undefined;
  return {
    init(next) { context = next; },
    async execute(data, { width, height, signal, options }) {
      const gap = Number(options.gap ?? 100);
      const nodes = [];
      for (const [index, node] of data.nodes.entries()) {
        await pause(signal, Number(options.delay ?? 0));
        if (signal?.aborted || context?.isDestroyed()) throw new DOMException('Canceled', 'AbortError');
        nodes.push({ ...node, x: width / 2 + (index - (data.nodes.length - 1) / 2) * gap, y: height / 2 });
      }
      return { nodes };
    },
    destroy() { context = undefined; },
  };
}
register('layout', 'docs-column', () => createColumnLayout());
```

**Complete runnable code**

```ts
import { Graph, register, type ExtensionContext, type LayoutExtension } from '@antv/g6-lite';
import GUI from 'lil-gui';

interface ColumnOptions extends Record<string, unknown> { gap?: number; delay?: number }
function pause(signal: AbortSignal | undefined, delay: number) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException('Canceled', 'AbortError')); return; }
    const abort = () => { clearTimeout(timer); reject(new DOMException('Canceled', 'AbortError')); };
    const timer = setTimeout(() => { signal?.removeEventListener('abort', abort); resolve(); }, delay);
    signal?.addEventListener('abort', abort, { once: true });
  });
}
// #region layout
export function createColumnLayout(): LayoutExtension<ColumnOptions> {
  let context: ExtensionContext | undefined;
  return {
    init(next) { context = next; },
    async execute(data, { width, height, signal, options }) {
      const gap = Number(options.gap ?? 100);
      const nodes = [];
      for (const [index, node] of data.nodes.entries()) {
        await pause(signal, Number(options.delay ?? 0));
        if (signal?.aborted || context?.isDestroyed()) throw new DOMException('Canceled', 'AbortError');
        nodes.push({ ...node, x: width / 2 + (index - (data.nodes.length - 1) / 2) * gap, y: height / 2 });
      }
      return { nodes };
    },
    destroy() { context = undefined; },
  };
}
register('layout', 'docs-column', () => createColumnLayout());
// #endregion layout

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: { nodes: ['A', 'B', 'C', 'D', 'E', 'F'].map((id) => ({ id })), edges: [] },
    layout: { type: 'docs-column', gap: 100 },
    node: { style: { size: 30, label: (node) => node.id } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  let revision = 0;
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;bottom:12px;left:12px;font:12px system-ui;color:#334155;background:white;padding:4px;';
  const apply = async (mode: string) => {
    const request = ++revision;
    status.textContent = mode === 'slow' ? 'Running slow layout…' : 'Running…';
    if (mode === 'grid') graph.cancelLayout();
    graph.setLayout(mode === 'grid' ? { type: 'grid' } : { type: 'docs-column', gap: 100, delay: mode === 'slow' ? 180 : 0 });
    await graph.layout();
    if (graph.destroyed || request !== revision) return;
    graph.fitView({ padding: 56, maxZoom: 1 });
    status.textContent = mode === 'grid' ? 'Canceled old run; grid' : 'Column layout complete';
  };
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { revision++; ui.destroy(); status.remove(); destroy(); };
  try {
    await graph.render();
    status.textContent = 'Column layout complete';
    for (const [mode, label] of [['column', 'Layout again'], ['slow', 'Slow layout'], ['grid', 'Cancel + grid']]) {
      ui.addAction(label, () => {
        void apply(mode).catch((error) => { if (!graph.destroyed) status.textContent = String(error); });
      });
    }
    container.append(status);
    return graph;
  }
  catch (error) { graph.destroy(); throw error; }
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



Six nodes start in a row. Layout again recalculates. Start Slow layout and immediately choose Cancel + grid to invalidate the old run and restore a grid. Run the column layout again to verify recovery.

## Cancellation and resources [#cancellation-and-resources]

The wait helper clears its timer on abort and removes its listener on completion. Each step checks signal / isDestroyed. Chunk expensive work and yield so cancellation can run.

Graph calls destroy after success, failure, or cancellation. Cleanup must tolerate partial initialization. Layout fallback may absorb failures; fulfilled await alone does not prove application. The buttons use their own generation check before status updates and fitting.

## Graph versus standalone execution [#graph-versus-standalone-execution]

Graph.render / layout / setData use init → execute → destroy. Standalone runLayout skips init but still calls execute / destroy. This example reads options from runtime so both paths work.

```ts
import { runLayout, type GraphData } from '@antv/g6-lite';
export async function calculate(data: GraphData) {
  // Register docs-column above first. This calculates positions, without updating Graph.
  return runLayout(data, { type: 'docs-column', gap: 100 }, { width: 640, height: 320 });
}
```

See the [runLayout example](/en/docs/api/graph#graph-layout-runlayout) for displaying calculated results. Do not request rendering from execute; Graph applies results. context.data can be the old graph, not this execution's input.

## Common questions [#common-questions]

### Does worker: true move a custom layout to a Worker? [#does-worker-true-move-a-custom-layout-to-a-worker]

No. Registered extensions currently take the main-thread path. Own messages, cancellation, and cleanup if implementing your own Worker; see [Worker guidance](/en/docs/guides/layout-worker).

### Why can cancellation still fulfill the Promise? [#why-can-cancellation-still-fulfill-the-promise]

Cancellation invalidates old results rather than promising rejection. Keep an application generation check to prevent stale UI updates.

See [LayoutExtension](/en/docs/api/extensions#layoutextension) for runtime fields and fallback, and the [two-row example](/en/docs/examples/custom-layout).

**Related runnable examples**

* [Custom layout](/en/docs/examples/custom-layout)
