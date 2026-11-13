# 图 API (/docs/api/graph)





## 目录 [#graph-api-contents]

<nav className="graph-api-contents" aria-label="目录">
  * **创建与销毁**
    * [new Graph()](#new-graph)
    * [render()](#graph-lifecycle-render)
    * [destroy()](#graph-lifecycle-destroy)
    * [更新配置](#graph-lifecycle-updateoptions)
  * **数据读写**
    * [数据查询](#graph-data)
    * [数据更新](#graph-data-mutations)
  * **状态与分组**
    * [状态与显隐](#graph-states)
    * [Combo 操作](#graph-combo)
  * **视口与布局**
    * [视口与坐标](#graph-viewport)
    * [布局](#graph-layout)
  * **事件与扩展**
    * [事件 API](#graph-events)
    * [register()](#graph-extensions-register)
</nav>

<span id="生命周期" style="{ display: 'block', scrollMarginTop: '8rem' }" />

以下示例中的 `graph` 是已创建的实例。完整接入步骤见[快速上手](/docs/getting-started/quick-start)。

## 生命周期与样式更新 [#graph-lifecycle]

先创建图并等待首次 `render()` 完成。后续更新复用同一实例，组件卸载时调用 `destroy()`。 [生命周期事件](/docs/api/graph/events#event-lifecycle)

<span id="new-graphoptions" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### new Graph() [#new-graph]

`new Graph(options: GraphOptions): Graph`

用数据和已挂载、宽高非零的容器创建图。容器接受 CSS 选择器或 `HTMLElement`。创建后调用 [render()](#graph-lifecycle-render)。 [构造配置](/docs/api/options)

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: '#container',
  data: { nodes: [{ id: 'A' }], edges: [] },
});
```

<Callout type="warn" title="注意">
  请为每个图实例使用独立容器。容器无效时会抛出 `Invalid container`。如果容器里已有 `canvas`，Graph 会复用第一个，并在调用 `destroy()` 时移除它。
</Callout>

<span id="render" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### render() [#graph-lifecycle-render]

`graph.render(): Promise<void>`

根据当前数据和配置渲染图。等待首次渲染完成后，再更新数据、状态或样式。

```ts
await graph.render();
```

运行中改样式可以调用 [updateOptions()](#graph-lifecycle-updateoptions)。

<span id="updateoptions" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="refresh" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="graph-lifecycle-refresh" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="样式更新刷新和重建的代码与效果" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### updateOptions() [#graph-lifecycle-updateoptions]

`graph.updateOptions(options): void`

首次渲染后更新图的样式或交互。`options` 可传 `node`、`edge`、`label`、`theme`、`behaviors`，各字段按需传入，详见[配置详情](/docs/api/options#graphoptions)。

```ts
graph.updateOptions({
  node: { style: { fill: '#F59E0B' } },
  edge: { style: { lineWidth: 2 } },
});
```

### setBehaviors() [#setbehaviors]

`graph.setBehaviors(behaviors?: readonly BehaviorOption[]): void`

替换整份交互列表。传 `[]` 关闭全部行为，省略参数恢复 `zoom-canvas` 和 `drag-canvas`。

```ts
const modes = {
  browse: ['zoom-canvas', 'drag-canvas'],
  select: ['zoom-canvas', 'click-select', 'brush-select'],
  off: [],
} as const;

const switchMode = (mode: keyof typeof modes) => graph.setBehaviors(modes[mode]);

switchMode('select'); // 切换到单击选择和框选
```

<span id="destroy" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### destroy() [#graph-lifecycle-destroy]

`graph.destroy(): void`

销毁图实例并释放画布、交互和 Graph 事件监听。组件卸载时立即调用，即使首次渲染仍在进行。

```ts
graph.destroy();
```

<span id="destroyed" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="isdestroyed" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### destroyed [#graph-lifecycle-destroyed]

`graph.destroyed: boolean`

只读。开始销毁时从 `false` 变为 `true`。异步操作返回后，可用它确认实例是否已销毁。判断渲染完成或请求是否过期时，还需检查对应任务。

```ts
import type { Graph, GraphData } from '@antv/g6-lite';

export async function reload(graph: Graph, load: () => Promise<GraphData>) {
  const data = await load();
  if (graph.destroyed) return;
  await graph.setData(data, { fitView: false });
}
```

<span id="读取数据" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## 数据读取与查询 [#graph-data]

<span id="查询前提与返回值" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="兼容方法" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### getData() [#getdata]

`graph.getData(): GraphData`

返回节点、边和 Combo 的 [GraphData](/docs/api/options#graphdata) 快照。

```ts
const { nodes, edges } = graph.getData();
```

<span id="快照与查询的代码和效果" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### getNodes() [#getnodes]

`graph.getNodes(): readonly NodeModel[]`

返回 [NodeModel](/docs/guides/data#模型字段) 数组的只读视图。

<span id="模型字段" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### getNodeData() [#getnodedata]

`graph.getNodeData(id: string): NodeModel | undefined`

按 ID 返回 [NodeModel](/docs/guides/data#模型字段)。找不到时返回 `undefined`。

```ts
const node = graph.getNodeData('A');
```

### getEdges() [#getedges]

`graph.getEdges(): readonly EdgeModel[]`

返回 [EdgeModel](/docs/guides/data#模型字段) 数组的只读视图。

### getEdgeData() [#getedgedata]

`graph.getEdgeData(id: string): EdgeModel | undefined`

按边的实际 ID 返回 [EdgeModel](/docs/guides/data#模型字段)。找不到时返回 `undefined`。

### getComboData() [#getcombodata]

`graph.getComboData(id: string): ComboModel | undefined`

按 ID 返回 Combo。找不到时返回 `undefined`。 [ComboModel 字段](/docs/guides/combo#只读查询模型)

### getElementData() [#getelementdata]

`graph.getElementData(id: string): ElementModel | undefined`

按节点、边、Combo 的顺序查找 ID，返回 [ElementModel](/docs/guides/data#模型字段)。找不到时返回 `undefined`。

### getNodeCount() [#getnodecount]

`graph.getNodeCount(): number`

返回节点总数，包含隐藏节点。

### getEdgeCount() [#getedgecount]

`graph.getEdgeCount(): number`

当前边总数，包含隐藏边。

### hasNode() [#hasnode]

`graph.hasNode(id: string): boolean`

判断指定节点是否存在。

### hasEdge() [#hasedge]

`graph.hasEdge(id: string): boolean`

判断指定边是否存在。

### hasElement() [#haselement]

`graph.hasElement(id: string): boolean`

判断指定 ID 是否对应节点、边或 Combo。

### getElementPosition() [#getelementposition]

`graph.getElementPosition(id: string): { x: number; y: number } | null`

返回节点或 Combo 的图坐标，重名时优先取节点。边或不存在的 ID 返回 `null`。Combo 的坐标随画布绘制更新。

### getNeighborNodes() [#getneighbornodes]

`graph.getNeighborNodes(nodeId: string): string[]`

返回与指定节点相连的节点 ID，包含出边和入边，结果去重。自环包含节点自身。

### getAdjacentEdges() [#getadjacentedges]

`graph.getAdjacentEdges(nodeId: string): Array<{ id: string; source: string; target: string }>`

按端点 ID 返回所有入边和出边，每条只含 `id`、`source` 和 `target`。自环只返回一次。

<span id="修改节点和边" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="共同前提与类型简写" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## 数据写入 [#graph-data-mutations]

首次 `render()` 完成后再写入数据，销毁后调用不会写入。增量方法会安排重绘。 [数据指南](/docs/guides/data)

<span id="替换数据与样式" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="setdata" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### setData() [#graph-data-mutations-setdata]

`graph.setData(data: GraphData, options?: SetDataOptions): Promise<void>`

替换整张图的节点、边和 Combo，按配置执行转换和布局。需要保留的元素、归属和状态应随新数据传入。

省略 `fitView` 或传 `true` 时执行 `fitView(0.9)`。传 `false` 保留当前缩放和位置，也可传数字或 `FitViewOptions` 自定义本次适配。 [fitView()](#graph-viewport-fitview)

```ts
await graph.setData(nextData, { fitView: false });
```

写回后发出 [`datachange`](#datachange)。被新操作取代或取消的更新，其 Promise 仍可能正常完成。更新失败时，数据也可能已经部分写入。

<span id="节点" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### addNode() [#addnode]

`graph.addNode(node: { id: string; x: number; y: number; data?: Record<string, unknown> }): void`

新增节点，必须提供 id 和图坐标 x/y。重复节点 ID 当前被忽略；不接受初始 states、comboId 或 fx/fy，需随后调用对应方法。不重新布局。

### addNodes() [#addnodes]

`graph.addNodes(nodes: Array<{ id: string; x: number; y: number; data?: Record<string, unknown> }>): void`

批量新增；重复 ID 跳过。统一调度绘制，但不是事务。

### updateNodeData() [#updatenodedata]

`graph.updateNodeData(id: string, data: Record<string, unknown>): void`

浅合并节点业务数据，嵌套对象整体替换。批量写法为 `graph.updateNodeData(updates: NodeDataUpdate[]): void`，每项包含 `id` 和 `data`。缺失节点会跳过，ID、位置和归属保持原值。

### updateNodePosition() [#updatenodeposition]

`graph.updateNodePosition(id: string, x: number, y: number): void`

更新图坐标，缺失节点不改数据。不是客户端 CSS 坐标；不执行布局或视口适配。

### updateNodePositions() [#updatenodepositions]

`graph.updateNodePositions(updates: NodePositionUpdate[]): void`

NodePositionUpdate 为 id/x/y。按顺序更新有效且坐标变化的节点，统一调度；缺失或未变化的项不发对应更新事件。

### removeNode() [#removenode]

`graph.removeNode(id: string): void`

删除节点及其所有入边、出边，解除该节点归属；不删除所属 Combo。缺失节点不改数据。

### removeNodes() [#removenodes]

`graph.removeNodes(ids: string[]): void`

批量删除节点与关联边，缺失 ID 忽略；集合查询顺序可能改变。

<span id="边" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### addEdge() [#addedge]

`graph.addEdge(edge: { id?: string; source: string; target: string; data?: Record<string, unknown>; states?: ElementState[] }): string`

新增边并返回实际 ID。省略 `id` 时自动生成，显式 ID 重复会抛错。调用前请验证两端节点存在。销毁后返回空字符串。

### addEdges() [#addedges]

`graph.addEdges(edges: Array<{ id?: string; source: string; target: string; data?: Record<string, unknown>; states?: ElementState[] }>): string[]`

按输入顺序返回实际 ID，销毁后为 \[]。重复显式 ID 可能在前面项目已写入后抛错，不提供回滚。

### updateEdgeData() [#updateedgedata]

`graph.updateEdgeData(id: string, data: Record<string, unknown>): void`

单条形式只浅合并业务 data；重载 graph.updateEdgeData(updates: EdgeDataUpdate\[]): void 还支持改 source/target。EdgeDataUpdate 为 id 和可选 data/source/target；不改 id。当前批量路径先校验有效边的新端点，不存在的端点会抛错，缺失边本身跳过。

### removeEdge() [#removeedge]

`graph.removeEdge(id: string): void`

删除指定边，保留两端节点；缺失边不改数据。

### removeEdges() [#removeedges]

`graph.removeEdges(ids: string[]): void`

批量删除边，忽略缺失 ID，统一安排更新。

<span id="增量更新的代码和效果" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### 批量调用示例 [#批量调用示例]

```ts
// 已渲染，A 存在
graph.addNodes([{ id: 'D', x: 300, y: 40 }, { id: 'E', x: 300, y: 120 }]);
graph.addEdges([{ id: 'A-D', source: 'A', target: 'D' }]);
graph.updateNodeData([{ id: 'D', data: { score: 2 } }]);
graph.updateNodePositions([{ id: 'D', x: 320, y: 60 }]);
graph.updateEdgeData([{ id: 'A-D', target: 'E', data: { weight: 3 } }]);
graph.removeNodes(['D', 'E']); // 关联边也会移除
```

<span id="状态显隐和定位" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="调用前提" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## 状态与显隐 [#graph-states]

首次渲染完成后再修改状态。状态立即写入，绘制由 Graph 调度。

ID 可指向节点、边或 Combo。缺失 ID 会被忽略，重名时按节点、边、Combo 的顺序查找。 [元素状态指南](/docs/guides/states)

<span id="setitemstate" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### setItemState() [#graph-states-setitemstate]

`graph.setItemState(id: string, state: ElementState, value: boolean): void`

true 增加一个状态，false 只移除该状态，其他状态保留。重复增加不会追加重复项；移除不存在的状态不改变集合。

```ts
// 已完成 render，包含 A
graph.setItemState('A', 'selected', true);
graph.setItemState('A', 'review', true);
graph.setItemState('A', 'review', false); // selected 仍保留
```

<span id="增减替换与清空的区别" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="setelementstates" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### setElementStates() [#graph-states-setelementstates]

`graph.setElementStates(id: string, states: ElementState[]): void`

```ts
import type { ElementState, Graph } from '@antv/g6-lite';
declare const graph: Graph;
declare const states: ElementState[];
graph.setElementStates('A', states);
graph.setElementStates({ A: ['selected'], 'A-B': ['highlight'] });
```

替换指定元素的全部状态。可传单个 ID 和状态数组，也可传 ID 到状态数组的映射。传空数组 `[]` 清空对应元素的状态。

重复状态会去重，`default` 会被过滤。要调整节点或边的状态覆盖顺序，先清空再写入。Combo 遵循固定的[状态样式顺序](/docs/guides/combo#options-combo-状态样式)。

<span id="batchsetstate" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### batchSetState() [#graph-states-batchsetstate]

`graph.batchSetState(items: Array<{ id: string; state: ElementState; value: boolean }>): void`

按数组顺序增减状态。同一元素的同一状态以最后一项为准。节点、边和 Combo 可混用，整批统一调度绘制。

```ts
graph.batchSetState([
  { id: 'A', state: 'review', value: true },
  { id: 'A-B', state: 'highlight', value: false },
  { id: 'group', state: 'selected', value: true },
]);
```

<span id="查询和清空" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### getItemStates() [#getitemstates]

`graph.getItemStates(id: string): ElementState[]`

返回指定元素的状态数组副本。无结果时返回 `[]`。

```ts
const selected = graph.getItemStates('A').includes('selected');
```

### findNodesByState() [#findnodesbystate]

`graph.findNodesByState(state: ElementState): string[]`

返回具有指定状态的节点 ID，包含匹配的隐藏节点。无结果时返回 `[]`。

```ts
const nodeIds = graph.findNodesByState('selected');
```

### findEdgesByState() [#findedgesbystate]

`graph.findEdgesByState(state: ElementState): string[]`

返回具有指定状态的边 ID。无结果时返回 `[]`。

### findCombosByState() [#findcombosbystate]

`graph.findCombosByState(state: ElementState): string[]`

返回自身具有指定状态的 Combo ID。无结果时返回 `[]`。

### clearItemStates() [#clearitemstates]

`graph.clearItemStates(id: string): void`

清空指定元素的全部业务状态，包括 selected 和显式 hidden。只想移除自己的标记时用 setItemState(id, state, false)。折叠 Combo 导致的结构性 hidden 会保留，不能用清空状态绕过折叠。

```ts
graph.clearItemStates('A');
```

<span id="hideitem-与-showitem" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### hideItem() [#hideitem]

`graph.hideItem(id: string): void`

等价于 setItemState(id, 'hidden', true)，保留其他状态、元素数据和坐标。不删除元素、不重新布局或适配视口；只改变该 id 的状态，不自动给关联边、子节点或子 Combo 设置 hidden。需要一起隐藏时显式列出目标。

<span id="显隐与状态查询" style="{ display: 'block', scrollMarginTop: '8rem' }" />

```ts
graph.hideItem('A');
graph.showItem('A');
```

### showItem() [#showitem]

`graph.showItem(id: string): void`

等价于 setItemState(id, 'hidden', false)，只移除显式业务 hidden，保留 selected 等其他状态。不恢复已经删除的元素，也不展开折叠的 Combo。

<span id="combo" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="前提与支持边界" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## Combo 操作 [#graph-combo]

使用以下方法创建和移除分组、调整成员归属、折叠或展开分组。分组字段和样式见 [Combo 配置](/docs/api/options#options-combo)，用法见 [Combo 指南](/docs/guides/combo)。

<span id="代码与操作效果" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### createCombo() [#createcombo]

`graph.createCombo(combo: ComboData, childNodeIds?: string[]): void`

新增分组并把已有节点加入；不创建这些节点，不移动位置。parentId 指向已有父级，归属和层级由业务校验。ID 应唯一：重复 ID 不新建分组，但成员分配仍可能执行。初始 collapsed 可影响加入节点的可见性。

```ts
graph.createCombo({ id: 'team' }, ['A', 'B']);
```

### removeCombo() [#removecombo]

`graph.removeCombo(comboId: string): void`

移除分组本身，不删除节点或边。直接节点解除归属，直接子 Combo 成为无父级分组，不自动转入祖父级。会释放被移除层级施加的折叠隐藏，保留业务显式 hidden。

### addToCombo() [#addtocombo]

`graph.addToCombo(nodeId: string, comboId: string): void`

把已有节点从原分组转入目标分组，不移动坐标或重新布局；目标折叠时按折叠层级隐藏。先校验节点和目标分组存在：无效目标当前可能解除旧归属，而不是拒绝整个操作。

### removeFromCombo() [#removefromcombo]

`graph.removeFromCombo(nodeId: string): void`

解除直接归属，不删除节点；释放原归属施加的隐藏，保留业务 hidden。

### getComboChildren() [#getcombochildren]

`graph.getComboChildren(id: string): { nodes: string[]; combos: string[] }`

返回直接节点和直接子分组 ID 新数组，不递归遍历后代。缺失分组或无模型时两个数组均为空，不承诺顺序。

### getNodeCombo() [#getnodecombo]

`graph.getNodeCombo(nodeId: string): string | undefined`

返回节点的直接 Combo ID；未归组、缺失节点或无模型时为 undefined。

### collapseCombo() [#collapsecombo]

`graph.collapseCombo(comboId: string): void`

设 collapsed=true，隐藏后代节点及其关联边，不生成虚拟边；子 Combo 边框不会随祖先自动隐藏。有效状态变化后发 combo:collapse；缺失或已折叠时不重复发事件。

### expandCombo() [#expandcombo]

`graph.expandCombo(comboId: string): void`

展开并释放本层的折叠隐藏；其他折叠祖先和业务 hidden 仍有效。有效变化后发 combo:expand；缺失或已展开时不重复发事件。

### toggleCombo() [#togglecombo]

`graph.toggleCombo(comboId: string): void`

根据当前 collapsed 调用展开或折叠；缺失分组不执行。事件沿对应 expand/collapse 路径发出。

### 查询归属与数据模型 [#查询归属与数据模型]

```ts
const parent = graph.getNodeCombo('B');
const direct = graph.getComboChildren('base');
const combo = graph.getComboData('base');
console.log(parent, direct, combo?.collapsed);
```

getComboData 返回只读类型的 ComboModel；完整字段见[只读查询模型](/docs/guides/combo#只读查询模型)。getData 导出当前归属、parentId 和 collapsed，不导出折叠派生 hidden。

<span id="状态显隐与兼容方法" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### Combo 状态与显隐 [#combo-state-and-visibility]

节点、边和 Combo 共用 `setItemState()`、`getItemStates()` 和 `clearItemStates()`。下面只切换 `selected`，保留分组上的其他状态。查找所有选中的分组可用 `findCombosByState('selected')`。

```ts
const selected = graph.getItemStates(comboId).includes('selected');
graph.setItemState(comboId, 'selected', !selected);
```

用 `combo:click` 监听分组点击，再调用上面的代码切换选中状态。`hidden` 只隐藏分组本身，折叠成员用 [collapseCombo()](#collapsecombo)。

继续阅读：[分组数据](/docs/api/options#options-combo-combodata) · [状态方法](/docs/api/graph#graph-states) · [数据导出](/docs/api/graph#getdata)。

<span id="视口" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="调用时机与单位" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## 视口与坐标 [#graph-viewport]

视口是画布里当前能看到的范围。平移或缩放视图时，节点在图里的坐标保持不变。

### getCamera() [#getcamera]

`graph.getCamera(): Camera`

返回当前视图的快照。`x`、`y` 是按图坐标计的平移量，`zoom` 是缩放倍数。构造后即可查询。要读取画布上实际显示的视图，等首次渲染完成后再调用。

```ts
const camera = graph.getCamera();
console.log(camera.zoom); // 当前缩放倍数
```

也可以保存整个 `camera`，稍后用 [`setCamera(camera)`](#setcamera) 恢复当时的平移和缩放。

<span id="保存恢复与定位的代码和效果" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### setCamera() [#setcamera]

`graph.setCamera(partial: Partial<Camera>): void`

设置视图的平移和缩放，只更新传入的字段。传 `{ zoom: 2 }` 只调整缩放。`x` 和 `y` 是以图坐标为单位的平移量，`zoom` 限制在 `0.1–20`。

### resetCamera() [#resetcamera]

`graph.resetCamera(): void`

恢复首次渲染后的缩放和位置。首次渲染前调用无效果。容器尺寸变化后，可用 [fitView()](#graph-viewport-fitview) 重新适配。

```ts
graph.resetCamera();
```

### getZoom() [#getzoom]

`graph.getZoom(): number`

返回当前缩放倍数，与 `getCamera().zoom` 相同。

<span id="zoomto-与-zoomby" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### zoomTo() [#zoomto]

`graph.zoomTo(zoom: number, options?: ZoomOptions): void`

把缩放倍数设为指定值。



```ts
const anchor = graph.getElementPosition('A');
if (!anchor) return;
const center = graph.graphToScreen(anchor.x, anchor.y);
graph.zoomTo(1.5, { center });
```

**完整运行代码**

```ts
import { Graph } from '@antv/g6-lite';
import GUI from 'lil-gui';

export function runZoomTo(container: HTMLElement) {
  return run(container, 'zoomTo(1.5)', (graph) => {
    // #region zoom-to
    const anchor = graph.getElementPosition('A');
    if (!anchor) return;
    const center = graph.graphToScreen(anchor.x, anchor.y);
    graph.zoomTo(1.5, { center });
    // #endregion zoom-to
  });
}

export function runZoomBy(container: HTMLElement) {
  return run(container, 'zoomBy(1.5)', (graph) => {
    // #region zoom-by
    graph.zoomBy(1.5, { maxZoom: 4 });
    // #endregion zoom-by
  });
}

async function run(container: HTMLElement, label: string, changeZoom: (graph: Graph) => void) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'A', x: -28, y: 12 },
        { id: 'B', x: 0, y: -20 },
        { id: 'C', x: 28, y: 12 },
      ],
      edges: [
        { id: 'A-B', source: 'A', target: 'B' },
        { id: 'B-C', source: 'B', target: 'C' },
        { id: 'A-C', source: 'A', target: 'C' },
      ],
    },
    node: { style: { size: 14, label: (node) => node.id } },
    behaviors: [],
    autoFit: false,
  });

  const panel = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    panel.destroy();
    destroy();
  };

  try {
    await graph.render();
    graph.zoomTo(2);

    const updateStatus = () => panel.setStatus(`zoom = ${graph.getZoom()}`);
    panel.addAction(label, () => {
      changeZoom(graph);
      updateStatus();
    });
    updateStatus();
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



默认围绕画布中心缩放。要围绕鼠标位置缩放，可以把事件的 `event.client` 传给 `center`。

| ZoomOptions | 默认值   | 含义                              |
| ----------- | ----- | ------------------------------- |
| `center`    | 画布中心  | 缩放中心 `{ x, y }`，单位为浏览器视口 CSS 像素 |
| `minZoom`   | `0.1` | 本次调用的缩放下限                       |
| `maxZoom`   | `20`  | 本次调用的缩放上限                       |

`zoom` 应为有限正数，`minZoom` 应小于或等于 `maxZoom`。最终缩放范围为 `0.1–20`。

### zoomBy() [#zoomby]

`graph.zoomBy(ratio: number, options?: ZoomOptions): void`

将当前缩放倍数乘以 `ratio`。`ratio` 应为有限正数，缩放中心和范围沿用 [zoomTo()](#zoomto) 的选项。



```ts
graph.zoomBy(1.5, { maxZoom: 4 });
```

**完整运行代码**

```ts
import { Graph } from '@antv/g6-lite';
import GUI from 'lil-gui';

export function runZoomTo(container: HTMLElement) {
  return run(container, 'zoomTo(1.5)', (graph) => {
    // #region zoom-to
    const anchor = graph.getElementPosition('A');
    if (!anchor) return;
    const center = graph.graphToScreen(anchor.x, anchor.y);
    graph.zoomTo(1.5, { center });
    // #endregion zoom-to
  });
}

export function runZoomBy(container: HTMLElement) {
  return run(container, 'zoomBy(1.5)', (graph) => {
    // #region zoom-by
    graph.zoomBy(1.5, { maxZoom: 4 });
    // #endregion zoom-by
  });
}

async function run(container: HTMLElement, label: string, changeZoom: (graph: Graph) => void) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'A', x: -28, y: 12 },
        { id: 'B', x: 0, y: -20 },
        { id: 'C', x: 28, y: 12 },
      ],
      edges: [
        { id: 'A-B', source: 'A', target: 'B' },
        { id: 'B-C', source: 'B', target: 'C' },
        { id: 'A-C', source: 'A', target: 'C' },
      ],
    },
    node: { style: { size: 14, label: (node) => node.id } },
    behaviors: [],
    autoFit: false,
  });

  const panel = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    panel.destroy();
    destroy();
  };

  try {
    await graph.render();
    graph.zoomTo(2);

    const updateStatus = () => panel.setStatus(`zoom = ${graph.getZoom()}`);
    panel.addAction(label, () => {
      changeZoom(graph);
      updateStatus();
    });
    updateStatus();
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



<span id="fitview" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### fitView() [#graph-viewport-fitview]

`graph.fitView(options?: number | FitViewOptions): void`

按内容范围调整平移和缩放。范围包含节点主体尺寸、边路径和 Combo 包围盒，不保证所有外部标签和 DOM 装饰都在视口内。当前节点范围不排除 hidden 节点；远离主体的隐藏节点也可能让适配结果变小。无节点时不执行。

| 入口   | 默认行为                            |
| ---- | ------------------------------- |
| 不传参数 | 相当于 fitView(0.9)                |
| 正数   | 在无 padding 的适配结果上乘该系数，不是绝对 zoom |
| 对象   | 系数按 1 计算；使用下列留白和缩放限制            |

| FitViewOptions | 默认值 | 含义                        |
| -------------- | --- | ------------------------- |
| padding        | 0   | 统一 CSS 像素或 `[上, 右, 下, 左]` |
| minZoom        | 0.1 | 适配缩放下限；设得过大可能无法看全         |
| maxZoom        | 20  | 适配缩放上限；设得较小可避免过度放大        |

底层相机仍限制在 0.1–20。留白应非负、范围应有效；过大的留白或缩放限制都可能使内容无法完整容纳。

```ts
graph.fitView(0.8);
graph.fitView({ padding: [32, 24, 48, 24], maxZoom: 1 });
```

首次 render 使用 autoFit 对象或数值；未配置、false 或 true 时采用 0.9。setData 默认另用 0.9，不继承 autoFit 对象；layout 不自动适配。完整时机对照见[使用指南](/docs/guides/viewport#选择适配时机)。

### fitCenter() [#fitcenter]

`graph.fitCenter(): void`

保持 zoom，只把节点中心点的范围移到画布中央。它不按节点尺寸、边路径、Combo 或标签重新计算缩放；无节点时不执行。需要看全图用 fitView。

```ts
graph.fitCenter();
```

<span id="focusitem" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### focusItem() [#graph-viewport-focusitem]

`graph.focusItem(id: string | string[], padding?: number): void`

只定位节点，忽略边 ID、Combo ID 和不存在的 ID；没有有效节点时不执行。将目标节点中心点范围居中，能放下时保持 zoom，否则只缩小，不自动放大。padding 默认 20 CSS 像素，负值按 0 处理。

范围以节点中心点计算，不包含主体尺寸或标签；实际缩放还受底层相机限制。它不改变状态、节点位置或布局，也不展开折叠 Combo。

```ts
graph.focusItem('A');
graph.focusItem(['A', 'B'], 32);
```

<span id="容器尺寸变化" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### setSize() [#setsize]

`graph.setSize(width: number, height: number): void`

用 CSS 像素设置画布宽高，宽高须为有限正数。容器尺寸变化时，画布会自动同步。尺寸更新后触发 `resize`，开启 `autoFit` 时会先重新适配视图。默认 `false`，保留当前视图。设为 `true` 使用默认适配系数 `0.9`，也可传正数或 [`FitViewOptions`](#graph-viewport-fitview)。坐标转换要求画布已挂载、可见且宽高大于 0。实例销毁后，坐标转换返回 `{ x: 0, y: 0 }`。

<span id="容器变宽变窄后的适配" style="{ display: 'block', scrollMarginTop: '8rem' }" />

```ts
graph.setSize(640, 480);
```

<span id="坐标转换" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### screenToGraph() [#screentograph]

`graph.screenToGraph(screenX: number, screenY: number): { x: number; y: number }`

输入客户端 CSS 坐标，与 MouseEvent.clientX / clientY 相同；返回当前相机下的图坐标。不是显示器 screenX / screenY，也不是 offsetX / offsetY。方法内部处理画布位置和缓冲区比例，无需乘 DPR。

```ts
graph.on('canvas:click', (event) => {
  const point = graph.screenToGraph(event.client.x, event.client.y);
  console.log(point, event.graph); // 同一图坐标
});
```

### graphToScreen() [#graphtoscreen]

`graph.graphToScreen(graphX: number, graphY: number): { x: number; y: number }`

输入图坐标，返回客户端 CSS 坐标，适合定位 fixed DOM 内容。滚动页面、改变容器位置或修改相机后需重新计算；返回值不是固定的全页 page 坐标。

```ts
const client = graph.graphToScreen(0, 0);
const point = graph.screenToGraph(client.x, client.y);
console.log(client, point);
```

<span id="布局" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## 布局 [#graph-layout]

### setLayout() [#setlayout]

`graph.setLayout(config: LayoutConfig): void`

替换布局配置。要让已有的图按新配置重排，再调用 [layout()](#graph-layout-layout)。

### layout() [#graph-layout-layout]

`graph.layout(): Promise<void>`

首次渲染完成后，按当前布局配置重新计算并更新节点位置。重排后想看全图，可在 `await graph.layout()` 后调用 [fitView()](#graph-viewport-fitview)。

<span id="graph-layout-代码与对应效果" style="{ display: 'block', scrollMarginTop: '8rem' }" />

```ts
graph.setLayout({ type: 'circular' });
await graph.layout();
graph.fitView();
```

#### 执行与适配时机 [#执行与适配时机]

| 调用        | 布局         | 视口                               |
| --------- | ---------- | -------------------------------- |
| 首次 render | 有配置就计算     | 首次会适配；autoFit 对象或数值参与首次适配        |
| layout    | 有配置且非空时计算  | 保留当前相机                           |
| setData   | 有配置就按新数据计算 | 默认适配；传 `{ fitView: false }` 保留相机 |

### cancelLayout() [#cancellayout]

`graph.cancelLayout(): void`

取消当前布局，保留已更新的节点位置和布局配置。可以再次调用 `layout()` 开始新的布局。被取消的 `layout()` 仍可能正常完成。 [Worker 取消示例](/docs/guides/layout-worker#代码与对应效果)

<span id="graph-extensions-runlayout" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### runLayout [#graph-layout-runlayout]

从包根导入，直接计算坐标，不需要创建 Graph：

```ts
import type { ExtensionContext, GraphData, LayoutConfig, LayoutResult } from '@antv/g6-lite';

declare function runLayout(
  data: GraphData,
  config: LayoutConfig,
  viewport?: { width: number; height: number },
  runtime?: { signal?: AbortSignal; extensionContext?: ExtensionContext },
): Promise<LayoutResult>;
```

| 参数 / 返回值                 | 规则                                                                              |
| ------------------------ | ------------------------------------------------------------------------------- |
| data                     | 平铺 nodes/edges；函数不创建 Graph，也不绘制或适配相机                                            |
| config                   | LayoutConfig；worker 只按显式值启用，没有 ≥ 1000 节点的自动开关                                   |
| viewport                 | 为缺失的 width/height/center 提供默认值；省略时交由算法默认，不读取 Graph 容器                           |
| runtime.signal           | 可选取消信号；取消时通常返回输入坐标作为后备结果，不保证抛 AbortError                                        |
| runtime.extensionContext | 可选扩展初始化上下文。Graph 内部调用会提供。独立调用省略此参数时跳过 `Layout.init`                             |
| result                   | `{ nodes: Array<GraphNode & { x: number; y: number }> }`；不返回 edges；不要当作输入数据的深拷贝 |

<span id="坐标计算与展示" style="{ display: 'block', scrollMarginTop: '8rem' }" />

```ts
import { runLayout } from '@antv/g6-lite';

const { nodes } = await runLayout(data, { type: 'dagre', rankdir: 'LR' });
console.log(nodes);
```

<Callout type="warn" title="独立计算的边界">
  执行顺序同布局配置参考：已注册同名扩展、内置函数式树布局、Worker、库算法。传 viewport 时，扩展 execute 上下文的 width/height 优先使用 viewport；显式 config.width/height 仍在 context.options 中。无 viewport 时，上下文尺寸回退到 config 或 800×600。

  独立 runLayout 不执行 Graph 的最终 fx/fy 覆盖，不运行 Graph transforms，也不发送 Graph 布局事件。返回后将坐标用于自己的渲染器；需要 Graph 的数据写回、状态和事件链时，使用实例 layout。
</Callout>

继续阅读：[布局配置](/docs/api/options#options-layout) · [自定义布局](/docs/guides/custom-layout)。

<span id="事件" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## 事件 API [#graph-events]

### on() [#on]

`graph.on<K extends keyof GraphEventMap>(event: K, handler: Handler<GraphEventMap[K]>): void`

持续接收事件，直到取消监听或销毁实例。

监听函数按注册顺序同步执行，抛出的异常会传给调用方。

```ts
graph.on('node:click', ({ nodeId }) => {
  console.log('clicked', nodeId);
});
```

**参数**：event 为事件名称；handler 为处理函数，参数随事件名推导。**返回值**：void。

**常用事件**

| 事件                                                          | 触发时机               |
| ----------------------------------------------------------- | ------------------ |
| [`beforerender`](/docs/api/graph/events#beforerender)       | 开始绘制前              |
| [`afterrender`](/docs/api/graph/events#afterrender)         | 显式渲染完成同步绘制后        |
| [`datachange`](/docs/api/graph/events#datachange)           | `setData()` 写回新数据后 |
| [`resize`](/docs/api/graph/events#resize)                   | 画布尺寸更新后            |
| [`destroy`](/docs/api/graph/events#event-lifecycle-destroy) | 首次销毁图实例时           |

完整事件清单和回调参数见[事件参考](/docs/api/graph/events)。应用可用 [EventEmitter](/docs/api/graph/events#eventemitter) 创建独立的事件分发器。

### off() [#off]

`graph.off<K extends keyof GraphEventMap>(event: K, handler: Handler<GraphEventMap[K]>): void`

使用注册时的同一个函数取消监听，也可取消尚未触发的 once。

```ts
import type { Graph, GraphEventMap } from '@antv/g6-lite';

declare const graph: Graph;
const onClick = ({ nodeId }: GraphEventMap['node:click'][0]) => console.log(nodeId);
graph.on('node:click', onClick);
graph.off('node:click', onClick);
```

**参数**：event 为原事件名；handler 为原函数引用，均不可省略。**返回值**：void。

<span id="graph-events-代码与对应效果" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### once() [#once]

`graph.once<K extends keyof GraphEventMap>(event: K, handler: Handler<GraphEventMap[K]>): void`

只接收注册后的下一次事件，触发后自动移除；不会补发历史事件。

```ts
graph.once('afterrender', ({ nodeCount }) => console.log(nodeCount));
await graph.render();
```

**参数**与 on 相同。**返回值**：void。销毁后不再添加监听。

### emit() [#emit]

`graph.emit<K extends string>(event: K, ...args: K extends keyof GraphEventMap ? GraphEventMap[K] : unknown[]): void`

同步调用该图的事件监听。首次渲染前可用，销毁后直接返回。

```ts
graph.emit('business:reset');
```

`GraphEventMap` 为已声明的事件提供参数类型。触发内置事件时，同名 Behavior 也会收到载荷。业务通知可用 `business:reset` 等独立名称。 [自定义事件示例](/docs/guides/events/custom)

## 扩展 API [#graph-extensions]

<span id="extension-registration" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="extension-registration-register" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="graph-extensions-extensionfactory" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### `register()` [#graph-extensions-register]

`register(type, name, extension): void`

注册自定义节点、边、标签、装饰、交互、布局、数据转换或插件。在 Graph 配置中填入注册名称即可启用。

<span id="最小注册与激活" style="{ display: 'block', scrollMarginTop: '8rem' }" />

以下示例将自定义弧线应用到图的边。页面需有一个 ID 为 `container` 的可见容器。

```ts
import { Graph, register } from '@antv/g6-lite';

register('edge', 'app-dependency', { base: 'arc', style: { curvature: 0.2 } });
const graph = new Graph({
  container: '#container',
  data: {
    nodes: [{ id: 'a', x: 0, y: 0 }, { id: 'b', x: 120, y: 0 }],
    edges: [{ source: 'a', target: 'b' }],
  },
  edge: { type: 'app-dependency' },
});
await graph.render();
```

各类扩展的配置位置和回调见[扩展参考](/docs/api/extensions)。
