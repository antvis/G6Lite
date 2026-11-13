# Custom Plugins (/en/docs/guides/custom-plugin)





This example adds a click counter to the graph container. The count increases when you click a node or the button on the panel.

## Implement the plugin [#implement-register-and-mount]

Use a factory to create the plugin. Keep the count, panel, and unsubscribe callback inside the factory so each plugin instance has its own state.

| Method                   | What it does in the example                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `init(context, options)` | Reads options such as the caption.                                                                                  |
| `mount(container)`       | Adds the panel to the graph container and subscribes to node clicks.                                                |
| `destroy()`              | Unsubscribes from clicks and removes the panel. Also release any timers or other resources the plugin creates here. |

## Register and use the plugin [#register-and-use-the-plugin]

Register the factory with `register('plugin', 'docs-counter', createCounter)`, then add `{ type: 'docs-counter', caption: 'Clicks' }` to `plugins`. See the [plugin overview](/en/docs/guides/plugins#configure-a-plugin) for the graph configuration.

## Code example [#code-example]

Click a node or **Plugin +1** to increment the count. Click **Render again** to reset the count to zero. The next node click still increments it by one.



```ts
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



Open the full code to see how the application provides a `subscribe` option. It calls `graph.on()` and returns a function that calls `graph.off()`. If a click counts more than once after remounting, check that `destroy()` calls the unsubscribe function.

See [PluginExtension](/en/docs/api/extensions#pluginextension) for the full contract.
