# 标签渲染内置策略开关变更记录

> 日期：2026-08-04
> 版本基线：`0.1.0-beta.24`

## 变更内容

- 新增公开 `LabelOptions` 类型，并通过 `@antv/g6-lite` 包根导出。
- 在 `GraphOptions` 新增顶层 `label` 配置：
  - `scaleWithZoom`：控制节点 Label 尺寸是否随 camera zoom 缩放。
  - `hideOnLowZoom`：控制节点 `0.3`、边 `0.5` 以下是否跳过 Label。
  - `hideOnCollision`：控制碰撞 Label 是否自动隐藏。
- 三项配置默认均为开启，未配置业务保持 beta.24 的既有视觉和性能行为。
- 默认和自定义节点、边 Label Renderer 统一遵守低 zoom 与碰撞开关。
- 关闭 zoom 缩放时，默认和自定义节点 Label 的字体、偏移、背景留白、最大宽度和间距保持固定屏幕尺寸。
- `Graph.updateOptions()` 支持运行时浅合并 `label` 配置并触发完整视觉刷新。
- 新增 Playground `label-rendering-options` 案例，可切换默认策略/全部标签，并在 zoom `0.2`、`0.4`、`1.0` 下对比效果。
- 修复 CI：同步 Playground 自动适配策略测试中的案例数量，并锁定 size-limit 使用的 `esbuild@0.28.0`，避免传递依赖升级导致同一产物的体积测量漂移。

## 变更原因

业务需要在画布缩小后仍以固定字号绘制全部 Label。原有 `labelFontSize` 只定义基础字号，无法关闭标签层内置的 zoom 缩放、低 zoom 隐藏和碰撞隐藏策略，因此需要通过公开 API 暴露引擎级开关。

## 兼容性与影响

- 默认值保持现有行为，无需迁移已有配置。
- 边 Label 原本已使用固定屏幕字号，因此 `scaleWithZoom: false` 主要影响节点 Label。
- 关闭低 zoom 或碰撞隐藏会增加 Canvas2D 测量和绘制次数，并允许文字互相遮挡；这是业务显式选择的效果。
- `hidden` 状态、空文本、视口裁剪、自定义 Renderer 错误隔离和 Decoration 独立碰撞行为不变。
- `esbuild` override 仅作用于 size-limit 的构建测量链路，Vite 继续使用其自身的 `esbuild@0.21.5`，不影响运行时依赖和发布包内容。

## 验证结果

- Label Renderer 与 Graph 定向测试：94 项通过。
- 全量测试：33 个测试文件、485 项测试通过。
- `npm run lint`：通过。
- `npm run typecheck`：通过。
- `npm run build`：通过，包含声明生成和包清单检查。
- `npm run size`：全新依赖解析后通过；dagre 最大组合为 `119.925 kB / 120 kB`。
- `npm run build:playground`：通过，新案例生成独立构建产物。
- `npm run examples:check -- --profile smoke`：45 个案例通过，包含 `label-rendering-options`。

测试期间保留了仓库既有的上级 `.umi/tsconfig.json` 缺失警告，该警告不影响测试与 size-limit 结果，也不是本次变更引入。
