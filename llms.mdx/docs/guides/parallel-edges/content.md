# 平行边与自环处理 (/docs/guides/parallel-edges)





同一对节点之间存在多条边时，默认直线会重叠。可以启用 `process-parallel-edges` transform 让平行边自动错开。

处理前后与自环的效果示意：多条边从重叠变为可区分的路径，自环连接同一个节点。

<img alt="三条平行边处理前重叠、处理后错开及多个自环的示意" src="__img0" title="平行边与自环" />

可运行示例：[平行边](/docs/examples/parallel-edges)、[自环](/docs/examples/edge-loops)。

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
