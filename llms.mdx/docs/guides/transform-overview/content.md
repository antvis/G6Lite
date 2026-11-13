# 数据处理 Transform (/docs/guides/transform-overview)





## 什么是数据处理 [#什么是数据处理]

数据处理（Transform）可以在图接收整份数据时统一整理输入，例如给节点生成标签，或筛选要绘制的节点和边。它适合把重复的数据处理逻辑封装成可复用的函数。

## 执行时机 [#执行时机]

自定义 Transform 在 `render()` 和 `setData()` 处理整份输入时执行。G6Lite 按 `transforms` 的顺序调用每个 `beforeRender(data)`，再用处理后的数据计算布局和绘制。

单独调用 `layout()` 或 `updateNodeData()` 时，图沿用当前数据。需要标签跟随节点字段实时变化时，可以在 `node.style.label` 的样式函数中直接读取该字段。

## 内置数据处理 [#内置数据处理]

| 类型                       | 描述                              | 配置示例                                   |
| ------------------------ | ------------------------------- | -------------------------------------- |
| `process-parallel-edges` | 将同一对节点之间重叠的 `line` 或 `arc` 边分开。 | [平行边配置与示例](/docs/guides/edge#两种入口与优先级) |

平行边在图数据写入后计算偏移。开启后，添加或删除边也会重新分配同组边的位置。

## 配置方式 [#配置方式]

### 基本配置 [#基本配置]

在创建图时，通过 `transforms` 指定要启用的数据处理。内置的平行边处理可以直接使用名称，自定义项需先注册。

```ts
const graph = new Graph({
  container,
  data,
  transforms: ['process-parallel-edges'],
});

await graph.render();
```

### 配置参数 [#配置参数]

有参数时使用对象写法。`type` 指定名称，参数放在 `options` 中。下面用 `offset` 调整平行边的间距。

```ts
const graph = new Graph({
  container,
  data,
  transforms: [{ type: 'process-parallel-edges', options: { offset: 48 } }],
});

await graph.render();
```

### 更换或移除数据处理 [#更换或移除数据处理]

更换或移除自定义 Transform、修改参数时，先销毁旧图，再用新的 `transforms` 创建图。平行边的间距和开关可以在运行时通过 `updateOptions()` 更新。 [平行边配置](/docs/guides/edge#分组与间距)

## 自定义数据处理 [#自定义数据处理]

下面实现一个 `docs-normalize` Transform，把节点名称转换成带前缀的标签，例如把 `API` 转成 `Svc: API`。

### 实现与注册 [#实现与激活]

在工厂函数中实现 `beforeRender(data)`。从传入的 `GraphData` 读取节点，同步返回处理后的整份数据。示例只为节点补充 `data.label`，并保留原有的边、分组和其他字段。

用 `register('transform', 'docs-normalize', createNormalize)` 注册工厂，再将它加入图的配置。

```ts
transforms: [
  { type: 'docs-normalize', options: { prefix: 'Svc' } },
],
node: {
  style: { label: (node) => String(node.data?.label ?? node.id) },
},
```

### 代码示例 [#代码示例]

点击 **Update name** 只修改节点名称，已生成的标签和 `run` 次数保持原样。点击 **Reload data** 会调用 `setData()`，标签随新数据更新，`run` 加一。



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

**完整运行代码**

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



### 选项与清理 [#选项与清理]

| 方法                       | 在示例中的作用                                             |
| ------------------------ | --------------------------------------------------- |
| `init(context, options)` | 首次创建时读取 `prefix`，默认用 `Svc`。                         |
| `update(options)`        | 后续 `render()` 或 `setData()` 复用同一位置、同名的实例时，重新读取完整选项。 |
| `beforeRender(data)`     | 根据本次输入生成标签，并返回处理后的数据。                               |
| `destroy()`              | 图销毁时释放回调引用。Transform 自己创建的计时器等资源也在这里清理。             |

转换时用新对象保存修改后的记录。过滤节点时同时处理关联边和分组引用，确保返回的数据仍然有效。

配置字段与扩展接口见 [TransformOption](/docs/api/options#transforms) 和 [TransformExtension](/docs/api/extensions#transformextension)。
