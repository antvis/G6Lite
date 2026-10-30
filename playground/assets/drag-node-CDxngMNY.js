const n=`/**
 * Demo: drag individual nodes, and drag a combo by its background.
 */
import { Graph } from '../../src/index.ts';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: 'web', data: { label: 'Web' }, x: 160, y: 150, comboId: 'clients' },
        { id: 'app', data: { label: 'App' }, x: 160, y: 250, comboId: 'clients' },
        { id: 'api', data: { label: 'API' }, x: 380, y: 200 },
        { id: 'db', data: { label: 'DB' }, x: 560, y: 140 },
        { id: 'cache', data: { label: 'Cache' }, x: 560, y: 270 },
      ],
      edges: [
        { source: 'web', target: 'api' },
        { source: 'app', target: 'api' },
        { source: 'api', target: 'db' },
        { source: 'api', target: 'cache' },
      ],
      combos: [{ id: 'clients', data: { label: '客户端' } }],
    },
    node: {
      type: 'rect',
      style: {
        fill: '#5B8FF9',
        width: 72,
        height: 32,
        borderRadius: 8,
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'center',
        labelColor: '#fff',
      },
    },
    combo: {
      style: {
        label: (combo) => String(combo.data?.label ?? combo.id),
        labelPlacement: 'top',
      },
    },
    edge: { style: { endArrow: true, stroke: '#99ADD1' } },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node'],
  });
  await graph.render();
  graph.fitView({ padding: 48, maxZoom: 1.4 });
  return graph;
}
`;export{n as default};
