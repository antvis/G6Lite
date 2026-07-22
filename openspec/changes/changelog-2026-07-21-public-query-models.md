# Graph 公开查询模型类型整理

## 变更内容

- 新增只读公开类型 `NodeModel`、`EdgeModel`、`ComboModel` 和联合类型 `ElementModel`。
- `Graph.getNodeData()`、`getEdgeData()`、`getComboData()`、`getElementData()` 改用上述公共类型声明。
- `Graph.getNodes()`、`getEdges()` 改为返回 DataModel 支撑的只读 Model 集合，不再声明为 Renderer 的 `LayoutNode[]` / `GraphEdge[]`。
- `ComboStyleValue` 的回调参数改为 `ComboModel`，避免扩展类型继续引用内部存储类型。
- `InternalNode`、`InternalEdge`、`InternalCombo` 保留为 DataModel 和 Renderer 内部可变记录，但不再从包根导出。
- `LayoutNode`、`ParallelEdgeMeta` 不再从包根导出；并行边元数据继续作为引擎内部渲染信息。
- TypeScript 构建开启 `stripInternal`，标记为 `@internal` 的 Graph 成员不再进入发布声明。
- 新增消费端 TypeScript 编译夹具，覆盖公开 getter、只读约束和 `Internal*` 根导入失败。
- 构建后自动检查发布声明，防止内部 Graph 成员或 `Internal*` 类型重新进入包根契约。

## 原因

公开 API 原先直接使用 `Internal*` 命名，既泄露 DataModel 的存储实现，也让用户难以判断这些类型是否属于稳定契约。新的 Model 类型明确表达“已归一化、包含运行时计算结果、供查询读取”的语义，并通过只读视图引导数据更新统一走 Graph API。

## 影响

- 运行时对象和查询性能不变，仍为 O(1) 查询。
- Model 是由 Graph 持有的只读视图，不承诺不可变快照或稳定对象身份。
- TypeScript 用户应从包根导入新的 `*Model` 类型；`Internal*` 不再属于公共包根 API。
- 底层仍使用可变集合维护状态和 Combo 关系，本次不改变渲染与数据更新行为。
