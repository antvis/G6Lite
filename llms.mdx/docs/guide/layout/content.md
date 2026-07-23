# 布局 (/docs/guide/layout)















通过 `layout` 配置布局,多数算法基于 [@antv/layout](https://github.com/antvis/layout),选项会透传到底层算法。`type` 之外还支持 `worker: true`,将布局计算放到 Web Worker 中以避免阻塞主线程（≥1000 节点的 force 系布局会自动启用）。

## 支持的布局类型 [#支持的布局类型]

共内置 **14 种**布局：

| type             | 说明              | 常用参数                            |
| ---------------- | --------------- | ------------------------------- |
| **force**        | 力导向             | `linkDistance`, `nodeStrength`  |
| **d3-force**     | D3 力导向          | `linkDistance`, `charge`        |
| **force-atlas2** | ForceAtlas2 力导向 | `kr`, `kg`                      |
| **fruchterman**  | Fruchterman 力导向 | `gravity`, `speed`              |
| **circular**     | 环形              | `radius`, `center`              |
| **concentric**   | 同心圆             | `center`, `minNodeSpacing`      |
| **radial**       | 辐射              | `center`, `unitRadius`          |
| **grid**         | 网格              | `rows`, `cols`                  |
| **dagre**        | 有向无环图 / 层级      | `rankdir`, `nodesep`, `ranksep` |
| **mds**          | 多维标度            | `linkDistance`                  |
| **random**       | 随机（默认兜底）        | `center`                        |
| **mindmap**      | 脑图（自研,树状双向展开）   | `direction`, `hGap`, `vGap`     |
| **indented**     | 缩进树（自研）         | `indent`, `rowHeight`           |
| **fishbone**     | 鱼骨图（自研）         | `direction`                     |

> `mindmap` / `indented` / `fishbone` 为 G6-GL 自研的树形布局,需配合树状结构的数据使用。
> 三者由无状态 executor function 执行，复杂度为 O(V+E)，不会进入 Worker；配置 `worker: true` 时仍保持原布局类型。

## 效果预览 [#效果预览]

以下为同一份数据在不同布局下的真实渲染截图（由 g6-gl WebGL 渲染并截图,见 `playground/capture.html`）：

|                force                |                circular                |                 radial                |
| :---------------------------------: | :------------------------------------: | :-----------------------------------: |
| <img alt="force 布局" src="__img0" /> | <img alt="circular 布局" src="__img1" /> |  <img alt="radial 布局" src="__img2" /> |
|              **dagre**              |                **grid**                |              **mindmap**              |
| <img alt="dagre 布局" src="__img3" /> |   <img alt="grid 布局" src="__img4" />   | <img alt="mindmap 布局" src="__img5" /> |

> 想交互式切换布局?运行 `npm run dev` 后打开 [`layouts` demo](https://github.com/antvis/G6Lite/tree/master/playground/demos/layouts.ts),可在同一数据上实时切换全部布局。

## 示例 [#示例]

```ts
// 环形
layout: { type: 'circular', radius: 150 }

// 力导向（大图自动走 Worker）
layout: { type: 'force', linkDistance: 100 }

// 网格
layout: { type: 'grid', rows: 3, cols: 4 }

// Dagre（自上而下）
layout: { type: 'dagre', rankdir: 'TB', nodesep: 40, ranksep: 60 }
```

不传 `layout` 时,将使用节点自带的 `x、y`（缺省为 0）。运行期可通过 `graph.setLayout(config)` 与 `graph.layout()` 重新布局,详见 [API 参考](/docs/api)。

## 相关 [#相关]

* 可运行示例:`layouts` / `mindmap` / `indented-tree` / `fishbone` / `flowchart` / `org-chart`（见 [playground](https://github.com/antvis/G6Lite/tree/master/playground/demos)）。
