# 插件总览 (/docs/guides/plugins)





## 什么是插件 [#什么是插件]

插件（Plugin）用来给图添加独立的功能，例如在画布旁显示统计面板或业务工具栏。

## 内置插件 [#内置插件]

G6Lite 目前没有内置插件。提示框由 [`tooltip` 交互](/docs/guides/behaviors#tooltip)提供，画布底色通过[主题](/docs/guides/theme)设置。需要添加自己的面板时，可以[开发自定义插件](/docs/guides/custom-plugin)。

## 配置方式 [#配置插件]

### 基本配置 [#基本配置]

先注册插件，再把注册名填入 `plugins` 的 `type`。这里的 `createCounter` 是[自定义插件](/docs/guides/custom-plugin)中实现的工厂函数。

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

### 配置插件参数 [#配置插件参数]

插件参数和 `type` 写在同一层。示例用 `caption` 设置计数器标题。点击节点或 **Plugin +1**，计数会加一。



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



### 更换插件或参数 [#更换插件或参数]

`plugins` 在创建图时设置。需要更换插件或修改参数时，先销毁旧图，再用新的 `plugins` 配置创建图。

### 挂载与卸载 [#挂载与卸载]

| 操作                              | 插件如何变化                                             |
| ------------------------------- | -------------------------------------------------- |
| `await graph.render()`          | 首次渲染时挂载插件；再次调用会重新挂载。点击示例中的 **Render again**，计数会归零。 |
| `await graph.setData(nextData)` | 只更新图数据，插件继续运行。                                     |
| `graph.destroy()`               | 销毁图，并调用插件的 `destroy()` 清理资源。                       |

## 自定义插件 [#自定义插件]

[自定义插件](/docs/guides/custom-plugin)用同一个计数器演示如何实现面板、监听节点点击，以及卸载时如何清理。配置字段见[插件配置参考](/docs/api/options#plugins)。
