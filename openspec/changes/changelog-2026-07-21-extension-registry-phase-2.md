# 扩展 Registry 统一（Phase 2 首批）

## 变更内容

- 新增公开 `extensionFactory()`，作为有状态扩展的推荐注册方式。
- Registry 在注册阶段将实例、显式 factory 和 beta 兼容 constructor 归一化，不再通过 `try new → catch → call` 执行式探测。
- factory 或 constructor 创建失败时只执行一次，并通过统一错误隔离返回 `undefined`，不阻断 Graph 主链路。
- Node 与 Label 注册接入通用 registry，同时保留渲染热点所需的 descriptor 缓存。
- `BaseNode` 和 `registerNode` 标记为 beta 兼容 API。
- 自定义节点、Behavior、Layout、Transform 和 Plugin 示例改用 `register()` + `extensionFactory()`。

## 变更原因

原实现同时存在通用、Node 和 Label 三套 registry，并通过异常判断函数究竟是 constructor 还是 factory。constructor 或 factory 内部真实抛错时可能被错误重试并产生两次副作用，也可能直接中断渲染。

## 影响

- `new Graph(options)` 和 Graph 核心 class 实现不变。
- 现有对象、裸箭头 factory 和 class constructor 在 beta 阶段继续兼容。
- 新扩展获得明确的函数式注册范式。
- Node/Label 重复注册会正确失效旧缓存。
- 包体积仍低于 120 kB 限制。
