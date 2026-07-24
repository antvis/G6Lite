const e=`/**
 * Demo: process-parallel-edges
 */
import { Graph, type TooltipContext } from '../../src/index.ts';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'source', name: 'Source', x: 180, y: 220 },
        { id: 'target', name: 'Target', x: 520, y: 220 },
        { id: 'singleA', name: 'Single A', x: 180, y: 420 },
        { id: 'singleB', name: 'Single B', x: 520, y: 420 },
      ],
      edges: [
        { id: 'e1', source: 'source', target: 'target', data: { label: 'approve' } },
        { id: 'e2', source: 'source', target: 'target', data: { label: 'reject' } },
        { id: 'e3', source: 'source', target: 'target', data: { label: 'review' } },
        { id: 'e4', source: 'source', target: 'target', data: { label: 'archive' } },
        { id: 'r1', source: 'target', target: 'source', data: { label: 'rollback' } },
        { id: 'r2', source: 'target', target: 'source', data: { label: 'notify' } },
        { id: 'single', source: 'singleA', target: 'singleB', data: { label: 'single edge' } },
      ],
    },
    transforms: ['process-parallel-edges'],
    node: {
      type: 'circle',
      style: {
        size: 34,
        fill: (node) => (node.id.startsWith('single') ? '#36B37E' : '#5B8FF9'),
        stroke: '#ffffff',
        strokeWidth: 2,
        label: (node) => node.name ?? node.id,
        labelPlacement: 'bottom',
        labelFontSize: 12,
      },
    },
    edge: {
      parallelEdges: {
        enabled: true,
        offset: 26,
        includeReverse: true,
      },
      style: {
        stroke: (_s, _t, edge) => (edge.source === 'target' ? '#F08F56' : '#6B8FF8'),
        endArrow: true,
        arrowSize: 12,
        label: (_s, _t, edge) => String(edge.data?.label ?? ''),
        labelFontSize: 11,
        labelBackground: 'rgba(255,255,255,0.92)',
        labelBackgroundPadding: 4,
        labelAutoRotate: true,
      },
      stateStyles: {
        selected: { stroke: '#F4664A', lineWidth: 2 },
        active: { stroke: '#00A3A3' },
      },
    },
    behaviors: [
      'zoom-canvas',
      'drag-canvas',
      'drag-node',
      'hover-highlight',
      'click-select',
      {
        type: 'tooltip',
        trigger: 'hover',
        getContent: (ctx: TooltipContext) => {
          if (ctx.itemType === 'edge') {
            const label = (ctx.data as { label?: string } | undefined)?.label ?? ctx.edgeId;
            return \`\${ctx.source} -> \${ctx.target}<br/><span style="color:#8c8c8c">\${label}</span>\`;
          }
          return String(ctx.nodeId);
        },
      },
    ],
    theme: 'light',
  });

  await graph.render();
  return { destroy: () => graph.destroy() };
}
`;export{e as default};
