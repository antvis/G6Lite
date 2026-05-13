# G6Lite 能力差距分析 — 对比 GeaMaker-V2 业务使用

> 基于 GeaMaker-V2 项目中 G6 关系图的使用情况，对比 G6Lite 当前能力，梳理不支持的功能项
> 更新时间：2026-05-11

---

## 一、总览

| 分类 | 业务需要 | G6Lite 已支持 | 不支持 |
|------|---------|-------------|--------|
| 节点交互 | 9 项 | 4 项 | 5 项 |
| 边交互 | 5 项 | 2 项 | 3 项 |
| 画布交互 | 6 项 | 4 项 | 2 项 |
| Combo 交互 | 2 项 | 0 项 | 2 项 |
| Behaviors | 10 种 | 6 种 | 4 种 |
| 布局 | 5 种 | 15 种 | 0 种（全部覆盖） |
| 状态管理 | 4 种 | 6 种 | 0 种（全部覆盖） |
| 图形事件 | 7 种 | 2 种 | 5 种 |

**G6Lite 已覆盖业务核心场景（点击、拖拽、缩放、高亮），但在右键菜单、双击、框选/圈选、Combo、生命周期事件方面存在缺口。**

---

## 二、节点交互 — 不支持项

| 能力 | 业务事件名 | 业务使用场景 | G6Lite 状态 | 优先级建议 |
|------|-----------|-------------|------------|-----------|
| 节点双击 | `node:dblclick` | 双击打开节点编辑 | **不支持** | P1 — 编辑场景刚需 |
| 节点右键菜单 | `node:contextmenu` | 右键显示操作菜单 | **不支持** | P0 — 图分析模块核心交互 |
| 节点 Hover 离开 | `node:mouseleave` / `NodeEvent.POINTER_LEAVE` | 取消高亮、隐藏提示 | **不支持**（只有 `node:hover` 进入） | P1 — 交互完整性 |
| 节点拖拽开始 | `node:dragstart` | 拖拽前记录位置 | **已支持** | - |
| 节点添加完成 | `afteradditem` | 节点添加后刷新列表 | **不支持** | P2 — 增量操作场景 |
| 节点删除完成 | `afterremoveitem` | 节点删除后刷新列表 | **不支持** | P2 — 增量操作场景 |
| 节点更新完成 | `afterupdateitem` | 节点更新后刷新列表 | **不支持** | P2 — 增量操作场景 |

**已支持的节点交互**：`node:click`、`node:hover`、`node:dragstart`、`node:drag`、`node:dragend`

---

## 三、边交互 — 不支持项

| 能力 | 业务事件名 | 业务使用场景 | G6Lite 状态 | 优先级建议 |
|------|-----------|-------------|------------|-----------|
| 边双击 | `edge:dblclick` | 双击边编辑 | **不支持** | P2 |
| 边 Hover 进入 | `edge:mouseenter` | 边悬停高亮 | **已支持**（`edge:hover`） | - |
| 边 Hover 离开 | `edge:mouseleave` | 取消边高亮 | **不支持**（只有 `edge:hover` 进入） | P1 — 交互完整性 |
| 边右键菜单 | `edge:contextmenu` | 右键显示操作菜单 | **不支持** | P0 — 图分析模块核心交互 |
| 边拖拽 | `edge:drag` | 拖拽边调整 | **不支持** | P3 — 低频场景 |
| 边添加完成 | `afteradditem` | 边添加后刷新 | **不支持** | P2 |

**已支持的边交互**：`edge:click`、`edge:hover`

---

## 四、画布交互 — 不支持项

| 能力 | 业务事件名 | 业务使用场景 | G6Lite 状态 | 优先级建议 |
|------|-----------|-------------|------------|-----------|
| 画布双击 | `canvas:dblclick` | 双击空白处放大 | **不支持** | P2 |
| 画布 Hover | `canvas:mouseenter` | 画布悬停 | **不支持** | P3 — 低频 |
| 渲染完成 | `afterrender` | 渲染完成后执行操作 | **不支持** | P1 — 多处业务依赖 |
| 布局完成 | `afterlayout` | 布局后执行操作 | **已支持**（`layout:end`） | - |

**已支持的画布交互**：`canvas:click`、`drag-canvas`（behavior）、`zoom-canvas`（behavior）、`layout:end`

---

## 五、Combo 交互 — 全部不支持

| 能力 | 业务事件名 | 业务使用场景 | G6Lite 状态 | 优先级建议 |
|------|-----------|-------------|------------|-----------|
| Combo 点击 | `combo:click` | 点击组合 | **不支持** | P2 — 仅 graph-dash 模块使用 |
| Combo 拖拽 | `combo:dragend` | 拖拽组合后更新 | **不支持** | P2 |
| Combo 右键 | `combo:contextmenu` | 右键菜单 | **不支持** | P2 |
| Combo 渲染 | combo 数据结构 | 组合力导向布局 | **不支持**（无 Combo 数据模型） | P2 |

> Combo 是 G6 v5 的核心特性，G6Lite 当前无 Combo 数据模型、无 Combo 渲染、无 Combo 事件。实现成本较高，建议作为独立迭代。

---

## 六、Behaviors — 不支持项

| Behavior | 功能描述 | 业务使用场景 | G6Lite 状态 | 优先级建议 |
|----------|---------|-------------|------------|-----------|
| `click-select` | 点击选中节点/边 | 单击选中 | **不支持**（有 `click-node` 但不设置 selected 状态） | P1 — 选中是基础交互 |
| `brush-select` | 框选多个节点 | 批量选中 | **不支持** | P2 |
| `lasso-select` | 套索圈选（Shift+拖拽） | Shift+鼠标圈选 | **不支持** | P2 — graph-analysis 使用 |
| `hover-activate` / `activate-relations` | Hover 高亮相邻节点 | 悬停时高亮关联 | **已支持**（`highlight-node` + `highlight-edge`，合并为 `hoverHighlight`） | - |
| `auto-adapt-label` | 标签自动适应缩放 | 标签显示优化 | **不支持** | P3 — G6Lite 标签能力尚在规划 |
| `optimize-viewport-transform` | 视口变换优化 | 性能优化 | **已支持**（内置 viewport culling + hideEdgesOnMove） | - |

**已支持的 Behaviors**：`zoom-canvas`、`drag-canvas`、`highlight-node`、`highlight-edge`、`click-node`、`drag-node`

---

## 七、图形生命周期事件 — 不支持项

| 事件 | 功能描述 | 业务使用场景 | G6Lite 状态 | 优先级建议 |
|------|---------|-------------|------------|-----------|
| `afterrender` | 渲染完成 | 多处业务依赖渲染后操作 | **不支持** | P1 — 高频需求 |
| `afteradditem` | 添加元素后回调 | 增量添加后刷新列表 | **不支持** | P2 |
| `afterremoveitem` | 删除元素后回调 | 增量删除后刷新列表 | **不支持** | P2 |
| `afterupdateitem` | 更新元素后回调 | 增量更新后刷新列表 | **不支持** | P2 |
| `beforelayout` | 布局前回调 | 布局前设置参数 | **已支持**（`layout:start`） | - |
| `afterlayout` | 布局后回调 | 布局后执行操作 | **已支持**（`layout:end`） | - |
| `afteranimate` | 动画完成 | 动画结束后操作 | **不支持**（G6Lite 暂无动画） | P3 |

---

## 八、G6Lite 已覆盖的能力（无需补充）

### 布局（完全覆盖，且有扩展）

| 业务使用 | G6Lite 支持 |
|---------|-----------|
| `dagre` | ✅ DagreLayout |
| `force` | ✅ ForceLayout |
| `circular` | ✅ CircularLayout |
| `grid` | ✅ GridLayout |
| `combo-force` | ❌ 无 Combo 支持，但 ForceLayout 可用 |
| — | ✅ 额外支持：concentric, d3-force, force-atlas2, fruchterman, mds, random, radial, indented, mindmap, fishbone |

### 状态管理（完全覆盖）

| 业务使用 | G6Lite 支持 |
|---------|-----------|
| `highlight` | ✅ `ElementState: 'highlight'` |
| `dim` | ✅ `ElementState: 'inactive'`（等价） |
| `selected` | ✅ `ElementState: 'selected'` |
| `active` | ✅ `ElementState: 'active'` |
| — | ✅ 额外支持：`disabled` |

---

## 九、优先级排序与实施建议

### P0 — 业务核心交互（阻塞图分析模块使用）

| 缺失能力 | 实现方案 | 预估工作量 |
|---------|---------|-----------|
| **节点右键菜单** `node:contextmenu` | `click-node` behavior 增加 `contextmenu` 事件监听，GPU pick 后发射 `node:contextmenu` / `edge:contextmenu` / `canvas:contextmenu` | 0.5 天 |
| **边右键菜单** `edge:contextmenu` | 同上 | 包含在上面 |

### P1 — 交互完整性（影响用户体验）

| 缺失能力 | 实现方案 | 预估工作量 |
|---------|---------|-----------|
| **节点双击** `node:dblclick` | 新增 `dblclick` behavior，双击时 GPU pick 发射事件 | 0.5 天 |
| **Hover 离开事件** `node:mouseleave` / `edge:mouseleave` | `hoverHighlight` behavior 在 mousemove 拾取不到元素时发射 leave 事件 | 0.5 天 |
| **渲染完成事件** `afterrender` | `Graph.render()` 末尾发射 `afterrender` 事件 | 0.5 天 |
| **click-select behavior** | `click-node` behavior 点击时调用 `setItemState(id, 'selected', true)`，点击空白处清除所有 selected | 0.5 天 |

### P2 — 增量操作与高级交互

| 缺失能力 | 实现方案 | 预估工作量 |
|---------|---------|-----------|
| **生命周期事件** `afteradditem` / `afterremoveitem` / `afterupdateitem` | `DataModel` 操作后由 `Graph` 发射事件 | 1 天 |
| **brush-select** 框选 | 新增 behavior，mousedown+mousemove 绘制选择框，GPU pick 框内节点 | 2-3 天 |
| **lasso-select** 圈选 | 新增 behavior，Shift+拖拽绘制套索路径，判断节点是否在路径内 | 2-3 天 |
| **Combo 支持** | 新增 Combo 数据模型、渲染、交互，工作量较大 | 5-10 天 |

### P3 — 低优先级

| 缺失能力 | 实现方案 | 预估工作量 |
|---------|---------|-----------|
| 画布双击 `canvas:dblclick` | dblclick behavior 中补充 | 0.5 天 |
| 边拖拽 `edge:drag` | 新增 drag-edge behavior | 1-2 天 |
| 动画完成 `afteranimate` | G6Lite 暂无动画系统，需先实现动画 | N/A |
| `auto-adapt-label` | 依赖标签系统完善 | N/A |

---

## 十、G6Lite 事件完整列表（当前）

| 事件名 | 来源 | Payload |
|--------|------|---------|
| `node:click` | click-node behavior | `{ nodeId, event }` |
| `edge:click` | click-node behavior | `{ edgeIndex, source, target, event }` |
| `canvas:click` | click-node behavior | `{ event }` |
| `node:hover` | highlight-node / hoverHighlight behavior | `{ nodeId, event }` |
| `edge:hover` | highlight-edge / hoverHighlight behavior | `{ edgeIndex, source, target, event }` |
| `node:dragstart` | drag-node behavior | `{ nodeId, event }` |
| `node:drag` | drag-node behavior | `{ nodeId, x, y, event }` |
| `node:dragend` | drag-node behavior | `{ nodeId }` |
| `layout:start` | Graph.render() | `{ nodeCount }` |
| `layout:end` | Graph.render() | `{ duration, nodeCount }` |

---

*文档最后更新于 2026-05-11*