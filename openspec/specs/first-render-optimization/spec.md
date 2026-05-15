# 首次渲染性能优化方案

## 问题背景

基于 degree=3 的基准测试数据，G6Lite 在首次渲染上显著落后于 sigma.js：

| 数据规模 | G6Lite | sigma.js | sigma.js(纯渲染) | G6Lite 纯渲染估算 |
|----------|--------|----------|-------------------|-------------------|
| 1K | 1583ms | 551ms | ~20ms | ~1583ms |
| 5K | 4691ms | 3797ms | ~27ms | ~4691ms |
| 10K | 11251ms | 4130ms | ~33ms | ~11251ms |

sigma.js 布局约 4s，渲染仅 20-33ms；G6Lite 布局同样约 4s，但渲染高达 7s+。差距完全在 CPU 端的数据处理与 buffer 构建阶段。

其他指标（拾取、高亮、状态变更、增删节点、内存）G6Lite 均优于或持平 sigma.js，**首次渲染是唯一致命短板**。

## 根因分析

### 瓶颈 1：边双重遍历 + 双重样式解析（影响最大）

`renderer.ts` 的 `process()` 方法中，边被遍历了两次：

- **第一遍**（L263-289）：分类 regular/selfLoop + 统计箭头数，每个边调用 `resolveEdgeStyle()` 一次
- **第二遍**（L501-604 `processFullEdges`）：实际渲染，每个边再调用 `resolveEdgeStyle()` 一次

10K 边 = 20K 次 `resolveEdgeStyle()` 调用 + 20K 次 WeakMap 查找 + 20K 次 scratch 对象写入。

对于静态配置（无函数样式），箭头数量是确定的，无需逐边解析样式。

### 瓶颈 2：两阶段首次渲染导致 process() 执行两次

`processSimplifiedEdges`（L294-310）在首次渲染且边数 > 500 时触发：
1. 当前帧：简化边处理 + 节点处理 + GPU 上传
2. rAF 回调：设置 `needToProcess = true` → 下一帧 `process()` **完整重跑**（节点 + 边 + 箭头全部重算）

第二次 process() 重新分配 buffer、重新遍历所有节点和边、重新上传 GPU。对于 10K 节点，这等于所有工作做了两遍。

### 瓶颈 3：三重数据拷贝

graph.ts `render()` 流程中数据被拷贝三次：

1. **L57-61**：`nodes.map(n => ({ ...n, x, y }))` — 展开拷贝
2. **L80-83**：`dataModel.replaceData()` — 每个元素创建新对象 + `new Set(states ?? [])`
3. **L90-99**：`renderer.setData()` — `this.nodes = renderData.nodes`（引用赋值，但 nodeIdToIndex 重建）

其中 `new Set()` 在无状态场景下产生 20K+ 空对象分配。布局阶段 `runLayout.ts:82-87` 也有额外展开拷贝。

### 瓶颈 4：逐元素 resolveStyle 调用开销

即使命中静态配置快速路径，`resolveNodeStyle` / `resolveEdgeStyle` 每次调用仍需：
- WeakMap.get 查找
- 3 层条件判断
- states 数组遍历（即使为空/undefined）
- 10+ 属性赋值到 scratch 对象
- 返回 scratch 引用（调用方必须立即读取所有字段）

20K 次函数调用在 V8 中虽被内联优化，但 WeakMap 查找 + 条件分支 + 属性写入的总开销在大规模下累积显著。

### 瓶颈 5：resize() 同步触发 draw()

`renderer.ts:1158`：`resize()` 末尾直接调用 `this.draw()`。在 `graph.ts:112` 首次渲染中，`setData()` 设置 `needToProcess = true`，随后 `resize()` 同步触发 `process()` + 渲染，阻塞主线程。

## 优化方案

### 优化 1：消除边的双重遍历

**目标**：将边的分类 + 箭头统计 + 样式解析合并为单次遍历。

**方案**：

修改 `process()` 中边的处理流程：

```
// 之前：两遍遍历
// 第一遍：分类 + 统计箭头（L263-289）
// 第二遍：渲染（L501-604）

// 之后：单遍遍历
// 1. 先根据静态配置确定箭头数（静态配置下箭头数 = edges.length * arrowPerEdge）
// 2. 单遍遍历边：分类 + 解析样式 + 立即写入 buffer
```

具体实现：

a) 对于静态配置，`analyzeEdgeConfig` 已经缓存了 `endArrow` / `startArrow`，直接从缓存读取箭头信息，无需逐边调用 `resolveEdgeStyle`：

```typescript
// 新增：从缓存获取静态箭头配置
function getStaticArrowConfig(config: EdgeConfig | undefined, theme: ThemeTokens): { endArrow: boolean; startArrow: boolean } | null {
  const cache = config ? edgeConfigCache.get(config) : undefined;
  if (cache?.styleType === 'static' && cache.cachedStyle) {
    return { endArrow: cache.cachedStyle.endArrow, startArrow: cache.cachedStyle.startArrow };
  }
  return null; // 动态配置，需要逐边解析
}
```

b) 合并分类和渲染为单遍遍历。先做一次快速分类（仅检查 source===target，不解析样式），然后根据是否静态配置决定处理路径：

```typescript
// 快速分类（不解析样式）
for (let i = 0; i < edges.length; i++) {
  if (edges[i].source === edges[i].target) {
    selfLoopIndices.push(i);
  } else {
    regularIndices.push(i);
  }
}

// 静态配置：箭头数可直接计算
if (staticArrow) {
  arrowCount = regularIndices.length * (Number(staticArrow.endArrow) + Number(staticArrow.startArrow))
    + selfLoopIndices.length * Number(staticArrow.endArrow);
}
```

c) `processFullEdges` 中复用第一次遍历的样式结果（对动态配置，在分类阶段缓存样式到数组）。

**预期收益**：减少 10K 次 `resolveEdgeStyle` 调用 + 10K 次 WeakMap 查找，约节省 15-25% 的边处理时间。

### 优化 2：移除两阶段首次渲染

**目标**：首次渲染只执行一次完整的 `process()`，避免 GPU buffer 重复构建。

**方案**：

移除 `isFirstRender` / `pendingFullEdgeRender` / `processSimplifiedEdges` 相关逻辑。直接走 `processFullEdges` 路径。

```typescript
// 删除：
// - isFirstRender 字段
// - pendingFullEdgeRender 字段
// - processSimplifiedEdges 方法
// - process() 中 L294-310 的简化边分支

// process() 中边的处理简化为：
this.processFullEdges(regularIndices, selfLoopIndices, nodes, edges, edgeConfig, theme, nodeHalfWidths, nodeHeights, bg, hasHighlight, arrowCount);
```

**理由**：简化边渲染原本是为了加速首次渲染的感知速度，但实际效果适得其反——它导致了完整的二次 process()。直接做一次完整渲染比做两次（简化+完整）更快。

**预期收益**：消除整个 process() 的第二次执行，首次渲染时间直接减半（节点处理 + GPU 上传 + 边处理均不重复）。

### 优化 3：静态配置批量写入 buffer

**目标**：当节点/边配置为静态（无函数样式）时，跳过逐元素 `resolveStyle` 调用，直接从缓存批量填充 GPU buffer。

**方案**：

在 `process()` 中，检测配置是否为静态，走专用的快速路径：

```typescript
// 新增方法
private processNodesStatic(nodes: LayoutNode[], config: NodeConfig, theme: ThemeTokens): void {
  const cache = nodeConfigCache.get(config);
  if (!cache?.cachedStyle) return;
  const base = cache.cachedStyle;
  const nodeProgram = this.activeNodeProgram;
  nodeProgram.reallocate(nodes.length);

  // 预解析颜色（只做一次）
  const color = base.fillRGB;
  const strokeColor = base.strokeRGB;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    // 无状态覆盖时，直接用缓存值写入 buffer
    if (this.activeNodeType === 'rect') {
      (nodeProgram as NodeRectProgram).processNode(i, node.x, node.y, base.width, base.height, color, i, base.strokeWidth, strokeColor, base.opacity, base.haloWidth, base.borderRadius);
    } else {
      (nodeProgram as NodeCircleProgram).processNode(i, node.x, node.y, base.size, color, i, base.strokeWidth, strokeColor, base.opacity, base.haloWidth);
    }
    this._nodeHalfWidths![i] = (this.activeNodeType === 'rect' ? base.width : base.size) / 2;
    this._nodeHeights![i] = this.activeNodeType === 'rect' ? base.height : base.size;
  }
  nodeProgram.upload();
}
```

对边同理，静态配置下直接从 `edgeConfigCache` 读取缓存值，跳过 `resolveEdgeStyle` 的 WeakMap 查找和 scratch 对象写入。

对于有状态覆盖的少量元素，可以在批量写入后单独 patch。

```typescript
// process() 中的分支逻辑
const nodeCache = nodeConfig ? nodeConfigCache.get(nodeConfig) : undefined;
if (nodeCache?.styleType === 'static' && !hasHighlight) {
  this.processNodesStatic(nodes, nodeConfig, theme);
} else {
  // 原有逐元素路径
  this.processNodesDynamic(nodes, nodeConfig, theme, bg, hasHighlight);
}
```

**预期收益**：静态配置下消除 10K 次 `resolveNodeStyle` 和 10K 次 `resolveEdgeStyle` 调用，减少约 40-60% 的样式解析开销。

### 优化 4：减少数据拷贝

**目标**：减少首次渲染路径上的冗余对象创建。

**方案**：

a) **DataModel.replaceData 中延迟创建 Set**：仅在元素实际有状态时才创建 Set，空状态使用共享的空 Set 常量：

```typescript
// 新增共享空 Set
const EMPTY_SET: Set<ElementState> = new Set<ElementState>();

// replaceData 中
states: n.states && n.states.length > 0 ? new Set(n.states) : EMPTY_SET,
```

b) **graph.ts render() 中减少中间拷贝**：`runLayout` 返回的节点数据直接传给 DataModel，避免 map 展开：

```typescript
// 之前
this.dataModel.replaceData(
  nodes.map(n => ({ id: n.id, x: n.x, y: n.y, data: n.data, states: n.states })),
  data.edges.map(e => ({ source: e.source, target: e.target, data: e.data, states: e.states })),
);

// 之后：DataModel.replaceData 接受 LayoutNode[] 直接
this.dataModel.replaceData(nodes, data.edges);
```

需要调整 `DataModel.replaceData` 的参数类型以兼容 `LayoutNode` 格式。

c) **runLayout 中减少展开**：`layoutData` 的边展开可以用更轻量的方式生成 id：

```typescript
// 之前
edges: data.edges.map((e) => ({ ...e, id: `${e.source}-${e.target}` })),

// 之后：仅添加 id 字段，不展开整个对象
edges: data.edges.map((e) => Object.assign({}, e, { id: `${e.source}-${e.target}` })),
```

**预期收益**：减少 10K+ 对象分配 + 20K 空创建，降低 GC 压力。预估节省 100-300ms（取决于 GC 频率）。

### 优化 5：resize() 延迟 draw

**目标**：`resize()` 不再同步触发 `process()`，改为调度到下一帧。

**方案**：

```typescript
// renderer.ts resize() 修改
resize(width: number, height: number): void {
  const dpr = Math.min(2, window.devicePixelRatio ?? 1);
  this.canvas.width = width * dpr;
  this.canvas.height = height * dpr;
  this.canvas.style.width = `${width}px`;
  this.canvas.style.height = `${height}px`;
  this.needPickingRender = true;
  this.scheduleRender();  // 替代 this.draw()
}
```

首次渲染流程变为：
```typescript
// graph.ts render() 中
this.renderer.setData(...);        // 设置 needToProcess = true
this.renderer.resize(w, h);        // 调度 scheduleRender，不阻塞
this.fitView();                    // 设置 camera，内部也调 scheduleRender
// 首帧 rAF 时统一 process() + draw()，只执行一次
```

注意：`fitView()` 内部调用 `setCamera()` → `scheduleRender()`，所以 resize + fitView 会在同一帧合并为一次 draw。但需确保 `pickAt()` 等需要同步渲染的 API 仍能正常工作——`pickAt()` 已有 lazy init 逻辑，会在需要时同步渲染 picking pass。

**预期收益**：首次渲染不再被同步 process() 阻塞，主线程更快释放。对 TTFB 感知有提升。

## 实施优先级

| 优先级 | 优化项 | 预期收益 | 实施复杂度 | 风险 |
|--------|--------|----------|------------|------|
| P0 | 优化 2：移除两阶段首次渲染 | 首次渲染时间减半 | 低 | 低：删除代码 |
| P0 | 优化 1：消除边双重遍历 | 边处理时间 -15~25% | 中 | 低 |
| P1 | 优化 3：静态配置批量写入 | 样式解析 -40~60% | 中 | 中：需兼容动态配置 |
| P1 | 优化 4：减少数据拷贝 | -100~300ms + 降低 GC | 低 | 低 |
| P2 | 优化 5：resize 延迟 draw | TTFB 感知提升 | 低 | 中：需验证交互正确性 |

**建议实施顺序**：优化 2 → 优化 1 → 优化 4 → 优化 3 → 优化 5

优化 2 和优化 1 是独立变更，可以并行。优化 3 依赖优化 1 的重构结构。优化 4 和优化 5 独立，可随时插入。

## 预期效果

以 10K 节点为例，粗略估算：

- 当前首次渲染（不含布局）：~7s
- 优化 2（移除二次 process）：-3.5s → ~3.5s
- 优化 1（消除双重边遍历）：-0.5s → ~3s
- 优化 3（静态批量写入）：-0.8s → ~2.2s
- 优化 4（减少拷贝）：-0.2s → ~2s
- 优化 5（延迟 draw）：TTFB 感知 ~0.1s

优化后首次渲染（不含布局）预估约 2s，相比当前 7s 提升约 3.5x。加上布局时间（~4s），总首次渲染约 6s，接近 sigma.js 的 4.1s。

## 测试验证

1. 基准测试复跑：使用相同 degree=3 数据集，对比优化前后 1K/5K/10K 节点的首次渲染时间
2. 功能回归：验证静态/动态样式配置、高亮、状态变更、增删节点等交互正常
3. 边类型覆盖：验证 line/rect/arc/cubic/polyline 各边类型在优化后渲染正确
4. 增量操作验证：addNode/removeNode/setItemState 等操作不受影响