# 标签渲染内置策略开关技术方案

> 状态：已实现，验证通过
> 日期：2026-08-04
> 范围：节点 Label、边 Label；不包含 Combo Label 和节点 Decoration

## 1. 背景

G6Lite `0.1.0-beta.24` 的节点和边 Label 由独立 Canvas2D 标签层统一调度。业务虽然可以通过 `labelFontSize` 配置字号，但标签层仍会应用以下内置策略：

1. 节点 Label 的字号、偏移、背景留白和最大宽度会随 zoom 按受限比例缩放。
2. 低 zoom 时直接跳过 Label：节点阈值为 `0.3`，边阈值为 `0.5`。
3. 节点和边 Label 共用碰撞网格，发生碰撞时后绘制的 Label 不绘制；当前节点先于边绘制，因此节点 Label 优先。

这些策略目前没有公开配置。仅设置 `labelFontSize` 无法满足“画布缩小后，所有标签仍以固定屏幕尺寸完整绘制”的业务诉求。

## 2. 目标

- 为上述三项引擎内置策略分别增加公开开关。
- 支持业务关闭 zoom 缩放后，让节点 Label 尺寸保持为固定屏幕像素。
- 支持业务关闭低 zoom 隐藏后，在任意有效 zoom 下继续尝试绘制节点和边 Label。
- 支持业务关闭碰撞隐藏后，绘制所有位于视口内且内容有效的节点和边 Label。
- 默认配置保持 `0.1.0-beta.24` 的现有行为，避免未配置业务发生视觉和性能回归。
- 默认 Label Renderer 和自定义 Label Renderer 使用同一套引擎策略配置。
- 支持通过 `graph.updateOptions()` 在运行时更新开关并触发重绘。
- 增加 Playground 独立案例，支持交互对比默认策略与三项策略全部关闭的效果。

## 3. 非目标

- 不开放节点 `0.3`、边 `0.5` 的低 zoom 阈值配置。
- 不提供节点和边的独立策略覆盖；本次三个开关统一作用于节点和边 Label。
- 不改变 Label 的绘制顺序和优先级。
- 不改变 `hidden` 状态、空文本、视口裁剪和无效自定义测量结果的过滤规则。
- 不改变节点图标、节点 Overlay、Decoration 或 Combo Label 的 zoom 与碰撞行为。
- 不修改业务自定义 Label Renderer 内部主动根据 `zoom` 跳过绘制的逻辑。
- 不新增多行、富文本或 DOM Label 能力。

## 4. 现状确认

当前实现分布如下：

- `src/types.ts`
  - `GraphOptions` 没有全局 Label 渲染策略配置。
  - `NodeConfig`、`EdgeConfig` 只声明 Label 内容、样式和自定义 Renderer。
- `src/renderer/labelStyle.ts`
  - `getLabelZoom(zoom)` 将缩放比例限制在 `[0.25, 2]`。
  - 默认节点 Label 和自定义节点 Label 通过该规则换算 Label 尺寸。
  - 边 Label 当前只按 DPR 换算，本身已经保持固定屏幕字号。
- `src/renderer/labelRenderer.ts`
  - 节点 Label 仅在 `zoom >= 0.3` 时绘制。
  - 边 Label 仅在 `zoom >= 0.5` 时绘制。
  - 默认和自定义节点、边 Label 都通过同一个 `LabelGrid` 执行碰撞隐藏。
  - Decoration 使用独立的 `decorationGrid`，不属于本次开关范围。
- `src/graph.ts`
  - Graph 在 WebGL 主层完成绘制后调用 `LabelLayerRenderer.draw()`，可在此传入 Graph 级 Label 配置。

## 5. 公开 API 设计

新增 `LabelOptions`，并通过包根导出：

```ts
export interface LabelOptions {
  /**
   * Whether engine-managed label dimensions scale with camera zoom.
   * Defaults to true. Edge labels are already fixed-size in the current renderer.
   */
  scaleWithZoom?: boolean;

  /**
   * Whether labels are hidden below the built-in low-zoom thresholds.
   * Defaults to true. The current thresholds are 0.3 for nodes and 0.5 for edges.
   */
  hideOnLowZoom?: boolean;

  /**
   * Whether labels that collide with an earlier label are hidden.
   * Defaults to true.
   */
  hideOnCollision?: boolean;
}

export interface GraphOptions {
  // existing options...
  label?: LabelOptions;
}
```

典型用法：

```ts
const graph = new Graph({
  container,
  data,
  label: {
    scaleWithZoom: false,
    hideOnLowZoom: false,
    hideOnCollision: false,
  },
  node: {
    style: {
      label: (node) => node.id,
      labelFontSize: 12,
    },
  },
  edge: {
    style: {
      label: (_source, _target, edge) => edge.id ?? '',
      labelFontSize: 10,
    },
  },
});
```

选择顶层 `label` 的原因：

- 三项能力是 Label 层的遍历、换算和过滤策略，不是单个元素的视觉样式。
- 节点与边共用碰撞网格，碰撞开关天然属于 Graph 级配置。
- 避免在 `node` 和 `edge` 中重复配置才能实现“全部标签可见”。
- 保留未来扩展独立阈值或优先级策略的空间，而不污染 `NodeStyleConfig` / `EdgeConfig.style`。

## 6. 配置语义

### 6.1 默认值与兼容性

三个字段都采用 `undefined` 等价于 `true`：

```ts
const scaleWithZoom = options.scaleWithZoom !== false;
const hideOnLowZoom = options.hideOnLowZoom !== false;
const hideOnCollision = options.hideOnCollision !== false;
```

因此未传 `label`、传空对象或只修改其中一个开关时，其余策略都保持 `0.1.0-beta.24` 行为。

### 6.2 `scaleWithZoom`

`true`：

- 节点 Label 保持现有受限 zoom 缩放语义。
- 默认节点 Label 沿用当前 `toLabelScreenPx()` 换算。
- 自定义节点 Label 的 `ResolvedLabelStyle` 沿用当前 zoom/DPR 换算。
- 边 Label 保持现有固定屏幕尺寸，不新增 zoom 缩放。

`false`：

- 节点 Label 的字体、偏移、背景留白、最大宽度和水平间距只按 DPR 换算，不再乘 camera zoom。
- 默认和自定义节点 Label 使用相同的固定屏幕尺寸语义。
- 节点本体仍随 camera zoom 缩放，Label 锚点继续基于节点实际屏幕边界计算。
- 边 Label 已是固定屏幕尺寸，因此视觉尺寸不变。

这里按“完整 Label 尺寸”而不只按字体切换，避免字体固定后背景、偏移和碰撞包围盒仍缩放，造成测量与绘制不一致。

### 6.3 `hideOnLowZoom`

`true`：

- `zoom < 0.3` 时跳过节点 Label。
- `zoom < 0.5` 时跳过边 Label。

`false`：

- 移除以上两处引擎级低 zoom 跳过条件。
- Label 仍需满足内容有效、元素非 `hidden`、位于视口附近等既有条件。
- 自定义 Renderer 仍可读取原始 `zoom` 并自行决定是否绘制；G6Lite 不覆盖业务 Renderer 的内部逻辑。

### 6.4 `hideOnCollision`

`true`：

- 保持现有共享 `LabelGrid` 行为。
- 节点 Label 先登记，后续节点或边 Label 命中已占用网格时跳过绘制。

`false`：

- 默认和自定义节点、边 Label 均跳过 `hasOverlap()` 判断。
- Label 不再向共享碰撞网格登记占用区域，避免无意义计算。
- 允许 Label 彼此重叠，也允许边 Label 与节点 Label 重叠。
- Decoration 的独立碰撞网格不受影响。

## 7. 运行时更新

扩展 `Graph.updateOptions()` 的公开参数范围：

```ts
updateOptions(
  opts: Partial<Pick<GraphOptions, 'node' | 'edge' | 'theme' | 'label'>>,
): void;
```

更新规则：

- `label` 与现有配置浅合并，未传字段保留原值。
- 更新后复用现有完整视觉刷新流程，不重跑布局，不改变数据和 camera。
- 下一次 `Renderer.afterDraw` 使用最新 Label 配置重绘标签层。

示例：

```ts
graph.updateOptions({
  label: {
    hideOnCollision: false,
  },
});
```

## 8. 内部实现方案

### 8.1 类型与导出

- 在 `src/types.ts` 新增 `LabelOptions`。
- 在 `GraphOptions` 新增 `label?: LabelOptions`。
- 在 `src/index.ts` 从包根导出 `LabelOptions`。
- 扩展 `Graph.updateOptions()` 对 `label` 的合并和刷新支持。

### 8.2 Graph 到标签层的配置传递

- `Graph.mountOverlayRuntime()` 在调用 `LabelLayerRenderer.draw()` 时传入 `this.options.label`。
- `LabelLayerRenderer.draw()` 将三个开关解析为带默认值的内部策略。
- 内部方法只接收已经解析后的布尔值，避免在每个 Label 上重复处理 `undefined`。

### 8.3 zoom 尺寸换算

- 保持 `toLabelScreenPx()` 和 `resolveNodeLabelStyle()` 的原有签名，避免增加内部运行时代码和改变既有调用契约。
- zoom 缩放关闭时，标签层向现有换算函数传入中性 zoom，使所有 Label 尺寸以 CSS 像素配置值乘 DPR，作为 Canvas backing-store 尺寸。
- 默认节点 Label 和自定义节点 Label 共用同一缩放决策，确保测量、碰撞包围盒与实际绘制一致。
- 不修改边 Label 当前只按 DPR 换算的逻辑。

### 8.4 低 zoom 过滤

- 节点绘制条件从固定 `zoom >= 0.3` 调整为“低 zoom 隐藏关闭，或 zoom 达到节点阈值”。
- 边绘制条件从固定 `zoom >= 0.5` 调整为“低 zoom 隐藏关闭，或 zoom 达到边阈值”。
- 阈值保留为内部常量，避免散落魔法数字，但本次不作为公开配置。

### 8.5 碰撞过滤

- 默认节点、自定义节点、默认边、自定义边四条路径统一受 `hideOnCollision` 控制。
- 关闭后同时跳过碰撞查询和登记。
- 保留视口裁剪；关闭碰撞不意味着绘制视口外 Label。
- 不修改 `decorationGrid`。

## 9. 测试方案

### 9.1 Label Renderer 单元测试

在 `tests/unit/renderer/labelRenderer.test.ts` 覆盖：

- 默认配置继续保留节点 zoom 尺寸缩放。
- `scaleWithZoom: false` 时，节点 Label 在不同 zoom 下得到相同 CSS 屏幕字号。
- 自定义节点 Label 在关闭 zoom 缩放后收到只按 DPR 换算的 `ResolvedLabelStyle`。
- 默认配置在节点 `zoom < 0.3`、边 `zoom < 0.5` 时继续跳过。
- `hideOnLowZoom: false` 时，节点和边 Label 在低 zoom 下进入绘制路径。
- 默认配置下重叠 Label 只绘制第一个。
- `hideOnCollision: false` 时，重叠的默认 Label 全部绘制。
- `hideOnCollision: false` 时，重叠的自定义 Label 全部调用 `draw()`。
- Decoration 碰撞行为不受 Label 开关影响。

### 9.2 Graph 与公开 API 测试

- 在 `tests/unit/publicApi.type-test.ts` 验证 `LabelOptions` 可从 `@antv/g6-lite` 根入口导入，且 `GraphOptions['label']` 类型正确。
- 在 `tests/unit/graph.test.ts` 验证 Graph 将构造配置传给标签层。
- 验证 `graph.updateOptions({ label: ... })` 合并配置并触发刷新。
- 保留已有自定义 Label Renderer 错误隔离、回退和生命周期测试。

### 9.3 工程验证

已执行：

```bash
npm test -- tests/unit/renderer/labelRenderer.test.ts tests/unit/graph.test.ts
npm run lint
npm run typecheck
npm run build
npm run size
npm run build:playground
npm run examples:check -- --profile smoke
```

`npm run build` 包含声明构建和包清单检查，用于确认 `LabelOptions` 正确进入根声明，且测试、方案和内部工具不进入发布包。

验证结果：全量 33 个测试文件、485 项测试通过；lint、typecheck、build、size、Playground 构建、45 个 smoke 示例浏览器检查和包清单检查通过。`size-limit` 的 dagre 组合为 `119.92 kB / 120 kB`。

## 10. 验收标准

1. 未配置 `GraphOptions.label` 时，节点字号缩放、低 zoom 隐藏和碰撞隐藏与 `0.1.0-beta.24` 一致。
2. 配置三个开关为 `false` 后，在 `zoom = 0.1` 的视口内：
   - 节点 Label 仍按配置字号的固定屏幕尺寸绘制。
   - 边 Label 仍进入绘制流程。
   - 发生碰撞的节点和边 Label 不再被 G6Lite 自动跳过。
3. 默认 Label Renderer 与自定义 Label Renderer 都遵守三个开关。
4. `graph.updateOptions()` 可单独更新任一开关，未传字段保持原配置，并立即在后续帧生效。
5. `hidden` 元素、空 Label、视口外 Label 和非法自定义布局仍按现有规则过滤。
6. 节点、边、图标、Decoration、Combo、布局、交互和 camera 行为不受无关影响。
7. Label 相关单测、公开 API 类型测试、lint、typecheck、build、size 和包清单检查全部通过。

## 11. 风险与取舍

### 11.1 全量标签的视觉重叠

关闭碰撞隐藏后，密集图上的 Label 会互相遮挡。这是业务显式选择的结果，G6Lite 不再保证文字互不覆盖。

### 11.2 低 zoom 性能

关闭低 zoom 隐藏和碰撞隐藏会增加测量与 Canvas2D 绘制次数，尤其会放大自定义 Label Renderer 的成本。默认值继续开启，以保留现有大图性能策略。

### 11.3 节点与边阈值不一致

当前真实行为是节点 `0.3`、边 `0.5`。本次以兼容性为先保留该差异，只提供统一启停开关；如后续业务需要自定义阈值，再单独设计数值配置。

### 11.4 固定字号与节点缩放的关系

关闭 zoom 缩放后，Label 保持屏幕可读，但节点本体仍会继续缩小，Label 可能明显大于节点。这符合本需求，不自动调整节点或 Label 位置优先级。

## 12. 预计修改范围

- `src/types.ts`
- `src/index.ts`
- `src/graph.ts`
- `src/renderer/labelRenderer.ts`
- `tests/unit/renderer/labelRenderer.test.ts`
- `tests/unit/graph.test.ts`
- `tests/unit/publicApi.type-test.ts`
- `playground/demos/label-rendering-options.ts`
- `playground/demos/catalog.json`
- `openspec/changes/changelog-2026-08-04-label-rendering-strategy-switches.md`（实现完成后新增）

不修改站点样式、布局、行为、WebGL 主渲染器和发布配置。
