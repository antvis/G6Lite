# Graph API Phase 4 基线收口

## 变更内容

- 在 API 与技术架构方案中补齐 Graph 发布声明全部一级成员的完整分组。
- 明确 `new Graph(options)` 永久保留，并冻结现有 Graph 方法名，不新增仅用于对齐 G6 的
  `*Data`、`setOptions/getOptions`、`stopLayout`、`focusElement` 等同义入口。
- 将 `getData()` 定为推荐数据快照入口，`toData()` 定为 deprecated 兼容入口。
- 固化单状态增删、批量单状态操作、完整状态集合替换和 Combo 状态便利方法的不同语义。
- 明确 Graph、client viewport、Canvas 局部和 backing-store 四类坐标边界，以及
  `getCamera()` 返回只读快照的契约。
- 补齐 ExtensionContext 与 Graph internal 成员的替代关系，禁止扩展、示例和文档依赖
  `eventEmitter`、`getCanvas()`、`scheduleRender()` 等内部能力。

## 变更原因

Phase 4 已完成发布声明和公共 Model 类型的边界整理，但历史 Graph API 评审仍保留多组候选
G6 alias，状态、坐标和相机语义也没有形成最终结论。正式进入生态迁移前，需要先冻结唯一的
Graph 命名和职责基线，避免后续测试、示例与官网继续分叉。

## 影响

- 本次只修改 OpenSpec 文档，不改变运行时代码和发布产物。
- 后续实现需要按该基线补齐数据快照、`toData()` deprecated 标记、相机快照、坐标专项测试
  和生命周期验证。
- Phase 6 只迁移生态使用方式并生成最终 API 快照，不再新增第二套 Graph 同义 API。
