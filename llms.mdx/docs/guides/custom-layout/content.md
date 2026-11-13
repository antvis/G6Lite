# 自定义布局 (/docs/guides/custom-layout)





需要按业务规则安排节点时，可以注册 `LayoutExtension`。它接收图数据，返回节点坐标。本例把节点等距排成一行。内置算法见[布局总览](/docs/guides/layout-overview)。

## 实现与执行 [#实现与执行]

`execute()` 接收本次图数据和运行参数。节点的 ID 和业务数据原样返回，位置用计算出的 `x`、`y`。示例从 `options.gap` 读取间距。



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

**完整运行代码**

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



初始的六个节点排成一行。点 **Layout again** 可以重新计算。点 **Slow layout** 后再点 **Cancel + grid**，可以取消计算并切换到网格。

## 取消与资源 [#取消与资源]

本例等待函数在取消时清理 timer，并在正常结束时移除 abort 监听；循环每步检查 signal / isDestroyed。真实耗时计算也要分块让出主线程，否则点击取消无法被处理。

Graph 在成功、失败或取消后调用 destroy。init 可能未完成，因此清理应支持部分初始化。错误可能被布局回退吸收，不能只凭 await 正常返回判定结果已应用；按钮用自己的代次检查保护状态提示与适配。

## Graph 与独立计算 [#graph-与独立计算]

Graph.render / layout / setData 路径执行 init → execute → destroy；独立 runLayout 不调用 init，仍执行 execute / destroy。本例配置只依赖 runtime.options，因此两条路径均可用。

```ts
import { runLayout, type GraphData } from '@antv/g6-lite';
export async function calculate(data: GraphData) {
  // 需先注册上述 docs-column；结果只是坐标，不会创建或更新 Graph。
  return runLayout(data, { type: 'docs-column', gap: 100 }, { width: 640, height: 320 });
}
```

独立计算的结果展示方式见[runLayout 示例](/docs/api/graph#graph-layout-runlayout)。Graph 中无需从 execute 调用 requestRender，结果由 Graph 写回；context.data 可能是旧图，不能作为本次布局输入。

## 常见问题 [#常见问题]

### worker: true 会把自定义布局移到 Worker 吗？ [#worker-true-会把自定义布局移到-worker-吗]

不会自动搬迁注册扩展代码；当前扩展路径优先在主线程。需要自己的 Worker 时管理消息、取消与释放，见[Worker 指南](/docs/guides/layout-worker)。

### 为什么取消后 Promise 仍正常结束？ [#为什么取消后-promise-仍正常结束]

取消表示旧结果失效，不承诺抛错。保留业务代次检查，避免旧任务完成后继续更新界面。

完整 runtime 字段、回退和返回类型查[LayoutExtension](/docs/api/extensions#layoutextension)；另一个布局案例见[自定义两行布局](/docs/examples/custom-layout)。

**相关可运行示例**

* [自定义布局](/docs/examples/custom-layout)
