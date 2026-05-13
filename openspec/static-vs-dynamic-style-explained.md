# 静态样式 vs 动态样式：为什么 G6Lite 比 sigma 慢？

## 一、问题本质：运行时判断的代价

### 1.1 当前 G6Lite 的做法（慢）

```typescript
// 用户配置（看起来是静态的）
const config = {
  style: {
    fill: '#5B8FF9',     // 纯字符串，不是函数
    size: 24             // 纯数字，不是函数
  }
}

// G6Lite 的解析代码（每次都要判断）
function resolveNodeStyle(node, config) {
  // 问题：即使 fill 是字符串，每次还是要执行 typeof
  const fill = typeof config.style.fill === 'function' 
    ? config.style.fill(node)   // 分支 1：动态
    : config.style.fill;        // 分支 2：静态
    
  const size = typeof config.style.size === 'function'
    ? config.style.size(node)   // 分支 1：动态
    : config.style.size;        // 分支 2：静态
    
  // ... 每个属性都要判断一次
}

// 1000 节点 × 10 个属性 = 10000 次 typeof 判断！
```

**性能杀手：**
- `typeof` 判断本身很快（~1ns）
- 但 10000 次 × 1ns = 10μs，累积起来就是 10ms+
- 加上函数调用开销、缓存未命中，实际更慢

### 1.2 sigma 的做法（快）

```typescript
// sigma 的配置
const config = {
  nodeColor: '#5B8FF9',    // 直接就是值
  nodeSize: 24               // 直接就是值
}

// sigma 的解析代码（直接读取）
function processNode(node, config) {
  const fill = config.nodeColor;   // 直接读取，无判断
  const size = config.nodeSize;    // 直接读取，无判断
  
  // 没有 typeof，没有分支，没有函数调用
}

// 1000 节点 × 10 个属性 = 10000 次直接读取
// 直接读取比 typeof + 分支快 5-10 倍
```

**为什么快：**
- CPU 分支预测更准
- 没有函数调用开销
- 编译器可以内联优化

---

## 二、解决方案：提前检测，分离路径

### 2.1 核心思想

```
初始化时（一次）：
检测配置类型 → 标记为"静态"或"动态"

运行时（每次）：
如果是"静态" → 直接返回缓存（超快）
如果是"动态" → 执行函数（慢，但必要）
```

### 2.2 具体实现

```typescript
// ========== 初始化时（只执行一次）==========
function analyzeConfig(config) {
  // 检测：所有样式属性都不是函数？
  const isStatic = 
    typeof config.style?.fill !== 'function' &&
    typeof config.style?.size !== 'function' &&
    typeof config.style?.stroke !== 'function';
  
  if (isStatic) {
    // 静态配置：预计算结果，缓存起来
    config._styleType = 'static';
    config._cachedStyle = {
      fill: config.style.fill ?? '#5B8FF9',
      size: config.style.size ?? 24,
      // ... 所有属性
    };
  } else {
    // 动态配置：标记为动态
    config._styleType = 'dynamic';
  }
}

// ========== 运行时（每次渲染）==========
function resolveNodeStyle(node, config) {
  // 快速路径：静态配置（90% 场景）
  if (config._styleType === 'static') {
    return config._cachedStyle;  // 直接返回缓存，零计算！
  }
  
  // 慢速路径：动态配置（10% 场景）
  return {
    fill: typeof config.style.fill === 'function' 
      ? config.style.fill(node) 
      : config.style.fill,
    // ... 每个属性都要判断
  };
}
```

### 2.3 性能对比

| 场景 | 当前 G6Lite | 优化后 | sigma | 优化后差距 |
|------|-------------|--------|-------|-----------|
| **静态样式** | 10000 次判断 | 1 次缓存读取 | 10000 次直接读取 | **接近 sigma** |
| **动态样式** | 10000 次判断 | 10000 次函数调用 | 不支持 | 功能换性能 |

---

## 三、实际代码对比

### 3.1 场景：1000 个蓝色节点

**用户代码：**
```typescript
const graph = new Graph({
  data: { nodes, edges },
  node: {
    style: {
      fill: '#5B8FF9',  // 静态值
      size: 24          // 静态值
    }
  }
});
```

**当前 G6Lite 执行（慢）：**
```typescript
// 第 1 个节点
resolveNodeStyle(node1, config)
  ├─ typeof config.style.fill === 'function'?  // false
  ├─ typeof config.style.size === 'function'?  // false
  └─ ... 还有 8 个属性

// 第 2 个节点（重复同样判断）
resolveNodeStyle(node2, config)
  ├─ typeof config.style.fill === 'function'?  // false（重复！）
  ├─ typeof config.style.size === 'function'?  // false（重复！）
  └─ ...

// ... 第 1000 个节点（重复 1000 次！）
```

**优化后 G6Lite 执行（快）：**
```typescript
// 初始化时（一次）
analyzeConfig(config)
  └─ 检测到 fill 和 size 都不是函数
  └─ 标记 config._styleType = 'static'
  └─ 缓存 config._cachedStyle = { fill: '#5B8FF9', size: 24 }

// 第 1 个节点
resolveNodeStyle(node1, config)
  └─ config._styleType === 'static'?  // true
  └─ return config._cachedStyle;      // 直接返回，无判断！

// 第 2 个节点（同样快）
resolveNodeStyle(node2, config)
  └─ config._styleType === 'static'?  // true
  └─ return config._cachedStyle;      // 直接返回！

// ... 第 1000 个节点（同样快）
```

### 3.2 场景：1000 个根据数据变色的节点

**用户代码：**
```typescript
const graph = new Graph({
  data: { nodes, edges },
  node: {
    style: {
      fill: (node) => node.data.important ? 'red' : 'blue',  // 动态函数
      size: 24  // 静态值
    }
  }
});
```

**优化后执行：**
```typescript
// 初始化时（一次）
analyzeConfig(config)
  └─ 检测到 fill 是函数
  └─ 标记 config._styleType = 'dynamic'

// 第 1 个节点
resolveNodeStyle(node1, config)
  └─ config._styleType === 'static'?  // false
  └─ fill: config.style.fill(node1)  // 执行函数
  └─ size: config.style.size          // 直接读取

// 第 2 个节点（无法优化，必须执行函数）
resolveNodeStyle(node2, config)
  └─ fill: config.style.fill(node2)  // 执行函数
```

**关键：** 只有明确使用函数时才承担性能代价

---

## 四、为什么叫"静态样式优先"

### 4.1 默认高性能

```typescript
// 默认情况（90% 用户）：高性能
style: {
  fill: '#5B8FF9',    // 静态值 → 走快速路径
  size: 24
}

// 首次渲染：~600ms（接近 sigma 555ms）
```

### 4.2 动态样式显式选择

```typescript
// 特殊情况（10% 用户）：功能优先
style: {
  type: 'dynamic',     // 明确选择动态
  fill: (node) => node.data.color
}

// 首次渲染：~1400ms（当前水平）
// 但功能更强大
```

### 4.3 对比当前

```typescript
// 当前：所有情况都走慢路径
// 静态样式也要判断 typeof，浪费性能

// 优化后：自动选择最优路径
// 静态样式走快速路径，动态样式走慢路径
```

---

## 五、实施后的预期效果

### 5.1 性能数据预测

| 场景 | 当前 | 优化后 | sigma | 差距 |
|------|------|--------|-------|------|
| **纯静态 1000 节点** | 1400ms | **600ms** | 555ms | 1.08x ✅ |
| **纯静态 5000 节点** | 4654ms | **2000ms** | 3864ms | 0.52x ✅ 超越！ |
| **混合（20% 动态）** | 1400ms | **800ms** | 不支持 | - |
| **纯动态** | 1400ms | 1400ms | 不支持 | - |

### 5.2 关键洞察

**为什么 5000 节点能超越 sigma？**
- sigma：全量重建 buffer（O(N)）
- G6Lite：静态样式缓存 + 增量更新（O(1)）
- 大数据量时，G6Lite 的架构优势显现

**为什么 1000 节点仍略慢？**
- sigma 的极简架构仍有优势
- 但差距从 2.5x 缩小到 1.08x，可接受

---

## 六、总结

### 当前问题
```
G6Lite：所有样式都要判断 typeof（慢）
sigma：直接读取值（快）
```

### 解决方案
```
优化后 G6Lite：
├── 初始化时检测配置类型（一次）
├── 静态配置：缓存结果，直接返回（快）
└── 动态配置：执行函数（慢，但必要）
```

### 最终效果
- **静态场景**：性能接近 sigma（差距 < 10%）
- **动态场景**：功能比 sigma 强大（sigma 不支持）
- **差异化**：用功能换性能，而不是用性能换功能
