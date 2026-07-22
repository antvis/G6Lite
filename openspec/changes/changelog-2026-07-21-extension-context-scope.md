# ExtensionContext 与扩展实例作用域收口

## 变更内容

- `ExtensionContext` 新增 `data`、`state`、`viewport` 三组受控能力。
- `context.graph` 和旧的平铺 viewport 方法保留 beta 兼容并标记 deprecated。
- 注册 Behavior 与内置 Behavior 同名时，注册版本明确优先。
- Behavior init 失败时不再继续绑定事件，并立即执行 destroy。
- Transform 实例由“类型名称”改为“配置位置 + 类型”隔离，同类型多配置不共享状态。
- Transform 配置减少或更新失败时立即销毁失效实例。
- Plugin init 失败时不再执行 mount；重复挂载会先销毁旧实例。
- playground 和官网扩展示例不再依赖 `context.graph`。

## 原因

扩展直接持有完整 Graph 会绕过公开能力边界；Transform 按类型名称缓存会导致同类型配置意外共享状态；内置 Behavior 优先级又会让同名注册扩展静默失效。

## 影响

- 新增扩展可仅依赖稳定的 data/state/viewport 能力。
- 现有依赖 `context.graph` 的扩展在 beta 阶段继续工作。
- 同一 Graph 内多个同类型 Transform 拥有独立生命周期。
- Behavior 和 Plugin 的失败、重挂载与销毁行为更可预测。
