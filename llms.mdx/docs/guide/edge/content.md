# 边样式 (/docs/guide/edge)



边通过 `edge` 配置类型与样式。

## edge 配置 [#edge-配置]

* **type**：`'line'`（默认,直线）、`'arc'`（弧线）、`'cubic'`（三次贝塞尔曲线）、`'polyline'`（折线,支持 `orth` / `tree` / `indented` / `fishbone` 路由）。
* **style**（支持值或 `(source, target, edge) => 值` 的函数形式）：
  * **stroke**：线条颜色。
  * **lineWidth**：线宽。
  * **curvature** / **curveOffset**：`arc` / `cubic` 的弯曲程度。
  * **startArrow** / **endArrow** / **arrowSize**：箭头开关与大小。
  * **lineDash**：虚线。
  * **opacity**：不透明度。
  * **radius** / **router** / **indentTarget** / **trunkGap**：`polyline` 的折角半径与路由参数。
  * **label** 及一系列 `label*` 属性,详见[标签与图标](/docs/guide/label)。
* **stateStyles**：按状态覆盖样式。

```ts
edge: {
  type: 'line',
  style: { stroke: '#e2e2e2', lineWidth: 2, endArrow: true },
}

// 折线（正交路由）
edge: {
  type: 'polyline',
  style: { router: 'orth', radius: 8 },
}
```

样式仅暴露可在 WebGL 下高效实现的属性,便于大规模渲染。

## 相关 [#相关]

* [节点样式](/docs/guide/node) — 节点的类型与样式。
* 可运行示例:`edge-types` / `edge-arrows` / `edge-colors` / `edge-loops` / `edge-states`（见 [playground](https://github.com/antvis/G6Lite/tree/master/playground/demos)）。
