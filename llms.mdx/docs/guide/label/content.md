# 标签与图标 (/docs/guide/label)



G6-GL 的文本标签与图标由 **Canvas 2D** 在 WebGL 画布上方叠加绘制：GPU 负责海量节点 / 边的图元渲染，文本则交给 Canvas 2D，兼顾性能与排版质量。标签属性都写在节点 / 边的 `style` 中，且大多支持函数形式按数据动态取值。

## 节点标签 [#节点标签]

最常用的是 `label`，传字符串或 `(node) => string`：

```ts
node: {
  style: {
    size: 20,
    fill: '#5B8FF9',
    label: (n) => (n.data?.name as string) ?? n.id,
    labelPlacement: 'bottom',
    labelFontSize: 12,
    labelColor: '#333',
  },
}
```

### 节点标签字段 [#节点标签字段]

| 字段                                  | 类型                                                   | 说明                 |
| ----------------------------------- | ---------------------------------------------------- | ------------------ |
| **label**                           | `string \| false \| (node) => ...`                   | 标签文本，`false` 表示不显示 |
| **labelFontSize**                   | `number`                                             | 字号                 |
| **labelFontFamily**                 | `string`                                             | 字体                 |
| **labelFontWeight**                 | `string`                                             | 字重                 |
| **labelColor**                      | `string`                                             | 文本颜色               |
| **labelPlacement**                  | `'center' \| 'top' \| 'bottom' \| 'left' \| 'right'` | 相对节点的位置            |
| **labelOffsetX** / **labelOffsetY** | `number`                                             | 在 placement 基础上的偏移 |
| **labelBackground**                 | `string \| false`                                    | 标签底色（描边文字可读性）      |
| **labelBackgroundPadding**          | `number`                                             | 底色内边距              |
| **labelMaxWidth**                   | `number`                                             | 最大宽度，超出截断          |

所有字段均支持 `(node) => 值` 的函数形式。

## 节点图标 [#节点图标]

节点可叠加一个图标（绘制在节点中心）：

| 字段             | 类型                                 | 说明                 |
| -------------- | ---------------------------------- | ------------------ |
| **icon**       | `string \| false \| (node) => ...` | 图标内容（如图片地址 / 文本符号） |
| **iconWidth**  | `number`                           | 图标宽度               |
| **iconHeight** | `number`                           | 图标高度               |

```ts
node: {
  style: {
    size: 28,
    icon: (n) => iconMap[n.data?.type as string],
    iconWidth: 16,
    iconHeight: 16,
    label: (n) => n.data?.name as string,
    labelPlacement: 'bottom',
  },
}
```

## 边标签 [#边标签]

边标签写在 `edge.style` 中，函数形式签名为 `(source, target, edge) => ...`：

```ts
edge: {
  style: {
    stroke: '#bbb',
    label: (s, t, e) => (e.data?.label as string) ?? '',
    labelPlacement: 'center',
    labelFontSize: 11,
    labelColor: '#666',
    labelAutoRotate: true,
  },
}
```

### 边标签字段 [#边标签字段]

| 字段                         | 类型                                    | 说明       |
| -------------------------- | ------------------------------------- | -------- |
| **label**                  | `string \| false \| (s, t, e) => ...` | 边标签文本    |
| **labelFontSize**          | `number`                              | 字号       |
| **labelFontFamily**        | `string`                              | 字体       |
| **labelColor**             | `string`                              | 文本颜色     |
| **labelPlacement**         | `'start' \| 'center' \| 'end'`        | 沿边的位置    |
| **labelBackground**        | `string \| false`                     | 标签底色     |
| **labelBackgroundPadding** | `number`                              | 底色内边距    |
| **labelAutoRotate**        | `boolean`                             | 是否随边方向旋转 |

## 性能提示 [#性能提示]

* 标签数量大时（如全量显示上万节点标签）会增加 Canvas 2D 绘制开销。大规模图建议按需显示——例如仅对选中 / 高亮节点显示标签，或在缩放到一定层级后再显示（业务侧控制 `label` 返回值即可）。
* 仓库 `playground/demos/labels.ts` 与 `large-labeled.ts` 提供了标签与大规模标签的可运行示例。
