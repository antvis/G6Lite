# 箭头方向 (/docs/examples/edge-arrows)





<div className="example-hero">
  <img src="withBasePath('/examples/edge-arrows.png')" alt="箭头方向截图" />
</div>

这个示例展示 `startArrow`、`endArrow` 和 `arrowSize` 的组合方式，可用于表达调用方向、依赖方向和双向关系。

<div className="example-actions">
  <a href="http://localhost:5179/#edge-arrows" target="_blank" rel="noreferrer">
    本地运行
  </a>

  <a href="https://github.com/antvis/G6Lite/tree/master/playground/demos/edge-arrows.ts" target="_blank" rel="noreferrer">
    完整源码
  </a>
</div>

## 代码 [#代码]

```ts
const graph = new Graph({
  container,
  data,
  node: { type: 'circle', style: { fill: '#5B8FF9', size: 24 } },
  edge: {
    type: 'line',
    style: {
      stroke: '#99ADD1',
      lineWidth: (_source, _target, edge) => edge.data?.lineWidth ?? 2,
      endArrow: (_source, _target, edge) => edge.data?.dir !== 'none',
      startArrow: (_source, _target, edge) => edge.data?.dir === 'both',
    },
  },
  theme: 'light',
});

await graph.render();
```

## 相关文档 [#相关文档]

* [边](/docs/guides/edge)
* [平行边与自环](/docs/advanced/parallel-edges)
