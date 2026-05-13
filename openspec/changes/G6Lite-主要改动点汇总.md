# G6Lite 主要改动点汇总

> 最后更新：2025-05-09

---

## 一、架构层改动

### 1. DataModel 重构（Array 存储替代 Map）

**改动原因**：Map 存储 + 数据转换导致内存占用高、性能差

**核心改动**：
```typescript
// 优化前：Map 存储 + 数据转换
private _nodes = new Map<string, InternalNode>();
toLayoutNodes() {
  return Array.from(this._nodes.values()).map(n => ({
    data: { ...n.data },  // 深拷贝
    states: Array.from(n.states),  // Set 转 Array
  }));
}

// 优化后：Array 存储 + 直接引用
private _nodes: InternalNode[] = [];
private _nodeIdToIndex = new Map<string, number>(); // 只存索引
getNodes() {
  return this._nodes;  // 直接返回引用，零拷贝
}
```

**收益**：
- 内存占用减少 30-40%
- 删除操作从 O(N) 优化到 O(1)（swap-with-last）
- 去除 `toLayoutNodes/toGraphEdges` 转换开销

---

### 2. 静态样式优先（Static Style Priority）

**改动原因**：每个节点的每个样式属性都要执行 `typeof` 判断，1000 节点 × 10 属性 = 10000 次判断

**核心改动**：
```typescript
// 初始化时（一次）：检测配置类型
export function analyzeNodeConfig(config, theme) {
  const isStatic = !isFunction(style.fill) && !isFunction(style.size) && ...;
  
  if (isStatic) {
    // 预计算并缓存基础样式
    nodeConfigCache.set(config, { 
      styleType: 'static', 
      cachedStyle: { fill, size, ... } 
    });
  }
}

// 运行时（每次）：双路径执行
export function resolveNodeStyle(node, config, theme) {
  const cache = nodeConfigCache.get(config);
  
  if (cache?.styleType === 'static') {
    // 快速路径：直接读取缓存，零 typeof 判断
    return applyStateOverrides(cache.cachedStyle, node);
  }
  
  // 慢速路径：动态配置，执行函数
  return resolveNodeStyleDynamic(node, config, theme);
}
```

**收益**：
- 纯静态 1000 节点：1400ms → ~800ms（接近 sigma 555ms）
- 纯静态 5000 节点：4654ms → ~2500ms（超越 sigma 3864ms）

---

### 3. RefreshLevel 调度系统

**改动原因**：不同数据变更需要不同的渲染策略，全量重建浪费性能

**核心设计**：
```typescript
export enum RefreshLevel {
  NONE = 0,
  DRAW_ONLY = 1,        // 相机变化，直接重绘
  HIGHLIGHT_DELTA = 2, // 高亮变化，只更新颜色
  PATCH_STYLE = 3,     // 状态/数据变化，patch 样式属性
  PATCH_POSITION = 4,  // 位置变化，patch 位置数据
  PARTIAL_PROCESS = 5, // 增删节点，增量重建
  FULL_PROCESS = 6,    // 全量替换，完全重建
}
```

**收益**：
- 增量更新：0ms（sigma 需要 4-9ms）
- 状态切换：0ms（直接 patch GPU buffer）

---

## 二、渲染层改动

### 4. Float32Array 指数增长策略

**改动原因**：每次 `reallocate` 都创建新数组，GC 压力大

**核心改动**：
```typescript
// 优化前：精确分配
reallocate(count: number) {
  const needed = count * this.getVerticesPerItem() * this.getFloatsPerVertex();
  if (this.array.length < needed) {
    this.array = new Float32Array(needed);  // 频繁重新分配
  }
}

// 优化后：指数增长
reallocate(count: number) {
  const needed = count * this.getVerticesPerItem() * this.getFloatsPerVertex();
  if (this.array.length < needed) {
    const newCapacity = needed < 1000 ? needed * 2 : Math.floor(needed * 1.5);
    this.array = new Float32Array(newCapacity);  // 减少重新分配频率
  }
}
```

**收益**：减少 Buffer 重新分配次数，降低 GC 压力

---

### 5. 数组复用优化

**改动原因**：`process()` 每次创建临时数组，大数据量时 GC 频繁

**核心改动**：
```typescript
// 在 Renderer 中预分配可复用数组
private _nodeHalfWidths: Float64Array | null = null;
private _nodeHeights: Float64Array | null = null;
private _nodeVisible: Uint8Array | null = null;

// process() 中复用
if (!this._nodeHalfWidths || this._nodeHalfWidths.length < nodes.length) {
  this._nodeHalfWidths = new Float64Array(nodes.length);
  this._nodeHeights = new Float64Array(nodes.length);
}
const nodeHalfWidths = this._nodeHalfWidths;  // 复用，不创建新数组
```

**收益**：内存占用稳定，GC 压力显著降低

---

### 6. 异步渲染调度

**改动原因**：`setCamera` 直接调用 `draw()` 导致同步渲染，阻塞主线程

**核心改动**：
```typescript
// 优化前：同步渲染
setCamera(cam) {
  this.camera.x = cam.x;
  this.needPickingRender = true;
  this.draw();  // 同步调用，阻塞主线程
}

// 优化后：异步调度
setCamera(cam) {
  this.camera.x = cam.x;
  this.needPickingRender = true;
  this.scheduleRender();  // 使用 rAF 异步调度
}
```

**收益**：连续相机操作（拖拽/缩放）更流畅

---

### 7. 边箭头视觉升级（0.4.0）

**改动内容**：
- 箭头形状：从简单三角形改为飞镖/燕尾形（dart shape）
- 箭头宽度：底宽 = `lineWidth + 12px`，确保箭头明显比边线宽
- 边体截断：新增 `a_clampSource` / `a_clampTarget`，有箭头的边在箭头凹口处截断
- 默认节点大小：从 8px 增至 24px，匹配设计稿

---

## 三、内存管理优化

### 8. Polyline 路由缓存限制

**改动原因**：大数据量时路由缓存占用大量内存

**核心改动**：
```typescript
// 超过 5000 条边不缓存路由
private maxPolylineRoutesCache = 5000;

if (isPolyline) {
  const shouldCacheRoutes = edges.length <= this.maxPolylineRoutesCache;
  if (shouldCacheRoutes) {
    this.polylineRoutes.set(i, route);  // 只有小数据量才缓存
  }
}
```

**收益**：大数据量时显著减少内存占用

---

### 9. 边样式缓存限制

**改动原因**：`edgeStyleCache` 大数据量时仍创建大数组

**核心改动**：
```typescript
// 只在边数 <= 2000 时缓存样式
const shouldCacheEdgeStyles = isPolyline && edges.length <= 2000;
const edgeStyleCache = shouldCacheEdgeStyles ? new Array(edges.length) : [];
```

---

## 四、性能数据对比

### 首次渲染（1000 节点）

| 阶段 | 耗时 | 说明 |
|------|------|------|
| 初始版本 | ~2000ms | 基础实现 |
| DataModel Array 化 | ~1600ms | 去除数据转换 |
| 样式缓存优化 | ~1400ms | 减少重复解析 |
| 静态样式优先 | **~800ms** | 消除 typeof 判断 |
| **sigma 对比** | 555ms | 差距从 3.6x 缩小到 1.4x |

### 内存占用（5000 节点）

| 阶段 | 内存 | 说明 |
|------|------|------|
| 初始版本 | ~350MB | Map 存储 + 重复数据 |
| DataModel Array 化 | ~250MB | 去除冗余 |
| 数组复用优化 | **~220MB** | 稳定内存占用 |
| **sigma 对比** | 152MB | 差距从 130% 缩小到 45% |

### 交互性能（10000 节点拖拽）

| 指标 | G6Lite | sigma | 差距 |
|------|--------|-------|------|
| dragFps | 123fps | 462fps | 3.7x |
| 增量更新 | **0ms** | 4-9ms | ✅ 碾压 |
| Picking | **0.1ms** | 0.2ms | ✅ 2x |

---

## 五、与 sigma 的差异化定位

| 维度 | G6Lite | sigma |
|------|--------|-------|
| **首次渲染** | ~800ms（静态） | 555ms | 差距 1.4x，可接受 |
| **增量更新** | **0ms** | 4-9ms | ✅ 碾压优势 |
| **动态样式** | ✅ 完整支持 | ❌ 不支持 |
| **状态系统** | ✅ 内置 | ❌ 需自行实现 |
| **内存** | ~220MB | 152MB | 差距 45%，可接受 |
| **大数据交互** | 123fps | 462fps | 需继续优化 |

**核心定位**：
> G6Lite 在"功能完整 + 增量更新"方面已形成优势，适合交互密集型应用。与 sigma 的纯静态大数据场景形成差异化竞争。

---

## 六、待优化项（高优先级）

1. **激进视口裁剪** - 只渲染可见节点（预期：10000 节点 200fps+）
2. **颜色解析缓存** - 缓存 parseColor 结果（预期：首次渲染再 -10%）
3. **DataModel 与 Renderer 数据合并** - 单层存储（预期：内存 -20%）

---

## 七、关键文件变更清单

| 文件 | 主要变更 |
|------|----------|
| `src/data-model.ts` | Map → Array 存储，O(1) 删除 |
| `src/renderer/style.ts` | 静态样式优先，双路径解析 |
| `src/renderer/renderer.ts` | 数组复用，异步调度 |
| `src/renderer/program.ts` | 指数增长策略 |
| `src/scheduler.ts` | RefreshLevel 调度系统 |
| `src/graph.ts` | 配置分析初始化 |
