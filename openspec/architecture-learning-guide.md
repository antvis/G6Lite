# 图可视化引擎架构学习指南

## 一、sigma.js 架构深度解析

### 1.1 核心架构图

```
sigma.js Core Architecture
├── src/
│   ├── sigma.ts              # 主入口，图数据管理
│   ├── camera.ts             # 2D 相机系统
│   ├── renderer/
│   │   ├── index.ts          # 渲染器协调器
│   │   ├── programs/         # WebGL Program 集合
│   │   │   ├── node.ts       # 节点渲染 (GL_POINTS)
│   │   │   ├── edge.ts       # 边渲染 (GL_LINES)
│   │   │   ├── edgeArrow.ts  # 箭头渲染
│   │   │   └── label.ts      # 文字渲染 (Canvas 2D 混合)
│   │   └── webgl/
│   │       ├── index.ts      # WebGL 上下文管理
│   │       ├── program.ts    # Program 基类
│   │       └── utils.ts      # 着色器工具
│   ├── captor/
│   │   ├── mouse.ts          # 鼠标事件捕获
│   │   └── touch.ts          # 触摸事件捕获
│   └── utils/
│       ├── index.ts          # 通用工具
│       └── events.ts         # 事件系统
```

### 1.2 关键设计决策

#### A. 极简渲染管线
```typescript
// sigma 的渲染流程（简化）
class Sigma {
  render() {
    // 1. Clear
    gl.clear(gl.COLOR_BUFFER_BIT)

    // 2. Render edges (batch draw)
    edgeProgram.render(cameraMatrix)

    // 3. Render nodes (batch draw)
    nodeProgram.render(cameraMatrix)

    // 4. Render labels (Canvas 2D overlay)
    if (settings.renderLabels) {
      labelRenderer.render()
    }
  }
}
```

**为什么快？**
- 没有 framebuffer picking，使用**空间索引**（quadtree）做 hit detection
- 边使用 `GL_LINES`，节点使用 `GL_POINTS`，都是最简单的图元
- 没有复杂的样式解析，样式是静态的或简单的映射函数

#### B. 空间索引替代 GPU Picking
```typescript
// sigma 使用 quadtree 进行 O(logN) 的 hit detection
class Sigma {
  pickNode(x, y) {
    // 空间查询，不需要渲染 picking framebuffer
    return this.quadtree.point(x, y)
  }
}
```

**权衡：**
- ✅ 优点：不需要额外的 GPU 渲染 pass，pick 操作极快
- ❌ 缺点：每次节点位置变化需要重建索引，大数据量时有开销

#### C. 数据流设计
```
User Data (Graphology)
    ↓
Sigma Internal (normalized nodes/edges)
    ↓
WebGL Buffers (Float32Array)
    ↓
GPU
```

**关键：** sigma 要求数据**预处理**完成，不支持动态样式函数

---

## 二、G6Lite 架构深度解析

### 2.1 核心架构图

```
G6Lite Core Architecture
├── src/
│   ├── graph.ts              # 主入口，协调各模块
│   ├── data-model.ts         # 数据模型 + 变更追踪
│   ├── scheduler.ts          # 渲染调度器 (RefreshLevel)
│   ├── events.ts             # 事件发射器
│   ├── renderer/
│   │   ├── renderer.ts       # 渲染协调器
│   │   ├── camera.ts         # 2D 相机 + 坐标转换
│   │   ├── picking.ts        # GPU Framebuffer Picking
│   │   ├── color.ts          # 颜色解析/缓存
│   │   ├── style.ts          # 样式解析引擎
│   │   └── programs/         # WebGL Program 集合
│   │       ├── nodeCircle.ts # 圆形节点 (GL_POINTS)
│   │       ├── nodeRect.ts   # 矩形节点 (2 triangles)
│   │       ├── edgeLine.ts   # 细边 (GL_LINES)
│   │       ├── edgeRect.ts   # 粗边 (2 triangles)
│   │       ├── edgeArrow.ts  # 箭头 ( TRIANGLES)
│   │       └── ...
│   ├── behaviors/            # 交互行为插件
│   │   ├── dragCanvas.ts
│   │   ├── zoomCanvas.ts
│   │   ├── dragNode.ts
│   │   └── highlightNode.ts
│   └── routing/              # 边路由算法
│       └── orthogonal.ts     # 正交/树形/鱼骨路由
```

### 2.2 关键设计决策

#### A. 分层渲染调度 (RefreshLevel)
```typescript
enum RefreshLevel {
  NONE = 0,           // 无变化
  DRAW_ONLY = 1,      // 仅重绘 (camera 变化)
  HIGHLIGHT_DELTA = 2,// 高亮变化 (patch color)
  PATCH_STYLE = 3,    // 样式变化 (patch attributes)
  PATCH_POSITION = 4, // 位置变化 (patch positions)
  PARTIAL_PROCESS = 5,// 增删元素 (rebuild buffers)
  FULL_PROCESS = 6,   // 全量重建
}
```

**优势：** 精细化控制渲染成本，不同操作走不同路径

#### B. GPU Framebuffer Picking
```typescript
// G6Lite 使用 GPU 拾取
class Renderer {
  pickAt(x, y) {
    // 1. Render to picking framebuffer (if needed)
    if (needPickingRender) {
      this.renderPickingPass()
    }
    // 2. Read pixel color → decode to ID
    const pixel = pickingBuffer.readPixel(x, y)
    return decodeId(pixel)
  }
}
```

**权衡：**
- ✅ 优点：精确拾取（支持任意形状），不需要维护空间索引
- ❌ 缺点：需要额外的 GPU pass，首次拾取有延迟

#### C. 动态样式系统
```typescript
// G6Lite 支持动态样式函数
const nodeConfig = {
  style: {
    fill: (node) => node.data.important ? 'red' : 'blue',
    size: (node) => Math.sqrt(node.data.value) * 10
  }
}
```

**代价：** 需要运行时解析，无法像 sigma 那样预计算

#### D. 数据变更追踪 (DataModel)
```typescript
class DataModel {
  private _changes: ChangeRecord[] = []

  addNode(node) {
    this._nodes.set(node.id, node)
    this._changes.push({ type: 'nodeAdded', ids: [node.id] })
  }

  getChanges() {
    const changes = this._changes
    this._changes = []
    return changes
  }
}
```

**优势：** 精确知道发生了什么变化，驱动 RefreshLevel 选择

---

## 三、WebGL 基础知识学习路径

### 3.1 学习路线图

```
Phase 1: WebGL 基础 (1-2 周)
├── 1. WebGL 上下文和初始化
├── 2. 着色器基础 (GLSL)
├── 3. Buffer 和 Attribute
├── 4. 绘制基本图元 (POINTS, LINES, TRIANGLES)
└── 5. 坐标系统和变换矩阵

Phase 2: 进阶渲染 (2-3 周)
├── 1. 纹理映射
├── 2. Framebuffer 和 Render-to-Texture
├── 3. Blending 和透明度
├── 4. 深度测试和 Stencil
└── 5. Instance Rendering (instanced arrays)

Phase 3: 性能优化 (2 周)
├── 1. Buffer 管理策略
├── 2. Draw call 合并 (batching)
├── 3. LOD (Level of Detail)
├── 4. Culling 技术 (frustum, occlusion)
└── 5. Shader 优化

Phase 4: 图可视化专用 (2 周)
├── 1. SDF (Signed Distance Fields) 渲染
├── 2. 抗锯齿技术 (MSAA, FXAA)
├── 3. 大数据量渲染策略
└── 4. 混合渲染 (WebGL + Canvas 2D)
```

### 3.2 核心知识点详解

#### A. WebGL 渲染管线

```
JavaScript          Vertex Shader          Fragment Shader         Framebuffer
    │                    │                       │                      │
    │  Buffer Data       │                       │                      │
    │ ─────────────────> │                       │                      │
    │                    │  gl_Position          │                      │
    │                    │  gl_PointSize         │                      │
    │                    │ ──────────────────>   │                      │
    │                    │                       │  gl_FragColor        │
    │                    │                       │ ──────────────────>  │
    │                    │                       │                      │
```

**关键概念：**
- **Vertex Shader**: 处理顶点位置，输出裁剪空间坐标
- **Fragment Shader**: 处理像素颜色
- **Rasterization**: 光栅化，将三角形变成像素

#### B. GLSL 着色器基础

```glsl
// Vertex Shader 模板
attribute vec2 a_position;      // 顶点位置 (来自 buffer)
attribute vec3 a_color;       // 顶点颜色

uniform vec2 u_resolution;    // 画布分辨率
uniform vec2 u_camera;        // 相机位置
uniform float u_scale;        // 缩放级别

varying vec3 v_color;         // 传递给 fragment shader

void main() {
  // 1. 应用相机变换
  vec2 graphPos = a_position + u_camera;
  vec2 clipSpace = (graphPos * u_scale / u_resolution) * 2.0 - 1.0;

  // 2. 设置输出位置
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  // 3. 传递颜色
  v_color = a_color;
}
```

```glsl
// Fragment Shader 模板
precision mediump float;
varying vec3 v_color;

void main() {
  gl_FragColor = vec4(v_color, 1.0);
}
```

#### C. Buffer 管理策略

```typescript
// 策略 1: 静态 Buffer (适合不常变化的数据)
class StaticBuffer {
  constructor(gl, data) {
    this.buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  }
}

// 策略 2: 动态 Buffer (适合频繁更新的数据)
class DynamicBuffer {
  update(newData) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    // 使用 DYNAMIC_DRAW 提示浏览器
    gl.bufferData(gl.ARRAY_BUFFER, newData, gl.DYNAMIC_DRAW)
  }
}

// 策略 3: 子区域更新 (部分数据变化)
class SubBuffer {
  updateRange(offset, subData) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.bufferSubData(gl.ARRAY_BUFFER, offset, subData)
  }
}
```

#### D. 图可视化专用技术

**1. GL_POINTS 渲染圆形节点**
```glsl
// Vertex Shader
attribute vec2 a_position;
attribute float a_size;
attribute vec3 a_color;

void main() {
  gl_Position = transform(a_position);
  gl_PointSize = a_size;
  v_color = a_color;
}

// Fragment Shader
void main() {
  // 将矩形点变成圆形
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);

  if (dist > 0.5) {
    discard;  // 丢弃圆形外的像素
  }

  gl_FragColor = vec4(v_color, 1.0);
}
```

**2. 粗边渲染 (mitre join)**
```glsl
// 边渲染的核心问题：如何在 shader 中计算垂直于边线的偏移
attribute vec2 a_source;
attribute vec2 a_target;
attribute float a_lineWidth;
attribute float a_posCoef;   // 0 = source, 1 = target
attribute float a_normalCoef; // -1 or 1 (哪一侧)

void main() {
  vec2 lineVector = a_target - a_source;
  vec2 normal = normalize(vec2(-lineVector.y, lineVector.x));

  vec2 pos = mix(a_source, a_target, a_posCoef);
  pos += normal * a_normalCoef * a_lineWidth / 2.0;

  gl_Position = transform(pos);
}
```

---

## 四、推荐学习资源

### 4.1 WebGL 基础

| 资源 | 类型 | 难度 | 说明 |
|------|------|------|------|
| [WebGL Fundamentals](https://webglfundamentals.org/) | 教程 | ⭐⭐ | 最系统的入门教程 |
| [WebGL2 Fundamentals](https://webgl2fundamentals.org/) | 教程 | ⭐⭐⭐ | WebGL2 版本 |
| [The Book of Shaders](https://thebookofshaders.com/) | 教程 | ⭐⭐⭐ | GLSL 着色器艺术 |
| [Pixi.js 源码](https://github.com/pixijs/pixijs) | 源码 | ⭐⭐⭐⭐ | 2D 渲染引擎参考 |
| [Three.js 源码](https://github.com/mrdoob/three.js) | 源码 | ⭐⭐⭐⭐⭐ | 3D 渲染引擎参考 |

### 4.2 图可视化专项

| 资源 | 类型 | 说明 |
|------|------|------|
| [sigma.js 源码](https://github.com/jacomyal/sigma.js) | 源码 | 轻量级 WebGL 图可视化 |
| [Ogma 文档](https://doc.linkurio.us/ogma/latest/) | 文档 | 商业级图可视化引擎 |
| [Graphology](https://graphology.github.io/) | 库 | 图数据结构标准 |
| [Force Atlas 2](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0098679) | 论文 | 力导向布局算法 |

### 4.3 性能优化

| 资源 | 类型 | 说明 |
|------|------|------|
| [WebGL Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices) | 文档 | MDN 官方最佳实践 |
| [Rendering Performance](https://developer.mozilla.org/en-US/docs/Web/Performance/Rendering) | 文档 | 渲染性能优化 |
| [GPU Gems](https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects) | 书籍 | GPU 编程经典 |

---

## 五、实践项目建议

### 5.1 入门级：实现简化版 sigma

**目标：** 渲染 1000 个节点和边，支持缩放/拖拽

**步骤：**
1. 创建 WebGL 上下文
2. 编写节点着色器（GL_POINTS）
3. 编写边着色器（GL_LINES）
4. 实现相机系统
5. 添加鼠标事件处理

### 5.2 进阶级：实现 G6Lite 核心功能

**目标：** 支持动态样式、GPU picking、增量更新

**步骤：**
1. 设计 DataModel + 变更追踪
2. 实现 RefreshLevel 调度
3. 添加 Framebuffer Picking
4. 支持多种边类型（直线、曲线、折线）
5. 实现增量 buffer 更新

### 5.3 专家级：性能对标 sigma

**目标：** 10000 节点达到 120fps 交互

**挑战：**
1. 实现视口裁剪（Viewport Culling）
2. 使用 Instanced Rendering
3. 实现 LOD（远距离简化节点）
4. 优化内存分配策略

---

## 六、常见问题 FAQ

**Q: 为什么 G6Lite 比 sigma 慢？**
A: G6Lite 功能更丰富（动态样式、GPU picking、增量更新），这些都是有代价的。sigma 通过限制功能换取性能。

**Q: 什么时候用 GL_POINTS，什么时候用 TRIANGLES？**
A: GL_POINTS 适合简单圆形节点（性能好），TRIANGLES 适合复杂形状（矩形、圆角、图标）。

**Q: 如何实现抗锯齿？**
A: 1) MSAA（多重采样）2) 在 shader 中用 SDF 计算平滑边缘 3) 渲染到 2x 纹理再缩小

**Q: 大数据量下如何优化内存？**
A: 1) 使用 Float32Array 池 2) 避免创建临时对象 3) 及时释放不用的 buffer 4) 考虑使用 IndexedDB 分页加载
