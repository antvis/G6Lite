# API 稳定性与发布边界 (/docs/compatibility/api-stability)



G6-GL 仍处于 `0.1.x` beta 阶段。公开 API 以 npm 包根入口和 `package.json#exports` 为唯一边界；`src/` 中未从包根导出的模块属于内部实现，不承诺深层路径兼容性。

## 推荐公开入口 [#推荐公开入口]

* `Graph`：创建、渲染、更新和销毁图实例。
* `register()` 与 `extensionFactory()`：注册受控扩展。
* `runLayout()`：独立运行布局。
* 从包根导出的配置、数据、行为和扩展类型。

```ts
import { Graph, register, runLayout } from '@antv/g6-gl';
import type { GraphData, GraphOptions } from '@antv/g6-gl';
```

不要从 `@antv/g6-gl/src/...` 或构建产物内部路径导入。发布包虽然包含 `src/`，但它不是额外的公开 API 面。

## 弃用兼容层 [#弃用兼容层]

以下能力为现有项目保留，但新代码应迁移到推荐入口：

* `BaseNode`、`BreathingNode`、`registerNode()`：改用 `register()` 和函数式节点扩展。
* `context.graph`：扩展优先使用结构化的 data、state、viewport 上下文。
* ExtensionContext 平铺坐标方法：改用 `context.viewport`。
* `Graph#getAllData()`：改用明确的数据查询与更新 API。
* 旧事件字段 `originalEvent`：改用当前事件对象定义。

弃用能力会在移除前通过 Changelog 给出迁移说明；beta 阶段不承诺跨 minor 永久保留。

## 实验性能力 [#实验性能力]

Combo 的折叠、嵌套和运行时归组仍为实验性能力。可以用于验证和受控场景，但其配置细节可能在 `0.1.x` 内调整。正式使用前请覆盖真实数据、嵌套层级和增量更新回归。

## 版本兼容预期 [#版本兼容预期]

* beta 阶段：公开入口保持集中，但 API 仍可能根据契约测试和案例反馈调整。
* 稳定版后：遵循语义化版本；破坏性变更进入 major 版本。
* 每次升级前：查看 [Changelog](/docs/changelog)，并执行类型检查、构建和关键案例回归。

完整签名以 [API 参考](/docs/api) 为准。
