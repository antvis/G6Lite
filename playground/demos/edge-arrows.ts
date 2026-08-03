/**
 * Demo: Arrow directions - none / forward / bidirectional
 */
import { Graph } from '../../src/index.ts';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'n1', name: 'No arrow', x: 80, y: 120 },
        { id: 't1', name: '', x: 280, y: 120 },
        { id: 'n2', name: 'Forward', x: 400, y: 120 },
        { id: 't2', name: '', x: 600, y: 120 },
        { id: 'n3', name: 'Bidirectional', x: 80, y: 280 },
        { id: 't3', name: '', x: 280, y: 280 },
        { id: 'n4', name: 'Thick + arrow', x: 400, y: 280 },
        { id: 't4', name: '', x: 600, y: 280 },
      ],
      edges: [
        { source: 'n1', target: 't1', data: { dir: 'none' } },
        { source: 'n2', target: 't2', data: { dir: 'forward' } },
        { source: 'n3', target: 't3', data: { dir: 'both' } },
        { source: 'n4', target: 't4', data: { dir: 'forward', lw: 6 } },
      ],
    },
    node: { type: 'circle', style: { fill: '#5B8FF9', size: 24 } },
    edge: {
      type: 'line',
      style: {
        stroke: '#99ADD1',
        lineWidth: (_s: any, _t: any, e: any) => e.data?.lw ?? 2,
        endArrow: (_s: any, _t: any, e: any) => e.data?.dir !== 'none',
        startArrow: (_s: any, _t: any, e: any) => e.data?.dir === 'both',
      },
    },
    theme: 'light',
  });

  await graph.render();
  return {
    fitView: () => graph.fitView({ padding: 64, maxZoom: 1.5 }),
    destroy: () => graph.destroy(),
  };
}
