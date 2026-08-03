# 标签与图标 (/docs/guides/label)



G6Lite 用 Canvas 2D 在 WebGL 画布上方绘制文本标签与图标。GPU 负责海量节点和边，Canvas 2D 负责文本排版。

## 节点标签 [#节点标签]

```ts
node: {
  style: {
    size: 20,
    label: (node) => (node.data?.name as string) ?? node.id,
    labelPlacement: 'bottom',
    labelFontSize: 12,
    labelColor: '#333',
  },
}
```

| 字段                              | 说明                                             |
| ------------------------------- | ---------------------------------------------- |
| `label`                         | 文本；`false` 表示不显示                               |
| `labelFontSize`                 | 字号                                             |
| `labelFontFamily`               | 字体                                             |
| `labelFontWeight`               | 字重                                             |
| `labelColor`                    | 文本颜色                                           |
| `labelPlacement`                | `center` / `top` / `bottom` / `left` / `right` |
| `labelOffsetX` / `labelOffsetY` | 偏移                                             |
| `labelBackground`               | 标签底色                                           |
| `labelBackgroundPadding`        | 底色内边距                                          |
| `labelMaxWidth`                 | 最大宽度，超出截断                                      |

## 节点图标 [#节点图标]

```ts
node: {
  style: {
    size: 28,
    icon: (node) => iconMap[node.data?.type as string],
    iconWidth: 16,
    iconHeight: 16,
  },
}
```

| 字段           | 说明              |
| ------------ | --------------- |
| `icon`       | 图标内容，如图片地址或文本符号 |
| `iconWidth`  | 图标宽度            |
| `iconHeight` | 图标高度            |

## 边标签 [#边标签]

```ts
edge: {
  style: {
    label: (_source, _target, edge) => (edge.data?.label as string) ?? '',
    labelPlacement: 'center',
    labelAutoRotate: true,
  },
}
```

| 字段                       | 说明                         |
| ------------------------ | -------------------------- |
| `label`                  | 边标签文本                      |
| `labelFontSize`          | 字号                         |
| `labelFontFamily`        | 字体                         |
| `labelColor`             | 文本颜色                       |
| `labelPlacement`         | `start` / `center` / `end` |
| `labelBackground`        | 标签底色                       |
| `labelBackgroundPadding` | 底色内边距                      |
| `labelAutoRotate`        | 是否随边方向旋转                   |

## 性能提示 [#性能提示]

* 大规模图不建议全量显示所有标签。
* 可以让 `label` 函数根据缩放层级、选中状态或业务过滤条件返回 `false`。
* 优先在高亮、选中或聚焦场景显示局部标签。
