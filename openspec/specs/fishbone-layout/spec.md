# 鱼骨图布局 (Fishbone / Ishikawa Layout)

## Purpose

为 G6Lite 新增鱼骨图（石川图）布局能力，支持因果分析、根因分析等场景的可视化。`@antv/layout` 不提供此布局，需自研。

---

## 参考效果

```
item3  item2  item1  item0           item0  item1  item2  item3
  [  分类A  ]           [  分类B  ]           [  分类C  ]
                  \              \              \
 ————————————————————————————————————————————————  [鱼头]
                  /              /              /
  [  分类D  ]           [  分类E  ]           [  分类F  ]
item3  item2  item1  item0           item0  item1  item2  item3
```

- 主脊柱为水平线，右端为鱼头（问题/结果节点）
- 一级分类节点沿脊柱**上下交替**排列，通过 45° 斜线连接到脊柱锚点
- 二级子项从分类节点出发，向**远离脊柱的方向**水平延伸，多个子项垂直堆叠
- 每个一级分类可独立着色，同分类的子项、边继承同一颜色

典型场景：质量管理、问题分析、项目复盘。

---

## 核心需求

### R-FISH-01: 鱼骨图布局算法

布局算法 SHALL 接受两层树形数据（头部 → 一级分类 → 二级子项），输出每个节点的 (x, y) 坐标。

**主脊柱**：
- 鱼头节点放在右端：`x = spineStartX + spineLength + headWidth/2, y = centerY`
- 脊柱为水平线，从 `(spineStartX, centerY)` 到 `(spineStartX + spineLength, centerY)`

**一级分类节点**（depth=1）：
- 沿脊柱等距排列：`spineX[i] = spineStartX + (i + 0.5) * categoryGap`
- 上下交替：偶数索引（0,2,4…）在上方，奇数索引（1,3,5…）在下方
- `catY = centerY ∓ categoryDistance`（上方取 −，下方取 +）
- `catX = spineX[i]`（分类节点 x 与脊柱锚点 x 对齐）

**二级子项节点**（depth=2）：
- `itemX = catX - (j+1) * itemHStep`（从分类节点向左逐级延伸，形成阶梯）
- `itemY = catY + dir * (j+1) * itemGap`（dir=−1 表示上方分类，+1 表示下方分类）
- 即子项**单向堆叠**，方向与所属分类一致

**边的控制点**：
- 分类 → 脊柱：折线，控制点在 `(spineX[i], spineY)`（脊柱锚点）
- 子项 → 分类：折线，控制点在 `(catX, itemY)`

**复杂度**：O(n)

**实现位置**：`src/layout/fishboneLayout.ts`，注册到 `runLayout.ts`。

### R-FISH-02: 边渲染

所有边均复用现有 `edgeLine` / `polyline` program，无需新增 WebGL shader：

| 边类型 | 渲染方式 | 控制点 |
|--------|----------|--------|
| 脊柱线 | 粗水平线，通过虚拟节点对实现 | 无 |
| 脊柱锚点 → 分类 | 斜线（45°） | `(spineX[i], spineY)` |
| 分类 → 子项 | 折线（水平 + 垂直） | `(catX, itemY)` |

### R-FISH-03: 分类着色

- 支持 `categoryColors?: string[]`，按一级分类索引分配颜色
- 同一分类的节点、边统一使用该颜色

---

## 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `direction` | `'LR'\|'RL'` | `'LR'` | 鱼头方向（暂只支持水平方向） |
| `categoryGap` | `number` | `150` | 一级分类沿脊柱的间距 |
| `itemGap` | `number` | `30` | 二级子项垂直间距 |
| `itemHStep` | `number` | `20` | 子项水平阶梯步长 |
| `categoryDistance` | `number` | `80` | 分类节点距脊柱的垂直距离 |
| `branchAngle` | `number` | `45` | 斜线角度（影响 categoryDistance 与 categoryGap 的比例） |
| `getWidth` | `(node) => number` | `() => 80` | 获取节点宽度 |
| `getHeight` | `(node) => number` | `() => 30` | 获取节点高度 |

---

## 数据结构

输入为标准 `GraphData`（两层树形）：
- 根节点（1 个）= 问题/结果节点（鱼头），通过无入边判断
- 一级子节点 = 分类节点（depth=1）
- 二级子节点 = 具体因素（depth=2）

布局算法内部通过 edge source/target 关系推断树层级，不依赖节点 data 中的 level 字段。

---

## 已知问题（当前实现）

1. `execute()` 内坐标计算为简化版，`calcPositions()` 方法未被调用
2. 子项排列用两侧对称分布，导致子项堆叠在分类节点两侧（错误）
3. 根节点位置硬编码 `x=600, y=300`，不自适应画布尺寸

---

## 工作量估算

| 任务 | 估算 |
|------|------|
| 重写布局算法 `execute()` + `calcPositions()` | 1 天 |
| 验证 Demo + 调试 | 0.5 天 |
| **合计** | **1.5 天** |

（边渲染已有 polyline 支持，无需额外工作）

---

## 验证方式

1. 用「产品盈利未达预期」数据（~25 节点）验证布局
2. 脊柱水平、分类上下交替、斜线角度一致
3. 二级子项方向与所属分类一致，无重叠
4. 分类着色正确
5. 缩放/拖拽流畅
