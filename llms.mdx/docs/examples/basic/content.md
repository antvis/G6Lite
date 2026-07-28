# 最简示例 (/docs/examples/basic)





<div className="example-hero">
  <img src="withBasePath('/examples/basic.png')" alt="最简示例截图" />
</div>

这个示例展示 G6-GL 的最小使用链路：传入节点和边，配置一个环形布局，启用缩放和拖拽。

<div className="example-actions">
  <a href="withBasePath('/playground/#basic')" target="_blank" rel="noreferrer">
    在线运行
  </a>

  <a href="https://github.com/antvis/G6Lite/tree/master/playground/demos/basic.ts" target="_blank" rel="noreferrer">
    完整源码
  </a>
</div>

## 代码 [#代码]

```ts
import { Graph } from '@antv/g6-gl';

const graph = new Graph({
  container,
  data: {
    nodes: [{ id: '0' }, { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
    edges: [
      { source: '0', target: '1' },
      { source: '0', target: '2' },
      { source: '1', target: '3' },
      { source: '2', target: '4' },
      { source: '3', target: '4' },
    ],
  },
  layout: { type: 'circular', radius: 150 },
  behaviors: ['zoom-canvas', 'drag-canvas'],
  theme: 'light',
});

await graph.render();
```

## 相关文档 [#相关文档]

* [安装与第一个图](/docs/getting-started/quick-start)
* [数据](/docs/guides/data)
* [布局](/docs/guides/layout)
