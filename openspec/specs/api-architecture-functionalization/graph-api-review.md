# Graph 一级 API 对照评审

> 状态：候选方案，公开 API 改动前需确认
> 对照基线：G6-GL 当前 `Graph` 与 `@antv/g6@5.1.1`

## 1. 评审原则

1. `new Graph(options)` 和核心生命周期保持稳定。
2. 高频 API 优先与 G6 v5 命名和用户心智一致。
3. G6-GL 特有且有明确价值的 WebGL/Camera 能力可以保留，但需要准确命名和稳定类型。
4. 当前已使用的 API 在 beta 期优先提供 deprecated 转发，不直接删除。
5. 泄露 Renderer、DataModel 或拾取实现的 API 移出根稳定面。

## 2. 生命周期与配置

| 当前 API | 建议 | 兼容方式 |
| --- | --- | --- |
| `new Graph(options)` | 保留 | 无变化 |
| `render()` | 保留 | 无变化 |
| `destroy()` | 保留 | 无变化 |
| `destroyed` | 保留 | 与 G6 一致 |
| `isDestroyed()` | 保留便利方法 | 不影响 `destroyed` 属性 |
| — | 候选新增 `rendered` | 兼容新增 |
| `updateOptions()` | 候选对齐 `setOptions()` | beta 保留旧名转发 |
| — | 候选新增 `getOptions()` | 兼容新增 |

## 3. 数据 API

建议主命名向 G6 的 `*Data` 体系收敛，明确这些方法修改的是业务图数据，而不是 Renderer 内部数据。

| 当前 API | 目标 API | 建议 |
| --- | --- | --- |
| `getData()` | `getData()` | 保留 |
| `toData()` | `getData()` | deprecated alias，确认二者是否存在语义差异 |
| `setData()` | `setData()` | 保留，但需冻结异步 layout/fit 语义 |
| `addNode()` / `addNodes()` | `addNodeData()` | 新增主 API，旧方法转发 |
| `addEdge()` / `addEdges()` | `addEdgeData()` | 新增主 API，旧方法转发 |
| `createCombo()` | `addComboData()` | 新增主 API，旧方法转发 |
| `updateNodeData()` | `updateNodeData()` | 保留，统一单个/批量签名 |
| `updateEdgeData()` | `updateEdgeData()` | 保留，统一单个/批量签名 |
| — | `updateComboData()` | 候选补齐 |
| `removeNode()` / `removeNodes()` | `removeNodeData()` | 新增主 API，旧方法转发 |
| `removeEdge()` / `removeEdges()` | `removeEdgeData()` | 新增主 API，旧方法转发 |
| `removeCombo()` | `removeComboData()` | 新增主 API，旧方法转发 |
| `updateData(RendererData)` | internal `replaceRendererData()` | 必须移出公开面；该名称与 G6 业务数据 API 冲突 |

`updateData(RendererData)` 是本轮最高优先级的命名冲突。G6 的 `updateData` 表示业务 `PartialGraphData` 更新，而 G6-GL 当前签名泄露 Renderer 契约，不能进入正式 API 基线。

## 4. 查询 API

| 当前 API | 建议 |
| --- | --- |
| `getNodeData()` / `getEdgeData()` / `getComboData()` | 已保留；返回类型改为只读 `NodeModel` / `EdgeModel` / `ComboModel` |
| `getElementData()` | 保留并完善 element 联合返回类型 |
| `getNodes()` / `getEdges()` | 已保留为只读 `NodeModel` / `EdgeModel` 集合，不再返回 Renderer 数组类型 |
| `getNodeCount()` / `getEdgeCount()` | 保留便利 API |
| `hasNode()` / `hasEdge()` / `hasElement()` | 保留 |
| `getNeighborNodes()` / `getAdjacentEdges()` | 保留，评估返回 ID 还是数据对象 |
| `getNodePosition()` / `getElementPosition()` | 向 element API 收敛，旧方法兼容 |
| `getNodeIndex()` | 移 internal，索引是 Renderer/DataModel 实现细节 |

## 5. 状态 API

推荐稳定面使用 element 命名，避免 `item` 与 `element` 混用。

| 当前 API | 目标方向 | 兼容方式 |
| --- | --- | --- |
| `setElementStates()` | `setElementState()` 或最终确认的 element 状态 API | 需要确认集合替换语义 |
| `getItemStates()` | `getElementState()` | beta alias |
| `setItemState(id,state,value)` | element 状态增删便利 API | beta alias |
| `clearItemStates()` | element 清空状态 API | beta alias |
| `batchSetState()` | 批量 element 状态 API | 评估是否合并进 map 签名 |
| Combo 专用 set/clear/get state | 通用 element 状态 API | beta alias |
| `findNodesByState()` / `findEdgesByState()` / `findCombosByState()` | `getElementDataByState(type,state)` | 兼容新增后逐步迁移 |

状态 API 的风险在于“布尔增删某一状态”和“用完整数组替换全部状态”不是同一语义，不能只做机械重命名。

## 6. 相机、视口与坐标

| 当前 API | 建议 |
| --- | --- |
| `fitView()` / `fitCenter()` | 保留 |
| `zoomTo()` / `zoomBy()` / `getZoom()` | 保留 |
| `setSize()` | 保留；候选补齐 `getSize()` / `resize()` |
| `focusItem()` | 候选对齐 `focusElement()`，旧名转发 |
| `getCamera()` / `setCamera()` / `resetCamera()` | 作为 G6-GL 有价值的高级公开能力保留 |
| `screenToGraph()` / `graphToScreen()` | 暂不改名；先定义 graph/canvas/viewport/client 坐标含义 |
| `getCanvas()` | 候选改为 `getCanvasElement()`；当前返回 DOM Canvas，与 G6 Canvas 对象同名异义 |

坐标 API 在正式基线前必须补一份坐标系说明和往返测试，避免为了对齐名称改变实际语义。

## 7. 布局 API

| 当前 API | 建议 |
| --- | --- |
| `setLayout()` | 保留 |
| `layout()` | 保留 |
| `cancelLayout()` | 候选对齐 G6 `stopLayout()`，旧名转发 |
| — | 候选新增 `getLayout()` |
| `getLayoutNodes()` | 已标记 internal，并从发布声明剥离 |

## 8. Combo API

| 当前 API | 建议 |
| --- | --- |
| `collapseCombo()` / `expandCombo()` | 候选增加通用 `collapseElement()` / `expandElement()`，旧名保留 |
| `toggleCombo()` | 保留为 G6-GL 便利 API |
| `getComboChildren()` / `getNodeCombo()` | 保留 |
| `addToCombo()` / `removeFromCombo()` | 保留 G6-GL 扩展能力 |
| `createCombo()` / `removeCombo()` | 转发到 `addComboData()` / `removeComboData()` |
| Combo 状态 API | 迁移至通用 element 状态体系 |

## 9. 事件 API

| 当前 API | 建议 |
| --- | --- |
| `on()` / `once()` | 保留；候选返回 `this` 支持链式调用 |
| `off(event,handler)` | 保留并兼容扩展为 0/1/2 参数清理方式 |
| `eventEmitter` | 候选改为 internal，用户只通过 Graph 事件 API |

事件名称需要另行统一。目前存在 `beforelayout`、`afterlayout` 与 `layout:start`、`layout:end` 两套风格。

## 10. 建议移出稳定公开面

- `updateData(RendererData)`
- `scheduleRender()`
- `setHighlight()` / `clearHighlight()`
- `pickAt()` / `pickComboAt()`
- `getNodeIndex()`
- `getLayoutNodes()`
- `eventEmitter`

其中扩展需要的刷新、事件和查询能力应通过受控 `ExtensionContext` 提供，而不是继续公开内部方法。

## 11. 实施顺序

1. 先处理无歧义的内部泄露：`updateData(RendererData)`、pick、index、layout runtime data。
2. 增加兼容性新 API：`getOptions/setOptions`、`getSize`、`stopLayout`、`focusElement`。
3. 增加 `*Data` 数据主 API并让旧方法转发。
4. 单独设计并迁移状态 API。
5. 最后处理 `getCanvas` 和坐标体系等高风险语义冲突。

## 12. 编码前确认项

1. 是否采用 G6 `addNodeData/addEdgeData/addComboData` 作为正式主命名。
2. `updateData(RendererData)` 是直接 internal 化，还是先公开改名并保留 deprecated alias。
3. 状态 API 最终选择单状态增删还是完整集合替换作为主语义。
4. `getCanvas()` 是否在 beta 直接改为 `getCanvasElement()`。
5. `getNodes/getEdges` 的返回值是否属于公开业务数据，还是布局/渲染运行时对象。
