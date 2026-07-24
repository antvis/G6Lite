const n=`/**
 * Demo: edge weight x state matrix
 *
 * 7 rows (default/level 1-6) x 6 columns (Default/Active/Selected/Disabled/Highlight/Inactive)
 * Aligned with design spec 2.1 + 2.2
 */
import { Graph, type EdgeState } from '../../src/index.ts';

export async function run(container: string | HTMLElement) {
  const states: EdgeState[] = ['default', 'active', 'selected', 'disabled', 'highlight', 'inactive'];
  const lineWidths = [1, 2, 4, 6, 8, 10, 12];

  const startX = 80;
  const gapX = 200;
  const startY = 80;
  const gapY = 80;
  const edgeLen = 120;

  const nodes: { id: string; name: string; x: number; y: number }[] = [];
  const edges: { source: string; target: string; states?: EdgeState[]; data?: Record<string, unknown> }[] = [];

  for (let row = 0; row < lineWidths.length; row++) {
    for (let col = 0; col < states.length; col++) {
      const state = states[col];
      const srcId = \`r\${row}-c\${col}-src\`;
      const tgtId = \`r\${row}-c\${col}-tgt\`;
      const x = startX + col * gapX;
      const y = startY + row * gapY;

      nodes.push({ id: srcId, name: '', x, y });
      nodes.push({ id: tgtId, name: '', x: x + edgeLen, y });

      edges.push({
        source: srcId,
        target: tgtId,
        states: state === 'default' ? undefined : [state],
        data: { weight: row },
      });
    }
  }

  const graph = new Graph({
    container,
    data: { nodes, edges },
    node: {
      type: 'circle',
      style: {
        fill: '#5B8FF9',
        size: 24,
      },
    },
    edge: {
      type: 'line',
      style: {
        stroke: '#99ADD1',
        endArrow: true,
        lineWidth: (_src, _tgt, e) => {
          const w = (e.data as Record<string, number>)?.weight ?? 0;
          return lineWidths[w];
        },
      },
    },
    theme: 'light',
  });

  await graph.render();
  return { destroy: () => graph.destroy() };
}
`;export{n as default};
