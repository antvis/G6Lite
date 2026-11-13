# 视口与坐标 (/docs/guides/viewport)





视口是当前看见图的区域。移动视口、拉近或拉远，改变的是看图方式；节点之间的连接和节点本身的图坐标保持不变。

## 图的位置与当前视野 [#图的位置与当前视野]

节点的 x / y 表示它在图中的位置，可以由数据提供或由布局计算。相机的 x / y / zoom 表示当前平移和缩放。拖动节点会改节点位置；拖动画布会改相机。

因此，“重新布局”与“适配画布”是两步：layout 计算节点位置，fitView 调整相机，让内容进入视口。

## 选择适配时机 [#选择适配时机]

| 任务           | 做法                                  |
| ------------ | ----------------------------------- |
| 展示完整内容       | fitView，按需指定留白和缩放限制                 |
| 只把内容移到中央     | fitCenter，保留当前缩放                    |
| 从列表定位节点      | focusItem(id)，必要时缩小以容纳目标            |
| 刷新数据但保留用户视野  | `setData(next, { fitView: false })` |
| 容器变窄后仍展示完整内容 | 初始化时配置 autoFit                      |

首次 await graph.render() 会做初始适配，即使 autoFit 为 false。运行中的数据替换、布局重排和容器变化各有独立策略；不用再次 render 来“刷新视口”。

用下面的按钮比较居中和适配。先放大或平移，再点 Center 或 Fit。Center 保留缩放，Fit 同时调整平移和缩放。Reset camera 恢复首次渲染时的相机。



```ts
const zoom = () => graph.zoomBy(1.5, { maxZoom: 4 });
const pan = () => {
  const camera = graph.getCamera();
  graph.setCamera({ x: camera.x + 80 });
};
const center = () => graph.fitCenter();
const fit = () => graph.fitView({ padding: [70, 50, 110, 50], maxZoom: 1 });
const reset = () => graph.resetCamera();
```

**完整运行代码**

```ts
import { Graph, type Camera } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 240, y: 80 }],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }],
    },
    node: { style: { size: 32, label: (node) => node.id === 'A' ? 'A (0, 0)' : 'B (240, 80)', labelOffsetY: 10 } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: [70, 50, 110, 50], maxZoom: 1 },
  });
  // #region camera
  const zoom = () => graph.zoomBy(1.5, { maxZoom: 4 });
  const pan = () => {
    const camera = graph.getCamera();
    graph.setCamera({ x: camera.x + 80 });
  };
  const center = () => graph.fitCenter();
  const fit = () => graph.fitView({ padding: [70, 50, 110, 50], maxZoom: 1 });
  const reset = () => graph.resetCamera();
  // #endregion camera
  let saved: Camera;
  // #region saved-view
  const save = () => { saved = graph.getCamera(); };
  const restore = () => graph.setCamera(saved);
  const focus = () => graph.focusItem('B', 32);
  // #endregion saved-view
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.5 system-ui;white-space:pre-line;pointer-events:none;z-index:20;';
  const point = ({ x, y }: { x: number; y: number }) => `${Math.round(x * 10) / 10}, ${Math.round(y * 10) / 10}`;
  let frame = 0;
  let disposed = false;
  const update = () => {
    const camera = graph.getCamera();
    // #region coordinates
    const rect = container.getBoundingClientRect();
    const client = graph.graphToScreen(0, 0);
    const canvas = { x: client.x - rect.left, y: client.y - rect.top };
    const back = graph.screenToGraph(client.x, client.y);
    // #endregion coordinates
    status.textContent = [
      `A graph (0, 0) | camera (${point(camera)}) | zoom ${camera.zoom.toFixed(2)}`,
      `A canvas (${point(canvas)}) | A client (${point(client)})`,
      `screenToGraph(A client) = (${point(back)})`,
    ].join('\n');
  };
  const schedule = () => {
    if (disposed || frame) return;
    frame = requestAnimationFrame(() => { frame = 0; if (!disposed) update(); });
  };
  const actions: Array<[string, () => void]> = [
    ['Zoom ×1.5', zoom], ['Pan right', pan], ['Center', center], ['Fit', fit], ['Reset camera', reset],
    ['Save view', save], ['Restore view', restore], ['Focus B', focus],
  ];
  const events = ['node:pointermove', 'edge:pointermove', 'canvas:pointermove', 'canvas:pointerup', 'resize'] as const;
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    disposed = true;
    cancelAnimationFrame(frame);
    for (const event of events) graph.off(event, schedule);
    window.removeEventListener('click', schedule);
    window.removeEventListener('wheel', schedule);
    window.removeEventListener('scroll', schedule, true);
    ui.destroy();
    status.remove();
    destroy();
  };
  try {
    await graph.render();
    if (graph.destroyed) return graph;
    save();
    for (const event of events) graph.on(event, schedule);
    // Refresh after interaction and page scrolling, including the shared toolbar.
    window.addEventListener('click', schedule);
    window.addEventListener('wheel', schedule, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true, capture: true });
    for (const [label, action] of actions) {
      ui.addAction(label, () => { action(); schedule(); });
    }
    container.append(status);
    update();
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



[fitView 参数](/docs/api/graph#graph-viewport-fitview) · [fitCenter 参数](/docs/api/graph#fitcenter)

### 适配后为什么图仍然很小？ [#适配后为什么图仍然很小]

先检查数据里是否有远离主体的节点、延伸很远的边或 Combo；再检查留白和 maxZoom。示例把 maxZoom 设为 1，避免少量节点被无限放大。fitCenter 只居中，不会放大；主动拉近用 zoomTo 或 zoomBy。

## 刷新数据，保留或重新适配 [#刷新数据保留或重新适配]

先用工具栏放大或拖动空白处，再点 Reload + keep view：B 从 x=240 移到 x=800，相机不变，B 可能离开视口。点工具栏“重置示例”，再用 Reload + fit 对比：更新后的内容会重新进入视口。



```ts
await graph.setData(data(next), {
  fitView: keepView ? false : fit,
});
```

**完整运行代码**

```ts
import { Graph, type FitViewOptions, type GraphData } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  const fit: FitViewOptions = { padding: [76, 48, 100, 48], maxZoom: 1 };
  const data = (wide: boolean): GraphData => ({
    nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: wide ? 800 : 240, y: 0 }],
    edges: [{ id: 'A-B', source: 'A', target: 'B' }],
  });
  const graph = new Graph({
    container, data: data(false), autoFit: false,
    node: { style: { size: 32, label: (node) => node.id, labelOffsetY: 10 } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
  });
  let wide = false;
  let disposed = false;
  let frame = 0;
  let lastAction = 'Initial view';
  const reload = async (keepView: boolean) => {
    const before = graph.getCamera();
    const next = !wide;
    // #region preserve-view
    await graph.setData(data(next), {
      fitView: keepView ? false : fit,
    });
    // #endregion preserve-view
    if (graph.destroyed) return;
    wide = next;
    const after = graph.getCamera();
    const unchanged = before.x === after.x && before.y === after.y && before.zoom === after.zoom;
    lastAction = `Last reload (${keepView ? 'keep view' : 'refit'}): camera ${unchanged ? 'unchanged' : 'changed'}`;
  };
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.5 system-ui;white-space:pre-line;pointer-events:none;z-index:20;';
  const update = () => {
    const camera = graph.getCamera();
    status.textContent = `A (0, 0), B (${wide ? 800 : 240}, 0) | ${lastAction}\ncamera (${camera.x.toFixed(1)}, ${camera.y.toFixed(1)}) | zoom ${camera.zoom.toFixed(2)}`;
  };
  const schedule = () => {
    if (disposed || frame) return;
    frame = requestAnimationFrame(() => { frame = 0; if (!disposed) update(); });
  };
  const actions: Array<[string, () => void | Promise<void>]> = [
    ['Reload + keep view', () => reload(true)],
    ['Reload + fit', () => reload(false)],
    ['Focus A', () => { graph.focusItem('A'); lastAction = 'Focused A'; }],
  ];
  const events = ['node:pointermove', 'edge:pointermove', 'canvas:pointermove', 'canvas:pointerup', 'resize'] as const;
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    disposed = true;
    cancelAnimationFrame(frame);
    for (const event of events) graph.off(event, schedule);
    window.removeEventListener('click', schedule);
    window.removeEventListener('wheel', schedule);
    ui.destroy(); status.remove();
    destroy();
  };
  try {
    await graph.render();
    if (graph.destroyed) return graph;
    graph.fitView(fit);
    for (const event of events) graph.on(event, schedule);
    window.addEventListener('click', schedule);
    window.addEventListener('wheel', schedule, { passive: true });
    const buttons = actions.map(([label, action]) => ui.addAction(label, async () => {
        for (const item of buttons) item.disable();
        try {
          await action();
          if (!disposed) update();
        } catch {
          if (!disposed) { lastAction = 'Update failed'; update(); }
        } finally {
          if (!disposed) for (const item of buttons) item.enable();
        }
    }));
    container.append(status);
    update();
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



保留视野只需 fitView: false，不必保存后再写回相机。新数据里的坐标、布局和状态仍按数据更新；保留相机不保证某个节点停在原来的屏幕位置。选择状态的保留另见[状态使用](/docs/guides/states#替换数据时保留选择)。

省略 setData 的第二个参数会使用 fitView(0.9)，不会继承初始化 autoFit 的留白。刷新后需要同一留白时，像示例一样给本次 setData 传入适配对象。

**异步刷新和保存视野**

示例在更新期间禁用按钮。应用有并发请求时，用请求序号或取消机制确保只应用最新结果；异步返回后检查 graph.destroyed。

跨页面恢复时，可以保存 getCamera() 返回的快照，在新实例 await render() 后调用 setCamera(saved)。相机只记录平移和缩放；恢复到不同尺寸的容器、不同坐标的图时，不保证呈现同一范围。不要紧接着调用 fitView，否则会覆盖恢复结果。

## 容器变化与布局完成后怎么办 [#容器变化与布局完成后怎么办]

分栏调整后要继续看全图，在初始化时配置 autoFit；用户正在探索时要保留缩放和平移，则保持 false（默认）。Graph 会通过 ResizeObserver 同步容器尺寸，两种情况下都不需要重建实例。

先放大，再切换下面的 Width 65% / 100%。示例只改容器 CSS 宽度，观察 resize 后的最终缩放和相机；完整代码中包含尺寸监听与清理。



```ts
autoFit: { padding: [84, 40, 100, 40], maxZoom: 1 },
```

**完整运行代码**

```ts
import { Graph } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  const originalWidth = container.style.width;
  const originalOutline = container.style.outline;
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 800, y: 0 }],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }],
    },
    node: { style: { size: 32, label: (node) => node.id, labelOffsetY: 10 } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    // #region auto-fit
    autoFit: { padding: [84, 40, 100, 40], maxZoom: 1 },
    // #endregion auto-fit
  });
  // ResizeObserver detects these CSS width changes; no setSize or render call.
  const narrow = () => { container.style.width = '65%'; };
  const wide = () => { container.style.width = '100%'; };
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.5 system-ui;white-space:pre-line;pointer-events:none;z-index:20;';
  let resizeCount = 0;
  let frame = 0;
  let disposed = false;
  const update = () => {
    const camera = graph.getCamera();
    status.textContent = `container ${Math.round(container.getBoundingClientRect().width)} CSS px | resize events: ${resizeCount}\nzoom ${graph.getZoom().toFixed(2)} | camera (${camera.x.toFixed(1)}, ${camera.y.toFixed(1)})`;
  };
  const schedule = () => {
    if (disposed || frame) return;
    frame = requestAnimationFrame(() => { frame = 0; if (!disposed) update(); });
  };
  const resized = () => { resizeCount++; update(); };
  const actions: Array<[string, () => void]> = [
    ['Width 65%', narrow], ['Width 100%', wide],
    ['Zoom ×1.5', () => graph.zoomBy(1.5)],
  ];
  const events = ['node:pointermove', 'edge:pointermove', 'canvas:pointermove', 'canvas:pointerup'] as const;
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    disposed = true;
    cancelAnimationFrame(frame);
    graph.off('resize', resized);
    for (const event of events) graph.off(event, schedule);
    window.removeEventListener('click', schedule);
    window.removeEventListener('wheel', schedule);
    ui.destroy(); status.remove();
    destroy();
    container.style.width = originalWidth;
    container.style.outline = originalOutline;
  };
  try {
    await graph.render();
    if (graph.destroyed) return graph;
    graph.on('resize', resized);
    for (const event of events) graph.on(event, schedule);
    window.addEventListener('click', schedule);
    window.addEventListener('wheel', schedule, { passive: true });
    container.style.outline = '1px dashed #cbd5e1';
    for (const [label, action] of actions) {
      ui.addAction(label, () => { action(); schedule(); });
    }
    container.append(status);
    update();
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



容器需要有非零宽高。从隐藏页签切换到可见时，若要重设视野，在容器获得最终尺寸后显式 fitView。resize 事件在可选的自动适配后发出。

await graph.layout() 完成后，按任务选择 `graph.fitView({ padding: 32, maxZoom: 1 })` 或保留当前相机。布局只计算节点位置，适配需要显式调用；异步取消规则见[布局方法](/docs/api/graph#graph-layout)。

## 转换坐标，定位 DOM 内容 [#转换坐标定位-dom-内容]

图坐标和浏览器坐标用 screenToGraph / graphToScreen 转换。上方画布里的 A 可以用来观察这三种坐标。缩放或平移会改变画布位置，滚动页面会改变浏览器位置。

| 坐标     | 参考位置            | 常见用途                                 |
| ------ | --------------- | ------------------------------------ |
| graph  | 图自身的坐标系         | 存储节点位置、布局、在图中添加元素                    |
| canvas | 画布左上角，CSS 像素    | 在画布容器内定位辅助内容                         |
| client | 浏览器视口左上角，CSS 像素 | 与鼠标 clientX / clientY 对应，放置 fixed 菜单 |

DOM 鼠标事件用 clientX / clientY 转换；元素事件已经提供 event.graph、event.canvas 和 event.client，可以直接读取。固定定位的菜单使用 client；挂在无边框、无内边距画布容器内的绝对定位内容，使用相对该容器的 CSS 坐标。

```ts
import type { Graph } from '@antv/g6-lite';

export function pointAtMouse(graph: Graph, event: MouseEvent) {
  return graph.screenToGraph(event.clientX, event.clientY);
}

// marker 挂在 document.body，point 是图坐标
export function placeMarker(graph: Graph, marker: HTMLElement, point: { x: number; y: number }) {
  const client = graph.graphToScreen(point.x, point.y);
  Object.assign(marker.style, {
    position: 'fixed', left: `${client.x}px`, top: `${client.y}px`,
  });
}
```

缩放、平移或滚动页面后，重新投影锚点；不需要跟随时直接关闭菜单。不要额外乘 DPR，screenToGraph 也不接收 offsetX / offsetY 或 screenX / screenY。

## 常见问题 [#常见问题]

### 平移或缩放后，要保存新的节点坐标吗？ [#平移或缩放后要保存新的节点坐标吗]

这些操作没有移动节点。保存用户视野时读取 getCamera；保存节点布局时读取元素位置，二者分开处理。

### 菜单为什么越缩放越偏？ [#菜单为什么越缩放越偏]

检查是否把 graph 坐标直接当 CSS 位置，或把 canvas 坐标当成 client。先确定菜单挂在哪个容器，再使用相应坐标。

### 居中后为什么内容仍显示不全？ [#居中后为什么内容仍显示不全]

fitCenter 只调整位置；需要同时调整缩放时使用 fitView，并检查留白和缩放限制。

### 关了 autoFit，刷新后为什么还会跳？ [#关了-autofit刷新后为什么还会跳]

检查 setData 是否传了 fitView: false，以及业务代码是否又调用 fitView。autoFit 关闭的是容器变化后的自动适配，不能关闭数据替换自己的适配策略。

### 手动缩放范围和滚轮范围为什么不同？ [#手动缩放范围和滚轮范围为什么不同]

zoomTo / zoomBy 的 minZoom、maxZoom 只约束本次方法调用；滚轮范围配置在 zoom-canvas Behavior，fitView 的范围又是独立的。需要一致时分别设置，见[滚轮缩放配置](/docs/api/options#导航与拖拽)。

继续查询：[视口方法](/docs/api/graph#graph-viewport) · [autoFit](/docs/api/options#autofit) · [setData](/docs/api/graph#setdata) · [元素事件坐标](/docs/api/graph/events#读取事件参数)。

**相关可运行示例**

* [搜索并聚焦](/docs/examples/search-focus)
* [视口与坐标转换](/docs/examples/viewport-controls)
* [缩放范围与灵敏度](/docs/examples/zoom-options)
