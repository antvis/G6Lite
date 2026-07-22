# Extension 生命周期与实例作用域

> 状态：已完成并验收

## 生命周期基线

所有具有运行时状态的扩展统一使用以下公共阶段：

1. `create`：由 registry 根据显式 factory 或 beta 兼容输入创建实例。
2. `init(context, options)`：注入上下文和首次配置。
3. `update(options)`：复用实例时更新配置。
4. 类别能力阶段：Behavior `getEvents`、Layout `execute`、Transform `beforeRender`、Plugin `mount`。
5. `destroy()`：解除事件、DOM、缓存和其他资源。

`create/init/update/destroy` 均由 registry 的统一错误隔离执行。单个扩展失败只记录当前阶段错误，不中断 Graph 主链路。

## 实例作用域

| 类别 | 实例作用域 | 生命周期 |
| --- | --- | --- |
| Node / Edge / Label / Decoration | 全局无状态 descriptor，解析后缓存 | create；重复注册使缓存失效 |
| Behavior | 每个 Graph、每次 Behavior 挂载 | create → init → getEvents → destroy |
| Layout | 每次 layout execute | create → init → execute → destroy |
| Transform | 每个 Graph、每个已配置类型 | create → init；后续 update；Graph destroy 时 destroy |
| Plugin | 每个 Graph、每次 render/mount | create → init → mount → destroy |

## 同步约束

当前 `init/update/destroy` 是同步生命周期。Layout `execute` 可以异步。正式支持异步 lifecycle 前，所有调用点必须统一增加 await 和竞态/取消语义，不能只修改类型声明。

## Beta 兼容

- 推荐：`extensionFactory(() => extension)`。
- 无状态 descriptor 可以直接注册对象。
- 裸箭头 factory、对象和 class constructor 暂时兼容。
- Plain object 会递归复制 enumerable 状态，零参数 class instance 会重新构造；这两类均属于尽力兼容，只有 `extensionFactory()` 保证有状态实例隔离。
- constructor/factory 兼容分类只发生在注册阶段；实例化失败不会换另一种方式重试。

## ExtensionContext 能力边界

- `data`：受控的节点/边查询与业务数据更新。
- `state`：元素状态读取、替换和清理。
- `viewport`：坐标转换与 zoom 查询。
- `requestRender()`：请求引擎调度刷新。
- `graph`：仅用于 beta 兼容，新增扩展不得依赖。

上下文返回的节点和边为公开只读数据快照，状态集合和顶层 `data` 对象会复制，扩展不能直接修改 DataModel 内部对象。更深层业务对象不承诺递归克隆。

Layout 和 Transform 的当前操作输入必须分别以 `execute(data, runtime)` 与 `beforeRender(data)` 参数为准。`context.data` 只表示 Graph 当前已提交数据，首次 render 可能为空，数据替换或重复 render 时可能是上一版。

Graph 管理的 Layout 执行 `init → execute → destroy`。独立 `runLayout(data, config)` 没有 Graph context，因此跳过 `init()`、直接执行 `execute()`，最后仍执行 `destroy()`。布局在 init 后、异步 execute 后和 Worker/第三方布局返回后均检查取消信号，已取消结果不进入当前渲染代次。

## Behavior 冲突规则

注册 Behavior 与内置 Behavior 同名时，显式注册版本优先。若注册版本创建或 init 失败，不会静默回退到同名内置实现，避免实际运行行为与配置预期不一致。

内置 Behavior 仍可使用 Renderer 优化通道，但与注册 Behavior 统一进入 Graph 的 mount/teardown 调度。

## 正式版前兼容清理

- 决定何时删除 beta constructor、对象实例注册与 `context.graph` 兼容层。
