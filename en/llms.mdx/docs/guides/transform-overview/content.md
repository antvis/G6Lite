# Transforms (/en/docs/guides/transform-overview)





## What is a transform? [#what-is-a-transform]

A transform prepares a full set of graph data. Use it to share logic that generates node labels or filters the nodes and edges to draw.

## When transforms run [#when-transforms-run]

G6Lite runs custom transforms when `render()` or `setData()` processes a full input. It calls each `beforeRender(data)` in `transforms` order, then uses the result for layout and drawing.

Calling `layout()` or `updateNodeData()` alone uses the current graph data. To keep a label in sync with a node field, read that field directly in the `node.style.label` style function.

## Built-in transforms [#built-in-transforms]

| Type                     | Description                                                                 | Configuration example                                                             |
| ------------------------ | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `process-parallel-edges` | Separates overlapping `line` or `arc` edges between the same pair of nodes. | [Parallel edge options and examples](/en/docs/guides/edge#entries-and-precedence) |

Parallel edge offsets are computed after the graph data is applied. When separation is enabled, adding or removing an edge also rearranges the edges in its group.

## Configuration [#configuration]

### Basic configuration [#basic-configuration]

Set `transforms` when you create the graph. Use the built-in transform name directly, or register a custom transform before using it.

```ts
const graph = new Graph({
  container,
  data,
  transforms: ['process-parallel-edges'],
});

await graph.render();
```

### Configure transform options [#configure-transform-options]

Use an object to pass parameters. Set `type` to the transform name and put the parameters in `options`. Here, `offset` controls parallel edge spacing.

```ts
const graph = new Graph({
  container,
  data,
  transforms: [{ type: 'process-parallel-edges', options: { offset: 48 } }],
});

await graph.render();
```

### Replace or remove transforms [#replace-or-remove-transforms]

To replace a custom transform or change its parameters, destroy the old graph and create a graph with the new `transforms`. To remove a transform, omit it from the new configuration. You can also use `updateOptions()` to change parallel edge spacing or toggle separation at runtime. [Parallel edge options](/en/docs/guides/edge#grouping-and-spacing)

## Custom transforms [#custom-transforms]

This example implements `docs-normalize`, a transform that prefixes node names to generate labels such as `Svc: API`.

### Implement and register [#implement-and-activate]

Implement `beforeRender(data)` in a factory. Read the nodes from the supplied `GraphData` and return the complete transformed data synchronously. The example adds `data.label` to each node and preserves the edges, Combos, and other fields.

Register the factory with `register('transform', 'docs-normalize', createNormalize)`, then configure the graph.

```ts
transforms: [
  { type: 'docs-normalize', options: { prefix: 'Svc' } },
],
node: {
  style: { label: (node) => String(node.data?.label ?? node.id) },
},
```

### Code example [#code-example]

**Update name** only changes the node name. The generated label and the `run` count stay the same. **Reload data** calls `setData()`, updates the label from the new input, and increments `run`.



```ts
export function createNormalize(): TransformExtension<NormalizeOptions> {
  let prefix = 'Svc';
  let report: NormalizeOptions['onPhase'];
  const configure = (options: Readonly<Partial<NormalizeOptions>>) => {
    prefix = options.prefix ?? 'Svc';
    report = options.onPhase;
  };
  return {
    init(_context, options) { configure(options); report?.('init'); },
    update(options) { configure(options); report?.('update'); },
    beforeRender(data) {
      report?.('run');
      return { ...data, nodes: data.nodes.map((node) => ({
        ...node, data: { ...node.data, label: prefix + ': ' + String(node.data?.name ?? node.id) },
      })) };
    },
    destroy() { report?.('destroy'); report = undefined; },
  };
}
register('transform', 'docs-normalize', () => createNormalize());
```

**Complete runnable code**

```ts
import { Graph, register, type GraphData, type TransformExtension } from '@antv/g6-lite';
import GUI from 'lil-gui';

type Phase = 'init' | 'update' | 'run' | 'destroy';
interface NormalizeOptions { prefix?: string; onPhase?: (phase: Phase) => void }
// #region transform
export function createNormalize(): TransformExtension<NormalizeOptions> {
  let prefix = 'Svc';
  let report: NormalizeOptions['onPhase'];
  const configure = (options: Readonly<Partial<NormalizeOptions>>) => {
    prefix = options.prefix ?? 'Svc';
    report = options.onPhase;
  };
  return {
    init(_context, options) { configure(options); report?.('init'); },
    update(options) { configure(options); report?.('update'); },
    beforeRender(data) {
      report?.('run');
      return { ...data, nodes: data.nodes.map((node) => ({
        ...node, data: { ...node.data, label: prefix + ': ' + String(node.data?.name ?? node.id) },
      })) };
    },
    destroy() { report?.('destroy'); report = undefined; },
  };
}
register('transform', 'docs-normalize', () => createNormalize());
// #endregion transform

export async function run(container: HTMLElement) {
  const counters: Record<Phase, number> = { init: 0, update: 0, run: 0, destroy: 0 };
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;bottom:12px;left:12px;font:12px system-ui;color:#334155;background:white;padding:4px;';
  const updateStatus = () => {
    status.textContent = 'init=' + counters.init + ' update=' + counters.update + ' run=' + counters.run;
  };
  let revision = 0;
  const input = (): GraphData => ({
    nodes: [
      { id: 'A', x: 0, y: 0, data: { name: revision % 2 ? 'New API' : 'API' } },
      { id: 'B', x: 240, y: 0, data: { name: 'DB' } },
    ],
    edges: [{ id: 'A-B', source: 'A', target: 'B' }],
  });
  const graph = new Graph({
    container, data: input(),
    // #region config-transforms
    transforms: [{ type: 'docs-normalize', options: { prefix: 'Svc', onPhase: (phase: Phase) => { counters[phase]++; updateStatus(); } } }],
    // #endregion config-transforms
    node: { style: { size: 32, label: (node) => String(node.data?.label ?? node.id) } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 64, maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { ui.destroy(); status.remove(); destroy(); };
  try {
    await graph.render();
    updateStatus();
    ui.addAction('Reload data', () => {
      revision++;
      void graph.setData(input(), { fitView: false }).catch((error) => { status.textContent = String(error); });
    });
    ui.addAction('Update name', () => {
      graph.updateNodeData('A', { name: 'Raw name' });
      updateStatus();
    });
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



### Options and cleanup [#options-and-cleanup]

| Method                   | What it does in the example                                                                                                             |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `init(context, options)` | Reads `prefix` when the instance is created, defaulting to `Svc`.                                                                       |
| `update(options)`        | Reads the complete options when a later `render()` or `setData()` reuses the instance at the same position with the same name.          |
| `beforeRender(data)`     | Generates labels from the current input and returns the processed data.                                                                 |
| `destroy()`              | Releases the callback reference when the graph is destroyed. Release any timers or other resources owned by the transform here as well. |

Return new objects for records you change. If you filter out nodes, also handle their associated edges and Combo references so the result remains valid.

See [TransformOption](/en/docs/api/options#transforms) for configuration fields and [TransformExtension](/en/docs/api/extensions#transformextension) for the extension API.
