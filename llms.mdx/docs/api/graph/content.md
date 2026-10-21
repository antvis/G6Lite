# Graph 类 (/docs/api/graph)



`Graph` 是业务代码操作一张图的实例。从包根导入后，先传入 [配置](/docs/api/options)，再 `await graph.render()`。

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({ container, data });
await graph.render();
```

数据写入、状态修改和 `layout()` 必须发生在首次 `render()` 成功之后。实例销毁后，这些方法直接返回。

## 生命周期 [#生命周期]

### `new Graph(options)` [#new-graphoptions]

```ts
const graph = new Graph({
  container: document.getElementById('container')!,
  data: { nodes: [{ id: 'a' }, { id: 'b' }], edges: [{ source: 'a', target: 'b' }] },
});
```

保存 `container`、`data` 和其余配置，并在容器内创建 canvas。此时还没有布局结果，也没有可查询的元素。

`container` 接受元素 id 或 `HTMLElement`。容器在构造时必须已经存在于文档中。

### `render()` [#render]

```ts
await graph.render();
```

按当前配置执行数据转换和布局，创建渲染数据，挂载交互、标签和插件，然后调用一次 `fitView()` 并绘制。完成后 `destroyed` 仍为 `false`，后续数据方法可以调用。

同一实例重复调用会取消仍在进行的布局，并按最新数据和配置重新绘制。

渲染过程会发出 `beforerender` 和 `afterrender`。

### `destroy()` [#destroy]

```ts
graph.destroy();
```

终止进行中的布局，发出 `destroy`，拆除交互、插件和渲染器，并移除 canvas。重复调用没有额外效果。`destroyed` 随后为 `true`。

### `destroyed` [#destroyed]

```ts
if (graph.destroyed) return;
```

实例是否已经销毁。

### `refresh()` [#refresh]

```ts
graph.refresh();
```

强制做一次完整样式重算和绘制。常规的数据、状态和视口修改会自己安排下一帧更新，只有外部改了引擎无法观察到的输入时才需要调用。

## 读取数据 [#读取数据]

查询返回当前图中的只读视图。修改画面请使用后面的写入方法。

```ts
const snapshot = graph.getData();
const nodes = graph.getNodes();
const node = graph.getNodeData('n1');
const neighbors = graph.getNeighborNodes('n1');
const edges = graph.getAdjacentEdges('n1');

if (graph.hasNode('n1') && node) {
  node.x;
  node.y;
  node.data;
  neighbors.length;
  edges[0]?.source;
  snapshot.nodes.length;
}
```

| 方法                         | 返回值                         | 说明                     |
| -------------------------- | --------------------------- | ---------------------- |
| `getData()`                | `GraphData`                 | 当前节点、边和 Combo 的数据快照    |
| `getNodes()`               | `readonly NodeModel[]`      | 全部节点                   |
| `getNodeData(id)`          | `NodeModel \| undefined`    | 按 id 取节点               |
| `getEdges()`               | `readonly EdgeModel[]`      | 全部边                    |
| `getEdgeData(id)`          | `EdgeModel \| undefined`    | 按 id 取边                |
| `getComboData(id)`         | `ComboModel \| undefined`   | 按 id 取 Combo           |
| `getElementData(id)`       | `ElementModel \| undefined` | 按 id 取节点、边或 Combo      |
| `getNodeCount()`           | `number`                    | 节点数量                   |
| `getEdgeCount()`           | `number`                    | 边数量                    |
| `hasNode(id)`              | `boolean`                   | 是否存在该节点                |
| `hasEdge(id)`              | `boolean`                   | 是否存在该边                 |
| `hasElement(id)`           | `boolean`                   | 是否存在该节点、边或 Combo       |
| `getElementPosition(id)`   | `{ x, y } \| null`          | 节点或 Combo 的图坐标；边没有单一位置 |
| `getNeighborNodes(nodeId)` | `string[]`                  | 相邻节点 id                |
| `getAdjacentEdges(nodeId)` | `{ id, source, target }[]`  | 与节点相连的边                |

`NodeModel` 包含 `id`、`name`、`x`、`y`、`data` 和 `states`。`EdgeModel` 包含 `id`、`source`、`target`、`data` 和 `states`。`states` 是只读集合。

首次 `render()` 之前，`getData()` 返回构造时传入的数据副本；其余查询按空图处理。

## 替换数据与样式 [#替换数据与样式]

### `setData()` [#setdata]

```ts
await graph.setData(
  {
    nodes: [{ id: 'a' }, { id: 'b' }],
    edges: [{ id: 'a-b', source: 'a', target: 'b' }],
  },
  { fitView: false },
);
```

用一份新的节点、边和 Combo 替换整张图。配置了 `layout` 时会重新布局，然后完整重绘，并发出 `datachange`。

`options.fitView` 决定替换后的视口：

* 省略或 `true`：按 `0.9` 调用 `fitView()`。
* `false`：保留当前相机。
* 数字或 `FitViewOptions`：按该参数调用 `fitView()`。

局部增删改使用下面的增量方法，避免整图重布局。

### `updateOptions()` [#updateoptions]

```ts
graph.updateOptions({
  node: { style: { fill: '#5366ad', size: 32 } },
  theme: { type: 'light' },
});
```

合并节点、边、标签和主题配置，并完整重算样式。节点和边的 `style` 对象会与原配置合并；传入函数样式时，函数整体替换旧样式。

布局、行为和插件不在这个方法的参数里。更换布局使用 `setLayout()` 加 `layout()`。

## 修改节点和边 [#修改节点和边]

这些方法都要求首次 `render()` 已经完成。批量方法只触发一次绘制。

### 节点 [#节点]

```ts
graph.addNode({ id: 'n4', x: 240, y: 80, data: { label: 'N4' } });
graph.updateNodeData('n4', { label: '已更新' });
graph.updateNodePosition('n4', 260, 100);
graph.updateNodePositions([
  { id: 'n1', x: 40, y: 40 },
  { id: 'n4', x: 280, y: 120 },
]);
graph.removeNode('n4');
```

`addNode()` 的 `id` 必须唯一，并带上图坐标。它不会重新跑布局。

`updateNodeData()` 合并业务字段。样式函数读取了这些字段时，下一帧会按新字段重算样式。

`removeNode()` 同时删除与该节点相连的边。

成功修改后会发出 `afteradditem`、`afterupdateitem` 或 `afterremoveitem`。

### 边 [#边]

```ts
const edgeId = graph.addEdge({ source: 'n1', target: 'n4', data: { weight: 1 } });
graph.updateEdgeData(edgeId, { weight: 2 });
graph.updateEdgeData([{ id: edgeId, source: 'n2', target: 'n4' }]);
graph.removeEdge(edgeId);
```

`source` 和 `target` 必须是已经存在的节点。省略 `id` 时由引擎生成，返回值就是这条边的 id，之后的查询和删除都使用它。

批量 `updateEdgeData()` 还可以修改边的两端节点。

## 状态、显隐和定位 [#状态显隐和定位]

内置状态名是 `default`、`active`、`selected`、`disabled`、`highlight`、`inactive` 和 `hidden`。也可以传入业务自己的状态名，并在 `node.stateStyles` 或 `edge.stateStyles` 里定义外观。

### `setItemState()` [#setitemstate]

```ts
graph.setItemState('n1', 'selected', true);
graph.setItemState('n1', 'selected', false);
```

给一个节点、边或 Combo 打开或关闭一个状态。`value: false` 只移除这一个状态。

### `setElementStates()` [#setelementstates]

```ts
graph.setElementStates('n1', ['selected', 'highlight']);
graph.setElementStates({
  n1: ['selected'],
  'a-b': ['active'],
});
```

用一份新的状态列表替换元素当前的全部状态。对象形式可以一次替换多个元素，并只绘制一次。

### `batchSetState()` [#batchsetstate]

```ts
graph.batchSetState([
  { id: 'n1', state: 'highlight', value: true },
  { id: 'n2', state: 'inactive', value: true },
]);
```

按布尔值批量开关状态，适合悬停高亮这类同时改很多元素的场景。

### 查询和清空 [#查询和清空]

```ts
const states = graph.getItemStates('n1');
const selected = graph.findNodesByState('selected');
graph.clearItemStates('n1');
```

`clearItemStates()` 清掉该元素上的全部状态。三个 `find*ByState()` 返回当前带有该状态的 id。

### `hideItem()` 与 `showItem()` [#hideitem-与-showitem]

```ts
graph.hideItem('n2');
graph.showItem('n2');
```

通过 `hidden` 状态隐藏或显示节点、边、Combo。`showItem()` 只清除 `hidden`，其他状态保留。

### `focusItem()` [#focusitem]

```ts
graph.focusItem('n1');
graph.focusItem(['n1', 'n2'], 24);
```

把视口中心移到一个或多个节点。目标能放进当前缩放时保持缩放；否则只缩小到留出 `padding` 屏幕像素。默认 `padding` 是 `20`。传入的 id 里没有有效节点时不做任何事。

## 视口 [#视口]

相机用图坐标的平移 `x`、`y` 和缩放 `zoom` 描述当前视野。

```ts
const camera = graph.getCamera();
graph.setCamera({ x: camera.x, y: camera.y, zoom: 1 });
graph.zoomBy(1.2);
graph.fitCenter();
graph.resetCamera();
```

| 方法                       | 说明                     |
| ------------------------ | ---------------------- |
| `getCamera()`            | 返回 `{ x, y, zoom }` 快照 |
| `setCamera(partial)`     | 合并写入相机字段               |
| `resetCamera()`          | 回到首次渲染结束时的相机；此前调用无效    |
| `getZoom()`              | 当前缩放                   |
| `setSize(width, height)` | 按 CSS 像素设置画布尺寸         |
| `fitCenter()`            | 保持缩放，把图内容移到视口中心        |

### `zoomTo()` 与 `zoomBy()` [#zoomto-与-zoomby]

```ts
graph.zoomTo(1.5, { center: { x: 320, y: 180 } });
graph.zoomBy(2, { minZoom: 0.2, maxZoom: 8 });
```

`zoomTo()` 把缩放设为绝对值。`zoomBy(2)` 表示在当前缩放上乘 2。

`ZoomOptions`：

| 字段        | 默认         | 说明          |
| --------- | ---------- | ----------- |
| `center`  | 画布中心的客户端坐标 | 缩放时保持不动的屏幕点 |
| `minZoom` | `0.1`      | 缩放下限        |
| `maxZoom` | `20`       | 缩放上限        |

### `fitView()` [#fitview]

```ts
graph.fitView();
graph.fitView(0.8);
graph.fitView({ padding: [24, 16, 24, 16], minZoom: 0.2, maxZoom: 2 });
```

按全部节点的包围盒调整相机，使内容进入视口。

* 数字是相对适配结果的缩放系数，默认 `0.9`。`render()` 结束时使用的就是这个默认值。
* 对象使用 `padding`、`minZoom`、`maxZoom`。`padding` 可以是统一的 CSS 像素，或 `[上, 右, 下, 左]`。对象形式下缩放系数按 `1` 计算，`minZoom` 默认 `0.1`，`maxZoom` 默认 `20`。

### 坐标转换 [#坐标转换]

```ts
graph.on('canvas:click', (event) => {
  const point = graph.screenToGraph(event.nativeEvent.clientX, event.nativeEvent.clientY);
  const screen = graph.graphToScreen(point.x, point.y);
  screen.x;
});
```

参数和返回值都是相对浏览器视口的客户端坐标，与 `MouseEvent.clientX` / `clientY` 同一坐标系。元素事件里的 `client`、`canvas`、`graph` 已经分好这三种坐标，多数点击逻辑直接读事件字段即可。

## 布局 [#布局]

```ts
graph.setLayout({ type: 'dagre', rankdir: 'LR' });
await graph.layout();
graph.cancelLayout();
```

`setLayout()` 只替换之后要使用的布局配置。`layout()` 用当前图数据执行它，并把算出的坐标写回节点。没有 `layout` 配置或没有节点时，`layout()` 直接返回。

`cancelLayout()` 放弃仍在进行的布局。后完成的旧布局不会覆盖更新的结果。

布局类型和参数见 [布局配置](/docs/guides/layout)。不创建 Graph、只计算结果时使用 [`runLayout()`](/docs/api/extensions#runlayout)。

## Combo [#combo]

Combo 的折叠、嵌套和运行时重新归组仍是实验能力，配置细节可能在 `0.1.x` 内调整。外观见 [Combo](/docs/guides/combo)。这些方法同样要在首次 `render()` 之后调用；渲染前调用会直接返回，不会创建或修改 Combo。

```ts
graph.createCombo({ id: 'group', data: { label: '分组' } }, ['n1', 'n2']);
graph.addToCombo('n3', 'group');
const children = graph.getComboChildren('group');
graph.collapseCombo('group');
graph.expandCombo('group');
graph.removeFromCombo('n3');
graph.removeCombo('group');
children.nodes;
```

`createCombo()` 可以在第二个参数里把已有节点放进新 Combo。`collapseCombo()` 隐藏其下节点并发出 `combo:collapse`；`expandCombo()` 恢复它们并发出 `combo:expand`。对已经处于目标状态的 Combo 再次折叠或展开不会重复发事件。

Combo 的选中和隐藏使用前面的 `setItemState()`、`hideItem()`，不要再调用旧的 `setComboState()`。

## 事件 [#事件]

```ts
graph.once('afterrender', () => {
  graph.fitView(0.9);
});
```

`GraphEventMap` 里的事件名会自动推导参数。自定义事件名也可以订阅，参数类型由 handler 自己声明。

```ts
graph.on('node:click', (event) => {
  event.nodeId;
  event.nativeEvent.clientX;
});

const onRender = (payload: { nodeCount: number; edgeCount: number }) => {
  console.log(payload.nodeCount);
};
graph.on('afterrender', onRender);
graph.off('afterrender', onRender);
```

`off()` 必须传入当初传给 `on()` 的同一个函数。`once()` 在第一次触发后移除监听。`destroy` 没有参数。

元素点击、悬停和滚轮由引擎直接发出，不需要额外打开某个 behavior。选择、拖拽、框选和套索事件只在对应 behavior 启用后出现。字段说明见 [事件](/docs/guides/events)。

| 事件                                                         | 主要字段                                                 |
| ---------------------------------------------------------- | ---------------------------------------------------- |
| `node:*`                                                   | `nodeId`、`nativeEvent`、`data`、`graph`                |
| `edge:*`                                                   | `edgeId`、`edgeIndex`、`source`、`target`、`nativeEvent` |
| `combo:pointerdown` / `click` / `dblclick` / `contextmenu` | `comboId`、`nativeEvent`                              |
| `canvas:*`                                                 | `nativeEvent`；没有目标元素 id                              |
| `node:selectchange`                                        | `nodeId`、`selected`、`event`                          |
| `edge:selectchange`                                        | `edgeId`、`edgeIndex`、`source`、`target`、`selected`    |
| `selection:clear`                                          | `ids`                                                |
| `node:dragstart` / `node:drag` / `node:dragend`            | `nodeId`、`nodeIds`；拖拽中还有 `dx`、`dy`                   |
| `combo:dragstart` / `combo:drag` / `combo:dragend`         | `comboId`；拖拽中还有 `dx`、`dy`                            |
| `edge:dragstart` / `edge:drag` / `edge:dragend`            | `source`、`target`、`dragEnd`；结束时有 `reconnected`       |
| `brush:select` / `brush:end`                               | `nodeIds`                                            |
| `lasso:select` / `lasso:end`                               | `nodeIds`                                            |
| `beforelayout` / `layout:start`                            | `nodeCount`                                          |
| `layout:end` / `afterlayout`                               | `duration`、`nodeCount`                               |
| `beforerender` / `afterrender`                             | `nodeCount`、`edgeCount`                              |
| `resize`                                                   | `width`、`height`                                     |
| `datachange`                                               | `nodeCount`、`edgeCount`                              |
| `afteradditem`                                             | `type`、`id`；边还包括 `source`、`target`                   |
| `afterremoveitem`                                          | `type`、`id`                                          |
| `afterupdateitem`                                          | `type`、`id`、`action`                                 |
| `combo:collapse` / `combo:expand`                          | `comboId`                                            |
| `destroy`                                                  | 无参数                                                  |

`node:*` 和 `edge:*` 各自包含 `pointerover`、`pointerenter`、`pointermove`、`pointerleave`、`pointerdown`、`click`、`dblclick`、`contextmenu`、`wheel`。`canvas:*` 包含 `pointermove`、`pointerdown`、`pointerup`、`click`、`dblclick`、`contextmenu`、`wheel`。

原生输入在 `nativeEvent` 上。旧字段 `event` 仍保留给已有监听代码。
