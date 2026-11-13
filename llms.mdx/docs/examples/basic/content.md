# 最简关系图 (/docs/examples/basic)





使用最少配置渲染一个可缩放、可拖拽的关系图。

## 如何体验

滚轮缩放，拖拽画布查看不同区域。

## 数据说明

5 个节点和 5 条边组成的最小闭环数据。

## 完整运行代码

```ts
/**
 * Demo: 最简示例 — 少量节点边 + 环形布局
 */
import { Graph } from '@antv/g6-lite';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: '0' },
        { id: '1' },
        { id: '2' },
        { id: '3' },
        { id: '4' },
      ],
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
  return graph;
}
```


## 继续阅读

- [数据接入与更新](/docs/guides/data)
- [图数据字段](/docs/api/options#options-data)