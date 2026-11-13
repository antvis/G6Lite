# 节点数据映射样式 (/docs/examples/node-style)





按业务字段动态设置节点颜色、尺寸和高亮交互。

## 如何体验

悬停节点或边，观察关联高亮。

## 数据说明

cluster=a 映射蓝色、cluster=b 映射绿色；id=0 的节点尺寸为 16，其他节点为 12。

## 完整运行代码

```ts
/**
 * Demo: 节点样式 — 按 data 用函数设置 fill、size
 */
import { Graph } from '@antv/g6-lite';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: '0', name: 'A', data: { cluster: 'a' } },
        { id: '1', name: 'B', data: { cluster: 'b' } },
        { id: '2', name: 'C', data: { cluster: 'a' } },
        { id: '3', name: 'D', data: { cluster: 'b' } },
        { id: '4', name: 'E', data: { cluster: 'a' } },
      ],
      edges: [
        { source: '0', target: '1' },
        { source: '0', target: '2' },
        { source: '1', target: '3' },
        { source: '2', target: '4' },
        { source: '3', target: '4' },
      ],
    },
    node: {
      type: 'circle',
      style: {
        fill: (d) => (d.data?.cluster === 'a' ? '#5B8FF9' : '#61DDAA'),
        size: (d) => (d.id === '0' ? 16 : 12),
      },
    },
    edge: { type: 'line', style: { lineWidth: 2 } },
    layout: { type: 'circular', radius: 150 },
    behaviors: ['zoom-canvas', 'drag-canvas', 'highlight-node', 'highlight-edge'],
    theme: 'light',
  });
  await graph.render();
  return graph;
}
```


## 继续阅读

- [节点配置](/docs/guides/node)
- [节点参考](/docs/api/options#options-node)