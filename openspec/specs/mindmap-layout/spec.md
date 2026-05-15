# 思维导图布局 (Mind Map Layout)

## Purpose

为 G6Lite 新增思维导图布局能力，支持中心节点向左右两侧展开子树的可视化场景。`@antv/layout` 不提供此布局，需自研。

---

## 参考效果

中心主题节点居中，一级子主题分配到左右两侧，每侧子树以水平方向逐级展开。父子之间用 S 型贝塞尔曲线连接。每个分支子树可独立染色（左右不同颜色体系）。

典型场景：知识结构梳理、头脑风暴、项目分解。

---

## 核心需求

### R-MIND-01: 思维导图布局算法

布局算法 SHALL 接受树形数据，计算每个节点的 `(x, y)` 坐标：

- 根节点放置在画布中心 (0, 0)
- 一级子节点平均分配到左半区和右半区
- 每侧子树独立计算 y 坐标，避免子树间重叠
- 每层 x 偏移 = `levelGap`（默认 120px）
- 同层节点间 y 间距 = `nodeGap`（默认 30px）

**配置项**:
- `levelGap`：层间水平距离
- `nodeGap`：同层节点垂直间距
- `direction`：`'H'`（水平展开，默认）或 `'V'`（垂直展开）

**算法思路**:
1. 将一级子节点按顺序交替分配到左/右两侧
2. 对每侧递归计算子树高度（所有叶节点高度之和 + 间距）
3. 从叶到根自底向上分配 y 坐标（子树中心对齐父节点）
4. x 坐标按层级递增（右侧正向，左侧负向）

**复杂度**: O(n)

**实现位置**: `src/layout/mindmapLayout.ts`，注册到 `runLayout.ts`。

### R-MIND-02: S 型贝塞尔曲线连接器

父子节点之间 SHALL 用水平方向的三次贝塞尔曲线连接：

- 控制点 1：从父节点水平延伸 `levelGap / 2`
- 控制点 2：从子节点水平反向延伸 `levelGap / 2`
- 形成平滑的 S 型曲线

**实现方案**:
- **优先尝试复用** 现有 `edgeArc` program（调整 curvature 和方向参数）
- 若 edgeArc 的二次贝塞尔不够平滑，新增 `edgeCubicH` program（水平三次贝塞尔）

### R-MIND-03: 分支着色

- 支持按一级子树为所有后代边染色
- 配置项 `branchPalette?: string[]` — 颜色按一级子节点索引分配
- 或通过 `edge.style.stroke` function 由用户在 demo 中控制

---

## 技术方案

### 1. 文件结构

```
src/
  layout/
    mindmapLayout.ts    # 布局算法实现
    runLayout.ts        # 注册 mindmap 布局
src/renderer/programs/
    edgeCubic.ts        # 三次贝塞尔曲线边（新增）
    index.ts            # 导出 edgeCubic
src/types.ts            # 扩展 LayoutConfig 类型
playground/demos/
    mindmap.ts          # Demo 示例
```

### 2. 布局算法设计 (mindmapLayout.ts)

```typescript
import type { LayoutInstance } from './runLayout.js';

export interface MindmapLayoutOptions {
  direction?: 'H' | 'LR' | 'RL';  // H=双向, LR=仅右, RL=仅左
  levelGap?: number;               // 层间水平距离，默认 120
  nodeGap?: number;                // 同层节点垂直间距，默认 30
  branchColors?: string[];         // 分支颜色 palette
  getSide?: (node: GraphNode, index: number) => 'left' | 'right';
}

export class MindmapLayout implements LayoutInstance {
  constructor(options?: MindmapLayoutOptions);
  execute(data: GraphData): Promise<void>;
  forEachNode(fn: (node: { id: string; x: number; y: number }) => void): void;
}
```

**算法流程**:
1. **构建树结构**: 从 GraphData 推断根节点（无入边者），构建父子关系映射
2. **分配左右**: 一级子节点按 `getSide` 或交替分配到 left/right
3. **计算子树高度**: 递归计算每侧子树的叶节点数量 × nodeGap
4. **分配坐标**:
   - x = level × levelGap（右侧 +，左侧 -）
   - y = 父节点 y + 当前子树累积偏移 - 子树高度/2

### 3. 边的渲染 (edgeCubic.ts)

复用现有 `EdgeArcProgram` 架构，新增三次贝塞尔支持：

```typescript
export class EdgeCubicProgram extends Program {
  processEdge(
    index: number,
    sx: number, sy: number,    // 起点（父节点右侧/左侧）
    tx: number, ty: number,    // 终点（子节点左侧/右侧）
    color: [number, number, number],
    pickingIndex: number,
    curveOffset: number,       // 控制点偏移量
    direction: 'LR' | 'RL',    // 方向
  ): void;
}
```

**三次贝塞尔公式**:
```
B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
P0 = 起点 (sx, sy)
P1 = (sx + curveOffset, sy)       // 第一个控制点
P2 = (tx - curveOffset, ty)       // 第二个控制点
P3 = 终点 (tx, ty)
```

### 4. 类型扩展 (types.ts)

```typescript
export interface MindmapLayoutConfig extends LayoutConfig {
  type: 'mindmap';
  direction?: 'H' | 'LR' | 'RL';
  levelGap?: number;
  nodeGap?: number;
  branchColors?: string[];
  getSide?: (node: GraphNode, index: number) => 'left' | 'right';
}
```

### 5. 布局注册 (runLayout.ts)

```typescript
import { MindmapLayout } from './mindmapLayout.js';

const LAYOUT_MAP = {
  // ... existing
  mindmap: MindmapLayout,
};
```

### 6. Demo 设计 (mindmap.ts)

- 数据：台风形成因素（~12 节点）或项目计划（~10 节点）
- 交互：
  - 按钮切换 direction: H / LR
  - 按钮切换主题: light / dark
- 验证点：
  - 根节点居中
  - 左右子树正确分布
  - S 型曲线平滑
  - 分支颜色正确

---

## 数据结构

输入为标准 `GraphData`（树形），布局内部推断根节点（无入边者）。

---

## 工作量估算

| 任务 | 估算 |
|------|------|
| 布局算法 (`mindmapLayout.ts`) | 1.5 天 |
| 三次贝塞尔边 (`edgeCubic.ts`) | 0.5 天 |
| 注册到 `runLayout.ts` + 类型扩展 | 0.5 天 |
| Demo (`playground/demos/mindmap.ts`) | 0.5 天 |
| 测试 + 调试 | 0.5 天 |
| **合计** | **3-3.5 天** |

---

## 依赖

- 无外部依赖
- 复用现有 Program 基类架构

---

## 验证方式

1. 用「台风形成因素」数据（~12 节点）验证左右子树分布正确
2. S 型曲线连接平滑
3. 分支颜色按一级子树分组
4. 暗色主题下显示正确
5. 缩放/拖拽交互流畅
