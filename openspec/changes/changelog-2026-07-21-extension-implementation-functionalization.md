# 扩展实现函数化（Phase 3）

## 变更内容

- 内置 `breathing-node` 改为普通 `NodeExtension` 配置和 overlay function，不再通过 `new BreathingNode()` 创建实际实现。
- `BaseNode`、`BreathingNode`、`registerNode` 继续作为 beta deprecated 兼容 API 保留。
- Node 文档和 playground 示例改为直接注册无状态配置对象，不再做冗余 factory 包装。
- `IndentedLayout`、`MindmapLayout`、`FishboneLayout` 从 class 改为纯 executor function。
- `runLayout()` 新增自研 executor 分流：注册扩展优先，其次自研 executor，最后才进入 Worker / `@antv/layout` class。
- 自研布局不再修改输入 `GraphData`，并增加非法边、环路和未连接节点保护。
- 新增自研布局坐标、元数据、输入不变性和 `worker: true` 分流测试。

## 原因

这些扩展实现没有长期状态、缓存、取消能力或待释放资源。原 class 只保存单次配置和结果，增加了不必要的构造器与 `forEachNode()` 适配层。函数化后与统一的 function/factory/config 扩展范式一致。

同时，Worker 的布局表不包含三种自研布局。此前为它们配置 `worker: true` 时会静默使用 RandomLayout；新的 executor 分流在 Worker 之前处理这些类型，保持配置和实际结果一致。

## 影响

- `new Graph(options)` 和核心引擎 class 不变。
- 包根 beta 兼容导出不变，旧 Node class 扩展仍可运行。
- 自研布局继续使用原有 `type` 和配置，不需要迁移业务代码。
- 自研布局返回新节点和 data 对象，避免通过布局执行污染输入数据。
