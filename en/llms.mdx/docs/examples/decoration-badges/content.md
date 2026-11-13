# Node badges (/en/docs/examples/decoration-badges)





Stack count, status, and text badges on a node boundary.

## Try it

Orders has 5 badges, initially two plus an overflow marker. Hover ··· to expand all 5; leave to collapse. Refresh keeps a single set of badges.

## Data

Three nodes stack built-in badges on their boundary.

## Complete runnable code

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

## Steps and expected results [#steps-and-expected-results]

1. The 订单 (orders) node has 5 badge items. With `maxVisible: 3`, it initially shows a count, a warning, and `···`, with 3 items hidden. The 用户 (users) node shows both items; 审计 (audit) shows its single item.
2. Move the pointer over `···` beside orders to expand all 5 items. Leave the expanded region to fold them again.
3. Change `maxVisible` to `5` in the source and click Run: all badges should appear immediately. Reset restores the original example.

The key options are in `node.decorations[]`: `items` reads each node's business data, `anchor` and `boundaryOverlap` control boundary alignment, and `overflowData` provides the hover target. Badges and node labels are configured separately.

See the [node guide](/en/docs/guides/node) and [decoration usage](/en/docs/guides/extensions#decoration-visibility); consult the [decoration reference](/en/docs/api/options#config-node-decoration) for complete definitions.


## Related documentation

- [Node decorations](/en/docs/guides/custom-decoration)
- [Node reference](/en/docs/api/options#options-node)