# Layout Performance — 布局性能瓶颈分析与优化方案

## Purpose

基于 Performance Benchmark 压测报告，定位首屏渲染的核心瓶颈并制定优化方案。压测数据表明 **WebGL 渲染管线无瓶颈（Drag/Zoom 均 120FPS），首屏延迟 100% 来自布局计算**。

---

## 压测数据

### 初始版本（iterations bug + animate + 零坐标初始化）

| 规模 | 布局耗时 | 首屏总计 | 高亮 | 拖拽 | 缩放 | Pick |
|------|---------|---------|------|------|------|------|
| 100 / 300 | 2,008ms | 2,028ms | 0.1ms | 120 FPS | 120 FPS | 0.10ms |
| 1K / 3K | 2,932ms | 2,952ms | 0.0ms | 120 FPS | 119 FPS | 0.00ms |
| 5K / 15K | 933,952ms | 933,972ms | 0.1ms | 120 FPS | 120 FPS | 0.00ms |
| 10K / 30K | 128,701ms | 128,721ms | 0.2ms | 120 FPS | 120 FPS | 0.10ms |

### 第二轮（R-LAYOUT-01~03 已修复，但零坐标初始化未修复）

| 规模 | 布局耗时 | 首屏总计 | 高亮 | 拖拽 | 缩放 | Pick |
|------|---------|---------|------|------|------|------|
| 100 / 300 | 46.7ms | 54.9ms | 0.1ms | 120 FPS | 120 FPS | 0.00ms |
| 1K / 3K | 1,266ms | 1,286ms | 0.1ms | 120 FPS | 120 FPS | 0.00ms |
| 5K / 15K | 27,150ms | 27,170ms | 0.1ms | 120 FPS | 120 FPS | 0.00ms |
| 10K / 30K | 108,696ms | 108,716ms | 0.1ms | 120 FPS | 120 FPS | 0.00ms |

**结论**：
- 渲染层（process + draw）耗时 < 20ms，性能良好
- 交互层（高亮增量、拖拽、缩放、拾取）均达标
- **布局层是唯一瓶颈**：5K 节点耗时 ~15 分钟，完全不可接受

---

## 根因分析

### Bug 1: `iterations` 参数被静默忽略（核心 Bug）

**严重性**: Critical

当前 Demo 和压测代码均传入 `iterations: 100`：

```typescript
// playground/bench-main.ts, playground/demos/large-labeled.ts
layout: { type: 'force', iterations: 100 }
```

但 `@antv/layout` 的 ForceLayout 不认识 `iterations` 参数，实际控制迭代次数的参数是 `maxIteration`。

**调用链分析**：

```
用户传入: { type: 'force', iterations: 100 }
       ↓
runLayout.ts: const { type, ...opts } = config
              new LayoutClass(opts)  // opts = { iterations: 100 }
       ↓
@antv/layout ForceLayout constructor:
  接收 opts，但只读取 maxIteration（默认 500）
  iterations 作为未知 key 被忽略
       ↓
实际执行: 500 次迭代（而非期望的 100 次）
```

**文件**: `src/layout/runLayout.ts` 第 48-49 行

**影响**: 迭代次数是期望值的 **5 倍**。

### Bug 2: 浏览器环境默认使用 animate 模式

**严重性**: High

`@antv/layout` 在浏览器环境中默认 `animate: true`，使用 `setInterval(0)` 逐帧执行迭代：

```
animate=true 模式:
  setInterval(() => {
    tick(1);  // 执行 1 次迭代
  }, 0);
  // 500 次迭代 = 500 次事件循环调度
  // 每次调度有 ~4ms 最低延迟（浏览器 clamp）
  // 纯调度开销: 500 × 4ms = 2,000ms

animate=false 模式:
  while (iteration < maxIteration && distance > minMovement) {
    tick(1);  // 紧凑循环，无事件循环开销
  }
```

**文件**: `node_modules/@antv/layout/src/algorithm/base-simulation.ts` 第 52-81 行

**影响**: `animate` 模式下 500 次迭代仅事件循环开销就超过 2 秒，加上每次迭代的计算量，实际放大 **10-50 倍**。

### Bug 3: 节点初始坐标 (0,0) 导致力布局退化 20 倍

**严重性**: Critical

当节点没有预设坐标时，`runLayout.ts` 将其初始化为 `(0, 0)`。所有节点重叠在原点时，斥力计算陷入奇异点——所有节点间距≈0，力方向几乎随机，Barnes-Hut 四叉树退化为单点，每次迭代几乎无法推开节点。

**实测对比**（ForceLayout, maxIteration=100, animate=false）：

| 规模 | 初始 (0,0) | 随机初始位置 | 退化倍数 |
|------|-----------|-------------|---------|
| 1K | 1,399ms | 329ms | **4.3x** |
| 5K | 27,402ms | 2,179ms | **12.6x** |
| 10K | 118,470ms | 5,889ms | **20.1x** |

**文件**: `src/layout/runLayout.ts` 第 71 行

```typescript
// 修复前: 所有无坐标节点聚集在原点
nodes: data.nodes.map((n) => ({ ...n, x: n.x ?? 0, y: n.y ?? 0 })),

// 修复后: 随机散布在 sqrt(n)*10 范围内
const spread = Math.sqrt(nodeCount) * 10;
nodes: data.nodes.map((n) => ({ ...n, x: n.x ?? Math.random() * spread, y: n.y ?? Math.random() * spread })),
```

**影响**: 这是当前最大的性能瓶颈，10K 节点场景退化 20 倍。

### 问题 4: 大图布局参数未调优

**严重性**: Medium

@antv/layout ForceLayout 默认参数为小图优化：

| 参数 | 默认值 | 大图问题 |
|------|--------|---------|
| `maxIteration` | 500 | 5000 节点 200 次即可收敛，多跑 300 次无收益 |
| `minMovement` | 0.4 | 阈值太严格，大图难以精确收敛到 0.4px 位移 |
| `animate` | true（浏览器） | 每次迭代过事件循环，大图延迟显著 |
| `enableWorker` | false | 布局在主线程，阻塞 UI |

### 问题 4: 未利用 Web Worker

**严重性**: Medium

`@antv/layout` 已内置 Web Worker 支持（基于 Comlink），通过 `enableWorker: true` 开启，可将布局计算移到后台线程。当前未使用。

**文件**: `node_modules/@antv/layout/src/runtime/supervisor.ts`

---

## @antv/layout Force 算法复杂度

### 每次迭代的力计算

| 力 | 算法 | 复杂度 | 说明 |
|----|------|--------|------|
| 斥力（Repulsive） | Barnes-Hut quadtree | O(n log n) | 使用 d3-quadtree，θ² = 0.81 |
| 引力（Attractive） | 遍历边 | O(E) | Hooke 弹簧力 |
| 碰撞（Collide 2D） | quadtree | O(n log n) | 2D 使用 quadtree |
| 碰撞（Collide 3D） | 暴力枚举 | O(n²) | 3D 模式退化为全对 |
| 重力（Gravity） | 遍历节点 | O(n) | 向中心引力 |
| 向心力（Centripetal） | 遍历节点 | O(n) | 可选聚类力 |

**单次迭代**: O(n log n)（2D 模式下，算法本身没问题）

**总计**: O(n log n × maxIteration)

### 理论 vs 实际耗时

以 5000 节点、500 次迭代计算：

```
理论: 5000 × log₂(5000) × 500 ≈ 30M 次操作
JS 执行: 30M × ~50ns/op ≈ 1.5 秒（同步紧凑循环）
实际: 933 秒（animate 模式 + 事件循环开销 + 参数过多迭代）
放大倍数: ~620x
```

---

## Sigma.js 生态对比

Sigma.js 大图布局通常使用 graphology-layout-forceatlas2：

| 特性 | @antv/layout force | sigma 生态 ForceAtlas2 |
|------|--------------------|-----------------------|
| 算法 | 自定义 5 力模型 | ForceAtlas2（Gephi 论文） |
| 空间加速 | Barnes-Hut quadtree | Barnes-Hut quadtree |
| 默认迭代 | 500 | 动态调整（100-1200） |
| 自动优化 | 无 | >250 节点自动 Barnes-Hut，>100 自动 prune |
| Worker | 支持但默认关闭 | 默认 Worker 模式 |
| 收敛策略 | 固定阈值 minMovement | 自适应温度衰减 |

**关键差异**：Sigma 生态默认 Worker + 自适应参数，大图开箱即用；@antv/layout 需要手动调优。

@antv/layout 本身也提供了 `forceatlas2` 布局类型，具备自动 Barnes-Hut 和 pruning，可作为大图替代选择。

---

## Requirements

### R-LAYOUT-01: 修正 iterations 参数映射

`runLayout()` SHALL 将用户传入的 `iterations` 参数映射为 `@antv/layout` 的 `maxIteration` 参数。当两者同时存在时，`maxIteration` 优先。

**文件**: `src/layout/runLayout.ts`

**GIVEN** 用户传入 `layout: { type: 'force', iterations: 100 }`
**WHEN** `runLayout()` 执行
**THEN** @antv/layout ForceLayout 实际使用 `maxIteration: 100`
**AND** 布局执行不超过 100 次迭代

### R-LAYOUT-02: 大图自动关闭 animate 模式

当节点数 > 500 且用户未显式设置 `animate` 时，`runLayout()` SHALL 自动设置 `animate: false`，使布局使用同步紧凑循环而非 setInterval。

**文件**: `src/layout/runLayout.ts`

**GIVEN** 一个 5000 节点的图，未设置 `animate`
**WHEN** `runLayout()` 执行 force 布局
**THEN** 布局使用同步 while 循环（非 setInterval）
**AND** 布局总耗时中无事件循环调度开销

**GIVEN** 用户显式设置 `animate: true`
**WHEN** `runLayout()` 执行
**THEN** 保持用户设置，使用 animate 模式

### R-LAYOUT-03: 大图自动调优默认参数

当节点数 > 1000 且为 force 布局时，`runLayout()` SHALL 自动设置更适合大图的默认参数（用户显式值优先）：

| 参数 | 自动默认值 | 条件 |
|------|-----------|------|
| `maxIteration` | 200 | 用户未设置 maxIteration 且未设置 iterations |
| `minMovement` | 1.0 | 用户未设置 |

**文件**: `src/layout/runLayout.ts`

**GIVEN** 5000 节点，`layout: { type: 'force' }`（无其他参数）
**WHEN** `runLayout()` 执行
**THEN** 实际使用 `maxIteration: 200, minMovement: 1.0, animate: false`

**GIVEN** 5000 节点，`layout: { type: 'force', maxIteration: 500, minMovement: 0.4 }`
**WHEN** `runLayout()` 执行
**THEN** 保持用户设置 `maxIteration: 500, minMovement: 0.4`

### R-LAYOUT-04: 随机初始坐标消除原点奇异性

当节点未提供 `x`/`y` 坐标时，`runLayout()` SHALL 将其初始化为 `Math.random() * spread`（spread = `sqrt(nodeCount) * 10`）而非 `0`。已有坐标的节点不受影响。

**文件**: `src/layout/runLayout.ts`

**GIVEN** 5000 个无坐标节点，`layout: { type: 'force', maxIteration: 100 }`
**WHEN** `runLayout()` 执行
**THEN** 节点初始位置随机分布在 ~707×707 范围内
**AND** 布局耗时 < 3 秒（而非 27 秒）

**GIVEN** 节点已有 `x: 100, y: 200`
**WHEN** `runLayout()` 执行
**THEN** 保留原始坐标 `(100, 200)` 作为初始位置

### R-LAYOUT-05: 修正压测和 Demo 的布局参数

压测代码和 Demo 中的 `iterations` SHALL 改为 `maxIteration`，并显式设置 `animate: false` 以确保可预测的性能度量。

**文件**:
- `playground/bench-main.ts` — 所有 5 个场景的 layout 配置
- `playground/demos/large-labeled.ts` — 5000 节点 demo
- `playground/demos/large.ts` — 200 节点 demo（检查是否使用 iterations）

### R-LAYOUT-06: 文档化布局参数

`openspec/specs/layout/spec.md` SHALL 补充大图布局性能指南，说明：
- `maxIteration`（非 `iterations`）控制迭代次数
- 大图（>1000 节点）建议参数
- `animate: false` 对性能的影响
- `enableWorker: true` 的使用场景

---

## 预期优化效果

| 规模 | 优化前 | 优化后（预估） | 提升倍数 |
|------|--------|---------------|---------|
| 100 / 300 | 2,028ms | < 50ms | ~40x |
| 1K / 3K | 2,952ms | < 200ms | ~15x |
| 5K / 15K | 933,952ms | < 2,000ms | ~470x |
| 10K / 30K | 128,701ms | < 5,000ms | ~25x |

**提升来源分解**：

| 优化项 | 预估贡献 |
|--------|---------|
| 修正参数名（500→100 迭代） | 5x |
| 关闭 animate（消除事件循环开销） | 10-50x |
| 随机初始坐标（消除原点奇异性） | **4-20x** |
| 大图参数调优（更快收敛） | 2-3x |

---

## 实施顺序

| 阶段 | 优化项 | 文件 | 工作量 |
|------|--------|------|--------|
| 1 | R-LAYOUT-01: 参数映射 iterations → maxIteration | `src/layout/runLayout.ts` | 10 分钟 |
| 2 | R-LAYOUT-02: 大图自动关闭 animate | `src/layout/runLayout.ts` | 10 分钟 |
| 3 | R-LAYOUT-03: 大图自动调优参数 | `src/layout/runLayout.ts` | 10 分钟 |
| 4 | R-LAYOUT-04: 修正压测和 Demo 参数 | `playground/bench-main.ts`, demos | 15 分钟 |
| 5 | R-LAYOUT-05: 补充布局文档 | `openspec/specs/layout/spec.md` | 15 分钟 |

总计约 1 小时。

---

## 后续可选优化

以下优化在本方案之外，可根据优化后的压测数据决定是否实施：

| 优化 | 预估收益 | 复杂度 |
|------|---------|--------|
| 启用 Web Worker（`enableWorker: true`） | 布局不阻塞 UI | 低（配置项） |
| 大图切换 ForceAtlas2 布局 | 自动 Barnes-Hut + pruning | 中（需评估布局效果） |
| 布局进度回调（onTick） | 用户可见进度条 | 低 |
| 增量布局（已有节点不动，新增节点布局） | 数据更新场景加速 | 高 |

---

## 验证方式

1. 压测页面重新跑 4 个梯度，对比优化前后数据
2. 5K 节点首屏总计 < 2 秒（目标）
3. 所有 playground demo 正常渲染，布局效果视觉不退化
4. 小图（100 节点）布局效果与优化前一致
5. 用户显式传入的布局参数不被自动调优覆盖
