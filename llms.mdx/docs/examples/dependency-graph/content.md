# 调用链 (/docs/examples/dependency-graph)





用从左到右的层级布局展示服务之间的调用关系。

## 如何体验

悬停服务节点，查看上下游高亮。

## 数据说明

服务节点按调用方向从左向右排列。

## 完整运行代码

```ts
/**
 * Demo: a left-to-right service call chain.
 */
import { Graph } from '@antv/g6-lite';

const CALLS: Array<[string, string, string]> = [
  ['gateway', '网关', 'auth'],
  ['auth', '鉴权', 'user'],
  ['auth', '鉴权', 'order'],
  ['user', '用户', 'profile'],
  ['order', '订单', 'inventory'],
  ['order', '订单', 'payment'],
  ['inventory', '库存', 'warehouse'],
  ['payment', '支付', 'ledger'],
];

export async function run(container: string | HTMLElement) {
  const nodes = new Map<string, string>();
  for (const [source, sourceLabel, target] of CALLS) nodes.set(source, sourceLabel);
  nodes.set('profile', '资料');
  nodes.set('warehouse', '仓库');
  nodes.set('ledger', '账本');

  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [...nodes].map(([id, label]) => ({ id, data: { label } })),
      edges: CALLS.map(([source, , target]) => ({ source, target })),
    },
    node: {
      type: 'rect',
      style: {
        fill: '#5B8FF9',
        width: 84,
        height: 34,
        borderRadius: 8,
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'center',
        labelColor: '#fff',
      },
    },
    edge: { style: { endArrow: true, stroke: '#99ADD1', lineWidth: 1.5 } },
    layout: { type: 'dagre', rankdir: 'LR', nodesep: 24, ranksep: 64, nodeSize: [84, 34] },
    behaviors: ['zoom-canvas', 'drag-canvas', 'highlight-node'],
  });
  await graph.render();
  return graph;
}
```


## 继续阅读

- [布局选择](/docs/guides/layout)
- [布局参考](/docs/api/options#options-layout)