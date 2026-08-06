# Label and Decoration Visibility Controls

> 状态：已实现并完成本地验证
> 日期：2026-08-06
> 目标：开放节点/边 Label 的最小展示 zoom，并为节点 Decoration 增加最小展示 zoom 与碰撞隐藏开关
> 联合实施：与 `openspec/specs/node-picking-hit-area-alignment/spec.md` 在同一研发波次实现和验证

## 1. 背景

KGBase 使用 `@antv/g6-lite@0.1.0-beta.25` 展示实体、关系标签以及节点附属的 Decoration。当前存在两类业务不可配置的引擎策略：

1. 节点 Label 在 `zoom < 0.3` 时隐藏，边 Label 在 `zoom < 0.5` 时隐藏。`GraphOptions.label.hideOnLowZoom` 只能整体启停，不能配置节点和边的实际阈值。
2. 所有 Decoration 都强制参与独立碰撞网格，没有最小展示 zoom，也不能关闭碰撞隐藏。相邻节点的 Decoration 重叠时，后绘制 Decoration 会消失；缩放改变包围盒后又可能恢复，造成展示不稳定。

这两类策略属于 G6Lite 通用标签层调度，不应由 KGBase 访问内部 Renderer 或复制碰撞逻辑规避。

## 2. 现状与根因

### 2.1 Label 阈值硬编码

`src/renderer/labelRenderer.ts` 当前定义：

```ts
const NODE_LABEL_MIN_ZOOM = 0.3;
const EDGE_LABEL_MIN_ZOOM = 0.5;
```

当 `hideOnLowZoom` 为默认值 `true` 时，节点和边只能使用以上固定阈值。此前 `label-rendering-strategy-switches` 规格明确把数值阈值配置留到后续，本次需求补齐该能力。

### 2.2 Decoration 强制碰撞隐藏

`drawNodeDecorations()` 对每个 Decoration 无条件执行：

```ts
if (this.decorationGrid.hasOverlap(...)) continue;
```

绘制完成后又无条件把包围盒注册到 `decorationGrid`。`NodeDecorationConfig` 没有策略开关，因此业务无法选择“允许重叠并完整展示”。

### 2.3 Decoration 没有 zoom 门槛

Decoration 在节点位于视口内时始终执行 renderer 查找、数据解析、测量、布局、碰撞和绘制。业务无法像 Label 一样在低 zoom 时隐藏附属内容，也无法减少低 zoom 下的测量与绘制成本。

## 3. 目标

1. 节点和边 Label 的最小展示 zoom 可分别配置。
2. KGBase 可把节点和边 Label 阈值统一设置为 `0.5`。
3. 单个 Decoration 可配置最小展示 zoom。
4. 单个 Decoration 可关闭引擎碰撞隐藏；关闭后不被其他 Decoration 隐藏，也不占用碰撞网格抑制后续 Decoration。
5. 未配置新字段时保持 `0.1.0-beta.25` 的默认行为。
6. 默认 Renderer 和自定义 Label/Decoration Renderer 使用同一套引擎可见性策略。
7. 支持通过现有 `graph.updateOptions()` 更新 Label 阈值或节点 Decoration 配置并触发视觉刷新。

## 4. 非目标

- 不改变 Label 的碰撞优先级、字号缩放、视口裁剪或文本测量规则。
- 不合并 Label 与 Decoration 的碰撞网格。
- 不新增 Decoration 优先级、避让方向、自动位移或智能排布算法。
- 不修改 Decoration Renderer 的 `measure()` / `draw()` 扩展协议。
- 不改变 Combo Label、节点 Icon、Overlay 或 WebGL 主图层的 zoom 行为。
- 不在本次修改 KGBase 仓库、升级业务依赖、提交发布版本或执行 npm publish。

## 5. 公开 API

### 5.1 Label 最小展示 zoom

扩展现有 `LabelOptions`：

```ts
export interface LabelOptions {
  scaleWithZoom?: boolean;
  hideOnLowZoom?: boolean;
  hideOnCollision?: boolean;

  /** Minimum camera zoom for node labels. Defaults to 0.3. */
  nodeMinZoom?: number;

  /** Minimum camera zoom for edge labels. Defaults to 0.5. */
  edgeMinZoom?: number;
}
```

语义：

- `hideOnLowZoom !== false` 时使用 `nodeMinZoom` / `edgeMinZoom`；
- `hideOnLowZoom === false` 时保持现有语义，忽略数值阈值并尝试绘制所有有效 Label；
- 未配置时分别回退 `0.3` 和 `0.5`；
- 只接受有限且大于等于 `0` 的数值，非法值回退默认阈值；
- 两个阈值相互独立，不要求节点阈值小于边阈值。

KGBase 目标配置：

```ts
label: {
  nodeMinZoom: 0.5,
  edgeMinZoom: 0.5,
}
```

### 5.2 Decoration 可见性配置

扩展 `NodeDecorationConfig`：

```ts
export interface NodeDecorationConfig<T = unknown> {
  renderer: string;

  /** Minimum camera zoom for this decoration. Defaults to 0. */
  minZoom?: number;

  /** Whether collisions hide this decoration. Defaults to true. */
  hideOnCollision?: boolean;

  // existing fields...
}
```

语义：

- `minZoom` 未配置或为非法值时按 `0` 处理，保持 Decoration 始终可参与绘制；
- `zoom < minZoom` 时在 renderer 查找和 `measure()` 前跳过，减少无效计算；
- `hideOnCollision !== false` 时保持现有碰撞查询和登记；
- `hideOnCollision === false` 时跳过碰撞查询，也不向 `decorationGrid` 登记占用区域；
- 同一节点存在多个 Decoration 时，每个配置独立决定是否参与碰撞。

KGBase 可按需要组合：

```ts
decorations: [
  {
    renderer: 'builtin-badge',
    minZoom: 0.5,
    hideOnCollision: false,
  },
]
```

## 6. 内部实现

### 6.1 阈值解析

在 Label 层集中解析一次配置，避免每个节点和边重复校验：

```ts
const nodeMinZoom = resolveMinZoom(labelOptions?.nodeMinZoom, 0.3);
const edgeMinZoom = resolveMinZoom(labelOptions?.edgeMinZoom, 0.5);
```

节点和边绘制条件分别改为解析后的阈值。阈值只决定是否进入 Label 绘制路径，不改变字号、位置或碰撞包围盒。

### 6.2 Decoration 早期过滤

`drawNodeDecorations()` 在每个配置循环开头解析 `minZoom`。低于阈值时直接 `continue`，不执行 renderer 查找、数据函数、测量、排序、overflow、碰撞或 hover region 注册。

### 6.3 Decoration 碰撞策略

仅当 `hideOnCollision !== false` 时：

1. 查询 `decorationGrid.hasOverlap()`；
2. 绘制成功后记录待登记包围盒；
3. 当前节点 Decoration 处理完成后注册包围盒。

关闭碰撞隐藏的 Decoration 仍执行视口裁剪、有效布局检查和 renderer 错误隔离。

### 6.4 运行时更新

- `Graph.updateOptions({ label: ... })` 已支持浅合并 LabelOptions，新字段自动沿用该链路。
- `Graph.updateOptions({ node: { decorations: ... } })` 沿用现有节点配置更新和完整视觉刷新。
- 更新后清空本帧 Decoration hover regions，下一帧仅为实际绘制的 Decoration 重新登记命中区域。

## 7. 预计修改范围

- `src/types.ts`：扩展 `LabelOptions` 和 `NodeDecorationConfig`。
- `src/renderer/labelRenderer.ts`：解析 Label 阈值、Decoration zoom 和碰撞策略。
- `tests/unit/renderer/labelRenderer.test.ts`：新增 Label/Decoration 策略回归。
- `tests/unit/graph.test.ts`：验证运行时 Label 阈值合并。
- `tests/unit/packageConsumer.type-test.ts` 或 `tests/unit/publicApi.type-test.ts`：验证包根公开类型。
- `site/content/docs/zh/guides/node.mdx`、对应英文指南或 Label 指南：记录新配置和默认值。
- `openspec/changes/`：实现完成后新增变更记录。

不修改 `package.json`、站点首页样式、布局、WebGL 节点几何、业务仓库或发布配置。

## 8. 验收标准

1. 未配置新字段时，节点 Label 阈值仍为 `0.3`，边 Label 阈值仍为 `0.5`，Decoration 仍始终参与绘制并默认执行碰撞隐藏。
2. 配置 `nodeMinZoom: 0.5` 后，节点 Label 在 `zoom=0.49` 不绘制，在 `zoom=0.5` 绘制。
3. 配置 `edgeMinZoom: 0.5` 后，边 Label 在 `zoom=0.49` 不绘制，在 `zoom=0.5` 绘制。
4. `hideOnLowZoom:false` 时，即使配置更高数值阈值，节点和边 Label 仍进入绘制路径。
5. Decoration 配置 `minZoom:0.5` 后，`zoom=0.49` 不调用 `measure()` / `draw()`，`zoom=0.5` 正常执行。
6. 两个 Decoration 包围盒重叠且保持默认配置时，仍只绘制先占用网格的 Decoration。
7. 配置 `hideOnCollision:false` 的 Decoration 即使发生重叠也会绘制，且不会抑制后续启用碰撞的 Decoration。
8. Decoration 因 zoom 或碰撞未绘制时，不生成 hover-expand 命中区域。
9. 默认和自定义 Label Renderer 都遵守可配置阈值；所有 Decoration Renderer 都遵守 `minZoom` 与碰撞开关。
10. `graph.updateOptions()` 更新配置后下一次完整视觉刷新生效，不重跑布局、不改变 camera。
11. 类型检查、Label/Decoration 定向测试、全量测试、构建、包体与 npm 包清单验证通过。

## 9. 验证计划

实施后至少执行：

```bash
npm run lint
npm run typecheck
npm test -- tests/unit/renderer/labelRenderer.test.ts tests/unit/graph.test.ts tests/unit/publicApi.type-test.ts tests/unit/packageConsumer.type-test.ts
npm test
npm run build
npm run size
npm pack --dry-run
```

浏览器验证与节点 Picking 修复共用同一次 Playwright 临时服务和报告，覆盖：

- zoom 从 `0.49` 切换到 `0.5` 时 Label/Decoration 的边界行为；
- 相邻节点 Decoration 默认碰撞隐藏与关闭碰撞后的完整展示；
- zoom 往返后 Decoration 展示结果稳定；
- DPR 1 / 2 下阈值与碰撞配置一致。

## 10. 风险与控制

- **关闭碰撞后的视觉遮挡**：属于业务显式选择；G6Lite 保证不跳过，但不保证内容互不覆盖。
- **降低阈值后的性能成本**：更多 Label/Decoration 会进入测量和绘制；默认值保持现状，业务按场景配置。
- **配置组合复杂度**：`hideOnLowZoom:false` 明确优先于数值阈值；Decoration 的 zoom 和碰撞配置彼此独立。
- **公开 API 增长**：只增加四个可选数值/布尔字段，不引入新对象层级或内部模块暴露。

## 11. 实施门禁

本规格与 `node-picking-hit-area-alignment` 的联合范围经用户确认后，才允许修改实现代码。范围确认只授权本地编辑和验证，不包含 commit、push、PR、DIMA 更新、版本升级、发布或部署。

