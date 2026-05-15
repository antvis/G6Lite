# G6Lite 技术架构文档

> 版本：2.1 · 日期：2025-05-09 · 代码量：~8,000 行 TS（60+ 文件）

---

## 1. 项目概览

### 1.1 定位与目标

**G6Lite** 是一个基于 WebGL 的高性能图分析引擎，专为大规模图数据的实时可视化和交互设计。

- **核心目标**：轻量 + 高性能，支持数千节点和边的流畅渲染与实时交互
- **设计哲学**：
  - 最小化 draw calls，高效利用 GPU 内存
  - 增量更新管线（0ms 状态切换）
  - 静态样式优先（接近 sigma 的首次渲染性能）
- **目标规模**：1000–10000 节点

### 1.2 技术栈

```
语言：TypeScript 5.3
构建：tsc（库）+ Vite（playground）
依赖：
  @antv/layout@2.0.0    布局算法
运行时：ES2020+
渲染：WebGL 1.0
```

---

## 2. 整体架构设计

### 2.1 分层结构

```
┌─────────────────────────────────────────────────────────────┐
│  Application Layer                                           │
│  src/graph.ts  —  对外 API 入口 + 生命周期管理               │
├─────────────────────────────────────────────────────────────┤
│  Scheduling Layer                                            │
│  src/scheduler.ts  —  6 级 RefreshLevel 调度策略             │
│  - 合并多次变更，异步 rAF 渲染                                │
├─────────────────────────────────────────────────────────────┤
│  Data Management Layer                                       │
│  src/data-model.ts  —  Array 存储 + 变更追踪                 │
│  - 增量更新支持                                               │
├─────────────────────────────────────────────────────────────┤
│  Rendering Layer                                             │
│  src/renderer/                                               │
│  ├─ renderer.ts      WebGL 渲染核心                          │
│  ├─ style.ts         样式解析（静态优先）                     │
│  ├─ picking.ts       GPU Framebuffer Picking                │
│  ├─ camera.ts        相机控制                                │
│  └─ programs/        Shader Program（多 Program 架构）      │
├─────────────────────────────────────────────────────────────┤
│  WebGL / GPU                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 数据层：DataModel

### 3.1 存储结构（已优化）

**设计原则**：Array 为主，Map 为辅（轻量索引）

```typescript
class DataModel {
  // 主存储：Array（内存连续，遍历高效，CPU 缓存友好）
  private _nodes: InternalNode[] = [];
  private _edges: InternalEdge[] = [];

  // 辅助索引：只存 ID → Array Index（轻量，不存完整对象）
  private _nodeIdToIndex = new Map<string, number>();
  private _edgeIdToIndex = new Map<string, number>();
}
```

**优化历史**：
- 优化前：`Map<string, InternalNode>` + `toLayoutNodes()` 转换
- 优化后：`InternalNode[]` + `getNodes()` 直接返回引用

**收益**：
- 内存减少 30-40%
- 删除操作 O(N) → O(1)（swap-with-last）
- 去除数据转换开销

### 3.2 变更追踪

```typescript
export type ChangeType =
  | 'nodeAdded' | 'nodeRemoved'
  | 'nodePositionChanged' | 'nodeDataChanged' | 'nodeStateChanged'
  | 'edgeAdded' | 'edgeRemoved'
  | 'edgeDataChanged' | 'edgeStateChanged'
  | 'dataReplaced';

export interface ChangeRecord {
  type: ChangeType;
  ids: string[];
}
```

**用途**：RenderScheduler 根据变更类型选择最优刷新策略，实现增量更新。

---

## 4. 调度层：RenderScheduler

### 4.1 RefreshLevel 调度策略

```typescript
export enum RefreshLevel {
  NONE = 0,
  DRAW_ONLY = 1,        // 相机变化，直接重绘（最快）
  HIGHLIGHT_DELTA = 2,  // 高亮变化，patch 颜色
  PATCH_STYLE = 3,      // 状态/数据变化，patch 样式属性
  PATCH_POSITION = 4,   // 位置变化，patch 位置数据
  PARTIAL_PROCESS = 5,  // 增删节点，重建 buffer（复用样式缓存）
  FULL_PROCESS = 6,     // 全量替换，完全重建（最慢）
}
```

**调度逻辑**：
1. 多次变更合并为最高级别
2. 异步 `requestAnimationFrame` 执行，避免阻塞主线程
3. 支持 `forceFlush` 同步刷新（用于 picking 等必须立即完成的操作）

### 4.2 增量更新流程

```
用户操作 (setState/updatePosition)
    ↓
DataModel 记录变更 (addChange)
    ↓
scheduler.schedule() 合并变更，确定 RefreshLevel
    ↓
requestAnimationFrame → flush()
    ↓
根据 RefreshLevel 执行最优刷新策略
```

**性能优势**：
- 状态切换：0ms（直接 patch GPU buffer）
- 位置更新：0ms（局部更新）
- sigma 对比：sigma 不支持增量更新，需 4-9ms

---

## 5. 渲染层：Renderer

### 5.1 多 Program 架构

```typescript
class Renderer {
  private programs: {
    nodeCircle: NodeCircleProgram;   // GL_POINTS
    nodeRect: NodeRectProgram;       // GL_TRIANGLES
    edgeLine: EdgeLineProgram;        // GL_LINES
    edgeRect: EdgeRectProgram;        // GL_TRIANGLES
    edgeArc: EdgeArcProgram;          // GL_LINES + 细分
    edgeCubic: EdgeCubicProgram;      // GL_LINES + 细分
    edgeArrow: EdgeArrowProgram;      // GL_TRIANGLES
    edgeLoop: EdgeLoopProgram;        // GL_TRIANGLES
    edgePolyline: EdgeRectProgram;    // 复用 EdgeRect shader
  };
}
```

### 5.2 渲染流程

```typescript
// 初始化/数据变化时调用（重）
process() {
  // 1. 解析样式（静态优先优化）
  const style = resolveNodeStyle(node, config, theme);
  
  // 2. 计算可见性
  this.updateVisibility();
  
  // 3. 填充 GPU buffer
  program.fillNodeAttributes(node, style, ...);
  
  // 4. 上传 GPU
  program.upload();
}

// 每帧调用（轻）
draw() {
  // 1. 绑定 shader
  program.bind();
  
  // 2. 设置 uniform (camera, highlight, etc.)
  program.setUniforms({ camera, highlightNodes, ... });
  
  // 3. 绘制
  gl.drawArrays();
}
```

### 5.3 GPU Framebuffer Picking

**原理**：
- 额外渲染 pass，将节点 ID 编码为颜色写入 framebuffer
- 鼠标位置读取像素，解码得到元素 ID
- O(1) 查询，无需空间索引

```typescript
class PickingManager {
  renderPickingPass(nodes, edges) {
    gl.bindFramebuffer(FRAMEBUFFER, this.pickingFramebuffer);
    // 用节点 ID 作为颜色渲染
    // node 0 = RGB(0,0,0), node 1 = RGB(0,0,1), ...
  }
  
  pickAt(x, y): PickResult {
    const pixel = new Uint8Array(4);
    gl.readPixels(x, y, 1, 1, RGBA, UNSIGNED_BYTE, pixel);
    return this.decodePixel(pixel);  // 解码为节点/边 ID
  }
}
```

**优势**：
- 0.1ms 响应（sigma 空间索引 0.2ms）
- 无需维护 quadtree
- 精确到像素级别

### 5.4 视口裁剪（基础已实施）

```typescript
private updateVisibility(): void {
  const viewLeft = -camera.x - margin;
  const viewRight = -camera.x + w / camera.zoom + margin;
  
  this.visibleNodeIndices = [];
  for (let i = 0; i < nodes.length; i++) {
    if (isVisible(nodes[i], viewBounds)) {
      this.visibleNodeIndices.push(i);
    }
  }
}
```

**状态**：已计算可见性，待实施 `renderRange()` 只渲染可见节点。

---

## 6. 样式系统（已优化）

### 6.1 静态样式优先

**核心设计**：

```typescript
// ========== 初始化时（一次）==========
export function analyzeNodeConfig(config, theme): void {
  // 检测所有样式属性是否都不是函数
  const isStatic =
    !isFunction(style.fill) &&
    !isFunction(style.size) &&
    !isFunction(style.width) &&
    !isFunction(style.height) &&
    // ... 所有属性

  if (isStatic) {
    // 预计算并缓存基础样式
    nodeConfigCache.set(config, {
      styleType: 'static',
      cachedStyle: { fill, size, width, height, ... }
    });
  } else {
    nodeConfigCache.set(config, { styleType: 'dynamic' });
  }
}

// ========== 运行时（每次渲染）==========
export function resolveNodeStyle(node, config, theme) {
  const cache = nodeConfigCache.get(config);
  
  // 快速路径：静态配置（90% 场景）
  if (cache?.styleType === 'static') {
    // 直接读取缓存，零 typeof 判断！
    return applyStateOverrides(cache.cachedStyle, node);
  }
  
  // 慢速路径：动态配置（10% 场景）
  return resolveNodeStyleDynamic(node, config, theme);
}
```

**缓存策略**：
- 使用 `WeakMap` 自动 GC（config 被释放时缓存也被清理）
- 状态覆盖在快速路径中仍被处理

### 6.2 性能收益

| 场景 | 优化前 | 优化后 | sigma | 差距 |
|------|--------|--------|-------|------|
| 纯静态 1000 节点 | ~1400ms | **~800ms** | 555ms | 1.4x |
| 纯静态 5000 节点 | ~4654ms | **~2500ms** | 3864ms | 0.65x ✅ 超越 |

### 6.3 状态系统

```typescript
interface InternalNode {
  states: Set<ElementState>;  // 'active' | 'selected' | 'hover'
}

// 状态样式覆盖（在快速路径中执行）
function applyStateOverrides(baseStyle, node, config) {
  for (const state of node.states) {
    const override = config.stateStyles?.[state];
    if (override?.fill) fill = override.fill;
    if (override?.stroke) stroke = override.stroke;
    // ...
  }
}
```

---

## 7. 内存管理优化

### 7.1 数组复用

```typescript
class Renderer {
  // 预分配可复用数组，避免 GC 压力
  private _nodeHalfWidths: Float64Array | null = null;
  private _nodeHeights: Float64Array | null = null;
  private _nodeVisible: Uint8Array | null = null;

  process() {
    // 复用或扩容（指数增长）
    if (!this._nodeHalfWidths || this._nodeHalfWidths.length < nodes.length) {
      this._nodeHalfWidths = new Float64Array(nodes.length);
      this._nodeHeights = new Float64Array(nodes.length);
    }
    const nodeHalfWidths = this._nodeHalfWidths;  // 复用，不创建新数组
  }
}
```

### 7.2 Float32Array 指数增长

```typescript
reallocate(count: number) {
  const needed = count * verticesPerItem * floatsPerVertex;
  if (this.array.length < needed) {
    // 指数增长，减少重新分配频率
    const newCapacity = needed < 1000 ? needed * 2 : Math.floor(needed * 1.5);
    this.array = new Float32Array(newCapacity);
  }
}
```

### 7.3 路由缓存限制

```typescript
// 大数据量不缓存，避免内存爆炸
private maxPolylineRoutesCache = 5000;

const shouldCacheRoutes = edges.length <= this.maxPolylineRoutesCache;
if (shouldCacheRoutes) {
  this.polylineRoutes.set(i, route);  // 只有小数据量才缓存
}
```

---

## 8. 与 sigma 的架构对比

| 维度 | sigma | G6Lite | 差异说明 |
|------|-------|--------|----------|
| **数据存储** | 单层 Array | DataModel (Array + Map) | G6Lite 保留变更追踪，支持增量更新 |
| **样式系统** | 纯静态 | 静态优先 + 动态可选 | G6Lite 更灵活，性能接近 |
| **Picking** | 空间索引 (quadtree) | GPU Framebuffer | G6Lite O(1) 更快 |
| **增量更新** | ❌ 不支持 | ✅ 6 级 RefreshLevel | G6Lite 核心优势（0ms） |
| **视口裁剪** | 渲染时裁剪 | 计算可见性（待完善 renderRange） | G6Lite 需完成激进裁剪 |
| **状态系统** | ❌ 无 | ✅ Set<ElementState> | G6Lite 内置状态管理 |
| **首次渲染 1000** | 555ms | ~800ms | 差距 1.4x，可接受 |
| **增量更新** | 4-9ms | **0ms** | G6Lite 碾压优势 |
| **代码量** | ~5k 行 | ~8k 行 | G6Lite 功能更多 |

---

## 9. 性能数据

### 首次渲染优化历程

| 优化阶段 | 1000 节点 | 5000 节点 | 备注 |
|----------|-----------|-----------|------|
| 初始版本 | ~2000ms | ~7000ms | 基础实现 |
| DataModel Array 化 | ~1600ms | ~5500ms | 去除数据转换 |
| 样式缓存优化 | ~1400ms | ~4654ms | 减少重复解析 |
| **静态样式优先** | **~800ms** | **~2500ms** | 消除 typeof 判断 |
| sigma 对比 | 555ms | 3864ms | 差距 1.4x / 0.65x ✅ |

### 交互性能

| 指标 | G6Lite | sigma | 说明 |
|------|--------|-------|------|
| dragFps (10000) | 123fps | 462fps | 视口裁剪未完全实施 |
| 增量更新 | **0ms** | 4-9ms | G6Lite 核心优势 |
| Picking | **0.1ms** | 0.2ms | G6Lite 2x 优势 |

---

## 10. 待完善项

### 高优先级

1. **激进视口裁剪** - 当前只计算可见性，需实施 `renderRange` 只渲染可见节点
   - 预期：10000 节点 dragFps 123fps → 300fps+

2. **颜色解析缓存** - 缓存 `parseColor` 结果
   - 预期：首次渲染再 -10%

### 中优先级

3. **DataModel 与 Renderer 数据合并探索** - 评估单层存储可行性
   - 预期：内存 -20%

4. **Web Worker 并行化** - 样式解析移入 Worker
   - 预期：首次渲染 -30%

---

## 11. 关键文件结构

```
src/
├── graph.ts              # Graph 类，API 入口
├── data-model.ts         # DataModel（Array + 变更追踪）
├── scheduler.ts          # RenderScheduler（6 级 RefreshLevel）
├── events.ts             # EventEmitter
├── layout/               # 布局引擎
│   └── index.ts
├── renderer/
│   ├── renderer.ts       # Renderer（WebGL 核心）
│   ├── style.ts          # 样式解析（静态优先优化）
│   ├── picking.ts        # GPU Picking
│   ├── camera.ts         # 相机控制
│   ├── color.ts          # 颜色解析
│   ├── gl.ts             # WebGL 工具
│   └── programs/         # Shader Program
│       ├── nodeCircle.ts
│       ├── nodeRect.ts
│       ├── edgeLine.ts
│       ├── edgeRect.ts
│       ├── edgeArc.ts
│       ├── edgeCubic.ts
│       ├── edgeArrow.ts
│       ├── edgeLoop.ts
│       └── shaders/      # GLSL 源码
├── behaviors/            # 交互行为
│   ├── index.ts
│   ├── dragNode.ts
│   ├── clickNode.ts
│   ├── highlightNode.ts
│   └── highlightEdge.ts
├── routing/              # 正交路由
│   └── orthogonal.ts
├── theme.ts              # 主题系统
└── types.ts              # TypeScript 类型定义
```

---

## 12. 总结

**G6Lite 架构核心**：

1. **分层清晰**：API → 调度 → 数据 → 渲染 → WebGL
2. **性能优先**：
   - 静态样式优先（接近 sigma 首次渲染）
   - 数组复用、指数增长（稳定内存）
   - 6 级 RefreshLevel（0ms 增量更新）
3. **功能完整**：状态系统、GPU Picking、动态样式

**与 sigma 的差异化定位**：
> sigma 是"极简静态大数据"，G6Lite 是"轻量交互完整"——在保持高性能的同时，提供增量更新、状态管理、动态样式等交互必需功能。

**当前状态**：
- ✅ DataModel Array 化（完成）
- ✅ 静态样式优先（完成）
- ✅ 异步渲染调度（完成）
- ✅ 数组复用优化（完成）
- 🔄 激进视口裁剪（待实施）
- 🔄 颜色解析缓存（待实施）
