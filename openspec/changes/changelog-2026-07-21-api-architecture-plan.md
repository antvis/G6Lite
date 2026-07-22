# API 与技术架构方案确认记录

## 变更内容

- 确认 `new Graph(options)` 为唯一推荐且长期保留的公开创建方式。
- 明确 `Graph` 底层继续采用真正的 class 实现，不增加 `createGraph()`。
- 核心有状态模块保留 class，包括 DataModel、Renderer、Scheduler、渲染管理器和 WebGL Programs。
- 将 function/factory/config 的使用范围收敛到用户扩展和无状态计算逻辑。
- 自研布局根据是否持有状态、缓存和取消能力分别选择 class 或 function。
- 调整实施阶段，取消全量 class 函数化和 WebGL Program 函数化计划。

## 变更原因

G6 当前的 Graph 和内部 Controller 采用 class，`new Graph(options)` 是稳定的用户心智。有状态对象和 GPU 资源管理也更适合使用 class。优化重点应放在统一用户扩展范式，而不是机械消除内部 class。

## 影响

- Graph 初始化方式保持兼容。
- 核心模块不承担无必要的重写风险。
- 后续破坏性调整主要集中在扩展注册、生命周期、上下文和类型契约。
- 测试、示例、README 和官网将在扩展 API 基线确认后统一迁移。
