# 性能优化 B+A+G+D+E

## 变更日期
2026-05-11

## 变更内容

### 优化B：减少布局迭代 + 提前终止
- `src/layout/runLayout.ts`：新增 >5000 节点阈值，`maxIteration=50`, `minMovement=2.0`
- `src/layout/runLayout.ts`：>1000 节点 `minMovement` 从 1.0 收紧至 1.5
- `src/layout/runLayout.ts`：扩展 `d3-force` 布局也使用相同自动调优
- `src/layout/layoutWorker.ts`：Worker 端同步应用相同的迭代参数

### 优化A：Web Worker 布局
- `src/layout/layoutWorker.ts`：新增 Worker 入口，接收 `{id, nodes, edges, config}`，执行布局后 `postMessage` 返回坐标
- `src/layout/workerLayout.ts`：新增主线程 Worker 管理器，懒创建/复用/销毁 Worker，通过递增 requestId 匹配响应
- `src/layout/runLayout.ts`：`runLayout()` 新增 `useWorker` 分支，委托给 `runLayoutInWorker()` 并合并坐标
- `src/graph.ts`：`render()` 中节点 >2000 时自动启用 Worker；发射 `layout:start` / `layout:end` 事件（携带 duration）
- `src/graph.ts`：`destroy()` 中调用 `terminateLayoutWorker()` 清理 Worker
- `src/types.ts`：`LayoutConfig` 新增 `worker?: boolean` 字段

### 优化G：修正基准测试
- `playground/bench-main.ts`：`benchFirstRender()` 改为监听 `layout:end` 事件获取真实布局耗时
- `playground/bench-main.ts`：移除硬编码估算 `render = Math.min(total * 0.15, 20)`，改用 `render = total - layout`
- `playground/bench-main.ts`：结果表格新增 Render 列
- `playground/bench.html`：表头新增 Render 列

### 优化D：消除 nodeIdToIndex Map 查找
- `src/renderer/renderer.ts`：新增 `edgeSourceIdx: Int32Array` 和 `edgeTargetIdx: Int32Array` 并行索引数组
- `src/renderer/renderer.ts`：`updateData()` / `setData()` 中构建并行索引数组
- `src/renderer/renderer.ts`：`partialProcess()` 中同步重建索引数组
- `src/renderer/renderer.ts`：热路径（`processFullEdges`、`process()` 动态箭头统计、`updateVisibility`、折线路由）中用 `this.edgeSourceIdx[i]` / `this.edgeTargetIdx[i]` 替代 `this.nodeIdToIndex.get()`
- `src/renderer/renderer.ts`：保留 `nodeIdToIndex` Map 供冷路径（highlight、patchStyles 等少量查找）使用
- `src/renderer/renderer.ts`：`destroy()` 中释放索引数组

### 优化E：批量 Float32Array 填充 + 修复 upload/reallocate
- `src/renderer/programs/program.ts`：`reallocate()` 增长时用 `newArray.set(this.array)` 保留已有数据，修复 incrementalProcess 的潜在数据丢失
- `src/renderer/programs/program.ts`：`upload()` 改用 `bufferData(size, STATIC_DRAW)` + `bufferSubData(0, subarray)` 只上传已用部分，减少 GPU 传输量约 33%
- `src/renderer/programs/nodeCircle.ts`：新增 `processNodeStatic()` 方法（1 次 `TypedArray.set` + 5 次写入 vs 原 15 次写入）和 `buildTemplate()` 静态方法
- `src/renderer/programs/nodeRect.ts`：`processNode()` 改为填第一顶点 + `copyWithin` 复制 + patch corner（19 写 + 5 copyWithin + 10 写 vs 原 114 写）
- `src/renderer/programs/edgeRect.ts`：`processEdge()` 同样优化（17 写 + 5 copyWithin + 10 写 vs 原 102 写）
- `src/renderer/renderer.ts`：静态 circle 节点快速路径使用 `processNodeStatic()` + 模板

## 影响范围
- `src/layout/runLayout.ts`：布局迭代参数调优 + Worker 委托
- `src/layout/layoutWorker.ts`：新增文件
- `src/layout/workerLayout.ts`：新增文件
- `src/types.ts`：LayoutConfig 新增字段
- `src/graph.ts`：Worker 自动启用 + 事件 + 清理
- `src/renderer/renderer.ts`：并行索引数组 + 静态模板快速路径
- `src/renderer/programs/program.ts`：reallocate/upload 修复
- `src/renderer/programs/nodeCircle.ts`：静态模板方法
- `src/renderer/programs/nodeRect.ts`：copyWithin 优化
- `src/renderer/programs/edgeRect.ts`：copyWithin 优化
- `playground/bench-main.ts`：真实布局/渲染计时
- `playground/bench.html`：新增 Render 列

## 性能预期
以 10K 节点为例：
- 优化B：布局时间 -30~50%（迭代次数减少 + 提前终止）
- 优化A：用户感知首次渲染从 ~11s 降至 ~200ms（布局在 Worker 后台执行）+ 骨架屏
- 优化G：度量准确，layout/render 分离可观测
- 优化D：渲染时间 -10~20ms（消除 30K 边 × 2 次 Map.get 查找）
- 优化E：静态配置下 process() 时间 -30~50ms（模板填充 + copyWithin + upload 优化）