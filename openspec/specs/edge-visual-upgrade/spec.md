# 边视觉升级 — Edge Visual Upgrade

## Purpose

基于设计稿（2.1~2.6），对 G6Lite 的边渲染能力进行全面升级，覆盖状态系统、箭头、边类型、多边处理、边标签、边文本六大模块。

---

## 现状分析

### G6Lite 当前能力

| 能力 | 状态 | 说明 |
|------|------|------|
| 边类型 | 部分 | 仅支持 line / rect(粗线) / arc(曲线)，无虚线 |
| 边颜色 | 支持 | stroke 颜色，支持函数式映射 |
| 边粗细 | 支持 | lineWidth，支持函数式映射 |
| 箭头 | 不支持 | 无箭头几何生成 |
| 边状态 | 仅 highlight | 二值化高亮（active/inactive 透明度混合），无 6 态系统 |
| 边标签 | 不支持 | WebGL 层无文本，仅 playground 有 Canvas 叠加层 |
| 边文本 | 不支持 | 同上 |
| 虚线 | 不支持 | 无虚线渲染 |
| 多边/平行边 | 不支持 | 同源同汇多边会重叠 |
| 自环 | 不支持 | source===target 无特殊处理 |

### G6（Canvas 2D）参考

- **状态系统**：6 种状态（default/active/selected/disabled/highlight/inactive），样式优先级链 `theme → palette → data → default → themeState → state`
- **箭头**：独立 Path 对象挂载为 markerStart/markerEnd，6 种内置类型 + 自定义函数，尺寸随 lineWidth 自动缩放（`lineWidth < 4 → 10px, == 4 → 12px, > 4 → lineWidth * 2.5`）
- **多边处理**：`processParallelEdges` transform，奇偶交替左右偏移曲率，`distance` 参数控制间距
- **自环**：8 方位 placement，cubic 贝塞尔特殊控制点
- **标签**：Label 类（Text + Rect 背景），参数化位置 0~1 沿边路径，autoRotate
- **Badge**：独立组件，prefix/suffix 放置在标签附近

### Sigma.js（WebGL）参考

- **箭头**：compound program 模式（EdgeClampedProgram 截断边 + EdgeArrowHeadProgram 三角形箭头），GPU 端计算法线和缩放
- **曲线**：distance field shader（片元着色器计算像素到贝塞尔曲线的距离），精度高但 GPU 计算重
- **标签**：Canvas 2D overlay，非 WebGL 渲染
- **多边**：`indexParallelEdgesIndex()` 工具函数分配 parallelIndex，映射为曲率偏移
- **性能**：instanced rendering、picking 降采样、hidden 元素零填充

---

## 设计稿需求汇总

### 2.1 边状态样式

6 种状态 × 4 种变体：

| 状态 | 含义 | 线宽变化 | 颜色变化 | 箭头 | 其他 |
|------|------|---------|---------|------|------|
| Default | 默认 | 基准 | 基准色 | 基准 | — |
| Active | 激活 | 加粗 | 基准色 | 加粗 | 光晕/halo |
| Selected | 选中 | 加粗 | 加深 | 加粗 | 光晕 + 选中标记 |
| Disable | 不可用 | 基准 | 灰化 | 灰化 | 虚线化 |
| Highlight | 强化 | 加粗 | 基准色 | 加粗 | — |
| Inactive | 弱化 | 变细 | 降低透明度 | 弱化 | 整体淡化 |

### 2.2 边权重

6 级线宽映射：

| 等级 | 线宽 | 箭头尺寸 |
|------|------|---------|
| 默认 | 1px | 10px |
| 一级 | 2px | 10px |
| 二级 | 4px | 12px |
| 三级 | 6px | 15px |
| 四级 | 8px | 20px |
| 五级 | 10px | 25px |
| 六级 | 12px | 30px |

### 2.3 边颜色

- 默认色：`#99ADD1`
- 分类色板 10 色：`#1783FF` `#00C9C9` `#F08F56` `#D580FF` `#7863FF` `#DB9D0D` `#60C42D` `#FF80CA` `#2491B3` `#17C76F`

### 2.4 边类型

| 类型 | 说明 | 实现方式 |
|------|------|---------|
| 无向（直线） | 两点间无箭头 | EdgeLine / EdgeRect |
| 有向（箭头） | 目标端箭头 | 新增 Arrow program |
| 曲线 | 贝塞尔弧线，多边不重叠 | EdgeArc + 曲率偏移 |
| 虚线 | 间接关系 | 新增 dash 支持 |

**多边情况**：
- 自环（单点）：弧线环绕，4px 基准间距，多条边扇形散开
- 平行边（两点）：曲率递增偏移，奇数边/偶数边分布方式不同（参考 G6 processParallelEdges 的交替左右偏移算法）

### 2.5 边标签

- **形状**：圆形、圆角矩形，占边长 16%，居中对齐
- **种类**：
  - 数量标签：bg `#F4664A`，字号 8，白色文字
  - 锁定/告警/收藏：bg 分别为 `#7E92B5` / `#F4664A` / `#FFBE3A`，含 icon
  - 长文本：bg `#F4664A`，圆角矩形
  - 自定义图标：bg `#7E92B5`
- **多标签**：默认显示几个，多余折叠，hover 展开全部；长文本标签优先排前

### 2.6 边文本

- **位置**：居中对齐在边上，最大占边长 60%
- **溢出**：超出最大宽度 `...` 省略
- **方向**：始终左→右可读（边朝左时文本翻转）

---

## 技术方案

### 实施分期

按依赖关系和复杂度拆分为 4 期：

| 期 | 内容 | 依赖 |
|----|------|------|
| **P1: 基础边能力** | 状态系统 + 箭头 + 虚线 + 边权重 + 颜色体系 | 无 |
| **P2: 多边处理** | 平行边曲率偏移 + 自环渲染 | P1 |
| **P3: 边文本** | 边上文本渲染（Canvas overlay）+ 自动方向 | P1 |
| **P4: 边标签** | 标签系统（badge 组件）+ 多标签折叠 | P3 |

---

### P1: 基础边能力

#### 1.1 状态系统

**设计**：参考 G6 的状态优先级链，但简化为适合 WebGL 批量渲染的方式。

```typescript
// 新增状态类型
type EdgeState = 'default' | 'active' | 'selected' | 'disabled' | 'highlight' | 'inactive';

// 扩展 GraphEdge
interface GraphEdge {
  source: string;
  target: string;
  data?: Record<string, unknown>;
  states?: EdgeState[];  // 新增
}

// 每个状态的样式覆盖
interface EdgeStateStyle {
  stroke?: string;
  lineWidth?: number;
  opacity?: number;
  lineDash?: number[];   // 虚线
  halo?: boolean;
  haloColor?: string;
  haloWidth?: number;
}
```

**样式解析流程**：`themeDefault → edgeConfig.style → stateStyle` 逐层覆盖。

**渲染实现**：当前 `processHighlightDelta()` 只处理二值化高亮。改为通用状态处理：
- `resolveEdgeStyle()` 接收 `states` 参数，返回合并后的最终样式
- 状态变更时调用 `patchItemColor()` + `patchItemWidth()` 增量更新

**文件**：`src/renderer/style.ts`、`src/renderer/renderer.ts`、`src/types.ts`

#### 1.2 箭头渲染

**方案选择**：

| 方案 | 优点 | 缺点 |
|------|------|------|
| A: 独立 ArrowHead program（sigma 方式） | 解耦、可复用 | 多一次 draw call |
| B: 扩展 EdgeRect 顶点（边+箭头一体） | 单次 draw call | 顶点布局复杂 |
| C: compound program（sigma 方式） | 灵活组合 | 需要 compound 基础设施 |

**推荐方案 A**：独立 `EdgeArrowProgram`，参考 sigma 的 `edge-arrow-head`。

- 每个箭头 3 个顶点（三角形），stride = 顶点属性数
- 顶点属性：source.xy, target.xy, arrowSize, color.rgb, pickingColor.rgb
- Vertex shader 中计算边方向法线，沿目标端放置三角形
- 截断边（EdgeClamped）：EdgeRect 的目标端内缩 arrowLength，避免箭头和线重叠

**箭头尺寸映射**（对齐设计稿 2.2）：

```typescript
function getArrowSize(lineWidth: number): number {
  if (lineWidth <= 2) return 10;
  if (lineWidth <= 4) return 12;
  return Math.round(lineWidth * 2.5);
}
```

**文件**：新建 `src/renderer/programs/edgeArrow.ts`，修改 `src/renderer/renderer.ts`

#### 1.3 虚线边

**方案**：在 EdgeRect 的 fragment shader 中通过 `fract()` 实现 dash pattern。

```glsl
// fragment shader 新增
uniform float u_dashLength;   // dash 段长度
uniform float u_gapLength;    // gap 段长度
varying float v_edgeLength;   // 沿边方向的参数化位置

if (u_dashLength > 0.0) {
  float cycle = u_dashLength + u_gapLength;
  float pos = mod(v_edgeLength, cycle);
  if (pos > u_dashLength) discard;
}
```

**文件**：修改 `src/renderer/programs/edgeRect.ts` 的 shader

#### 1.4 边颜色体系

**Theme tokens 扩展**：

```typescript
interface ThemeTokens {
  // 现有
  edgeStroke: string;
  edgeLineWidth: number;
  // 新增
  edgeDefaultColor: string;        // #99ADD1
  edgeCategoryPalette: string[];   // 10 色分类色板
  edgeStateStyles: Record<EdgeState, Partial<EdgeStateStyle>>;
}
```

**文件**：`src/types.ts`、`src/themes/`

---

### P2: 多边处理

#### 2.1 平行边检测与曲率分配

**参考 G6 的 processParallelEdges**，在数据预处理阶段完成：

```typescript
function processParallelEdges(edges: GraphEdge[]): GraphEdge[] {
  // 1. 按 (source, target) 分组（无向：排序后分组）
  // 2. 单条边：curvature = 0（直线）
  // 3. 多条边：交替左右偏移
  //    - 奇数条：中间一条直线，两侧对称弯曲
  //    - 偶数条：两侧对称弯曲，无中间直线
  //    - 间距：baseDist = 4px（设计稿），curvature = sign * ceil(i/2) * baseDist
}
```

#### 2.2 自环渲染

**方案**：新增 `EdgeLoopProgram`，渲染为扇形弧线。

- 多条自环边按角度均匀散开
- 每条自环为一段圆弧（cubic bezier 近似），控制点基于节点尺寸计算
- 箭头放在弧线末端

**文件**：新建 `src/renderer/programs/edgeLoop.ts`，修改 `src/graph.ts` 预处理

---

### P3: 边文本

#### 3.1 Canvas 2D Overlay（推荐方案）

**理由**：
- WebGL 文本渲染需要 glyph atlas + MSDF，工程量大且中文字符集庞大
- sigma 和多数 WebGL 图库均使用 Canvas overlay
- G6Lite 已有 playground 中的 `attachLabelsCanvas` 先例

**实现**：

```typescript
class EdgeLabelLayer {
  private canvas: HTMLCanvasElement;  // 叠加在 WebGL canvas 上
  private ctx: CanvasRenderingContext2D;

  render(edges: GraphEdge[], nodes: LayoutNode[], camera: Camera): void {
    // 1. 遍历可见边
    // 2. 计算边中点的屏幕坐标
    // 3. 计算边方向角度
    // 4. 如果角度 > 90° 或 < -90°，翻转 180°（保证左→右可读）
    // 5. 绘制文本，maxWidth = edgeScreenLength * 0.6
    // 6. 超出部分 ellipsis
  }
}
```

**文件**：新建 `src/renderer/edgeLabelLayer.ts`

---

### P4: 边标签

#### 4.1 标签组件

在边文本基础上扩展，标签本质是「背景图形 + 内容（文字/图标）」的组合。

**标签数据结构**：

```typescript
interface EdgeBadge {
  type: 'count' | 'status' | 'text' | 'icon';
  text?: string;
  icon?: string;         // icon URL 或内置 icon name
  bgColor?: string;      // 背景色
  shape?: 'circle' | 'rounded-rect';
}

// EdgeConfig 扩展
interface EdgeConfig {
  // ...现有
  badges?: EdgeBadge[] | ((edge: GraphEdge) => EdgeBadge[]);
}
```

**渲染**：Canvas overlay 层，位于边中点偏移 16% 处（设计稿规格），居中对齐。

#### 4.2 多标签折叠

- 默认显示前 N 个标签（N 可配置，默认 1）
- 超出的标签折叠为 `+N` 指示器
- Hover 时展开全部（下拉列表形式）
- 长文本标签优先排序

**文件**：新建 `src/renderer/edgeBadgeLayer.ts`

---

## 文件变更清单

| 文件 | 操作 | 期 |
|------|------|---|
| `src/types.ts` | 修改：扩展 EdgeState、EdgeConfig、ThemeTokens | P1 |
| `src/renderer/style.ts` | 修改：状态样式解析 | P1 |
| `src/renderer/renderer.ts` | 修改：状态管理重构、箭头渲染集成 | P1 |
| `src/renderer/programs/edgeArrow.ts` | 新建：箭头 WebGL program | P1 |
| `src/renderer/programs/edgeRect.ts` | 修改：虚线 shader + 截断支持 | P1 |
| `src/themes/light.ts` | 修改：新增边状态默认样式 + 色板 | P1 |
| `src/themes/dark.ts` | 修改：同上 dark 版本 | P1 |
| `src/graph.ts` | 修改：平行边/自环预处理 | P2 |
| `src/renderer/programs/edgeLoop.ts` | 新建：自环 WebGL program | P2 |
| `src/renderer/edgeLabelLayer.ts` | 新建：边文本 Canvas overlay | P3 |
| `src/renderer/edgeBadgeLayer.ts` | 新建：边标签 Canvas overlay | P4 |

---

## G6 / Sigma 参考对照

| 能力 | G6 实现 | Sigma 实现 | G6Lite 推荐 |
|------|---------|-----------|-------------|
| 状态系统 | 6 态优先级链 | edgeReducer 函数 | **参考 G6**：6 态 + 主题预设 |
| 箭头 | Canvas Path marker | 独立 ArrowHead program | **参考 Sigma**：独立 WebGL program |
| 曲线 | Quadratic/Cubic bezier Path | Distance field shader | **保持现有** EdgeArc tessellation |
| 多边 | processParallelEdges transform | indexParallelEdgesIndex util | **参考 G6**：数据预处理阶段完成 |
| 自环 | 8 方位 cubic loop | 不支持 | **参考 G6**：cubic bezier 环 |
| 标签 | Label 类（Text + Rect bg） | Canvas 2D overlay | **Canvas overlay**（sigma 方式） |
| 文本 | 参数化路径位置 + autoRotate | Canvas 2D overlay | **Canvas overlay** + 左→右翻转 |
| 虚线 | Canvas lineDash | 不支持 | **Shader dash**（GPU 实现） |

---

## 验证方式

每期完成后：

1. 新增对应 playground demo（如 `demos/edge-states.ts`、`demos/edge-arrows.ts`）
2. 压测验证性能不退化（5K 节点 + 15K 边场景）
3. 视觉对照设计稿截图验证
4. 部署预览到 Surge 供设计评审
