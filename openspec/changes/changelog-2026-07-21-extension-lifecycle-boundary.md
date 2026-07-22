# 扩展生命周期与公开边界整理

## 变更内容

- 新增统一的 `initializeExtension`、`updateExtension`、`destroyExtension` 内部调用器。
- Behavior、Layout、Transform、Plugin 的公共生命周期阶段统一接入错误隔离。
- 增加 Layout per-execute 实例作用域测试和通用 lifecycle 测试。
- 从包根移除 DataModel、RenderScheduler、RefreshLevel、RendererData 及相关内部类型。
- NodeExtension 契约移动到正式 Extension API 分组。
- 补充导出公开 `Graph.getNodes()` 签名引用的 `LayoutNode` 类型。
- 新增包根运行时导出快照测试，阻止内部实现重新泄露。
- Graph 中的 Renderer 拾取、索引、调度和直接数据通道标记为 `@internal`，API 文档启用 `excludeInternal`。

## 原因

扩展类别此前分别调用 init/update/destroy，容易出现错误处理和销毁行为漂移；同时包根仍暴露数据模型、调度器和 Renderer 契约，使业务可能依赖内部实现。

## 影响

- `new Graph(options)` 及现有 Graph 使用方式不变。
- 扩展异常不会阻断主渲染链路。
- 内部 DataModel、Scheduler、RendererData 不再属于包根公开 API。
- 业务定制应使用 Graph 与 Extension API，不直接依赖内部渲染和调度模块。
