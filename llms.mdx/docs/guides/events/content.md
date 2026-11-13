# 事件入门 (/docs/guides/events)





图事件告诉你用户点了哪里、选择了什么，以及数据操作进行到哪一步。先用节点点击示例试用监听，再按下文的链接查看其他事件用法。

## 元素事件 [#元素事件]

### 监听节点点击 [#监听节点点击]

已有 Graph 实例时，注册一个处理函数即可，无需启用 click-select。

```ts
import type { Graph } from '@antv/g6-lite';

declare const graph: Graph;
graph.on('node:click', ({ nodeId }) => {
  console.log('点击了节点', nodeId);
});
```

监听本身不会选中节点或改变外观。点击下面的节点、边、空白，说明区会显示目标和坐标。



```ts
const onClick = (event: GraphElementEvent) => {
  latest = [
    `${event.targetType}: ${event.targetId ?? 'empty'}`,
    `client (${point(event.client)})`,
    `canvas (${point(event.canvas)})`,
    `graph (${point(event.graph)})`,
  ].join(' | ');
  update();
};
const clickEvents = ['node:click', 'edge:click', 'canvas:click'] as const;
for (const event of clickEvents) graph.on(event, onClick);
```

**完整运行代码**

```ts
import { Graph, type GraphElementEvent, type GraphEventMap } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 160, y: 0 }, { id: 'C', x: 320, y: 0 }],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }],
    },
    node: { style: { size: 32, label: (node) => node.id, labelOffsetY: 8 } },
    edge: { style: { hitAreaWidth: 12 } },
    behaviors: [],
    autoFit: { padding: 60, maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;bottom:12px;left:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.6 system-ui;white-space:pre-line;pointer-events:none;z-index:20;';
  let latest = 'Click a node, edge, or empty canvas';
  let onceResult = 'once: not armed';
  const update = () => { status.textContent = `${latest}\n${onceResult}`; };
  const point = ({ x, y }: { x: number; y: number }) => `${Math.round(x)}, ${Math.round(y)}`;
  // #region listeners
  const onClick = (event: GraphElementEvent) => {
    latest = [
      `${event.targetType}: ${event.targetId ?? 'empty'}`,
      `client (${point(event.client)})`,
      `canvas (${point(event.canvas)})`,
      `graph (${point(event.graph)})`,
    ].join(' | ');
    update();
  };
  const clickEvents = ['node:click', 'edge:click', 'canvas:click'] as const;
  for (const event of clickEvents) graph.on(event, onClick);
  // #endregion listeners
  const onOnce = ({ nodeId }: GraphEventMap['node:click'][0]) => {
    onceResult = `once: ${nodeId} (consumed)`;
    update();
  };
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    for (const event of clickEvents) graph.off(event, onClick);
    graph.off('node:click', onOnce);
    ui.destroy();
    status.remove();
    destroy();
  };
  try {
    await graph.render();
    update();
    ui.gui.add({ listening: true }, 'listening').name('Listening').onChange((listening: boolean) => {
      for (const event of clickEvents) {
        if (listening) graph.on(event, onClick);
        else graph.off(event, onClick);
      }
    });
    ui.addAction('Arm once', () => {
      graph.off('node:click', onOnce);
      graph.once('node:click', onOnce);
      onceResult = 'once: waiting for a node click';
      update();
    });
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



### 读取数据与位置 [#读取数据与位置]

* data 是节点或边携带的业务数据，可为空。
* client 是相对浏览器视口的位置，适合放置菜单。
* canvas 是相对画布左上角的 CSS 像素。
* graph 是图坐标，适合创建或移动图内元素。

点击边时读取 edgeId / source / target，点击分组背景时读取 comboId。完整字段及其他鼠标事件查[元素事件](/docs/api/graph/events#event-element)。

### 监听分组悬停 [#监听分组悬停]

用 `combo:pointerover` 打开分组提示，用 `combo:pointerleave` 关闭。指针从分组背景移到内部节点时，也会触发离开事件。见[Combo 事件](/docs/api/graph/events#event-element-combo)。

## 取消监听 [#取消监听]

保存注册时的函数，离开页面或替换订阅时，用同一个函数取消。不要创建一个相似的箭头函数交给 off。

```ts
import type { Graph } from '@antv/g6-lite';

export function observeClicks(graph: Graph, onClick: () => void) {
  graph.on('node:click', onClick);
  return () => graph.off('node:click', onClick);
}
```

只需要下一次事件时使用 once。上面的 Arm once 按钮注册下一次节点点击；Listening 关闭的是持续监听，两者彼此独立。完整参数查 [on / off / once](/docs/api/graph#on)。

## 选择与拖拽事件 [#选择与拖拽事件]

同步“哪些节点被选中”，监听选择结果；保存“节点移到了哪里”，监听拖拽结束。先启用对应 Behavior，再连接业务 UI。

试用画布并查看同步选择、保存位置的代码。 [选择与拖动](/docs/guides/events/selection-drag)

## 生命周期与数据事件 [#生命周期与数据事件]

首次渲染、局部修改、整体替换与重排触发的事件不同。afterrender 不会在每次数据更新后重复触发。

查看[渲染、布局与数据更新](/docs/guides/events/lifecycle)，了解何时可以更新图、读取布局坐标或处理数据替换。

## 常见问题 [#常见问题]

### 为什么 nativeEvent 是 undefined？ [#为什么-nativeevent-是-undefined]

元素点击、悬停和滚轮有 nativeEvent；选择与部分拖拽事件使用 event，拖拽结束与区域选择可能没有原始事件字段。按[事件参考](/docs/api/graph/events)查询对应载荷。

### 为什么布局结束时读到的坐标还是旧的？ [#为什么布局结束时读到的坐标还是旧的]

layout:end / afterlayout 在写回前通知。等待 await graph.layout() 后查询，见[生命周期指南](/docs/guides/events/lifecycle)。

### 为什么监听有时重复执行，有时完全不触发？ [#为什么监听有时重复执行有时完全不触发]

检查是否重复注册、off 是否使用原函数、once 是否已消费，以及对应 Behavior 是否启用。

## 自定义事件 [#自定义事件类型]

用 `graph.emit()` 发送业务事件，例如工具栏按钮发出的重置视图通知。 [查看自定义事件示例](/docs/guides/events/custom)

继续查阅 [事件 API 参考](/docs/api/graph/events) · [交互组合](/docs/guides/behaviors) · [事件面板](/docs/examples/event-log)。

**相关可运行示例**

* [事件面板](/docs/examples/event-log)
* [右键菜单](/docs/examples/context-menu)
