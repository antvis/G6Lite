# 节点样式 (/docs/guide/node)



节点通过 `node` 配置类型与样式。`circle` 与 `rect` 均为真实图元,由不同的 WebGL program 绘制。

## node 配置 [#node-配置]

* **type**：`'circle'`（默认,圆形）或 `'rect'`（矩形,使用独立的 `width` / `height`）。
* **style**（绝大多数属性都支持值或 `(node) => 值` 的函数形式）：
  * **fill**：填充色。
  * **size**：圆形直径（`circle` 用）。
  * **width** / **height**：矩形尺寸（`rect` 用）。
  * **stroke** / **strokeWidth**：描边颜色与宽度。
  * **opacity**：不透明度。
  * **borderRadius**：矩形圆角。
  * **label** 及一系列 `label*` / **icon** 等标签与图标属性,详见[标签与图标](/docs/guide/label)。
* **stateStyles**：按状态（`selected` / `highlight` / `inactive` 等）覆盖样式,配合 `graph.setItemState()` 使用。

```ts
// 圆形节点
node: {
  type: 'circle',
  style: {
    fill: (d) => (d.data?.cluster === 'a' ? '#5B8FF9' : '#61DDAA'),
    size: 12,
  },
  stateStyles: {
    selected: { stroke: '#1890ff', strokeWidth: 3 },
  },
}

// 矩形节点
node: {
  type: 'rect',
  style: { width: 60, height: 32, fill: '#5B8FF9', borderRadius: 4 },
}
```

样式仅暴露可在 WebGL 下高效实现的属性,便于大规模渲染。

## 相关 [#相关]

* [边样式](/docs/guide/edge) — 边的类型与样式。
* [标签与图标](/docs/guide/label) — 节点文本标签与图标。
* 可运行示例:`node-style` / `shapes` / `node-border` / `node-states`（见 [playground](https://github.com/antvis/G6Lite/tree/master/playground/demos)）。
