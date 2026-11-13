# Plugin overview (/en/docs/guides/plugins)





## What is a plugin? [#what-is-a-plugin]

A plugin adds a separate feature to a graph, such as a statistics panel or an application toolbar.

## Built-in plugins [#built-in-plugins]

G6Lite has no built-in plugins. Use the [`tooltip` behavior](/en/docs/guides/behaviors#tooltip) for tooltips and the [theme](/en/docs/guides/theme) for the canvas background. To add your own panel, [write a custom plugin](/en/docs/guides/custom-plugin).

## Configuration [#configure-a-plugin]

### Basic configuration [#basic-configuration]

Register the plugin and use its registered name as `type` in `plugins`. The [custom plugin guide](/en/docs/guides/custom-plugin) implements the `createCounter` factory used here.

```ts
import { Graph, register } from '@antv/g6-lite';

register('plugin', 'docs-counter', createCounter);

const graph = new Graph({
  container,
  data,
  plugins: [{ type: 'docs-counter' }],
});

await graph.render();
```

### Configure plugin options [#configure-plugin-options]

Put plugin options alongside `type`. This example uses `caption` to set the counter title. Click a node or **Plugin +1** to increment the count.



```ts
plugins: [{
  type: NAME, caption: 'Clicks',
  subscribe(listener: () => void) {
    graph.on('node:click', listener);
    return () => graph.off('node:click', listener);
  },
  onRenderAgain() { void graph.render().catch(console.error); },
} satisfies CounterOptions],
```

**Complete runnable code**

```ts
import { Graph, register, type PluginExtension, type PluginOptions } from '@antv/g6-lite';
import GUI from 'lil-gui';

const NAME = 'docs-counter' as const;
interface CounterOptions extends PluginOptions<typeof NAME> {
  caption?: string;
  subscribe?: (listener: () => void) => () => void;
  onRenderAgain?: () => void;
}
// #region plugin
export function createCounter(): PluginExtension<CounterOptions> {
  let ui: ReturnType<typeof createDemoPanel> | undefined;
  let unsubscribe: (() => void) | undefined;
  let settings: CounterOptions | undefined;
  let count = 0;
  const report = () => ui?.setStatus(`${settings?.caption ?? 'Clicks'}: ${count}`);
  const increment = () => { count++; report(); };
  return {
    init(_context, options) { settings = options; },
    mount(container) {
      ui = createDemoPanel(container);
      ui.addAction('Plugin +1', increment);
      if (settings?.onRenderAgain) ui.addAction('Render again', settings.onRenderAgain);
      report();
      unsubscribe = settings?.subscribe?.(increment);
    },
    destroy() {
      unsubscribe?.(); unsubscribe = undefined;
      ui?.destroy();
      ui = undefined;
      settings = undefined;
    },
  };
}
register('plugin', NAME, () => createCounter());
// #endregion plugin

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: { nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 200, y: 0 }], edges: [] },
    node: { style: { size: 32, label: (node) => node.id } },
    // #region activate
    plugins: [{
      type: NAME, caption: 'Clicks',
      subscribe(listener: () => void) {
        graph.on('node:click', listener);
        return () => graph.off('node:click', listener);
      },
      onRenderAgain() { void graph.render().catch(console.error); },
    } satisfies CounterOptions],
    // #endregion activate
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 64, maxZoom: 1 },
  });
  try { await graph.render(); return graph; }
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



### Replace a plugin or its options [#replace-a-plugin-or-its-options]

Set `plugins` when you create the graph. To replace a plugin or change its options, destroy the old graph and create a graph with the new configuration.

### Mount and unmount [#mount-and-unmount]

| Operation                       | What happens to plugins                                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `await graph.render()`          | Mounts plugins on first render and remounts them on subsequent calls. Click **Render again** in the example to reset the count. |
| `await graph.setData(nextData)` | Updates graph data while plugins keep running.                                                                                  |
| `graph.destroy()`               | Destroys the graph and calls each plugin's `destroy()` to release its resources.                                                |

## Custom plugins [#custom-plugins]

The [custom plugin guide](/en/docs/guides/custom-plugin) uses the same counter to show how to create the panel, listen for node clicks, and clean up on unmount. For configuration fields, see the [plugin options reference](/en/docs/api/options#plugins).
