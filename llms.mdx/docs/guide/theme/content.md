# 主题 (/docs/guide/theme)



通过 `theme` 配置主题：

* **字符串**：`'light'` 或 `'dark'`,使用内置主题。
* **对象**：在某一主题基础上覆盖部分 token。

内置 token 包括：`nodeFill`、`nodeSize`、`nodeStroke`、`nodeStrokeWidth`、`edgeStroke`、`edgeLineWidth`、`canvasBackground`、`edgeDefaultColor`、`edgeCategoryPalette`、`edgeArrow`,以及按状态覆盖的 `nodeStateStyles` / `edgeStateStyles`。

```ts
// 使用预设
theme: 'dark'

// 覆盖部分 token
theme: {
  type: 'light',
  edgeLineWidth: 2,
  canvasBackground: '#f5f5f5',
}
```

## 相关 [#相关]

* [节点样式](/docs/guide/node) / [边样式](/docs/guide/edge) — 单个元素的样式优先级高于主题 token。
* 可运行示例:`theme`（见 [playground](https://github.com/antvis/G6Lite/tree/master/playground/demos)）。
