# G6Lite 轻量高性能架构重构方案

## 一、核心目标对齐

**目标：** 轻量 + 高性能

**当前问题：**
- ❌ DataModel + Renderer 双份数据（违背轻量）
- ❌ 动态样式函数导致首次渲染慢（违背高性能）
- ❌ 复杂 RefreshLevel 调度（部分过度设计）
- ✅ GPU picking 正确（轻量 + 高性能）
- ✅ 增量更新正确（高性能）

## 二、架构重构方案

### 2.1 数据层：单层存储（去除 DataModel 冗余）

**当前问题：**
```
User Data
    ↓
DataModel (Map + Set + Changes)  ← 内存占用大
    ↓
Renderer (Array)                 ← 重复存储
    ↓
GPU Buffer
```

**重构后：**
```
User Data (Array)  ← 直接使用用户数据，不转换
    ↓
Renderer (View)    ← 只存索引，不存数据
    ↓
GPU Buffer
```

**实现：**
```typescript
// 去除 DataModel，直接使用用户提供的数组
class Renderer {
  // 不再存储 nodes: LayoutNode[]
  // 而是直接使用传入的引用
  private dataRef: { nodes: Node[]; edges: Edge[] } | null = null;

  updateData(data: { nodes: Node[]; edges: Edge[] }) {
    this.dataRef = data;
    // 只构建索引，不复制数据
    this.rebuildIndex();
  }

  private rebuildIndex() {
    this.nodeIdToIndex.clear();
    // 直接遍历用户数据
    this.dataRef!.nodes.forEach((n, i) => this.nodeIdToIndex.set(n.id, i));
  }
}
```

**收益：**
- 内存减少 30-40%
- 减少数据转换开销
- 用户数据变化自动同步（无需 DataModel 追踪）

### 2.2 样式系统：静态优先 + 动态降级

**当前问题：**
```typescript
// 每次都要执行函数
const style = {
  fill: (node) => node.data.important ? 'red' : 'blue',
  size: (node) => Math.sqrt(node.data.value) * 10
}
```

**重构后：**
```typescript
type StyleConfig =
  | { type: 'static'; value: string | number }           // 高性能路径
  | { type: 'indexed'; field: string; map: Map<any, any> } // 中性能路径
  | { type: 'dynamic'; fn: (node) => any };             // 低性能路径（警告）

// 默认使用静态，明确选择动态
const config = {
  style: {
    fill: '#5B8FF9',  // 静态 - 零开销
    size: { type: 'indexed', field: 'value', map: sizeMap } // 预计算索引
  }
}
```

**首次渲染优化：**
```typescript
class Renderer {
  private styleCache = new Map<string, ResolvedStyle>();

  resolveStyle(node: Node) {
    // 静态样式直接返回缓存
    if (this.isStaticStyle) {
      return this.staticStyleCache;
    }

    // 索引样式 O(1) 查询
    if (this.isIndexedStyle) {
      return this.indexedStyleMap.get(node.data[this.indexField]);
    }

    // 动态样式（警告用户性能问题）
    return this.dynamicStyleFn(node);
  }
}
```

**收益：**
- 静态样式首次渲染接近 sigma 速度
- 动态样式明确性能代价
- 用户可选择性能级别

### 2.3 渲染调度：简化 RefreshLevel

**当前：** 6 层调度（过度设计）
```typescript
enum RefreshLevel {
  NONE = 0,
  DRAW_ONLY = 1,
  HIGHLIGHT_DELTA = 2,
  PATCH_STYLE = 3,
  PATCH_POSITION = 4,
  PARTIAL_PROCESS = 5,
  FULL_PROCESS = 6,
}
```

**重构后：** 3 层调度（精简）
```typescript
enum RenderMode {
  DRAW = 'draw',           // Camera/Highlight 变化，buffer 不变
  PATCH = 'patch',         // Position/Style 变化，patch buffer
  REBUILD = 'rebuild',     // 数据增删，重建 buffer
}

class Renderer {
  render(mode: RenderMode) {
    switch (mode) {
      case RenderMode.DRAW:
        this.draw();  // 只改 uniform，最快
        break;
      case RenderMode.PATCH:
        this.patchBuffer();  // 局部更新，快
        break;
      case RenderMode.REBUILD:
        this.rebuildBuffer();  // 全量重建，慢
        break;
    }
  }
}
```

**收益：**
- 减少代码复杂度
- 减少运行时判断开销
- 更容易理解和优化

### 2.4 内存管理：对象池 + 数组复用

**当前问题：**
```typescript
// 每次 process 都创建新数组
const nodeHalfWidths = new Float64Array(nodes.length);
const nodeStyles: ResolvedNodeStyle[] = new Array(nodes.length);
```

**重构后：**
```typescript
class MemoryPool {
  private floatArrays = new Map<number, Float64Array[]>();
  private objectArrays = new Map<number, any[][]>();

  getFloatArray(size: number): Float64Array {
    const pool = this.floatArrays.get(size) || [];
    if (pool.length > 0) return pool.pop()!;
    return new Float64Array(size);
  }

  releaseFloatArray(array: Float64Array) {
    const pool = this.floatArrays.get(array.length) || [];
    pool.push(array);
    this.floatArrays.set(array.length, pool);
  }
}

// 全局单例池
const globalPool = new MemoryPool();
```

**收益：**
- 减少 GC 压力
- 内存占用稳定
- 提升重复操作性能

### 2.5 视口裁剪：激进实现

**当前：** 只计算可见性，仍渲染全部

**重构后：** 只渲染可见
```typescript
class Renderer {
  private visibleRange = { start: 0, end: 0 };

  updateVisibility() {
    // 使用空间索引（简单 grid）
    const grid = this.buildSpatialGrid();
    this.visibleRange = grid.query(this.cameraBounds);
  }

  draw() {
    // 只渲染可见范围
    const { start, end } = this.visibleRange;
    nodeProgram.renderRange(start, end - start);
  }
}
```

**收益：**
- 10000 节点交互性能接近 sigma（462fps）
- 内存与可见节点数成正比，而非总节点数

## 三、实施路径

### Phase 1: 去除 DataModel（1 周）
- [ ] 移除 DataModel 类
- [ ] Renderer 直接使用用户数据引用
- [ ] 简化 change 追踪（用户直接调用 render）
- [ ] 预期：内存减少 30%，代码减少 20%

### Phase 2: 静态样式系统（3 天）
- [ ] 实现 StyleConfig 类型
- [ ] 默认静态样式路径
- [ ] 动态样式警告机制
- [ ] 预期：首次渲染性能接近 sigma

### Phase 3: 内存池化（3 天）
- [ ] 实现 MemoryPool
- [ ] 替换所有临时数组创建
- [ ] 预期：内存稳定，GC 减少

### Phase 4: 激进视口裁剪（1 周）
- [ ] 实现 spatial grid
- [ ] Program 支持 renderRange
- [ ] 预期：10000 节点交互性能 300fps+

## 四、与 sigma 的差异化定位

| 特性 | sigma | 重构后 G6Lite | 说明 |
|------|-------|---------------|------|
| **数据存储** | 单层 | 单层 | 一致 |
| **样式系统** | 静态 | 静态优先 + 动态可选 | G6Lite 更灵活 |
| **Picking** | 空间索引 | GPU Framebuffer | G6Lite 更快 |
| **增量更新** | 不支持 | 支持 | G6Lite 优势 |
| **视口裁剪** | 无 | 有 | G6Lite 优势 |
| **代码量** | ~5k | ~8k | G6Lite 稍多，但功能多 |

**定位：**
- sigma：极简，适合静态大数据
- G6Lite：轻量但完整，适合交互密集型应用

## 五、关键代码示例

### 重构后的主流程
```typescript
// 用户使用
const graph = new Graph({
  container: '#canvas',
  data: { nodes, edges },  // 直接使用用户数组
  style: {
    node: { fill: '#5B8FF9', size: 24 },  // 静态样式
    edge: { stroke: '#e2e2e2' }
  }
});

// 内部实现
class Graph {
  render() {
    // 直接传递引用，不转换
    this.renderer.updateData(this.data);
    this.renderer.render('rebuild');
  }

  highlightNode(id) {
    this.renderer.setHighlight({ nodes: new Set([id]) });
    this.renderer.render('draw');  // 只重绘，buffer 不变
  }

  updateNodePosition(id, x, y) {
    // 直接修改用户数据
    const node = this.data.nodes.find(n => n.id === id);
    node.x = x;
    node.y = y;
    this.renderer.render('patch');  // 局部更新
  }
}
```

## 六、风险与回退

| 风险 | 缓解策略 |
|------|----------|
| 去除 DataModel 后变更追踪失效 | 用户直接调用 render 模式，或提供可选插件 |
| 静态样式不够灵活 | 保留动态样式路径，明确性能代价 |
| 视口裁剪引入 bug | 提供开关，默认关闭，验证后开启 |

## 七、结论

**"轻量 + 高性能" = 精简架构 + 保留核心优势**

1. **去除冗余**：DataModel 双份存储、过度设计的 RefreshLevel
2. **简化样式**：静态优先，动态可选
3. **激进优化**：内存池、视口裁剪
4. **保留优势**：GPU picking、增量更新

**预期结果：**
- 首次渲染：接近 sigma（1000节点 < 600ms）
- 交互性能：超越 sigma（10000节点 300fps+）
- 内存占用：接近 sigma（5000节点 < 180MB）
- 代码量：保持精简（< 10k 行）
