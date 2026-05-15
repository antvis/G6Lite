# G6Lite vs sigma 性能差距深度分析

## 一、首次渲染差距分析 (1400ms vs 555ms)

### 1.1 差距根因

```
G6Lite 首次渲染耗时构成 (1000节点估算):
├── 样式解析: ~400ms (28%)     ← 主要差距
├── 数据转换: ~200ms (14%)     ← 已优化，仍有提升空间
├── Buffer 生成: ~300ms (21%)   ← 与 sigma 持平
├── GPU 上传: ~100ms (7%)      ← 与 sigma 持平
├── 路由计算: ~200ms (14%)     ← polyline 场景
└── 其他开销: ~200ms (14%)

sigma 首次渲染: ~555ms
└── 样式解析: ~50ms (静态映射)
```

### 1.2 优化方案对比

| 方案 | 实现复杂度 | 预期收益 | 风险 | 推荐度 |
|------|-----------|----------|------|--------|
| **A. 静态样式优先** | 中 | -40% (~560ms) | 需改 API | ⭐⭐⭐⭐⭐ |
| **B. Web Worker 并行化** | 高 | -30% (~420ms) | 架构复杂 | ⭐⭐⭐ |
| **C. 分帧处理 (Time Slicing)** | 中 | 感知-50%，实际不变 | 体验好 | ⭐⭐⭐⭐ |
| **D. 样式指纹缓存** | 低 | -20% (~280ms) | 有限 | ⭐⭐⭐⭐ |

### 1.3 推荐方案：静态样式优先

**核心思想：** 默认走高性能静态路径，动态样式显式选择

```typescript
// 当前：默认动态，性能差
const config = {
  style: (node) => ({  // 每个节点都执行函数
    fill: node.data.important ? 'red' : 'blue'
  })
}

// 优化后：默认静态，性能接近 sigma
const config = {
  style: {
    fill: '#5B8FF9',  // 静态值，零开销
    size: 24
  }
}

// 动态样式显式选择（性能警告）
const config = {
  style: {
    type: 'dynamic',
    fn: (node) => ({ fill: node.data.color })
  }
}
```

**实施步骤：**
1. 修改 `resolveNodeStyle` 检测静态配置
2. 静态配置跳过函数调用，直接返回值
3. 预计算静态样式到 `staticStyleCache`

**预期效果：**
- 纯静态场景：1400ms → 600ms（接近 sigma 555ms）
- 混合场景：根据动态比例线性下降

---

## 二、内存差距分析 (250MB vs 152MB)

### 2.1 差距根因

```
G6Lite 5000节点内存构成:
├── DataModel: ~60MB
│   ├── nodes Array: ~20MB (5000 * 4KB)
│   ├── edges Array: ~15MB (15000 * 1KB)
│   ├── ID 索引 Map: ~10MB
│   └── states Set: ~15MB
├── Renderer: ~100MB
│   ├── nodes 引用: ~20MB (与 DataModel 重复)
│   ├── edges 引用: ~15MB (与 DataModel 重复)
│   ├── nodeIdToIndex: ~10MB (与 DataModel 重复)
│   ├── GPU buffers: ~40MB
│   └── 临时数组: ~15MB
├── Picking: ~20MB
│   └── framebuffer: 800*600*4*2 = ~4MB
└── 其他: ~70MB

sigma 5000节点: ~152MB
└── 单层存储 + 紧凑数组
```

### 2.2 关键问题：数据重复存储

**当前架构：**
```
User Data (Array)
    ↓
DataModel (Array + Map)  ← 60MB
    ↓ (getNodes 返回引用，但仍有一份)
Renderer (Array 引用)    ← 20MB (引用开销)
    ↓
GPU Buffer               ← 40MB
```

**优化方向：**

| 方案 | 实现复杂度 | 预期收益 | 风险 | 推荐度 |
|------|-----------|----------|------|--------|
| **A. Renderer 直接使用 DataModel 数组** | 低 | -20MB | 无 | ⭐⭐⭐⭐⭐ |
| **B. TypedArray 精确分配** | 中 | -10MB | 需计算精确大小 | ⭐⭐⭐⭐ |
| **C. 去除 states Set（用 bitmask）** | 中 | -15MB | 状态数量受限 | ⭐⭐⭐ |
| **D. 数据共享（单一数据源）** | 高 | -40MB | 架构改动大 | ⭐⭐ |

### 2.3 推荐方案组合

**阶段 1：Renderer 直接引用（立即可做）**
```typescript
class Renderer {
  // 不再存储 this.nodes: LayoutNode[]
  // 直接使用 DataModel 的数组
  private dataModelRef: DataModel | null = null;

  updateData(dataModel: DataModel) {
    this.dataModelRef = dataModel;
    // 只构建渲染需要的索引
    this.rebuildRenderIndex();
  }

  process() {
    const nodes = this.dataModelRef!.getNodes();  // 直接引用
    // ... 处理
  }
}
```

**阶段 2：states 用 bitmask（可选）**
```typescript
// 当前：Set<ElementState>
states: Set<'active' | 'selected' | 'hover'>  // 每个 Set ~3KB

// 优化：bitmask
states: number  // 4 bytes，支持 32 种状态
// bit 0: active
// bit 1: selected
// bit 2: hover
```

**预期效果：**
- 阶段 1：250MB → 200MB（-20%）
- 阶段 2：200MB → 185MB（-7%）
- 最终接近 sigma 152MB

---

## 三、10000节点交互差距分析 (123fps vs 462fps)

### 3.1 差距根因

```
每帧渲染耗时分析 (10000节点):
├── G6Lite: ~8.1ms (123fps)
│   ├── 视口裁剪计算: ~1ms      ← 已计算但未生效
│   ├── 渲染全部节点: ~5ms     ← 主要差距！
│   ├── 渲染全部边: ~2ms
│   └── Picking pass: ~0.1ms
│
└── sigma: ~2.2ms (462fps)
    ├── 视口裁剪: ~0.5ms
    ├── 渲染可见节点: ~1ms      ← 只渲染可见
    ├── 渲染可见边: ~0.5ms
    └── 其他: ~0.2ms
```

**核心问题：** G6Lite 计算了可见性，但仍渲染全部节点

### 3.2 优化方案对比

| 方案 | 实现复杂度 | 预期收益 | 风险 | 推荐度 |
|------|-----------|----------|------|--------|
| **A. 完整视口裁剪** | 中 | 300fps+ | 需改 Program | ⭐⭐⭐⭐⭐ |
| **B. LOD (Level of Detail)** | 高 | 400fps+ | 效果复杂 | ⭐⭐⭐ |
| **C. Instanced Rendering** | 高 | 500fps+ | 需 WebGL2 | ⭐⭐ |
| **D. 空间分割 (Grid/Quadtree)** | 中 | 辅助裁剪 | 额外开销 | ⭐⭐⭐ |

### 3.3 推荐方案：完整视口裁剪

**当前问题：**
```typescript
// 计算了可见性
updateVisibility() {
  this.visibleNodeIndices = [0, 5, 10, ...];  // 只有 30% 可见
}

// 但渲染时仍渲染全部
draw() {
  nodeProgram.render(params);  // 渲染全部 10000 节点！
}
```

**优化方案：**
```typescript
// 方案 1: Program 支持 range 渲染（已部分实现）
draw() {
  if (this.shouldCull()) {
    // 只渲染可见范围
    for (const range of this.visibleRanges) {
      nodeProgram.renderRange(params, range.start, range.count);
    }
  } else {
    nodeProgram.render(params);  // 小数据量全量渲染
  }
}

// 方案 2: 使用 gl.drawArrays 的 first/count 参数
class NodeProgram {
  renderVisible(params: RenderParams, visibleIndices: number[]) {
    // 将可见索引排序，合并连续范围
    const ranges = this.mergeRanges(visibleIndices);
    for (const { start, count } of ranges) {
      gl.drawArrays(this.getDrawMethod(), start, count);
    }
  }
}
```

**关键优化点：**
1. **排序 buffer**：按空间位置排序节点，使可见节点尽量连续
2. **范围合并**：减少 draw call 次数
3. **层级裁剪**：远距离时合并相邻节点

**预期效果：**
- 视口内 30% 节点可见时：123fps → 300fps
- 配合 LOD：300fps → 400fps

---

## 四、综合优化路线图

### 短期（本周，低风险高回报）

| 优化项 | 目标差距 | 预期收益 | 实施难度 |
|--------|----------|----------|----------|
| 静态样式优先 | 首次渲染 | 1400ms → 800ms | ⭐⭐⭐ |
| Renderer 直接引用 DataModel | 内存 | 250MB → 200MB | ⭐⭐ |
| 完整视口裁剪 | 交互 fps | 123fps → 300fps | ⭐⭐⭐ |

**预期结果：**
- 首次渲染：与 sigma 差距从 2.5x 缩小到 1.4x
- 内存：与 sigma 差距从 65% 缩小到 30%
- 交互：与 sigma 差距从 3.7x 缩小到 1.5x

### 中期（下周，中等风险）

| 优化项 | 目标差距 | 预期收益 | 实施难度 |
|--------|----------|----------|----------|
| 样式指纹缓存 | 首次渲染 | 800ms → 650ms | ⭐⭐ |
| states bitmask | 内存 | 200MB → 180MB | ⭐⭐⭐ |
| LOD 系统 | 交互 fps | 300fps → 400fps | ⭐⭐⭐⭐ |

### 长期（可选，高风险）

| 优化项 | 目标差距 | 预期收益 | 实施难度 |
|--------|----------|----------|----------|
| Web Worker 并行化 | 首次渲染 | 650ms → 500ms | ⭐⭐⭐⭐⭐ |
| Instanced Rendering | 交互 fps | 400fps → 500fps | ⭐⭐⭐⭐⭐ |
| 单一数据源架构 | 内存 | 180MB → 150MB | ⭐⭐⭐⭐⭐ |

---

## 五、关键决策建议

### 决策 1：首次渲染是否追求 sigma 速度？

**分析：**
- sigma 的 555ms 是**牺牲功能**换来的（纯静态样式）
- G6Lite 的动态样式是**核心优势**（0ms 增量更新）

**建议：**
- ✅ 静态场景优化到 **< 800ms**（接近但不超越 sigma）
- ✅ 明确动态样式的**性能代价**
- ❌ 不要为了速度完全牺牲动态能力

### 决策 2：内存是否追求 sigma 水平？

**分析：**
- sigma 的 152MB 是**单层存储**的结果
- G6Lite 的变更追踪需要**额外开销**

**建议：**
- ✅ 优化到 **< 200MB**（可接受范围）
- ✅ 提供**内存使用文档**，让用户了解代价
- ❌ 不要为了内存去除变更追踪（核心优势）

### 决策 3：10000节点交互是否追求 sigma 速度？

**分析：**
- sigma 的 462fps 是**极致优化**的结果
- 120fps 以上**人眼无法区分**

**建议：**
- ✅ 优化到 **> 200fps**（流畅即可）
- ✅ 优先保证**功能完整性**
- ❌ 不要为了数字好看过度优化

---

## 六、结论

### 当前状态

| 维度 | 当前差距 | 可优化空间 | 建议目标 |
|------|----------|------------|----------|
| **首次渲染** | 2.5x | 1.4x | 静态场景 < 800ms |
| **内存** | 65% | 30% | < 200MB |
| **交互 fps** | 3.7x | 1.5x | > 200fps |

### 核心策略

> **"保持差异化优势，缩小可接受差距"**

1. **不放弃的功能：**
   - 增量更新（0ms 高亮）
   - 动态样式系统
   - 状态管理

2. **可接受的差距：**
   - 首次渲染：1.4x（功能换性能）
   - 内存：30%（变更追踪的代价）
   - 交互：1.5x（>200fps 足够流畅）

3. **下一步行动：**
   - 本周实施：静态样式 + 视口裁剪
   - 验证效果后再决定是否继续深度优化
