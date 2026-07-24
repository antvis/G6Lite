# 节点样式 (/docs/examples/node-style)





<div className="example-hero">
  <img src="withBasePath('/examples/node-style.png')" alt="节点样式截图" />
</div>

这个示例展示 `node.style` 的函数式写法。颜色和尺寸可以从节点业务字段中读取，适合按集群、类型、风险等级等维度编码。

<div className="example-actions">
  <a href="withBasePath('/playground/#node-style')" target="_blank" rel="noreferrer">
    在线运行
  </a>

  <a href="https://github.com/antvis/G6Lite/tree/master/playground/demos/node-style.ts" target="_blank" rel="noreferrer">
    完整源码
  </a>
</div>

## 代码 [#代码]

```ts
const graph = new Graph({
  container,
  data,
  node: {
    type: 'circle',
    style: {
      fill: (node) => (node.data?.cluster === 'a' ? '#5B8FF9' : '#61DDAA'),
      size: (node) => (node.id === '0' ? 16 : 12),
    },
  },
  edge: { type: 'line', style: { lineWidth: 2 } },
  layout: { type: 'circular', radius: 150 },
  behaviors: ['zoom-canvas', 'drag-canvas', 'highlight-node', 'highlight-edge'],
  theme: 'light',
});

await graph.render();
```

## 相关文档 [#相关文档]

* [节点](/docs/guides/node)
* [交互总览](/docs/interactions/overview)
* [性能调优](/docs/advanced/performance-tuning)
