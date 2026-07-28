# 平行边与自环处理 (/docs/guides/parallel-edges)



同一对节点之间存在多条边时，默认直线会重叠。可以启用 `process-parallel-edges` transform 让平行边自动错开。

```ts
const graph = new Graph({
  container: 'container',
  data,
  edge: {
    type: 'arc',
    style: {
      endArrow: true,
      lineWidth: 2,
    },
  },
  transforms: [
    {
      type: 'process-parallel-edges',
      distance: 18,
    },
  ],
});
```

## 使用建议 [#使用建议]

* 平行边较多时，优先使用 `arc` 或 `cubic`。
* 有方向语义时开启 `endArrow`。
* 标签较多时，避免所有平行边同时显示标签。
* 若业务侧有边分组语义，可以把分组信息放在 `edge.data` 中，用颜色或标签区分。

## 示例入口 [#示例入口]

* `playground/demos/parallel-edges.ts`
* `playground/demos/edge-loops.ts`
* `playground/demos/edge-arrows.ts`

见 [示例总览](/docs/examples)。
