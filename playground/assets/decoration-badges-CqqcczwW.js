const n=`/**
 * Demo: stack built-in badges on a node boundary.
 */
import { Graph, type NodeBadgeItem } from '../../src/index.ts';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    // Padding covers the boundary badges extending past the rightmost node.
    autoFitOnResize: { padding: 56, maxZoom: 1.5 },
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
`;export{n as default};
