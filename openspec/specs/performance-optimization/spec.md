# Performance Optimization — 5000 节点首屏渲染优化

## Purpose

优化 G6Lite 在 5000 节点 + 15000 边规模下的首屏渲染速度和交互响应性能。基于渲染管线全链路瓶颈分析和 Sigma.js 优化模式研究，制定系统性优化方案。

## 目标

| 指标 | 当前 | 目标 |
|------|------|------|
| 首屏渲染（5000+15000） | ~100ms | <50ms |
| Hover 高亮响应 | ~20ms（全量 reprocess） | <1ms（增量更新） |
| 拖拽/缩放帧率 | ~30fps | ~55fps |

---

## 瓶颈分析

### 量化数据（5000 节点 + 15000 边，NodeCircle + EdgeLine）

| 环节 | 耗时估算 | 根因 |
|------|---------|------|
| parseColor 无缓存 | ~15ms | 20000 次 regex+parseInt，实际仅 2-3 种颜色 |
| process() 重复建 nodeMap | ~3ms | 5000 次 Map.set，已有 nodeIdToIndex 未复用 |
| 首帧 Picking Pass | ~8ms | 2 次额外 draw call + framebuffer，用户尚未交互 |
| Style 对象分配 | ~3ms | 20000 次 new Object，立即丢弃 |
| Highlight 全量重建 | ~20ms/次 | setHighlight → needToProcess → 全量 process() |
| 边渲染（拖拽时） | 帧时间 75% | 15000 边 = 主要 draw 开销，拖拽时无需精确渲染 |

### Buffer 规模

| Program | 计算 | 总量 |
|---------|------|------|
| NodeCircle | 5000 × 1 × 9 floats | 45,000 floats (180KB) |
| EdgeLine | 15000 × 2 × 8 floats | 240,000 floats (960KB) |
| EdgeRect | 15000 × 6 × 13 floats | 1,170,000 floats (4.68MB) |
| EdgeArc | 15000 × 32 × 8 floats | 3,840,000 floats (15.36MB) |

---

## Requirements

### Phase 1: Quick Wins

#### R-PERF-01: 颜色解析缓存

`parseColor()` SHALL 使用 `Map<string, [number,number,number]>` 缓存解析结果。相同的 hex 字符串 SHALL 只解析一次。

**文件**: `src/renderer/color.ts`

**GIVEN** 5000 个节点使用相同颜色 `#5B8FF9`
**WHEN** process() 遍历所有节点调用 parseColor
**THEN** 实际 regex 解析只执行 1 次，后续 4999 次命中缓存

#### R-PERF-02: 消除冗余 nodeMap

`process()` 中的边处理 SHALL 使用已有的 `this.nodeIdToIndex` + `this.nodes[]` 查找源/目标节点，而非每次创建新 Map。

**文件**: `src/renderer/renderer.ts` — `process()` 方法

**GIVEN** Renderer 已维护 `nodeIdToIndex: Map<string, number>`
**WHEN** process() 处理边数据时需要查找源/目标节点位置
**THEN** 直接 `this.nodes[this.nodeIdToIndex.get(edgeSource)!]`，不再 `new Map()` + forEach

#### R-PERF-03: 延迟 Picking 渲染

Picking framebuffer 的渲染 SHALL 延迟到 `pickAt()` 首次被调用时。首帧 `draw()` SHALL 跳过 picking pass。

**文件**: `src/renderer/renderer.ts`

**GIVEN** 用户打开页面，图首次渲染
**WHEN** draw() 执行
**THEN** 只执行 normal pass（2 次 draw call），不执行 picking pass
**AND** 当用户首次 mousemove 触发 pickAt() 时，lazy 执行一次 picking pass

---

### Phase 2: Highlight 路径分离

#### R-PERF-04: 增量高亮更新

`setHighlight()` SHALL NOT 触发全量 `process()`。SHALL 只更新发生状态变化的节点/边的颜色 floats。

**实现要求**:
- Renderer SHALL 维护 `prevHighlightNodeIds` / `prevHighlightEdgeIndices` 追踪上次高亮状态
- 新增 `processHighlightDelta()` 方法：计算状态变化的 delta，只更新变化项的 color floats
- Program 基类 SHALL 提供 `patchColors(itemIndex, color)` 方法，根据 attributeLayout 定位 color offset
- `needHighlightUpdate` 标志区分于 `needToProcess`

**文件**: `src/renderer/renderer.ts`, `src/renderer/programs/program.ts`

**GIVEN** 当前有 nodeId='5' 被高亮
**WHEN** 鼠标移到 nodeId='8' 触发 setHighlight
**THEN** 只更新 nodeId='5'（取消高亮）和 nodeId='8'（新增高亮）及其关联边的颜色
**AND** 其余 4998 个节点和 ~14990 条边的 buffer 数据不变

#### R-PERF-05: 渲染调度合并

`setHighlight()` 和 behaviors SHALL 使用 `scheduleRender()` 而非直接调用 `draw()`。同一帧内的多次状态变更 SHALL 合并为一次渲染。

**文件**: `src/renderer/renderer.ts`, `src/behaviors/*.ts`

---

### Phase 3: 交互 + 边优化

#### R-PERF-06: hideEdgesOnMove

拖拽/缩放期间 SHALL 跳过边渲染。交互结束 150ms 后恢复边显示。

**文件**: `src/renderer/renderer.ts`, `src/behaviors/dragCanvas.ts`, `src/behaviors/zoomCanvas.ts`

**GIVEN** 5000 节点 + 15000 边的图
**WHEN** 用户拖拽画布
**THEN** 只渲染节点，边不渲染
**AND** 拖拽松开 150ms 后边自动恢复

#### R-PERF-07: EdgeArc 段数优化

EdgeArc 的 SEGMENTS 常量 SHALL 从 16 降至 8。二次贝塞尔曲线 8 段在常规缩放下视觉无损。

**文件**: `src/renderer/programs/edgeArc.ts`

#### R-PERF-08: Style 对象复用

`resolveNodeStyle()` 和 `resolveEdgeStyle()` SHALL 复用模块级 scratch 对象，避免每次调用分配新对象。

**文件**: `src/renderer/style.ts`

**约束**: 返回的对象仅在下次调用前有效。调用者 SHALL NOT 存储返回对象的引用。

---

## 实施顺序

| 阶段 | 优化项 | 预估收益 | 工作量 |
|------|--------|---------|--------|
| Phase 1a | R-PERF-01 颜色缓存 | 首屏 -15ms | 15 分钟 |
| Phase 1b | R-PERF-02 消除 nodeMap | 首屏 -3ms | 10 分钟 |
| Phase 1c | R-PERF-03 延迟 Picking | 首屏 -8ms | 30 分钟 |
| Phase 2a | R-PERF-04 增量高亮 | hover -19ms | 2 小时 |
| Phase 2b | R-PERF-05 调度合并 | 交互 -10ms | 1 小时 |
| Phase 3a | R-PERF-06 hideEdgesOnMove | 拖拽帧率 +80% | 1 小时 |
| Phase 3b | R-PERF-07 EdgeArc 段数 | Arc 图 -8ms | 15 分钟 |
| Phase 3c | R-PERF-08 Style 复用 | GC -3ms | 30 分钟 |

---

## Sigma.js 参考模式

| G6Lite 优化 | Sigma.js 对应实现 | 来源文件 |
|-------------|------------------|---------|
| 颜色缓存 | `FLOAT_INDEX_CACHE` 缓存 picking 颜色 | sigma/src/utils/colors.ts:259 |
| 增量更新 | `refresh({ partialGraph, skipIndexation })` | sigma/src/sigma.ts:2074 |
| hideEdgesOnMove | `settings.hideEdgesOnMove` + `moving` 检测 | sigma/src/sigma.ts:1325 |
| Label 密度控制 | `LabelGrid` 空间索引 + `labelRenderedSizeThreshold` | sigma/src/core/labels.ts |
| Buffer 复用 | `reallocate()` capacity 相同时 no-op | sigma/src/rendering/program.ts:305 |
| 延迟 picking | Sigma 在 render() 中条件执行 picking pass | sigma/src/rendering/program.ts:338 |

---

## 验证方式

1. `performance.now()` 包裹 `process()` 和 `draw()`，5000 节点 demo 前后对比
2. 所有 9 个 playground demo 视觉回归验证
3. Hover 快速移动压力测试（>10次/秒）
4. 拖拽+缩放流畅度主观评估
5. EdgeArc demo 8 段 vs 16 段视觉对比
