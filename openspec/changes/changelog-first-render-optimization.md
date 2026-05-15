# 首次渲染性能优化

## 变更日期
2026-05-11

## 变更内容

### 优化1：消除边双重遍历
- `renderer.ts`：将边的分类（regular/selfLoop）+ 箭头统计合并为纯分类 + 静态箭头计算，移除了分类阶段的 `resolveEdgeStyle` 调用
- 静态配置下，箭头数量直接从 `edgeConfigCache` 计算，无需逐边解析样式
- 动态配置下，箭头统计阶段缓存的样式结果传递给 `processFullEdges` 复用，避免二次 `resolveEdgeStyle`
- `style.ts`：导出 `edgeConfigCache` 和 `nodeConfigCache` 供 renderer 直接访问

### 优化2：移除两阶段首次渲染
- 删除 `isFirstRender` / `pendingFullEdgeRender` 字段和 `processSimplifiedEdges` 方法
- 首次渲染直接走 `processFullEdges`，避免 process() 执行两次（简化边 + 完整边）
- 预期首次渲染时间减半

### 优化3：静态配置批量写入 buffer
- `renderer.ts process()`：当节点配置为静态且无高亮时，跳过逐元素 `resolveNodeStyle`，直接从 `nodeConfigCache` 读取缓存值写入 buffer
- `processFullEdges()`：当边配置为静态且无高亮且非 polyline 时，跳过逐边 `resolveEdgeStyle`，直接从 `edgeConfigCache` 读取
- `style.ts CachedNodeStyle`：新增 `haloWidth` 字段（静态节点无状态，haloWidth 始终为 0）

### 优化4：减少数据拷贝
- `data-model.ts`：引入 `EMPTY_SET` 共享常量，避免每个元素创建空 Set（10K 节点 + 10K 边 = 20K 空对象分配）
- `setNodeState` / `setEdgeState`：惰性替换 `EMPTY_SET` 为可变 Set（仅在首次添加状态时）
- `graph.ts render()`：移除 `replaceData` 调用中的 `nodes.map()` 和 `edges.map()` 展开，直接传原数组
- `runLayout.ts`：减少布局数据的展开拷贝，已有 x/y 的节点不再展开，边直接传引用

### 优化5：resize 延迟 draw
- `renderer.ts resize()`：用 `scheduleRender()` 替代同步 `this.draw()`
- `graph.ts render()`：在 `fitView()` 后手动调 `this.renderer.draw()` 确保首次渲染同步完成
- 后续 resize（窗口变化）不再同步阻塞主线程

## 影响范围
- `src/renderer/renderer.ts`：主要改动文件
- `src/renderer/style.ts`：导出缓存 + CachedNodeStyle 新增字段
- `src/data-model.ts`：EMPTY_SET 共享 + 惰性可变替换
- `src/graph.ts`：减少数据拷贝 + 首次渲染同步保证
- `src/layout/runLayout.ts`：减少布局数据展开

## 性能预期
以 10K 节点为例：
- 优化2（移除二次 process）：首次渲染时间 -50%
- 优化1（消除双重边遍历）：边处理时间 -15~25%
- 优化3（静态批量写入）：样式解析开销 -40~60%
- 优化4（减少数据拷贝）：-100~300ms + 降低 GC 压力
- 优化5（延迟 draw）：TTFB 感知提升

总体首次渲染（不含布局）预估从 ~7s 降至 ~2s