# 元素总览 (/docs/elements/overview)





G6Lite 的图包含节点（Node）、边（Edge）和分组（Combo）三类元素。标签为元素补充名称、关系或分组信息。

## 节点（Node） [#node]

节点表示图中的对象，例如用户、设备或服务。用 `node.type` 选择圆形 `circle` 或矩形 `rect`，再用 `node.style` 调整尺寸、填充和描边。示例对比实心和描边圆形，以及直角和圆角矩形。

[节点总览](/docs/elements/node)

## 边（Edge） [#edge]

边表示节点之间的关系，例如好友关系或服务调用。用 `edge.type` 选择直线 `line`、弧线 `arc`、三次曲线 `cubic` 或折线 `polyline`。下面的弧线使用 `lineDash` 设置虚线，三次曲线和折线使用 `endArrow` 标出方向。

同一对节点之间的多条关系可用 `parallelEdges` 分开显示。让 `source` 和 `target` 指向同一节点即可绘制自环。

折线可根据场景选择路由。上图演示 `orth`，其他路由可在 [tree 组织架构图](/docs/examples/org-chart)、[indented 缩进树](/docs/examples/indented-tree)和 [fishbone 鱼骨图](/docs/examples/fishbone)中查看。类型与数据结构见[边总览](/docs/elements/edge)。

## 分组（Combo） [#combo]

Combo 将相关节点组织成分组，例如同属一个子系统的服务。节点通过 `comboId` 加入分组，子分组通过 `parentId` 嵌套。展开时显示成员的包围框。折叠时用 `collapsedType` 选择圆形或矩形，并显示成员计数或自定义文字。

[分组总览](/docs/elements/combo)

## 标签（Label） [#label]

用 `node.style.label` 标注节点名称、用 `edge.style.label` 标注关系、用 `combo.style.label` 添加分组标题。用 `labelPlacement` 调整位置，用 `labelBackground` 给节点或边的标签加底色，用 `labelAutoRotate` 让边标签沿边方向旋转。

[标签样式与显示策略](/docs/guides/label)

## 元素构成 [#element-parts]

节点的圆形或矩形主体可以叠加 `icon` 图标、`label` 标签与 `node.decorations` 装饰。边由路径、可选的起止箭头和标签组成。Combo 展开时以包围框圈出成员，可在框上显示标题。

## 元素状态 [#元素状态]

基础外观对应 `default`。内置状态还包括激活 `active`、选中 `selected`、高亮 `highlight`、弱化 `inactive`、禁用 `disabled` 和隐藏 `hidden`。隐藏示例的画布留空，禁用示例用灰色弱化节点。

示例将自定义状态 `review` 配为橙色填充。与 `selected` 同时使用时，节点保留选中描边。用数据中的 `states` 声明初始状态，或在渲染后调用 `graph.setItemState()`。各元素的状态合并规则见[元素状态](/docs/guides/states)。

## 配置元素 [#configure]

在 `new Graph()` 的同一层级配置 `node`、`edge` 和 `combo`。下面用 `node.style` 设置服务节点，用 `edge.style` 配置协议标签和箭头，再用 `combo.style` 设置存储分组的边框和标题。点击节点可以对照 `node.stateStyles.selected` 中的描边配置。



```ts
node: {
  type: 'rect',
  style: {
    width: 96,
    height: 38,
    borderRadius: 8,
    fill: '#eef2ff',
    stroke: '#6366f1',
    strokeWidth: 1,
    label: (node) => node.name ?? node.id,
    labelPlacement: 'center',
    labelColor: '#1e293b',
  },
  stateStyles: { selected: { stroke: '#4338ca', strokeWidth: 3 } },
},
edge: {
  style: {
    stroke: '#64748b',
    endArrow: true,
    label: (_source, _target, edge) => String(edge.data?.protocol ?? ''),
    labelColor: '#334155',
    labelBackground: '#fff',
    labelBackgroundPadding: 4,
  },
},
combo: {
  style: {
    label: 'Storage',
    labelPlacement: 'top',
    labelColor: '#065f46',
    padding: 20,
    borderRadius: 12,
    fill: 'rgba(16,185,129,0.08)',
    stroke: '#6ee7b7',
  },
},
```

**完整运行代码**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'web', name: 'Browser' },
        { id: 'api', name: 'API' },
        { id: 'cache', name: 'Cache', comboId: 'storage' },
        { id: 'db', name: 'Database', comboId: 'storage' },
      ],
      edges: [
        { source: 'web', target: 'api', data: { protocol: 'HTTPS' } },
        { source: 'api', target: 'cache', data: { protocol: 'GET' } },
        { source: 'api', target: 'db', data: { protocol: 'SQL' } },
      ],
      combos: [{ id: 'storage' }],
    },
    // #region element-options
    node: {
      type: 'rect',
      style: {
        width: 96,
        height: 38,
        borderRadius: 8,
        fill: '#eef2ff',
        stroke: '#6366f1',
        strokeWidth: 1,
        label: (node) => node.name ?? node.id,
        labelPlacement: 'center',
        labelColor: '#1e293b',
      },
      stateStyles: { selected: { stroke: '#4338ca', strokeWidth: 3 } },
    },
    edge: {
      style: {
        stroke: '#64748b',
        endArrow: true,
        label: (_source, _target, edge) => String(edge.data?.protocol ?? ''),
        labelColor: '#334155',
        labelBackground: '#fff',
        labelBackgroundPadding: 4,
      },
    },
    combo: {
      style: {
        label: 'Storage',
        labelPlacement: 'top',
        labelColor: '#065f46',
        padding: 20,
        borderRadius: 12,
        fill: 'rgba(16,185,129,0.08)',
        stroke: '#6ee7b7',
      },
    },
    // #endregion element-options
    layout: { type: 'dagre', rankdir: 'LR', ranksep: 84, nodesep: 16, nodeSize: 96 },
    label: { hideOnLowZoom: false, scaleWithZoom: false },
    behaviors: ['click-select', 'drag-canvas', 'zoom-canvas'],
    autoFit: { padding: 36, maxZoom: 1 },
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```



## 图形绘制与扩展 [#drawing]

切换示例，查看扩展如何通过 `register()` 接入 G6Lite。每项指南都提供对应的可运行代码。

* [自定义节点](/docs/guides/custom-node)根据服务状态改变节点样式并绘制覆盖层。
* [自定义边](/docs/guides/custom-edge)根据边权重设置弧线颜色和线宽。
* [自定义节点装饰](/docs/guides/custom-decoration)在节点旁绘制并堆叠状态徽章。
* [自定义标签渲染](/docs/guides/custom-label-renderer)为节点和边绘制多行文字。
