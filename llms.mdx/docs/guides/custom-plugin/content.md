# 自定义插件 (/docs/guides/custom-plugin)





下面实现一个点击计数器。它在图容器里显示面板，点击节点或面板上的按钮时更新计数。

## 实现插件 [#实现注册与挂载]

用工厂函数创建插件。计数、面板和退订函数都保存在工厂函数内部，每个插件实例独立管理自己的状态。

| 方法                       | 在示例中的作用                          |
| ------------------------ | -------------------------------- |
| `init(context, options)` | 读取标题等插件参数。                       |
| `mount(container)`       | 在图容器里创建面板，订阅节点点击。                |
| `destroy()`              | 退订节点点击，移除面板。插件自己创建的定时器等资源也在这里清理。 |

## 注册与使用 [#注册与使用]

用 `register('plugin', 'docs-counter', createCounter)` 注册工厂，再在 `plugins` 中配置 `{ type: 'docs-counter', caption: 'Clicks' }`。完整的图配置见[插件总览](/docs/guides/plugins#配置插件)。

## 代码示例 [#代码示例]

点击节点或 **Plugin +1**，计数会加一。点击 **Render again** 后，计数归零；再次点击节点，计数仍然只加一。



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

**完整运行代码**

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



展开「完整代码」可查看节点点击的接入方式：应用通过 `subscribe` 传入订阅函数，在里面调用 `graph.on()`，并返回调用 `graph.off()` 的退订函数。如果重挂载后一次点击加了多次，检查 `destroy()` 是否执行了退订。

更多钩子见 [PluginExtension](/docs/api/extensions#pluginextension)。
