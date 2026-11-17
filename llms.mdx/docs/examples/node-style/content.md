# 节点数据映射样式 (/docs/examples/node-style)





按业务字段动态设置节点颜色、尺寸和高亮交互。

## 如何体验

悬停节点或边，观察关联高亮。

## 数据说明

cluster=a 映射蓝色，cluster=b 映射绿色。主节点 A 的 role 为 lead，尺寸为 36，其他节点为 24。

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
        { id: '0', name: 'A', x: 0, y: 96, data: { cluster: 'a', role: 'lead' } },
        { id: '1', name: 'B', x: 124, y: 26, data: { cluster: 'b' } },
        { id: '2', name: 'C', x: 190, y: 160, data: { cluster: 'a' } },
        { id: '3', name: 'D', x: 254, y: 26, data: { cluster: 'b' } },
        { id: '4', name: 'E', x: 380, y: 96, data: { cluster: 'a' } },
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
        size: (d) => (d.data?.role === 'lead' ? 36 : 24),
        label: (d) => d.name ?? d.id,
        labelPlacement: 'bottom',
        labelFontSize: 13,
      },
    },
    label: { scaleWithZoom: false },
    edge: { type: 'line', style: { lineWidth: 3, stroke: '#8b9ec2' } },
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