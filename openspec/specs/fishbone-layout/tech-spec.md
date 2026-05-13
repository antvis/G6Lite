# 鱼骨图布局 - 技术方案

## 1. 概述

鱼骨图（Ishikawa Diagram）布局，用于因果分析场景。主脊柱为水平线，分类节点沿脊柱上下交替排列通过斜线连接，二级子项从分类节点单向垂直堆叠延伸。

---

## 2. 配置项设计

```typescript
export interface FishboneLayoutOptions {
  /** 布局方向，暂支持 'LR'（鱼头在右）| 'RL'（鱼头在左） */
  direction?: 'LR' | 'RL';
  /** 一级分类沿脊柱的间距，默认 150 */
  categoryGap?: number;
  /** 二级子项垂直间距，默认 30 */
  itemGap?: number;
  /** 子项水平阶梯步长，默认 20 */
  itemHStep?: number;
  /** 分类节点距脊柱的垂直距离，默认 80 */
  categoryDistance?: number;
  /** 获取节点宽度的回调 */
  getWidth?: (node: GraphNode) => number;
  /** 获取节点高度的回调 */
  getHeight?: (node: GraphNode) => number;
}
```

---

## 3. 数据结构

输入标准 `GraphData`，两层树形：

```
head (root, 无入边)
├── cat0 (depth=1, 偶数索引 → 上方)
│   ├── item0 (depth=2)
│   └── item1 (depth=2)
├── cat1 (depth=1, 奇数索引 → 下方)
│   └── item0 (depth=2)
└── cat2 (depth=1, 偶数索引 → 上方)
    ├── item0 (depth=2)
    └── item1 (depth=2)
```

布局算法自动识别根节点（无入边的节点），不依赖 `data.level` 字段。

---

## 4. 坐标计算算法

### 4.1 全局参数

```
canvasWidth  = 画布宽度（默认 900）
canvasHeight = 画布高度（默认 600）
centerY      = canvasHeight / 2

numCategories = root.children.length
spineLength   = numCategories * categoryGap
spineStartX   = canvasWidth / 2 - spineLength / 2  // 居中
```

### 4.2 鱼头坐标

```
head.x = spineStartX + spineLength + headWidth / 2
head.y = centerY
```

### 4.3 一级分类坐标（depth=1）

```
i = 0, 1, 2, ...  (按 root.children 顺序)

spineAnchorX[i] = spineStartX + (i + 0.5) * categoryGap
isTop[i]        = i % 2 === 0  // 偶数索引在上方

cat.x = spineAnchorX[i]
cat.y = isTop ? centerY - categoryDistance
              : centerY + categoryDistance
```

### 4.4 二级子项坐标（depth=2）

```
j = 0, 1, 2, ...  (按 category.children 顺序，j=0 最靠近分类节点)
dir = isTop ? -1 : 1  // 上方分类 → 子项向上；下方分类 → 子项向下

item.x = cat.x - (j + 1) * itemHStep   // 每项向左递进，形成阶梯
item.y = cat.y + dir * (j + 1) * itemGap
```

示意图（上方分类，dir=-1）：

```
item1 ——  (x=catX-2*step, y=catY-2*gap)
item0 ——  (x=catX-1*step, y=catY-1*gap)
[catA]    (x=catX, y=catY)
          |  (斜线到脊柱锚点)
——————————+—————————————————————  脊柱
```

### 4.5 边的控制点

布局算法在 `forEachEdge()` 中输出每条边的折线控制点：

| 边 | 控制点 | 说明 |
|----|--------|------|
| head → cat | `[(spineAnchorX[i], centerY)]` | 脊柱锚点，形成斜线效果 |
| cat → item | `[(cat.x, item.y)]` | 先水平后垂直的折线 |

---

## 5. 实现计划

### 5.1 `fishboneLayout.ts` 重写

- 删除现有 `execute()` 内的硬编码计算
- 将 `calcPositions()` 逻辑整合进 `execute()`，按上述算法实现
- 新增 `forEachEdge()` 方法，输出边的控制点（供 `runLayout.ts` 使用）

### 5.2 `runLayout.ts` 适配

检查 fishbone 的边控制点是否已被 `runLayout.ts` 消费。若有 `forEachEdge()` 接口需注册，参考 mindmap 的处理方式。

### 5.3 验证

运行 `playground/demos/fishbone.ts` demo，对照参考图验证布局效果。

---

## 6. 关键约束

- 当前只支持两层树（head → category → item），三层及以上不在本次范围
- `direction: 'RL'` 通过镜像所有 x 坐标实现：`x_new = canvasWidth - x_old`
- 节点尺寸通过 `getWidth/getHeight` 回调获取，布局算法不硬编码尺寸
