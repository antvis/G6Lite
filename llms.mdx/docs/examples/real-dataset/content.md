# 真实数据集 (/docs/examples/real-dataset)





<div className="example-hero">
  <img src="withBasePath('/examples/real-dataset.png')" alt="真实数据集截图" />
</div>

这个示例使用真实网络数据集，复用数据内置坐标，不重新运行布局。它适合验证大图渲染、拖拽、缩放和邻居高亮的真实表现。

<div className="example-actions">
  <a href="http://localhost:5179/#real-dataset" target="_blank" rel="noreferrer">
    本地运行
  </a>

  <a href="https://github.com/antvis/G6Lite/tree/master/playground/demos/real-dataset.ts" target="_blank" rel="noreferrer">
    完整源码
  </a>
</div>

## 代码 [#代码]

```ts
const data = await fetch('/datasets/ai-papers.json').then((res) => res.json());

const graph = new Graph({
  container,
  data,
  node: {
    type: 'circle',
    style: {
      fill: (node) => {
        const color = node.data?.color as string | undefined;
        if (color) return color;
        const cluster = Number(node.data?.cluster ?? 0);
        return palette[cluster % palette.length];
      },
      size: 4,
    },
  },
  edge: { type: 'line', style: { lineWidth: 0.4, stroke: '#ccc' } },
  behaviors: ['zoom-canvas', 'drag-canvas', 'highlight-node'],
  theme: 'light',
});

await graph.render();
```

## 相关文档 [#相关文档]

* [性能指标](/docs/metrics/performance)
* [性能调优](/docs/advanced/performance-tuning)
