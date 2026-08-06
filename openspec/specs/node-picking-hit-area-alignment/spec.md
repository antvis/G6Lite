# Node Picking Hit Area Alignment

> 状态：已实现并完成本地验证
> 日期：2026-08-05
> 目标：修复圆节点命中范围大于可见实体的问题，并统一 GPU Picking 与 CPU fallback 的节点命中语义

> 联合实施：本规格计划与 `openspec/specs/label-decoration-visibility-controls/spec.md` 在同一研发波次实现和验证；任一规格范围变化都会使联合确认失效。

## 1. 背景

KGBase 在实体密集或相邻节点距离较近的场景中，出现鼠标尚未进入节点可见区域就能触发选中、拖拽或 Tooltip 的现象。当前使用版本为 `@antv/g6-lite@0.1.0-beta.25`。

仓库代码确认该问题位于 G6Lite Picking 链路，不应通过业务侧缩小节点视觉尺寸或增加额外边距规避。

## 2. 根因

### 2.1 GPU point picking 在半分辨率帧缓冲中放大了圆节点命中范围

`PickingManager` 默认把 picking framebuffer 的宽高分别降为画布的一半。节点中心坐标通过较小 viewport 映射后能够正确缩放，但 `NodeCircleProgram` 使用的 `gl_PointSize` 仍保持正常画布的像素尺寸。

以直径 `20px` 的圆节点为例：

- 正常画布中的可见半径为 `10px`；
- picking framebuffer 的宽高为正常画布的 `1/2`；
- point sprite 在 picking framebuffer 中仍按 `20px` 直径绘制；
- 映射回正常画布后等效为 `40px` 直径，即 `20px` 命中半径。

因此常规 GPU Picking 路径下，圆节点命中直径约为可见直径的两倍。基于 triangle quad 的大圆 fallback 和矩形节点不直接使用 `gl_PointSize`，不具备同一放大机制。

### 2.2 CPU fallback 把圆节点直径直接当作半径

节点文档和 WebGL Program 均将 `style.size` 定义为圆节点直径，但 `Renderer.hitTestNode()` 当前直接使用：

```ts
const r = style.size;
```

因此 CPU fallback 同样把直径 `20px` 的节点按半径 `20px` 命中，命中直径也扩大为可见直径的两倍。

这两处错误使 GPU point picking 与 CPU fallback 表面上得到相似结果，但二者都偏离真实渲染边界。当圆节点切换到 quad backend 时，命中范围还会随缩放阈值发生变化。

### 2.3 CPU fallback 未完整复用节点形状和绘制层级

当前 CPU 节点命中统一按圆形 `style.size` 计算，没有覆盖矩形节点的 `width`、`height` 和 `borderRadius`；多个节点命中区域重叠时，当前逻辑偏向半径较小的节点，也与 GPU 按绘制顺序由后绘制节点覆盖前绘制节点的结果不同。

## 3. 目标

1. 圆节点的 GPU point picking 边界与正常渲染边界一致。
2. CPU fallback 对 circle 和 rect 节点复用与 WebGL shader 一致的几何语义。
3. `style.size` 始终按圆节点直径解释，命中半径为 `style.size / 2`。
4. 节点描边和状态 halo 不额外扩大命中区域，与当前 GPU picking shader 保持一致。
5. 多节点重叠时，GPU 与 CPU 均优先返回实际绘制层级更高的节点。
6. 不修改公开 API，不要求 KGBase 改数据、样式或交互配置。

## 4. 非目标

- 不增加可配置的业务命中 padding 或最小触摸热区。
- 不改变边、箭头、Combo、Label 或框选的命中规则。
- 不调整节点可见尺寸、描边宽度、选中 halo 或节点间距。
- 不修改隐藏节点、透明节点当前是否参与 picking 的既有语义。
- 不在本次方案中执行版本升级、npm 发布、DIMA 写入或 KGBase 代码修改。

## 5. 方案

### 5.1 为 point sprite 增加 picking 像素缩放

保留半分辨率 picking framebuffer，避免直接改为全分辨率导致显存和 picking fill-rate 约四倍增长。

在 picking pass 中计算统一缩放系数：

```text
pointPickingScale = min(
  pickingViewportWidth / canvasWidth,
  pickingViewportHeight / canvasHeight,
)
```

normal pass 使用 `1`，picking pass 使用上述缩放系数。`NodeCircleProgram` 的 vertex shader 将 point size 调整为：

```glsl
gl_PointSize = pointSize * u_pointPickingScale;
```

该 uniform 只由使用 `gl_PointSize` 的圆节点 point program 声明和消费，不改变 quad、rect、edge、arrow 等几何 Program。

为避免设备纹理或 viewport 上限造成宽高独立裁剪，`PickingManager.resize()` 使用单一比例同时计算 framebuffer 宽高，保持原画布宽高比。默认比例仍为 `1/2`，超出设备上限时按较小可用比例整体缩小。

### 5.2 CPU fallback 使用真实节点几何

将 CPU 节点命中收口为内部几何判断：

- circle：`dx² + dy² <= (size / 2)²`；
- rect：按 `width / 2`、`height / 2` 与裁剪后的 `borderRadius` 使用和 `nodeRect.frag.ts` 等价的 rounded-rect SDF；
- stroke：继续位于节点尺寸内部，不增加 `strokeWidth / 2`；
- halo：不参与 picking；
- 状态样式：继续通过 `resolveNodeStyle()` 获取最终尺寸与形状相关样式。

节点按数组倒序检查，首个命中即返回，使 CPU fallback 与 GPU “后绘制覆盖前绘制”的层级规则一致。

### 5.3 保持交互入口不变

`InteractionDispatcher`、`Graph.pickAt()`、select、drag、tooltip 和 hover 继续复用 `Renderer.pickAt()`，不新增业务侧判断或 Behavior 私有 hit-test。

修复后所有点选类交互自动获得一致边界。

## 6. 影响文件

预计只修改以下范围：

- `src/renderer/picking.ts`：统一 framebuffer 缩放比例并暴露 picking point scale。
- `src/renderer/programs/program.ts`：为特定 Program 提供 picking 专用 uniform 扩展能力。
- `src/renderer/programs/nodeCircle.ts`：传递 point picking scale。
- `src/renderer/programs/shaders/nodeCircle.vert.ts`：缩放 picking pass 的 `gl_PointSize`。
- `src/renderer/renderer.ts`：修正 CPU circle/rect 几何与重叠层级。
- `tests/unit/renderer/picking.test.ts`：覆盖 framebuffer 等比缩放。
- `tests/unit/renderer/programs/`：覆盖 point picking scale。
- `tests/unit/renderer/renderer.test.ts` 或对应 `tests/bugfix/renderer/`：覆盖 circle、rect、halo、描边与重叠节点的 CPU fallback。

不修改 `package.json`、站点首页、公开导出或业务仓库。

## 7. 验收标准

1. circle `size=20`、zoom `1` 时，节点中心外 `10px` 以内可命中，超过边界后不可命中；允许真实浏览器栅格化产生不超过 `1 CSS px` 的边界误差。
2. 同一圆节点在 GPU point、GPU quad 和 CPU fallback 三条路径中的命中结果一致。
3. DPR `1` 与 DPR `2`、zoom `0.5`、`1`、`2` 下，命中边界均与可见节点边界一致，不随 point/quad backend 切换突变。
4. selected/active halo 不扩大节点命中区；描边宽度变化不扩大节点外边界。
5. rect 节点在矩形内部可命中，圆角裁掉的角落不可命中。
6. 两个节点可见区域重叠时，CPU fallback 与 GPU 均返回后绘制节点。
7. select、drag-node、tooltip/hover 继续通过共享 `pickAt()` 工作，无重复 picking 或事件双发回归。
8. 不新增公开 API，npm 包清单仍只包含既有允许文件。

## 8. 验证计划

实施后执行：

```bash
npm run lint
npm run typecheck
npm test -- tests/unit/renderer/picking.test.ts tests/unit/renderer/renderer.test.ts tests/unit/renderer/programs
npm test
npm run build
npm run size
npm pack --dry-run
```

另外使用 Playwright 在真实 Chromium WebGL 环境运行定向 picking 验收，至少覆盖：

- circle point backend；
- 放大后切换到 circle quad backend；
- DPR 1 / 2；
- GPU picking 正常路径；
- 人工触发 picking readPixels 失败后的 CPU fallback。

## 9. 风险与控制

- **边界变小带来的行为变化**：修复后节点外空白区域不再触发节点事件，这是缺陷修正的预期变化；业务若需要更大的触摸热区，应另行设计公开配置，不能继续依赖错误半径。
- **picking 性能回归**：保留半分辨率 framebuffer，只增加一个 point-size uniform，不把 FBO 升为全分辨率。
- **重叠节点选择变化**：CPU fallback 从“偏向较小节点”改为“后绘制节点优先”，用于对齐 GPU；通过专项回归锁定。
- **设备上限导致非等比缩放**：framebuffer 改用统一比例，避免 point sprite 在极端画布上产生椭圆化命中映射。

## 10. 实施门禁

本规格确认前不修改实现代码。确认后按本规格实施，并在 `openspec/changes/` 新增实现变更记录；完成定向测试、全量测试、类型检查、构建、包体与发布清单验证后再交付。

