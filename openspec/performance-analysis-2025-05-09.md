# G6Lite 性能优化分析报告 (2025-05-09)

## 一、最新测试数据对比

### 1.1 与优化前对比 (5/8 → 5/9)

| 指标 | 优化前 (5/8) | 优化后 (5/9) | 变化 |
|------|-------------|-------------|------|
| **firstRender 1000** | 1486ms | **1580ms** | ⚠️ +6% (异常) |
| **firstRender 5000** | 4920ms | **4654ms** | ✅ -5% |
| **firstRender 10000** | 13214ms | **12765ms** | ✅ -3% |
| **dragFps 10000** | 123fps | **123fps** | → 持平 |
| **memory 5000** | 202MB | **311MB** | ⚠️ +54% (Bug) |

### 1.2 与 sigma.js 对比

| 指标 | G6Lite | sigma | 差距 |
|------|--------|-------|------|
| **firstRender 1000** | 1580ms | **555ms** | sigma 快 **2.8x** |
| **firstRender 5000** | 4654ms | **3864ms** | sigma 快 **1.2x** |
| **firstRender 10000** | 12765ms | **4317ms** | sigma 快 **3x** |
| **dragFps 5000** | 121fps | **122fps** | 基本持平 |
| **dragFps 10000** | 123fps | **462fps** | sigma 快 **3.7x** |
| **pickAt** | 0.1ms | **0.2ms** | G6Lite 快 **2x** |
| **highlight** | 0ms | **4-9ms** | G6Lite 碾压 |
| **stateChange** | 0ms | **3-7ms** | G6Lite 碾压 |
| **addNodes** | 14-16ms | **8ms** | sigma 快 **2x** |
| **memory 5000** | 311MB | **152MB** | G6Lite 多 **105%** |

## 二、关键发现

### 2.1 G6Lite 的优势领域

✅ **增量更新性能碾压**
- 高亮操作：0ms（sigma 4-9ms）
- 状态变更：0ms（sigma 3-7ms）
- 这是 RefreshLevel + GPU patch 架构的优势

✅ **Picking 性能优秀**
- 0.1ms vs 0.2ms（sigma）
- GPU Framebuffer picking 比空间索引更快

✅ **交互性能 5000 节点以下持平**
- drag/zoom 120fps 左右，与 sigma 基本持平

### 2.2 G6Lite 的劣势领域

❌ **首次渲染仍是最大瓶颈**
- 1000节点：比 sigma 慢 1000ms（多 1秒）
- 10000节点：比 sigma 慢 8秒
- 原因：动态样式解析、复杂渲染管线初始化

❌ **10000节点交互性能差距大**
- sigma: 462fps（可能使用了更激进的视口裁剪或 LOD）
- G6Lite: 123fps
- 差距：3.7倍

❌ **内存占用过高**
- 5000节点：311MB vs 152MB（sigma）
- 多占用 105% 内存
- 刚修复了临时数组重复创建的问题

❌ **addNodes 性能**
- 比 sigma 慢约 2 倍
- 增量优化效果不明显

## 三、已实施的优化

### 3.1 首次渲染优化

1. ✅ 节点样式缓存（避免重复解析）
2. ✅ 边分类与箭头计数合并（减少遍历）
3. ✅ Polyline 样式缓存（大数据量时禁用）
4. ✅ 数组复用（Float64Array 不再每次创建）

**效果：** 5000/10000 节点有 3-5% 提升，但 1000 节点异常（可能是测试波动）

### 3.2 内存优化

1. ✅ 指数增长 Float32Array（减少重新分配）
2. ✅ 限制 polylineRoutes 缓存（>5000边不缓存）
3. ✅ 修复临时数组重复创建问题（nodeStyles, edgeStyleCache, nodeVisible）

**问题：** 5/9 数据内存反而增加，可能是测试环境问题或其他代码引入

### 3.3 交互优化

1. ✅ setCamera 改用 scheduleRender（避免同步绘制）
2. ✅ 延迟 picking pass（不在 camera 变化时立即渲染）
3. ✅ 添加视口裁剪基础结构（但尚未完全发挥效果）

## 四、深度优化建议

### 4.1 首次渲染优化（优先级：🔴 最高）

**目标：** 1000节点首次渲染 < 800ms（接近 sigma 的 555ms）

**方案 A：Web Worker 并行化**
```typescript
// 将样式解析移到 Worker
const worker = new Worker('style-worker.js');
worker.postMessage({ nodes, nodeConfig, theme });
worker.onmessage = (e) => {
  const resolvedStyles = e.data;
  // 直接写入 GPU buffer
};
```
- 预期提升：30-40%
- 复杂度：高

**方案 B：分帧处理（Time Slicing）**
```typescript
// 将大数据量的 process 拆分到多个帧
async function processInChunks(nodes, chunkSize = 1000) {
  for (let i = 0; i < nodes.length; i += chunkSize) {
    await new Promise(resolve => requestAnimationFrame(resolve));
    processChunk(nodes.slice(i, i + chunkSize));
  }
}
```
- 预期提升：首屏时间减少 50%，但完全渲染时间不变
- 复杂度：中

**方案 C：更激进的样式缓存**
```typescript
// 基于节点数据指纹缓存样式
const styleCache = new Map<string, ResolvedNodeStyle>();

function resolveNodeStyleCached(node, config, theme) {
  const key = hash(node.data) + hash(config);
  if (styleCache.has(key)) {
    return styleCache.get(key);
  }
  const style = resolveNodeStyle(node, config, theme);
  styleCache.set(key, style);
  return style;
}
```
- 预期提升：20-30%（如果节点有大量重复样式）
- 复杂度：低

### 4.2 10000节点交互优化（优先级：🟡 高）

**目标：** dragFps 从 123fps → 200fps+

**方案 A：完整视口裁剪实现**
- 当前只计算了可见性，但仍渲染全部节点
- 需要修改 Program.render() 支持只渲染可见范围

**方案 B：LOD（Level of Detail）**
```typescript
// 远距离时简化节点渲染
if (camera.zoom < 0.5) {
  // 使用 GL_POINTS 代替 TRIANGLES
  // 合并相邻节点
}
```

**方案 C：Instanced Rendering**
- 使用 WebGL2 `gl.drawArraysInstanced()`
- 一个 draw call 渲染所有相同形状的节点

### 4.3 内存优化（优先级：🟡 高）

**目标：** 5000节点内存 < 200MB

**方案 A：DataModel 与 Renderer 数据共享**
- 当前：DataModel 存一份，Renderer 存一份（nodes/edges 数组）
- 优化：Renderer 直接使用 DataModel 的引用

**方案 B：颜色解析缓存**
```typescript
// 缓存 parseColor 结果
const colorCache = new Map<string, [number, number, number]>();
function parseColorCached(color: string) {
  if (colorCache.has(color)) return colorCache.get(color);
  const result = parseColor(color);
  colorCache.set(color, result);
  return result;
}
```

**方案 C：TypedArray 全局池**
```typescript
class Float32ArrayPool {
  private pool: Map<number, Float32Array[]> = new Map();
  
  acquire(size: number): Float32Array {
    const arrays = this.pool.get(size) || [];
    if (arrays.length > 0) return arrays.pop()!;
    return new Float32Array(size);
  }
  
  release(array: Float32Array) {
    const arrays = this.pool.get(array.length) || [];
    arrays.push(array);
    this.pool.set(array.length, arrays);
  }
}
```

### 4.4 addNodes 优化（优先级：🟢 中）

**目标：** addNodes < 10ms（接近 sigma 的 8ms）

**方案：** 绕过 DataModel 直接操作 GPU
```typescript
// 当前路径：addNode → DataModel → Scheduler → Renderer → GPU
// 优化路径：addNode → 直接写入 GPU buffer → 标记 dirty
```

## 五、与 sigma 的架构差异总结

| 特性 | sigma | G6Lite | 影响 |
|------|-------|--------|------|
| **样式系统** | 静态/简单映射 | 动态函数 | G6Lite 灵活但慢 |
| **Picking** | 空间索引(quadtree) | GPU Framebuffer | G6Lite 精确但内存大 |
| **更新策略** | 全量重建 | 分层增量 | G6Lite 增量更新快 |
| **数据存储** | 单层 | DataModel+Renderer | G6Lite 内存大 |
| **渲染管线** | 简单直接 | 复杂调度 | G6Lite 功能多但慢 |

**结论：**
- G6Lite 牺牲首次渲染性能和内存，换取**增量更新能力**和**动态样式灵活性**
- 如果应用需要频繁高亮/状态变更，G6Lite 更优
- 如果应用是一次性渲染大量静态数据，sigma 更优

## 六、下一步行动建议

### 短期（1-2 天）
1. 验证内存优化效果（修复临时数组问题后重新测试）
2. 实现颜色解析缓存
3. 添加更激进的视口裁剪（只渲染可见节点）

### 中期（1 周）
1. 实现样式指纹缓存
2. 调研 Web Worker 并行化可行性
3. 实现分帧处理（Time Slicing）

### 长期（2-4 周）
1. 完整的 LOD 系统
2. Instanced Rendering（WebGL2）
3. DataModel 与 Renderer 数据合并

## 七、测试建议

**建议增加的性能指标：**
1. **首次可交互时间**（First Interactive）- 比 firstRender 更重要
2. **内存分配速率**（GC 压力）
3. **GPU 显存占用**（不仅是 JS heap）
4. **电量消耗**（移动端）

**建议增加的测试场景：**
1. 频繁高亮切换（验证增量更新优势）
2. 连续添加节点（验证 addNodes 优化）
3. 极端缩放（验证 LOD）
4. 真实业务数据（非随机数据）
