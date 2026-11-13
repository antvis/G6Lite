# 折线与正交路由 (/docs/examples/polyline-routing)





用圆角正交折线连接从左到右的流程节点。

## 如何体验

缩放和平移，观察正交圆角折线连接端点边界；该路由不是全图避障算法，刷新恢复初始视野。

## 数据说明

5 个矩形节点用正交圆角折线连接。

## 完整运行代码

```ts
/**
 * Demo: orthogonal polyline edges with rounded corners.
 */
import { Graph } from '@antv/g6-lite';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: 'request', data: { label: '请求' } },
        { id: 'auth', data: { label: '鉴权' } },
        { id: 'cache', data: { label: '缓存' } },
        { id: 'service', data: { label: '服务' } },
        { id: 'db', data: { label: '数据库' } },
      ],
      edges: [
        { source: 'request', target: 'auth' },
        { source: 'auth', target: 'cache' },
        { source: 'auth', target: 'service' },
        { source: 'service', target: 'db' },
        { source: 'cache', target: 'db' },
      ],
    },
    node: {
      type: 'rect',
      style: {
        fill: '#5B8FF9',
        width: 88,
        height: 36,
        borderRadius: 8,
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'center',
        labelColor: '#fff',
      },
    },
    edge: {
      type: 'polyline',
      style: {
        stroke: '#8C8C8C',
        lineWidth: 1.5,
        endArrow: true,
        radius: 12,
        router: 'orth',
      },
    },
    layout: { type: 'dagre', rankdir: 'LR', nodesep: 28, ranksep: 72, nodeSize: [88, 36] },
    behaviors: ['zoom-canvas', 'drag-canvas'],
  });
  await graph.render();
  return graph;
}
```


## 继续阅读

- [折线路由](/docs/guides/edge#polyline-routing)
- [边参考](/docs/api/options#options-edge)