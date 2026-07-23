# 节点 (/docs/guides/node)



节点通过 `node` 配置类型与样式。`circle` 与 `rect` 都由 WebGL program 绘制，适合大规模渲染。

## 基础配置 [#基础配置]

```ts
node: {
  type: 'circle',
  style: {
    size: 16,
    fill: '#5B8FF9',
  },
}
```

## 类型 [#类型]

| 类型       | 说明        | 常用尺寸字段             |
| -------- | --------- | ------------------ |
| `circle` | 圆形节点，默认类型 | `size`             |
| `rect`   | 矩形节点      | `width` / `height` |

## 样式字段 [#样式字段]

| 字段                       | 说明                                 |
| ------------------------ | ---------------------------------- |
| `fill`                   | 填充色                                |
| `size`                   | 圆形直径                               |
| `width` / `height`       | 矩形尺寸                               |
| `stroke` / `strokeWidth` | 描边颜色与宽度                            |
| `opacity`                | 不透明度                               |
| `borderRadius`           | 矩形圆角                               |
| `label*`                 | 标签字段，见 [标签与图标](/docs/guides/label) |
| `icon*`                  | 图标字段，见 [标签与图标](/docs/guides/label) |

大多数字段支持值或函数形式：

```ts
node: {
  style: {
    size: (node) => ((node.data?.value as number) ?? 1) * 4 + 12,
    fill: (node) => (node.data?.cluster === 'a' ? '#5B8FF9' : '#61DDAA'),
  },
}
```

## 状态样式 [#状态样式]

```ts
node: {
  stateStyles: {
    selected: { stroke: '#1890ff', strokeWidth: 3 },
    highlight: { stroke: '#faad14', strokeWidth: 3 },
    inactive: { opacity: 0.25 },
    hidden: { opacity: 0 },
  },
}
```

运行时切换状态：

```ts
graph.setItemState('node-a', 'selected', true);
graph.setItemState('node-b', 'inactive', true);
```

## 性能建议 [#性能建议]

* 优先使用静态样式；函数式样式适合按数据分类，但不要在函数中做重计算。
* 大图中尽量减少全量标签，标签绘制由 Canvas 2D 承担。
* 高频交互优先切换状态，不要频繁重建整份数据。

## 相关 [#相关]

* [边](/docs/guides/edge)
* [标签与图标](/docs/guides/label)
* [示例总览](/docs/examples)
* [API: NodeConfig](/docs/api)
