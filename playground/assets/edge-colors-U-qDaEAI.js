const n=`/**
 * Demo: Edge colors - category palette
 */
import { Graph } from '../../src/index.ts';

const PALETTE = ['#1783FF', '#00C9C9', '#F08F56', '#D580FF', '#7863FF', '#DB9D0D', '#60C42D', '#FF80CA', '#2491B3', '#17C76F'];

export async function run(container: string | HTMLElement) {
  const nodes: { id: string; name: string; x: number; y: number }[] = [];
  const edges: { source: string; target: string; data: { idx: number } }[] = [];

  for (let i = 0; i < 10; i++) {
    const x = 60 + i * 100;
    nodes.push({ id: \`s\${i}\`, name: PALETTE[i].slice(1, 4), x, y: 60 });
    nodes.push({ id: \`t\${i}\`, name: '', x, y: 200 });
    edges.push({ source: \`s\${i}\`, target: \`t\${i}\`, data: { idx: i } });
  }

  const graph = new Graph({
    autoFitOnResize: true,
    container,
    data: { nodes, edges },
    node: { type: 'circle', style: { fill: '#5B8FF9', size: 20 } },
    edge: {
      type: 'line',
      style: {
        stroke: (_s: any, _t: any, e: any) => PALETTE[e.data?.idx % PALETTE.length],
        lineWidth: 3,
        endArrow: true,
      },
    },
    theme: 'light',
  });

  await graph.render();
  return {
    fitView: () => graph.fitView(),
    destroy: () => graph.destroy(),
  };
}
`;export{n as default};
