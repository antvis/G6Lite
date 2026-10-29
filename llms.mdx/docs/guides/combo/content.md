# Combo (/docs/guides/combo)





Combo 是节点的分组容器，用于把一组节点圈在一个可视包围框内。它支持嵌套、折叠 / 展开，以及整体拖拽。

Combo 包围框由 Canvas 2D 在 WebGL 画布下方叠加绘制，不影响节点和边的 GPU 渲染路径。

下面的分组示意对应声明中的归属关系：`n1`、`n2` 属于 Frontend，`n3` 属于 Backend；边可以跨组连接。

<img alt="Frontend 包含 n1 和 n2，Backend 包含 n3，n1 与 n3 跨组连接" src="__img0" title="节点分组与跨组连接" />

在 [Combo 示例](/docs/examples/combo) 中可体验嵌套、折叠展开和整体拖拽。

## 声明 Combo [#声明-combo]

```ts
const graph = new Graph({
  container: 'container',
  data: {
    nodes: [
      { id: 'n1', comboId: 'frontend' },
      { id: 'n2', comboId: 'frontend' },
      { id: 'n3', comboId: 'backend' },
    ],
    edges: [{ source: 'n1', target: 'n3' }],
    combos: [
      { id: 'frontend', data: { name: 'Frontend' } },
      { id: 'backend', data: { name: 'Backend' } },
    ],
  },
  layout: { type: 'd3-force' },
  behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'click-select'],
});
```

## ComboData [#combodata]

| 字段         | 说明              |
| ---------- | --------------- |
| `id`       | Combo 唯一标识      |
| `parentId` | 父 Combo id，用于嵌套 |
| `style`    | 单个 Combo 的样式覆盖  |
| `data`     | 业务扩展字段          |

## 样式 [#样式]

```ts
combo: {
  style: {
    fill: 'rgba(91, 143, 249, 0.08)',
    stroke: 'rgba(91, 143, 249, 0.35)',
    strokeWidth: 1,
    borderRadius: 12,
    padding: 30,
    label: (combo) => (combo.data as Record<string, string>)?.name ?? combo.id,
    labelPlacement: 'top',
  },
}
```

## 折叠与展开 [#折叠与展开]

```ts
graph.collapseCombo('frontend');
graph.expandCombo('frontend');
graph.toggleCombo('frontend');

graph.on('combo:collapse', ({ comboId }) => console.log(comboId));
graph.on('combo:expand', ({ comboId }) => console.log(comboId));
```

## 动态调整归属 [#动态调整归属]

```ts
graph.addToCombo('n4', 'frontend');
graph.removeFromCombo('n4');
graph.createCombo({ id: 'new-group' }, ['n1', 'n2']);
graph.removeCombo('new-group');
```

## 查询 [#查询]

```ts
graph.getComboData('frontend');
graph.getComboChildren('frontend');
graph.getNodeCombo('n1');
```

## 整体拖拽 [#整体拖拽]

启用 `drag-node` 后，拖拽 Combo 区域会带动其子节点一起移动，并触发 `combo:dragstart`、`combo:drag`、`combo:dragend` 事件。
