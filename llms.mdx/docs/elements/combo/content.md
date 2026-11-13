# 分组总览 (/docs/elements/combo)





## 什么是分组 [#什么是分组]

分组（Combo）把相关节点圈在一起，比如把 Web 和 Mobile 放进「客户端」分组。分组也能放进另一个分组。展开时，边框会随成员的位置和大小调整。折叠时，成员节点收起，分组可显示成圆形或矩形。

## 数据结构 [#数据结构]

分组写在 `data.combos`。节点属于哪个分组，由节点的 `comboId` 指定。分组属于哪个上级，由子分组的 `parentId` 指定。边的起点和终点仍填写节点 ID。

| 字段          | 类型                          | 必填 | 说明                     |
| ----------- | --------------------------- | -- | ---------------------- |
| `id`        | `string`                    | 是  | 分组的唯一 ID               |
| `parentId`  | `string`                    | 否  | 上级分组 ID                |
| `collapsed` | `boolean`                   | 否  | 是否在首次渲染时折叠             |
| `states`    | `ElementState[]`            | 否  | 初始状态，例如 `['selected']` |
| `style`     | `Partial<ComboStyleConfig>` | 否  | 该分组的样式                 |
| `data`      | `Record<string, unknown>`   | 否  | 业务数据，例如分组名称            |

## 配置方法 [#配置方法]

所有分组的默认样式写在 `combo.style`。单个分组的样式写在它自己的 `style`，同名字段以该分组的配置为准。节点需要提供坐标，或由布局计算位置。

下图中，Web 和 Mobile 属于 Client，Client 又属于 Platform。Archive 首次渲染时就处于折叠状态。



```ts
data: {
  nodes: [
    { id: 'web', x: 100, y: 120, comboId: 'client' },
    { id: 'mobile', x: 220, y: 120, comboId: 'client' },
    { id: 'old-a', x: 420, y: 100, comboId: 'archive' },
    { id: 'old-b', x: 500, y: 140, comboId: 'archive' },
    { id: 'outside', x: 300, y: 260 },
  ],
  edges: [
    { id: 'live', source: 'mobile', target: 'outside' },
    { id: 'archived', source: 'old-a', target: 'outside' },
  ],
  combos: [
    { id: 'platform', data: { name: 'Platform' }, style: { padding: 24 } },
    { id: 'client', parentId: 'platform', data: { name: 'Client (selected)' }, states: ['selected'] },
    { id: 'archive', collapsed: true, data: { name: 'Archive (collapsed)' } },
  ],
},
```

**完整运行代码**

```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    // #region graph-data
    data: {
      nodes: [
        { id: 'web', x: 100, y: 120, comboId: 'client' },
        { id: 'mobile', x: 220, y: 120, comboId: 'client' },
        { id: 'old-a', x: 420, y: 100, comboId: 'archive' },
        { id: 'old-b', x: 500, y: 140, comboId: 'archive' },
        { id: 'outside', x: 300, y: 260 },
      ],
      edges: [
        { id: 'live', source: 'mobile', target: 'outside' },
        { id: 'archived', source: 'old-a', target: 'outside' },
      ],
      combos: [
        { id: 'platform', data: { name: 'Platform' }, style: { padding: 24 } },
        { id: 'client', parentId: 'platform', data: { name: 'Client (selected)' }, states: ['selected'] },
        { id: 'archive', collapsed: true, data: { name: 'Archive (collapsed)' } },
      ],
    },
    // #endregion graph-data
    node: { style: { size: 22, label: (node) => node.id } },
    edge: { style: { lineWidth: 2, endArrow: true } },
    combo: {
      style: {
        padding: 30,
        label: (combo) => String(combo.data?.name ?? combo.id),
        labelPlacement: 'top',
        collapsedType: 'rect',
        collapsedSize: [150, 44],
        stateStyles: { selected: { stroke: '#873bf4', strokeWidth: 2 } },
      },
    },
    behaviors: [],
    autoFit: { padding: 56, maxZoom: 1 },
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



样式、折叠和拖拽的配置见[分组通用配置项](/docs/guides/combo)。
