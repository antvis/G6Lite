# 基础视觉完善技术方案 — Issue #4

> 对应 Issue: https://github.com/antvis/G6Lite/issues/4
> 设计稿: `design/node.png`, `design/edge.png`, `design/basic.png`, `design/interaction.png`

## 目录

1. [设计原则](#设计原则)
2. [节点视觉升级](#节点视觉升级)
3. [边视觉补全](#边视觉补全)
4. [分组 Combo](#分组-combo)
5. [文件变更清单](#文件变更清单)
6. [性能策略](#性能策略)
7. [验证方式](#验证方式)

---

## 设计原则

1. **GPU 优先**：所有图形渲染走 WebGL，Canvas 2D overlay 仅用于文本
2. **批量渲染**：同类元素一次 draw call，避免逐元素切换 program
3. **属性扩展**：通过增加 vertex attribute 扩展能力，不新增 draw call
4. **状态系统统一**：节点/边/Combo 共用 6 态模型（default/active/selected/disabled/highlight/inactive）
5. **参考实现**：G6（数据模型 + 状态系统）+ sigma.js（WebGL 渲染技术），取长补短

---

## G6 vs sigma.js 参考对照

本方案从两个项目各取所需：

| 维度 | 参考 G6 | 参考 sigma.js | G6Lite 选择 |
|------|---------|--------------|-------------|
| **数据模型** | 状态系统 6 态、样式优先级链 theme→config→state | edgeReducer/nodeReducer 函数式 | **G6 模式**：声明式状态 + 主题预设，更易用 |
| **节点渲染** | Canvas 2D Path 绘制，逐元素渲染 | GL_POINTS + fragment shader SDF，批量渲染 | **sigma 模式**：shader SDF 实现 stroke/halo/圆角 |
| **边框/Stroke** | Canvas strokeRect/strokeCircle | fragment shader 同心圆/距离场判断 | **sigma 模式**：shader 内实现，零额外 draw call |
| **Halo 光晕** | 创建独立 halo Shape 子元素 | 扩大 gl_PointSize + shader 外圈渐变 | **sigma 模式**：shader 扩展，不增加几何体 |
| **Combo** | 完整 combo 子系统（折叠、嵌套、拖拽） | 不支持 combo | **G6 模式**：参考 G6 数据结构和 bounds 计算 |
| **平行边** | processParallelEdges 数据预处理 | indexParallelEdgesIndex 工具函数 | **G6 模式**：数据预处理阶段分配曲率 |
| **文本渲染** | Canvas Path + G 渲染引擎 | Canvas 2D overlay | **sigma 模式**：Canvas overlay，性能更好 |
| **性能优化** | — | 增量 color patch、picking 降采样、move 隐藏边 | **sigma 全套**：已在 G6Lite 中实现 |
| **圆角矩形** | Canvas roundRect | SDF（Signed Distance Field）shader | **sigma 模式**：SDF shader 实现 |

### 从 sigma 引入但 G6Lite 尚未利用的优化

| 技术 | 说明 | 应用场景 |
|------|------|---------|
| **NodeBorder compound program** | sigma v3 的 NodeBorderProgram 用 compound 模式：先画大圆（border色），再画小圆（fill色），两次 draw 叠加成边框效果 | 备选方案：如果 shader SDF 性能不佳可切换 |
| **Hover 专用 program** | sigma 在 hover 时为 hover 节点单独渲染一个 program（带阴影/边框），其他节点用普通 program | 减少所有节点 stride 膨胀，仅 hover 节点付出额外开销 |
| **WebGL2 instancing** | sigma v3 部分 program 支持 `ANGLE_instanced_arrays` 扩展，1 node = 1 instance（不重复 attribute） | 未来优化：节点数 > 50K 时考虑 instancing 减少内存 |
| **createNormalizationFunction** | sigma 将坐标归一化到 [-1,1]，避免 GPU 浮点精度问题 | 超大画布（>10K 图坐标范围）时防抖动 |

---

## 节点视觉升级

### 1. 节点状态系统

**现状**：节点无状态支持，仅有 highlight 二值化高亮。

**方案**：参考边状态系统，扩展 `GraphNode` 和 `NodeConfig`。

#### 类型扩展

```typescript
// types.ts
type NodeState = 'default' | 'active' | 'selected' | 'disabled' | 'highlight' | 'inactive';

interface GraphNode {
  id: string;
  name?: string;
  data?: NodeData;
  states?: NodeState[];  // 新增
}

interface NodeStateStyleOverride {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  size?: number;
}

interface NodeConfig {
  type?: 'circle' | 'rect';
  style?: {
    fill?: NodeStyleValue<string>;
    size?: NodeStyleValue<number>;
    width?: NodeStyleValue<number>;
    height?: NodeStyleValue<number>;
    stroke?: NodeStyleValue<string>;       // 新增
    strokeWidth?: NodeStyleValue<number>;  // 新增
    opacity?: NodeStyleValue<number>;      // 新增
  };
  stateStyles?: Partial<Record<NodeState, NodeStateStyleOverride>>;  // 新增
}
```

#### 主题预设

```typescript
// theme.ts
nodeStateStyles: {
  active:    { strokeWidth: 2, opacity: 1 },
  selected:  { strokeWidth: 3, opacity: 1, stroke: '#1783FF' },
  disabled:  { opacity: 0.25 },
  highlight: { strokeWidth: 2, opacity: 1 },
  inactive:  { opacity: 0.15 },
}
```

#### 样式解析

扩展 `resolveNodeStyle()` 支持状态覆盖，逻辑与 `resolveEdgeStyle()` 一致：`themeDefault → config.style → stateStyle`。

**文件**：`src/types.ts`, `src/theme.ts`, `src/renderer/style.ts`

### 2. 节点边框（Stroke）

**现状**：圆形和矩形节点仅支持 fill，无 stroke。

**方案**：在 fragment shader 中实现边框渲染，零额外 draw call。

#### 圆形节点

当前 `nodeCircle.frag.ts` 使用 `gl_PointCoord` 做圆形 discard。扩展为同心圆边框：

```glsl
// 新增 attribute
attribute float a_strokeWidth;
attribute vec3 a_strokeColor;
attribute float a_opacity;

// fragment shader
float dist = length(gl_PointCoord - vec2(0.5));
float outerRadius = 0.5;
float innerRadius = outerRadius - a_strokeWidth / a_size;
if (dist > outerRadius) discard;
vec3 finalColor = dist > innerRadius ? a_strokeColor : a_fillColor;
gl_FragColor = vec4(finalColor, a_opacity);
```

**Stride 变化**：9 → 14（+strokeWidth 1, +strokeColor 3, +opacity 1）

#### 矩形节点

类似方式，在 fragment shader 中判断像素是否在边框区域：

```glsl
// vertex shader 传递归一化坐标
varying vec2 v_uv;  // [-1, 1] 范围

// fragment shader
vec2 absUv = abs(v_uv);
float borderX = 1.0 - a_strokeWidth * 2.0 / a_width;
float borderY = 1.0 - a_strokeWidth * 2.0 / a_height;
bool isBorder = absUv.x > borderX || absUv.y > borderY;
vec3 finalColor = isBorder ? a_strokeColor : a_fillColor;
```

**Stride 变化**：12 → 17（+strokeWidth 1, +strokeColor 3, +opacity 1）

**文件**：`src/renderer/programs/nodeCircle.ts`, `src/renderer/programs/nodeRect.ts` 及对应 shader

### 3. 圆角矩形

**现状**：矩形节点为直角。

**方案**：在 fragment shader 中使用 SDF（Signed Distance Field）实现圆角：

```glsl
attribute float a_borderRadius;

// fragment shader
vec2 absUv = abs(v_uv) * vec2(a_width, a_height) * 0.5;
vec2 corner = max(absUv - vec2(a_width, a_height) * 0.5 + a_borderRadius, 0.0);
float dist = length(corner) - a_borderRadius;
if (dist > 0.0) discard;
// border 同理，用 dist + strokeWidth 判断
```

**NodeConfig 扩展**：`borderRadius?: NodeStyleValue<number>`

**Stride 变化**：+1（a_borderRadius），合并到边框方案中

**文件**：`src/renderer/programs/nodeRect.ts`, shader

### 4. 节点 Halo（光晕）

**现状**：无光晕效果。

**方案**：参考 G6 的 halo 实现 — Active/Selected 状态下，在节点外围渲染半透明光晕。

**WebGL 实现**：在 fragment shader 中扩展，当节点处于 active/selected 状态时，外围像素使用渐变透明度而不是 discard：

```glsl
// 圆形节点
float haloRadius = outerRadius + haloWidth / a_size;
if (dist < haloRadius && dist > outerRadius) {
  float alpha = 1.0 - (dist - outerRadius) / (haloWidth / a_size);
  gl_FragColor = vec4(a_fillColor, alpha * 0.15);
  return;
}
```

需要扩大 `gl_PointSize`（圆形）或矩形 quad 尺寸以容纳 halo 区域。

**Stride 变化**：+1（a_haloWidth，0 表示无 halo）

**文件**：nodeCircle/nodeRect shader

---

## 边视觉补全

### 5. 平行边（P2）

**现状**：同源同汇多边会完全重叠。

**方案**：参考 G6 `processParallelEdges`，在数据预处理阶段分配曲率偏移。

#### 预处理函数

```typescript
// src/transforms/processParallelEdges.ts
function processParallelEdges(edges: GraphEdge[], distance = 15): GraphEdge[] {
  // 1. 按 (min(source,target), max(source,target)) 分组
  // 2. 单条边：curvature = 0（直线）
  // 3. 多条边：奇数条 — 中间直线 + 两侧对称弯曲
  //            偶数条 — 两侧对称弯曲
  //    curvature = sign * ceil(i/2) * distance / edgeLength
  // 4. 为每条边设置 data._parallelCurvature
}
```

#### 渲染集成

- 当检测到平行边时，自动切换为 `arc` 类型
- `resolveEdgeStyle()` 中读取 `edge.data._parallelCurvature` 覆盖 curvature

**文件**：新建 `src/transforms/processParallelEdges.ts`，修改 `src/graph.ts`

### 6. 边文本（P3）

**现状**：无边文本渲染。

**方案**：Canvas 2D overlay（与现有节点标签方案一致）。

```typescript
// src/renderer/edgeLabelLayer.ts
class EdgeLabelLayer {
  render(edges, nodes, camera): void {
    // 1. 遍历可见边
    // 2. 计算边中点屏幕坐标
    // 3. 计算边方向角度，保证左→右可读（>90° 翻转 180°）
    // 4. ctx.fillText()，maxWidth = edgeScreenLength * 0.6
    // 5. 超出 ellipsis
  }
}
```

**文件**：新建 `src/renderer/edgeLabelLayer.ts`

### 7. 边标签/Badge（P4）

**现状**：无边标签。

**方案**：Canvas 2D overlay，位于边中点，支持圆形/圆角矩形背景 + 文字/图标。

**文件**：新建 `src/renderer/edgeBadgeLayer.ts`

### 8. Halo 光晕（边）

**现状**：边无光晕。

**方案**：Active/Selected 状态下，渲染一条更宽、低透明度的底层边作为 halo。

在 `process()` 中，为有 halo 的边额外渲染一条宽边（lineWidth + haloWidth），颜色同 stroke 但 opacity 0.15。需要在正常边之前渲染。

**实现**：新增 halo pass，复用 EdgeRect program：
1. 第一遍：渲染 halo 边（宽、低透明度）
2. 第二遍：渲染正常边

**文件**：修改 `src/renderer/renderer.ts`

---

## 分组 Combo

### 9. 基础渲染

**现状**：无 Combo 支持。

**方案**：新增 Combo 渲染层，在边之后、节点之前渲染。

#### 数据结构

```typescript
// types.ts
interface ComboData {
  id: string;
  label?: string;
  children?: string[];      // 子节点/子 Combo ID
  parentCombo?: string;     // 父 Combo ID（嵌套时）
  style?: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    padding?: number | [number, number, number, number];
    borderRadius?: number;
    opacity?: number;
  };
  collapsed?: boolean;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  combos?: ComboData[];     // 新增
}
```

#### 渲染方式

**矩形 Combo**：复用 NodeRect program 的 shader 逻辑（GL_TRIANGLES 矩形），但独立 program instance 用于 combo。

**Bounds 计算**（参考 G6）：

```typescript
function computeComboBounds(combo, nodes, combos): { x, y, width, height } {
  // 1. 收集所有子节点位置和尺寸
  // 2. 计算 AABB 包围框
  // 3. 应用 padding
  // 4. 返回 center + size
}
```

#### 渲染顺序

```
1. Clear
2. Combos (背景层，半透明)
3. Edges
4. Self-loop edges
5. Arrows
6. Nodes
7. Labels (Canvas overlay)
```

#### Combo 标签

使用 Canvas 2D overlay，与节点标签同层渲染。

**文件**：
- `src/types.ts` — ComboData 类型
- `src/renderer/programs/comboRect.ts` — 新建，复用 nodeRect shader
- `src/renderer/renderer.ts` — combo 渲染 pass
- `src/graph.ts` — combo 数据预处理、bounds 计算

### 10. 分组嵌套（P2）

**方案**：递归 bounds 计算。从叶子 combo 开始，逐层向上计算父 combo 的 bounds（包含子 combo 的 bounds + padding）。

渲染顺序按 combo 层级：最外层 combo 先渲染（最底），内层后渲染。

### 11. 分组折叠/展开（P3）

**方案**：
- 折叠时：隐藏子节点和内部边，combo 缩小为固定尺寸，显示折叠标记（子节点数量）
- 展开时：恢复子节点显示，重新计算 bounds
- 交互：双击 combo 切换折叠状态

---

## 文件变更清单

| 文件 | 操作 | 阶段 |
|------|------|------|
| `src/types.ts` | 修改：NodeState, NodeStateStyleOverride, ComboData, stateStyles | P1 |
| `src/theme.ts` | 修改：nodeStateStyles 预设 | P1 |
| `src/renderer/style.ts` | 修改：resolveNodeStyle 支持状态、stroke、opacity | P1 |
| `src/renderer/programs/nodeCircle.ts` | 修改：stride 扩展，stroke/halo 属性 | P1 |
| `src/renderer/programs/nodeRect.ts` | 修改：stride 扩展，stroke/borderRadius/halo | P1 |
| `src/renderer/programs/shaders/nodeCircle.vert.ts` | 修改：传递新属性 | P1 |
| `src/renderer/programs/shaders/nodeCircle.frag.ts` | 修改：stroke + halo 渲染 | P1 |
| `src/renderer/programs/shaders/nodeRect.vert.ts` | 修改：传递 UV + 新属性 | P1 |
| `src/renderer/programs/shaders/nodeRect.frag.ts` | 修改：stroke + borderRadius + halo | P1 |
| `src/renderer/renderer.ts` | 修改：节点状态处理、combo 渲染 pass、halo pass | P1 |
| `src/transforms/processParallelEdges.ts` | 新建：平行边预处理 | P2 |
| `src/graph.ts` | 修改：combo 数据处理、平行边调用 | P1-P2 |
| `src/renderer/programs/comboRect.ts` | 新建：combo 矩形渲染 | P1 |
| `src/renderer/edgeLabelLayer.ts` | 新建：边文本 Canvas overlay | P3 |
| `src/renderer/edgeBadgeLayer.ts` | 新建：边标签 Canvas overlay | P4 |

---

## 性能策略

### 大数据场景（5K+ 节点）保障

1. **批量渲染**：每类元素（节点/边/combo）一次 draw call，attribute 扩展不增加 draw call 数
2. **增量更新**：状态变更仅 patch 变化的 attribute floats（`patchItemColor` 模式），不重建整个 buffer
3. **视口裁剪**：combo bounds 计算只在 `process()` 时执行（数据变更触发），不在每帧重算
4. **Halo 优化**：仅对有 active/selected 状态的元素渲染 halo pass，无状态时跳过
5. **文本分层渲染**：Canvas 2D overlay 的边文本使用脏标记，仅在 camera 变化或数据变更时重绘
6. **LOD（未来）**：缩放层级低于阈值时隐藏边文本/标签/badge，减少 overlay 开销

### 参考基准

| 场景 | 目标帧率 | 参考 |
|------|---------|------|
| 5K 节点 + 15K 边 | 60fps | sigma.js 同规模 benchmark |
| 10K 节点 + 30K 边 | 30fps+ | 可交互 |
| 50K+ 节点 | 15fps+ | 概览模式，隐藏 overlay |

---

## 验证方式

1. 每阶段完成后新增对应 playground demo
2. `npx tsc --noEmit` 类型检查通过
3. 5K 节点 benchmark 对比变更前后帧率（不退化）
4. 截图对照设计稿验证视觉一致性
5. 变更记录至 `openspec/changes/`
