# Sigma.js vs G6Lite 架构对比分析

## 一、核心差异一览

| 维度 | sigma.js | G6Lite | 影响 |
|------|----------|--------|------|
| **Picking 方式** | 空间索引 (quadtree) | GPU Framebuffer | sigma 拾取快，G6Lite 精确 |
| **样式系统** | 静态/简单映射 | 动态函数 | G6Lite 灵活，sigma 高效 |
| **渲染调度** | 直接渲染 | 分层调度 (RefreshLevel) | G6Lite 增量更新更优 |
| **数据流** | 单向简单 | 变更追踪 | G6Lite 支持细粒度更新 |
| **图元选择** | POINTS + LINES | 多种 Program | G6Lite 效果丰富，sigma 简单 |
| **内存策略** | 紧凑数组 | 功能优先 | sigma 内存小，G6Lite 功能多 |

## 二、代码对比：节点渲染

### 2.1 sigma.js - 极简节点渲染

```typescript
// sigma/src/renderers/webgl/programs/node.ts

const vertexShader = `
  attribute vec2 a_position;
  attribute float a_size;
  attribute vec4 a_color;

  uniform mat3 u_matrix;  // 投影矩阵
  uniform float u_sizeRatio;
  uniform float u_pixelRatio;

  void main() {
    // 直接应用矩阵变换
    gl_Position = vec4(
      (u_matrix * vec3(a_position, 1)).xy,
      0,
      1
    );

    // 点大小随 zoom 变化
    gl_PointSize = a_size * u_sizeRatio * u_pixelRatio;

    v_color = a_color;
  }
`;

const fragmentShader = `
  precision mediump float;

  varying vec4 v_color;

  void main() {
    // 简单的圆形裁剪
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    gl_FragColor = v_color;
  }
`;

// 渲染流程
class NodeProgram {
  process(node) {
    // 直接写入 buffer，没有复杂的样式解析
    array[i++] = node.x;
    array[i++] = node.y;
    array[i++] = node.size;
    array[i++] = node.color.r;
    array[i++] = node.color.g;
    array[i++] = node.color.b;
    array[i++] = node.color.a;
  }
}
```

**特点：**
- 使用 `gl.POINTS`，一个顶点就是一个节点
- 样式直接来自 node 对象，没有运行时计算
- 圆形用 `discard` 实现，简单高效

### 2.2 G6Lite - 功能丰富节点渲染

```typescript
// G6Lite/src/renderer/programs/nodeCircle.ts

const vertexShader = `
  attribute vec2 a_position;
  attribute float a_size;
  attribute vec3 a_color;
  attribute vec3 a_strokeColor;
  attribute float a_strokeWidth;
  attribute float a_opacity;
  attribute float a_haloWidth;

  uniform vec2 u_translate;    // 相机位置
  uniform float u_scale;       // 缩放级别
  uniform vec2 u_resolution; // 画布分辨率

  varying vec3 v_color;
  varying vec3 v_strokeColor;
  varying float v_strokeWidth;
  varying float v_opacity;
  varying float v_haloWidth;

  void main() {
    // 手动计算投影矩阵
    vec2 clipSpace = ((a_position + u_translate) * u_scale / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

    gl_PointSize = a_size * u_scale;

    v_color = a_color;
    v_strokeColor = a_strokeColor;
    v_strokeWidth = a_strokeWidth;
    v_opacity = a_opacity;
    v_haloWidth = a_haloWidth;
  }
`;

const fragmentShader = `
  precision mediump float;

  varying vec3 v_color;
  varying vec3 v_strokeColor;
  varying float v_strokeWidth;
  varying float v_opacity;
  varying float v_haloWidth;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));

    // 背景色（用于高亮时的透明混合）
    vec3 bgColor = vec3(1.0);

    // 光晕效果
    float haloEdge = 0.5 + v_haloWidth / gl_PointSize;
    if (v_haloWidth > 0.0 && dist < haloEdge) {
      gl_FragColor = vec4(v_color * 1.5, v_opacity * 0.3);
      return;
    }

    // 主圆
    if (dist > 0.5) discard;

    // 边框
    float innerRadius = 0.5 - v_strokeWidth / gl_PointSize;
    if (dist > innerRadius) {
      gl_FragColor = vec4(v_strokeColor, v_opacity);
    } else {
      gl_FragColor = vec4(v_color, v_opacity);
    }
  }
`;
```

**特点：**
- 支持边框、透明度、光晕等多种效果
- 样式通过 JavaScript 动态解析后传入
- 一个节点需要 15 个 float 属性

## 三、代码对比：Picking 实现

### 3.1 sigma - 空间索引

```typescript
// sigma/src/quadtree.ts

class Quadtree {
  constructor(bounds) {
    this.root = new Node(bounds);
  }

  insert(item) {
    // 递归找到合适的象限插入
    this.root.insert(item);
  }

  query(x, y, radius) {
    // 只查询相关象限，O(logN)
    return this.root.query(x, y, radius);
  }
}

// 使用
class Sigma {
  pickNode(x, y) {
    // 不需要 GPU，直接空间查询
    return this.quadtree.point(x, y);
  }
}
```

**优点：**
- 不需要额外的 GPU pass
- 可以获取精确的距离信息
- 支持模糊查询（半径内所有节点）

**缺点：**
- 节点移动后需要更新索引
- 大数据量时索引构建有开销

### 3.2 G6Lite - GPU Picking

```typescript
// G6Lite/src/renderer/picking.ts

class PickingManager {
  constructor(gl) {
    this.gl = gl;
    // 创建离屏 framebuffer
    this.framebuffer = gl.createFramebuffer();
    this.texture = gl.createTexture();
    // ... 初始化纹理
  }

  bind() {
    // 绑定到离屏 framebuffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
  }

  unbind() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

  readPixel(x, y) {
    const pixel = new Uint8Array(4);
    this.gl.readPixels(x, y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixel);
    return pixel;
  }
}

// 使用
class Renderer {
  pickAt(screenX, screenY) {
    // 1. 确保 picking framebuffer 是最新的
    if (this.needPickingRender) {
      this.renderPickingPass();
    }

    // 2. 读取像素颜色
    const pixel = this.picking.readPixel(screenX, screenY);

    // 3. 颜色解码为 ID
    const id = decodePickingColor(pixel);

    return this.getElementById(id);
  }

  renderPickingPass() {
    this.picking.bind();

    // 使用 picking 着色器（输出 ID 而不是颜色）
    this.nodeProgram.render({ picking: true });
    this.edgeProgram.render({ picking: true });

    this.picking.unbind();
    this.needPickingRender = false;
  }
}
```

**优点：**
- 精确拾取任意形状
- 不需要维护空间索引
- 拾取结果与视觉完全一致

**缺点：**
- 需要额外的 GPU pass
- 首次拾取有延迟（需要渲染 picking buffer）
- 消耗更多 GPU 内存

## 四、代码对比：数据更新

### 4.1 sigma - 全量更新

```typescript
class Sigma {
  // 数据变化后，重新生成所有 buffer
  refresh() {
    // 1. 清空 buffer
    this.nodeBuffer = [];
    this.edgeBuffer = [];

    // 2. 遍历所有节点重新生成
    for (const node of this.graph.nodes()) {
      this.nodeBuffer.push({
        x: node.x,
        y: node.y,
        size: this.settings.nodeSize,
        color: this.nodeColor(node)
      });
    }

    // 3. 上传 GPU
    this.webglRenderer.upload(this.nodeBuffer);
  }
}

// 使用：每次数据变化都调用 refresh
graph.setNodeAttribute(id, 'size', 20);
sigma.refresh();  // 全量重建
```

### 4.2 G6Lite - 增量更新

```typescript
class RenderScheduler {
  // 根据变更类型选择最优更新策略
  schedule() {
    const changes = this.dataModel.getChanges();
    const level = this.resolveRefreshLevel(changes);

    switch (level) {
      case RefreshLevel.DRAW_ONLY:
        // 只重绘，buffer 不变
        this.renderer.draw();
        break;

      case RefreshLevel.PATCH_POSITION:
        // 只更新位置属性
        this.renderer.patchPositions(changes);
        break;

      case RefreshLevel.PATCH_STYLE:
        // 只更新样式属性
        this.renderer.patchStyles(changes);
        break;

      case RefreshLevel.PARTIAL_PROCESS:
        // 增量重建（只处理新增/删除）
        this.renderer.partialProcess(changes);
        break;

      case RefreshLevel.FULL_PROCESS:
        // 全量重建
        this.renderer.updateData(data);
        break;
    }
  }
}

// 使用：框架自动选择最优策略
graph.updateNodePosition(id, x, y);  // → PATCH_POSITION
graph.setNodeState(id, 'active');     // → PATCH_STYLE
graph.addNode(newNode);               // → PARTIAL_PROCESS
```

## 五、性能对比：关键指标

### 5.1 首次渲染 (1000 节点)

```
sigma:
  - 数据预处理: ~5ms
  - buffer 生成: ~10ms
  - GPU 上传: ~5ms
  - 总计: ~20ms

G6Lite:
  - 样式解析: ~50ms (动态函数调用)
  - buffer 生成: ~30ms
  - GPU 上传: ~10ms
  - 总计: ~90ms

差距原因: G6Lite 的动态样式系统有运行时开销
```

### 5.2 交互帧率 (10000 节点)

```
sigma:
  - 渲染: 1 draw call (节点) + 1 draw call (边)
  - 视口裁剪: 无（依赖 GPU）
  - 典型 FPS: 450

G6Lite:
  - 渲染: 多个 program 切换
  - 视口裁剪: 有（CPU 计算可见性）
  - picking pass: 额外开销
  - 典型 FPS: 120

优化建议: G6Lite 可添加更激进的视口裁剪
```

### 5.3 内存占用 (10000 节点)

```
sigma:
  - 节点 buffer: 10000 * 7 floats * 4 bytes = 280KB
  - 边 buffer: 30000 * 6 floats * 4 bytes = 720KB
  - 空间索引: ~2MB
  - 总计: ~3MB + 图数据

G6Lite:
  - 节点 buffer: 10000 * 15 floats * 4 bytes = 600KB
  - 边 buffer: 30000 * 17 floats * 4 bytes = 2MB
  - picking texture: 800 * 600 * 4 bytes = 1.9MB
  - polyline 缓存: 可变，可能 10MB+
  - DataModel 拷贝: 双倍内存
  - 总计: 15MB+

差距原因: G6Lite 功能丰富导致内存开销大
```

## 六、设计哲学对比

### 6.1 sigma.js

> "做一件事，并把它做好"

- **专注**: 只做图可视化渲染，不处理布局、交互
- **简单**: 限制功能集换取性能
- **可预测**: 静态配置，运行时行为确定
- **零依赖**: 核心库不依赖其他框架

**适用场景:**
- 大数据量网络图
- 需要极致性能
- 样式相对静态
- 不需要复杂交互

### 6.2 G6Lite

> "功能完整，灵活扩展"

- **完整**: 数据模型、渲染、交互一体化
- **灵活**: 动态样式、插件化行为
- **增量**: 精细化更新策略
- **精确**: GPU picking 保证交互准确性

**适用场景:**
- 复杂业务图应用
- 需要丰富视觉效果
- 频繁数据更新
- 精确交互要求

## 七、学习建议

### 如果你来自 React/Vue 背景

1. **先学 sigma**: 理解 WebGL 基础，没有复杂架构负担
2. **对比 G6Lite**: 理解 DataModel + Scheduler 模式，类似 React 的 state + render
3. **深入 WebGL**: 学习 shader 编程，理解 GPU 并行思维

### 如果你来自游戏开发背景

1. **直接看 G6Lite**: 架构类似游戏引擎（ECS 模式）
2. **关注差异**: 图可视化的特殊需求（picking、动态样式、混合渲染）
3. **性能优化**: 对比游戏 LOD 和图可视化的 culling 策略

### 实践路径

```
Week 1: 用 raw WebGL 渲染 1000 个圆点
Week 2: 添加相机系统和鼠标交互
Week 3: 实现简单的 picking（距离检测）
Week 4: 学习 sigma 源码，对比自己的实现
Week 5: 学习 G6Lite 架构，理解 RefreshLevel
Week 6: 实现自己的 mini 图可视化引擎
```
