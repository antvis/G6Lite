# 缩进树布局 (Indented Tree Layout) — 技术方案

## 1. 概述

为 G6Lite 新增**缩进树布局**（Indented Tree），支持类似文件目录、分类层级等场景的可视化。根节点在最左侧，子节点按层级向右缩进、纵向排列，父子之间用正交折线（L 型阶梯线）连接，每层可独立着色。

`@antv/layout` 不提供此布局，需自研布局算法。但边的渲染可完全复用已有的 **polyline 边 + 正交路由**（`EdgeRectProgram` + `computeTreeRoutes`），无需新增 WebGL 程序。

### 参考效果

```
my-project ─┬── src ─┬── components
             │        ├── pages
             │        └── utils
             ├── public
             └── package.json
```

典型场景：项目目录结构、分类体系、组织层级、配置树。

---

## 2. 核心设计

### 2.1 布局算法 — IndentedLayout

**文件**: `src/layout/indentedLayout.ts`

算法核心：DFS 遍历树，按遍历顺序分配 y 坐标，按深度分配 x 坐标。

```typescript
interface IndentedLayoutOptions {
  /** 每层水平缩进量（px），默认 80 */
  indent?: number;
  /** 行高 / 节点纵向间距（px），默认 40 */
  rowHeight?: number;
  /** 布局方向，默认 'LR'（从左到右缩进） */
  direction?: 'LR' | 'RL';
  /** 根节点 ID，不指定时自动推断（取第一个无入边的节点） */
  rootId?: string;
}
```

**算法伪代码**：

```
function execute(data):
  1. 从 edges 构建 adjacency map: parentId → childIds[]
  2. 找到根节点（无入边节点，或 rootId 指定）
  3. rowIndex = 0
  4. DFS(root, depth=0):
     - node.x = depth * indent
     - node.y = rowIndex * rowHeight
     - rowIndex++
     - for each child of node (按原始数据顺序):
         DFS(child, depth+1)
```

**复杂度**: O(n)，纯几何计算，无迭代。

**注册**: 加入 `src/layout/runLayout.ts` 的 `LAYOUT_MAP`，key 为 `'indented'`。

由于 IndentedLayout 是自研布局（不依赖 `@antv/layout`），其接口需要与 `runLayout.ts` 中已有的 `LayoutInstance` 接口保持一致：

```typescript
export class IndentedLayout {
  private opts: IndentedLayoutOptions;
  private nodes: Array<{ id: string; x: number; y: number }> = [];

  constructor(opts?: Record<string, unknown>) {
    this.opts = {
      indent: 80,
      rowHeight: 40,
      direction: 'LR',
      ...opts,
    };
  }

  async execute(data: GraphData): Promise<void> {
    // 构建邻接表，DFS 赋坐标
  }

  forEachNode(fn: (n: { id: string; x: number; y: number }) => void): void {
    this.nodes.forEach(fn);
  }
}
```

### 2.2 边渲染 — 复用 Polyline + Tree 路由

**无需新增 WebGL 程序**。完全复用已有能力：

- **边类型**: `edge.type = 'polyline'`
- **路由模式**: `edge.style.router = 'tree'`（使用 `computeTreeRoutes` 的 LR 模式）
- **圆角**: `edge.style.radius = 6`（通过 `applyRoundedCorners` 实现平滑拐角）

`computeTreeRoutes` 在 LR 方向下的路由逻辑（`src/routing/orthogonal.ts:264-301`）：

```
对于同一父节点的所有子边:
  srcRight = parent.x + width/2
  forkX = srcRight + 30% gap     // 分叉点 X
  
  每条边路径:
    (srcRight, parentY) → (forkX, parentY) → (forkX, childY) → (childLeft, childY)
```

这正好生成了缩进树需要的 L 型/阶梯型正交折线。

### 2.3 层级着色

通过 `edge.style.stroke` 函数按源节点深度着色：

```typescript
edge: {
  style: {
    stroke: (src, _tgt, _edge) => {
      const depth = src.data?.depth as number ?? 0;
      const palette = ['#1783FF', '#F08F56', '#00C9C9', '#D580FF', '#7863FF'];
      return palette[depth % palette.length];
    },
  },
}
```

布局算法在计算坐标时，将 `depth` 写入 `node.data.depth`，供着色函数使用。

---

## 3. 需要修改的文件

| 文件 | 变更 | 说明 |
|------|------|------|
| `src/layout/indentedLayout.ts` | **新建** | 缩进树布局算法 |
| `src/layout/runLayout.ts` | 修改 | 注册 `'indented'` 到 LAYOUT_MAP |
| `playground/demos/indented-tree.ts` | **新建** | Demo：项目目录结构 |
| `playground/demos/index.ts` | 修改 | 注册 demo |

### 不需要改动的文件

- `src/renderer/` — 无需新增渲染程序，复用 `EdgeRectProgram`（polyline）
- `src/routing/orthogonal.ts` — 已有的 `computeTreeRoutes` LR 模式完全满足需求
- `src/types.ts` — `LayoutConfig` 已支持任意 key，无需改动

---

## 4. 详细实现步骤

### Step 1: 布局算法 (`src/layout/indentedLayout.ts`)

```typescript
import type { GraphData } from '../types.js';

export class IndentedLayout {
  private opts: { indent: number; rowHeight: number; direction: 'LR' | 'RL'; rootId?: string };
  private nodes: Array<{ id: string; x: number; y: number }> = [];

  constructor(opts?: Record<string, unknown>) {
    this.opts = {
      indent: (opts?.indent as number) ?? 80,
      rowHeight: (opts?.rowHeight as number) ?? 40,
      direction: (opts?.direction as 'LR' | 'RL') ?? 'LR',
      rootId: opts?.rootId as string | undefined,
    };
  }

  async execute(data: GraphData): Promise<void> {
    const { indent, rowHeight, direction, rootId } = this.opts;
    const { nodes, edges } = data;

    // 1. 构建邻接表
    const children = new Map<string, string[]>();
    const hasParent = new Set<string>();
    for (const e of edges) {
      if (!children.has(e.source)) children.set(e.source, []);
      children.get(e.source)!.push(e.target);
      hasParent.add(e.target);
    }

    // 2. 找根节点
    const root = rootId ?? nodes.find(n => !hasParent.has(n.id))?.id ?? nodes[0]?.id;
    if (!root) return;

    // 3. DFS 赋坐标
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    let rowIndex = 0;
    this.nodes = [];

    const dfs = (id: string, depth: number) => {
      const node = nodeMap.get(id);
      if (!node) return;

      const x = direction === 'LR' ? depth * indent : -(depth * indent);
      const y = rowIndex * rowHeight;
      rowIndex++;

      // 将 depth 写入 node.data 供着色函数使用
      if (!node.data) node.data = {};
      (node.data as Record<string, unknown>).depth = depth;

      // 同步写回原始节点坐标
      node.x = x;
      node.y = y;

      this.nodes.push({ id, x, y });

      const kids = children.get(id) ?? [];
      for (const kid of kids) {
        dfs(kid, depth + 1);
      }
    };

    dfs(root, 0);
  }

  forEachNode(fn: (n: { id: string; x: number; y: number }) => void): void {
    this.nodes.forEach(fn);
  }
}
```

### Step 2: 注册布局 (`src/layout/runLayout.ts`)

```diff
+ import { IndentedLayout } from './indentedLayout.js';

  const LAYOUT_MAP = {
    // ...existing layouts...
+   indented: IndentedLayout,
  } as Record<string, new (opts?: Record<string, unknown>) => LayoutInstance>;
```

### Step 3: Demo (`playground/demos/indented-tree.ts`)

用项目目录结构数据（与参考图一致）：

```typescript
import { Graph } from '../../src/index.ts';
import { attachLabelsCanvas, type GraphInstanceWithTools } from '../tooling.ts';

const DEPTH_COLORS = ['#1783FF', '#F08F56', '#00C9C9', '#D580FF', '#7863FF'];

const data = {
  nodes: [
    { id: 'root',   name: 'my-project' },
    { id: 'src',    name: 'src' },
    { id: 'comp',   name: 'components' },
    { id: 'pages',  name: 'pages' },
    { id: 'utils',  name: 'utils' },
    { id: 'public', name: 'public' },
    { id: 'pkg',    name: 'package.json' },
    { id: 'app',    name: 'App.tsx' },
    { id: 'index',  name: 'index.tsx' },
    { id: 'home',   name: 'Home.tsx' },
    { id: 'about',  name: 'About.tsx' },
    { id: 'req',    name: 'request.ts' },
    { id: 'fmt',    name: 'format.ts' },
    { id: 'assets', name: 'assets' },
    { id: 'logo',   name: 'logo.svg' },
    { id: 'readme', name: 'README.md' },
    { id: 'tsconf', name: 'tsconfig.json' },
  ],
  edges: [
    { source: 'root', target: 'src' },
    { source: 'root', target: 'public' },
    { source: 'root', target: 'pkg' },
    { source: 'root', target: 'readme' },
    { source: 'root', target: 'tsconf' },
    { source: 'src',  target: 'comp' },
    { source: 'src',  target: 'pages' },
    { source: 'src',  target: 'utils' },
    { source: 'src',  target: 'app' },
    { source: 'src',  target: 'index' },
    { source: 'comp', target: 'home' },
    { source: 'comp', target: 'about' },  // 补充：去掉此行也可
    { source: 'utils', target: 'req' },
    { source: 'utils', target: 'fmt' },
    { source: 'public', target: 'assets' },
    { source: 'assets', target: 'logo' },
  ],
};

const NODE_W = 120;
const NODE_H = 28;

export async function run(container: string | HTMLElement) {
  const wrapper = typeof container === 'string'
    ? document.querySelector(container)! as HTMLElement : container;
  wrapper.style.position = 'relative';

  const graph = new Graph({
    container: wrapper,
    data,
    node: {
      type: 'rect',
      style: {
        fill: (n) => {
          const depth = (n.data?.depth as number) ?? 0;
          return depth === 0 ? '#4A90D9' : DEPTH_COLORS[depth % DEPTH_COLORS.length];
        },
        width: NODE_W,
        height: NODE_H,
        borderRadius: 4,
        opacity: 0.9,
      },
    },
    edge: {
      type: 'polyline',
      style: {
        stroke: (src) => {
          const depth = (src.data?.depth as number) ?? 0;
          return DEPTH_COLORS[depth % DEPTH_COLORS.length];
        },
        lineWidth: 2,
        router: 'tree',
        radius: 6,
        endArrow: false,
        startArrow: false,
      },
    },
    layout: {
      type: 'indented',
      indent: 100,
      rowHeight: 44,
      direction: 'LR',
    },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    theme: 'light',
  });

  await graph.render();

  const g = graph as unknown as GraphInstanceWithTools;
  attachLabelsCanvas(wrapper, g, {
    nodeLabel: (n) => n.name ?? n.id,
    position: 'inside',
    nodeSize: () => ({ width: NODE_W, height: NODE_H }),
    fontSize: 12,
    color: '#fff',
  });

  return { destroy: () => graph.destroy() };
}
```

### Step 4: 注册 Demo (`playground/demos/index.ts`)

在 demos 数组中添加缩进树 demo。

---

## 5. 关键决策与考量

### 为什么复用 polyline 而非新建 WebGL 程序？

| 对比项 | 新建 edgeOrthogonal | 复用 polyline + tree路由 |
|--------|---------------------|------------------------|
| 工作量 | 2-3 天（shader + program + 集成） | 0 天（已有） |
| 渲染质量 | 相同（均为矩形三角化） | 相同 |
| 圆角支持 | 需重新实现 | 已有 `applyRoundedCorners` |
| 性能 | 略优（2段/边 vs 4-5段/边） | 可接受（17 节点 ≈ 100 段，万级节点也无压力） |

结论：polyline 方案零新增渲染代码，且 `computeTreeRoutes` 的 LR 路由已经生成了缩进树需要的 L 型折线路径。

### 节点尺寸与路由配合

`computeTreeRoutes` 需要知道每个节点的 `width` 和 `height` 以计算出口/入口点。当前 renderer 在 `process()` 中会根据 `NodeConfig.style.width/height` 构建 `NodeRect`，polyline 路由已经在消费这些信息。因此缩进树只需配置合理的节点尺寸即可。

### 方向支持

初版支持 `'LR'`（左到右，主用）和 `'RL'`（右到左），对应 `computeTreeRoutes` 已支持的两个水平方向。后续如有需要可扩展 `'TB'`（上到下，纵向缩进树）。

---

## 6. 验证标准

1. **布局正确性**：根节点在 (0,0)，子节点按 DFS 序纵向排列，每层水平缩进一致
2. **边连接正确**：正交折线从父节点右侧出发，经 L 型折弯连接到子节点左侧
3. **圆角平滑**：折弯处有圆角过渡（radius=6）
4. **层级着色**：不同深度的边颜色不同，视觉区分清晰
5. **交互正常**：缩放、拖拽画布流畅
6. **多根/空数据**：多棵树时取第一个无入边节点为根，空数据不崩溃

---

## 7. 工作量估算

| 任务 | 估算 |
|------|------|
| 布局算法 (`indentedLayout.ts`) | 0.5 天 |
| 注册到 `runLayout.ts` | 0.5h |
| Demo (`indented-tree.ts`) + 注册 | 0.5 天 |
| 联调 + 测试 | 0.5 天 |
| **合计** | **~1.5 天** |

相比旧方案的 4-5 天大幅缩减，核心原因是复用已有的 polyline 渲染和 tree 路由能力。
