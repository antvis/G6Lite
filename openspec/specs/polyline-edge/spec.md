# 折线边（Polyline Edge）+ 边标签徽章 技术方案

> 补充 edge-visual-upgrade spec，新增正交折线边类型和边标签徽章渲染能力

## 目录

1. [需求背景](#需求背景)
2. [Polyline 边类型](#polyline-边类型)
3. [正交路由算法](#正交路由算法)
4. [WebGL 渲染方案](#webgl-渲染方案)
5. [边标签徽章](#边标签徽章)
6. [文件变更清单](#文件变更清单)
7. [验证方式](#验证方式)

---

## 需求背景

### 现状

G6Lite 当前支持的边类型：
- `line` — 直线（GL_LINES 或 EdgeRectProgram GL_TRIANGLES）
- `arc` — 贝塞尔曲线（EdgeArcProgram，分段线近似）

### 目标

对标 G6 的流程图渲染效果：
- **折线边**：仅水平/垂直线段，转角处圆角平滑过渡
- **边标签徽章**：标签文字显示在圆角矩形背景中（如 "true"/"false"）

### G6 参考

```typescript
// G6 流程图典型配置
edge: {
  type: 'polyline',
  style: {
    radius: 20,
    router: { type: 'orth' },
    endArrow: true,
  },
}
```

G6 的 polyline 通过 `router` 配置路由算法，`radius` 控制转角圆角大小。

---

## Polyline 边类型

### 类型定义扩展

```typescript
// src/types.ts
interface EdgeConfig {
  type?: 'line' | 'arc' | 'polyline';  // 新增 polyline
  style?: {
    // 现有属性...
    radius?: EdgeStyleValue<number>;  // 新增：折线转角圆角半径，默认 0
  };
}
```

```typescript
// src/renderer/style.ts
interface ResolvedEdgeStyle {
  // 现有属性...
  radius: number;  // 新增
}
```

### 渲染管线

```
数据 → 正交路由(计算折点) → 圆角处理(弧线替换直角) → 段展平 → EdgePolylineProgram(WebGL) → 箭头(最后段方向)
```

---

## 正交路由算法

### 文件：`src/routing/orthogonal.ts`

#### 接口

```typescript
interface RouteOptions {
  direction: 'TB' | 'LR' | 'BT' | 'RL';
  offset?: number;  // 折线与节点的最小间距，默认 20
}

interface Waypoint { x: number; y: number }

function computeOrthogonalRoute(
  src: { x: number; y: number; width: number; height: number },
  tgt: { x: number; y: number; width: number; height: number },
  options: RouteOptions,
): Waypoint[];
```

#### TB 方向算法

对于自上而下的布局（dagre `rankdir: 'TB'`）：

```
源节点中心 (srcX, srcY)
  → 出发点：源节点底部中点 (srcX, srcY + srcH/2)
  → 垂直下行到中间 Y：(srcX, midY)  // midY = (srcBottom + tgtTop) / 2
  → 水平移动到目标 X：(tgtX, midY)
  → 垂直下行到目标节点顶部：(tgtX, tgtY - tgtH/2)
```

特殊情况：
- srcX === tgtX：直接垂直线，2 个折点
- 反向边（目标在源上方）：绕路处理，增加额外折点避开节点

#### LR 方向算法

类似，水平/垂直互换。

---

## WebGL 渲染方案

### 新建 `EdgePolylineProgram`

#### 设计决策

**方案选择：独立 Program（推荐）**

| 方案 | 优点 | 缺点 |
|------|------|------|
| A: 独立 EdgePolylineProgram | 架构清晰，buffer 管理独立 | 多一次 draw call |
| B: 扩展 EdgeRect 支持多段 | 单次 draw call | 混淆关注点，buffer 管理复杂 |

选择方案 A：独立 Program。多一次 draw call 开销可忽略。

#### 实现

- **Shader 复用**：直接复用 `edgeRect.vert.ts` 和 `edgeRect.frag.ts`
- **每段几何**：与 EdgeRect 相同，6 顶点（2 三角形），stride 17 floats
- **Buffer 分配**：变长方式
  1. 第一遍：计算所有 polyline 路由，统计总段数
  2. `reallocate(totalSegments)` 分配
  3. 第二遍：逐段写入 buffer

#### 顶点预算

| 参数 | 值 |
|------|-----|
| 典型折点数/边 | 4 |
| 直线段数 | 3 (折点数 - 1) |
| 圆角弧段数/转角 | 4 |
| 转角数 | 2 (折点数 - 2) |
| 顶点/段 | 6 |
| 总顶点/边 | (3 + 2×4) × 6 = 66 |
| 5K 边总顶点 | 330K |
| Buffer 大小 | 330K × 17 × 4B = 22MB |

在 WebGL 限制内，可行。

### 圆角处理

每个 90° 弯角替换为 quarter-circle 弧线（4 段近似）：

1. 取弯角前后方向向量
2. 将 radius clamp 到 `min(radius, halfPrevSegLen, halfNextSegLen)`
3. 计算弧线起终点（距弯角点 radius 距离）
4. 计算弧心
5. 均匀插值 4 段弧线点
6. 每段弧线作为粗线矩形渲染

### 箭头支持

- 箭头方向取 **最后一段** 的方向（最后两个折点）
- 最后一段 clampTarget 内缩 arrowSize
- 复用现有 `EdgeArrowProgram.processArrow()`

---

## 边标签徽章

### 增强 `attachEdgeLabelsCanvas()`

#### 当前实现

```typescript
// 简单白色矩形背景
ctx.fillStyle = 'rgba(255,255,255,0.85)';
ctx.fillRect(x - w/2 - pad, y - h/2 - pad, w + 2*pad, h + 2*pad);
```

#### 升级为圆角徽章

```typescript
// 圆角矩形背景
const r = opts.borderRadius ?? 8;
ctx.beginPath();
ctx.roundRect(x - w/2 - pad, y - h/2 - pad, w + 2*pad, h + 2*pad, r);
ctx.fillStyle = opts.bgColor ?? 'rgba(255,255,255,0.9)';
ctx.fill();
ctx.strokeStyle = opts.borderColor ?? '#e0e0e0';
ctx.lineWidth = 1 * dpr;
ctx.stroke();
```

#### 新增配置

```typescript
interface EdgeLabelCanvasOpts {
  // 现有...
  bgColor?: string | ((edge: GraphEdge, label: string) => string);
  textColor?: string | ((edge: GraphEdge, label: string) => string);
  borderRadius?: number;
  borderColor?: string;
  padding?: number;
}
```

#### Polyline 标签位置

对于 polyline 边，标签位置需要沿折线路径的几何中点：

```typescript
function getPolylineMidpoint(waypoints: Waypoint[]): { x: number; y: number } {
  // 1. 计算各段长度之和 totalLen
  // 2. 找到 totalLen/2 处所在的段
  // 3. 在该段上线性插值得到坐标
}
```

---

## 文件变更清单

| 文件 | 操作 | 阶段 |
|------|------|------|
| `src/types.ts` | 修改：EdgeConfig.type 加 `'polyline'`，style 加 `radius` | P1 |
| `src/renderer/style.ts` | 修改：ResolvedEdgeStyle 加 `radius` | P1 |
| `src/routing/orthogonal.ts` | 新建：正交路由算法 | P1 |
| `src/renderer/programs/edgePolyline.ts` | 新建：折线边 WebGL program | P1 |
| `src/renderer/renderer.ts` | 修改：polyline 分支集成 | P1 |
| `playground/tooling.ts` | 修改：边标签徽章样式升级 | P1 |
| `playground/demos/flowchart.ts` | 修改：改用 `type: 'polyline'` | P1 |

---

## 验证方式

1. `npx tsc --noEmit` 类型检查通过
2. flowchart demo 展示正交折线边 + 圆角 + 圆角徽章标签
3. 5K 节点 benchmark 性能不退化
4. 视觉对照 G6 设计稿
