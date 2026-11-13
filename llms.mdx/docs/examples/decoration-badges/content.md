# 节点徽章 (/docs/examples/decoration-badges)





在节点边界堆叠计数、状态和文本徽章。

## 如何体验

订单节点有 5 项，初始显示两项与溢出入口；悬停 ··· 展开全部 5 项，移开恢复。刷新后仍只有一套徽章。

## 数据说明

三个节点在边界上堆叠内置徽章。

## 完整运行代码

```ts
/**
 * Demo: stack built-in badges on a node boundary.
 */
import { Graph, type NodeBadgeItem } from '@antv/g6-lite';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    // Padding covers the boundary badges extending past the rightmost node.
    autoFit: { padding: 56 },
    container,
    data: {
      nodes: [
        {
          id: 'orders',
          data: {
            label: '订单',
            badges: [
              { kind: 'count', value: 12 },
              { kind: 'warning' },
              { kind: 'text', text: '优先' },
              { kind: 'lock' },
              { kind: 'favorite' },
            ] satisfies NodeBadgeItem[],
          },
        },
        {
          id: 'users',
          data: {
            label: '用户',
            badges: [
              { kind: 'favorite' },
              { kind: 'lock' },
            ] satisfies NodeBadgeItem[],
          },
        },
        { id: 'audit', data: { label: '审计', badges: [{ kind: 'count', value: 3 }] satisfies NodeBadgeItem[] } },
      ],
      edges: [
        { source: 'users', target: 'orders' },
        { source: 'orders', target: 'audit' },
      ],
    },
    node: {
      type: 'circle',
      style: { size: 56, fill: '#5B8FF9', label: (node) => String(node.data?.label ?? node.id), labelPlacement: 'center', labelColor: '#fff' },
      decorations: [
        {
          renderer: 'builtin-badge',
          placement: 'right',
          attachment: 'boundary',
          anchor: 'start',
          boundaryOverlap: 'half-badge',
          layout: 'stack',
          items: (node) => (node.data?.badges as NodeBadgeItem[] | undefined) ?? [],
          maxVisible: 3,
          overflow: 'hover-expand',
          overflowData: { kind: 'text', text: '···' },
        },
      ],
    },
    edge: { style: { endArrow: true, stroke: '#99ADD1' } },
    layout: { type: 'dagre', rankdir: 'LR', nodesep: 40, ranksep: 120, nodeSize: 56 },
    behaviors: ['zoom-canvas', 'drag-canvas'],
  });
  await graph.render();
  return graph;
}
```

## 操作与预期 [#操作与预期]

1. 初始时，“订单”有 5 项徽章数据，`maxVisible: 3` 使其显示计数、警告和 `···`；其余 3 项收起。“用户”的 2 项和“审计”的 1 项全部显示。
2. 将鼠标移入“订单”右侧的 `···`，应展开全部 5 项；移出展开区域后恢复折叠。
3. 在源码中把 `maxVisible` 改为 `5`，点击“运行”，应直接显示全部徽章；点击“重置”恢复原例。

关键配置在 `node.decorations[]`：`items` 按节点读取业务数据，`anchor` 与 `boundaryOverlap` 控制边界对齐，`overflowData` 提供可悬停的占位项。徽章和节点标签分别配置。

用法见[节点指南](/docs/guides/node)与[装饰扩展](/docs/guides/extensions#decoration-renderer)；完整定义见[节点装饰配置参考](/docs/api/options#config-node-decoration)。


## 继续阅读

- [节点装饰](/docs/guides/custom-decoration)
- [节点参考](/docs/api/options#options-node)