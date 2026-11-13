# 事件 (/docs/api/graph/events)



<span id="on" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="off" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="once" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="代码与对应效果" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="grapheventmap" style="{ display: 'block', scrollMarginTop: '8rem' }" />

用 `graph.on()` 监听事件。其他监听方法见[图 API](/docs/api/graph#graph-events)，交互示例见[事件入门](/docs/guides/events)。

<span id="元素事件清单" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## 元素事件 [#event-element]

### 点击与指针事件 [#event-pointer]

| 操作                                   | <span id="event-element-节点" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />节点                  | <span id="event-element-边" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />边                    | <span id="event-element-combo" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />Combo              | <span id="画布" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />画布                                  |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 单击目标。                                | <span id="nodeclick" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`node:click`               | <span id="edgeclick" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`edge:click`               | <span id="comboclick" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`combo:click`               | <span id="canvasclick" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`canvas:click`             |
| 双击目标。                                | <span id="nodedblclick" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`node:dblclick`         | <span id="edgedblclick" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`edge:dblclick`         | <span id="combodblclick" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`combo:dblclick`         | <span id="canvasdblclick" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`canvas:dblclick`       |
| 右键点击目标，浏览器默认菜单会被阻止。                  | <span id="nodecontextmenu" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`node:contextmenu`   | <span id="edgecontextmenu" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`edge:contextmenu`   | <span id="combocontextmenu" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`combo:contextmenu`   | <span id="canvascontextmenu" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`canvas:contextmenu` |
| 在目标上按下鼠标。                            | <span id="nodepointerdown" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`node:pointerdown`   | <span id="edgepointerdown" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`edge:pointerdown`   | <span id="combopointerdown" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`combo:pointerdown`   | <span id="canvaspointerdown" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`canvas:pointerdown` |
| 在窗口松开鼠标，统一由画布通知。                     | —                                                                                                              | —                                                                                                              | —                                                                                                                | <span id="canvaspointerup" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`canvas:pointerup`     |
| 移入目标。                                | <span id="nodepointerover" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`node:pointerover`   | <span id="edgepointerover" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`edge:pointerover`   | <span id="combopointerover" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`combo:pointerover`   | —                                                                                                                |
| 紧随 `pointerover` 触发。                 | <span id="nodepointerenter" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`node:pointerenter` | <span id="edgepointerenter" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`edge:pointerenter` | <span id="combopointerenter" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`combo:pointerenter` | —                                                                                                                |
| 在目标上移动指针。                            | <span id="nodepointermove" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`node:pointermove`   | <span id="edgepointermove" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`edge:pointermove`   | <span id="combopointermove" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`combo:pointermove`   | <span id="canvaspointermove" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`canvas:pointermove` |
| 离开目标。坐标为离开时的指针位置。                    | <span id="nodepointerleave" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`node:pointerleave` | <span id="edgepointerleave" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`edge:pointerleave` | <span id="combopointerleave" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`combo:pointerleave` | —                                                                                                                |
| 在目标上滚动鼠标滚轮，可读取 `nativeEvent.deltaY`。 | <span id="nodewheel" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`node:wheel`               | <span id="edgewheel" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`edge:wheel`               | —                                                                                                                | <span id="canvaswheel" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`canvas:wheel`             |

<span id="元素事件载荷" style="{ display: 'block', scrollMarginTop: '8rem' }" />

#### 回调参数 [#读取事件参数]

| 字段                              | 含义                                             |
| ------------------------------- | ---------------------------------------------- |
| `targetType` / `targetId`       | 目标类型和元素 ID。`targetId` 仅用于节点、边和 Combo。          |
| `nodeId` / `edgeId` / `comboId` | 对应元素的 ID。边还提供 `edgeIndex`、`source` 和 `target`。 |
| `data`                          | 节点或边携带的可选业务数据。                                 |
| `client`                        | 相对浏览器视口的 CSS 像素坐标。                             |
| `canvas`                        | 相对画布左上角的 CSS 像素坐标。                             |
| `graph`                         | 图坐标，用于图内定位。                                    |
| `nativeEvent`                   | 鼠标事件为 `MouseEvent`，滚轮事件为 `WheelEvent`。         |

<span id="监听节点点击" style="{ display: 'block', scrollMarginTop: '8rem' }" />

点击节点时，读取目标、业务数据和三种坐标，并从原始鼠标事件判断是否按住 Shift。

```ts
graph.on('node:click', (event) => {
  console.log({
    target: { type: event.targetType, id: event.targetId },
    data: event.data,
    client: event.client,
    canvas: event.canvas,
    graph: event.graph,
    shiftKey: event.nativeEvent.shiftKey,
  });
});
```

#### 命中与手势 [#命中与手势]

命中顺序为节点 → 边 → Combo → 画布。指针换目标时先发旧目标的 `pointerleave`，再发新目标的 `pointerover` → `pointerenter` → `pointermove`。Combo 背景上还会触发 `canvas:pointermove`，滚轮由 `canvas:wheel` 通知。拖拽可能抑制后续单击。

<span id="选择事件" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### 选择事件 [#event-selection]

启用 `click-select`、`brush-select` 或 `lasso-select` 后可监听对应事件。事件在选中状态写回后触发。

| 操作               | 节点                                                                                                             | 边                                                                                                              | 整体选择                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 切换选中状态。          | <span id="nodeselectchange" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`node:selectchange` | <span id="edgeselectchange" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`edge:selectchange` | —                                                                                                          |
| 清空非空选择。          | —                                                                                                              | —                                                                                                              | <span id="selectionclear" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`selection:clear` |
| 框选中命中节点，按节流频率触发。 | <span id="brushselect" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`brush:select`           | —                                                                                                              | —                                                                                                          |
| 框选结束，结果可为空。      | <span id="brushend" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`brush:end`                 | —                                                                                                              | —                                                                                                          |
| 套索中命中节点。         | <span id="lassoselect" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`lasso:select`           | —                                                                                                              | —                                                                                                          |
| 套索结束，结果可为空。      | <span id="lassoend" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`lasso:end`                 | —                                                                                                              | —                                                                                                          |

#### 回调参数 [#selection-callback-fields]

| 字段                  | 含义                                                 |
| ------------------- | -------------------------------------------------- |
| `nodeId` / `edgeId` | 切换选中状态的元素 ID。边还提供 `edgeIndex`、`source` 和 `target`。 |
| `selected`          | 切换后的选中状态。                                          |
| `ids`               | `selection:clear` 清除的元素 ID，可同时包含节点和边。              |
| `nodeIds`           | 框选和套索事件返回的节点 ID。`brush:end` 返回框选结束时当前选中的节点。        |
| `event`             | 切换或清空选择时的原始 `MouseEvent`。                          |

<span id="读取最终选择" style="{ display: 'block', scrollMarginTop: '8rem' }" />

启用 `brush-select` 后，监听 `brush:end` 读取框选结束时选中的节点。

```ts
graph.on('brush:end', ({ nodeIds }) => {
  console.log('选中的节点', nodeIds);
});
```

套索事件返回本次套索命中的节点。用 `findNodesByState('selected')` 和 `findEdgesByState('selected')` 查询全图选择。 [选择与拖拽指南](/docs/guides/events/selection-drag)

<span id="拖拽事件" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### 拖拽事件 [#event-drag]

节点和 Combo 拖拽由 `drag-node` 提供，边端点拖拽由 `drag-edge` 提供。

| 操作                                         | 节点                                                                                                       | 边                                                                                                        | Combo                                                                                                      |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 开始拖拽。节点或 Combo 移动超过 3 CSS 像素时触发，边在按下左键时触发。 | <span id="nodedragstart" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`node:dragstart` | <span id="edgedragstart" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`edge:dragstart` | <span id="combodragstart" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`combo:dragstart` |
| 拖拽中。节点或 Combo 成员的位置写回后触发。                  | <span id="nodedrag" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`node:drag`           | <span id="edgedrag" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`edge:drag`           | <span id="combodrag" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`combo:drag`           |
| 松开鼠标，结束拖拽。                                 | <span id="nodedragend" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`node:dragend`     | <span id="edgedragend" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`edge:dragend`     | <span id="combodragend" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`combo:dragend`     |

#### 回调参数 [#edge-drag-payload]

| 字段                                  | 含义                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| `nodeId` / `nodeIds`                | 节点拖拽事件中的第一个节点 ID 和全部被拖动的节点 ID。                                                        |
| `comboId`                           | Combo 拖拽事件中被拖动的 Combo ID。                                                             |
| `dx` / `dy`                         | `node:drag` 和 `combo:drag` 中从起点累计的图坐标位移。                                              |
| `edgeId` / `edgeIndex`              | 边拖拽事件中的边 ID 和索引，`edgeId` 为可选字段。                                                       |
| `source` / `target`                 | 边拖拽的两端节点 ID。`edge:dragend` 有效落点时返回建议端点，由应用验证后写回。                                      |
| `dragEnd`                           | `edge:dragstart` 和 `edge:drag` 中被拖动的端点（`source` 或 `target`）。取离按下点较近的端点，等距时取 `target`。 |
| `originalSource` / `originalTarget` | `edge:dragend` 中拖拽前的端点 ID。                                                            |
| `reconnected` / `newEndpoint`       | `edge:dragend` 中是否命中有效落点，以及该节点的 ID（如有）。                                               |
| `event`                             | 原始 `MouseEvent`。节点和 Combo 的 `dragend` 只提供拖拽结果。                                        |

<span id="保存节点位置" style="{ display: 'block', scrollMarginTop: '8rem' }" />

拖拽结束时，用 `nodeIds` 查询全部被拖动节点的位置。

```ts
graph.on('node:dragend', ({ nodeIds }) => {
  const positions = nodeIds.map((id) => graph.getElementPosition(id));
  console.log(positions);
});
```

<span id="生命周期与数据事件" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## 生命周期与数据事件 [#event-lifecycle]

用这些事件跟踪图的布局、绘制和数据变化。[渲染、布局与数据更新](/docs/guides/events/lifecycle)

### 布局与渲染 [#event-rendering]

| 事件                                                                                                          | 触发时机                                                      | 回调参数                                    |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------- |
| <span id="beforelayout" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`beforelayout`       | 有布局配置且节点非空时，在计算前触发。                                       | `nodeCount: number`                     |
| <span id="layoutstart" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`layout:start`        | 紧随 `beforelayout`，仍在计算前。                                  | `nodeCount: number`                     |
| <span id="layoutend" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`layout:end`            | 有效计算结束，坐标尚未写回。`duration` 单位为毫秒。                           | `duration: number`、`nodeCount: number`  |
| <span id="afterlayout" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`afterlayout`         | 紧随 `layout:end`。读取最终位置请等待 `await graph.layout()`。         | `duration: number`、`nodeCount: number`  |
| <span id="beforerender" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`beforerender`       | 显式 `render()` 中，适配视口和绘制之前。                                | `nodeCount: number`、`edgeCount: number` |
| <span id="afterrender" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`afterrender`         | 显式 `render()` 的同步绘制之后。首次修改数据前，先等待 `await graph.render()`。 | `nodeCount: number`、`edgeCount: number` |
| <span id="resize" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`resize`                   | 调整画布尺寸并完成可选的视口适配后。尺寸单位为 CSS 像素。                           | `width: number`、`height: number`        |
| <span id="event-lifecycle-destroy" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`destroy` | 首次销毁实例时，先于画布和监听清理。                                        | 无参数                                     |

<span id="顺序与完成边界" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="graph-events-顺序与完成边界" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="event-lifecycle-顺序与完成边界" style="{ display: 'block', scrollMarginTop: '8rem' }" />

实际计算布局时，`render()`、`layout()` 和 `setData()` 都会触发布局事件。取消布局时可能收不到结束事件。

<span id="接收首次渲染事件" style="{ display: 'block', scrollMarginTop: '8rem' }" />

在首次 `render()` 前监听一次 `afterrender`，再用 `datachange` 读取每次替换数据后的节点数和边数。

```ts
graph.once('afterrender', ({ nodeCount, edgeCount }) => {
  console.log('首次绘制', nodeCount, edgeCount);
});
await graph.render();

graph.on('datachange', ({ nodeCount, edgeCount }) => {
  console.log('数据已替换', nodeCount, edgeCount);
});
await graph.setData({
  nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 120, y: 0 }],
  edges: [{ source: 'A', target: 'B' }],
});
```

### 数据更新与分组 [#event-data]

<span id="事件与缺失-id" style="{ display: 'block', scrollMarginTop: '8rem' }" />

| 事件                                                                                                          | 触发时机                                                          | 回调参数                                                                                        |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| <span id="datachange" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`datachange`           | `setData()` 写回整份数据后。                                          | `nodeCount: number`、`edgeCount: number`                                                     |
| <span id="afteradditem" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`afteradditem`       | 添加节点或边后按项触发。                                                  | `type: 'node'`、`id: string` 或 `type: 'edge'`、`id: string`、`source: string`、`target: string` |
| <span id="afterremoveitem" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`afterremoveitem` | 删除节点或边时按传入 ID 触发，包括缺失 ID。节点的关联边不另发事件。                         | `type`（`node` / `edge`）、`id: string`                                                        |
| <span id="afterupdateitem" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`afterupdateitem` | 更新节点坐标、节点数据或边数据后按项触发。`updateNodePosition()` 传入缺失节点或相同坐标时也会触发。 | `type`（`node` / `edge`）、`id: string`、`action`（节点为 `position` 或 `data`，边为 `data`）            |
| <span id="combocollapse" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`combo:collapse`    | Combo 折叠状态改变后。                                                | `comboId: string`                                                                           |
| <span id="comboexpand" style="{ display: 'inline-block', scrollMarginTop: '8rem' }" />`combo:expand`        | Combo 展开状态改变后。                                                | `comboId: string`                                                                           |

## EventEmitter [#eventemitter]

用 `EventEmitter` 在界面组件之间传递自定义事件。下面把已渲染的图、工具栏的「重置视图」按钮和状态栏传给 `bindResetView()`。点击按钮时，图恢复初始视图，状态栏显示提示。页面卸载时调用返回的清理函数。

```ts
import { EventEmitter, type Graph } from '@antv/g6-lite';

export function bindResetView(graph: Graph, button: HTMLButtonElement, status: HTMLElement) {
  const events = new EventEmitter();
  const resetCamera = () => graph.resetCamera();
  const showStatus = () => {
    status.textContent = '视图已重置';
  };
  const onClick = () => events.emit('view:reset');

  events.on('view:reset', resetCamera);
  events.on('view:reset', showStatus);
  button.addEventListener('click', onClick);

  return () => {
    button.removeEventListener('click', onClick);
    events.off('view:reset', resetCamera);
    events.off('view:reset', showStatus);
  };
}
```
