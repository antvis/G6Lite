const e=`/**
 * Demo: 节点标签 / 边标签 / 节点图标
 */
import { Graph, type GraphEdge, type GraphNode, type LabelPlacement } from '../../src/index.ts';
import { mountCanvasMenu } from './demo-panel.ts';

const DATA = {
  nodes: [
    { id: 'server', data: { name: 'API Server', type: 'server' } },
    { id: 'db', data: { name: 'Database', type: 'database' } },
    { id: 'cache', data: { name: 'Redis Cache', type: 'cache' } },
    { id: 'queue', data: { name: 'Message Queue', type: 'queue' } },
    { id: 'worker', data: { name: 'Worker', type: 'worker' } },
    { id: 'gateway', data: { name: 'API Gateway', type: 'gateway' } },
    { id: 'client', data: { name: 'Client App', type: 'client' } },
    { id: 'monitor', data: { name: 'Monitor', type: 'monitor' } },
  ],
  edges: [
    { source: 'client', target: 'gateway', data: { label: 'HTTPS' } },
    { source: 'gateway', target: 'server', data: { label: 'gRPC' } },
    { source: 'server', target: 'db', data: { label: 'SQL' } },
    { source: 'server', target: 'cache', data: { label: 'TCP' } },
    { source: 'server', target: 'queue', data: { label: 'AMQP' } },
    { source: 'queue', target: 'worker', data: { label: 'consume' } },
    { source: 'worker', target: 'db', data: { label: 'write' } },
    { source: 'monitor', target: 'server', data: { label: 'metrics' } },
    { source: 'monitor', target: 'gateway', data: { label: 'health' } },
  ],
};

export async function run(container: string | HTMLElement) {
  const el = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;

  el.style.position = 'relative';

  const graph = new Graph({
    autoFitOnResize: true,
    container: el,
    data: DATA,
    layout: { type: 'circular', radius: 180 },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node'],
    node: {
      style: {
        size: 20,
        fill: '#5B8FF9',
        label: (n) => (n.data?.name as string | undefined) ?? n.id,
        labelPlacement: 'bottom',
        labelFontSize: 12,
        labelColor: '#333',
      },
    },
    edge: {
      style: {
        label: (s, t, e) => (e.data?.label as string) ?? '',
        labelFontSize: 10,
        labelColor: '#666',
        labelAutoRotate: true,
      },
    },
    theme: 'light',
  });
  await graph.render();

  const placements: LabelPlacement[] = ['bottom', 'center', 'top', 'right'];
  mountCanvasMenu(el, {
    caption: '标签',
    items: placements.map((placement) => ({ value: placement, label: placement })),
    value: 'bottom',
    onSelect(value) {
      graph.updateOptions({ node: { style: { labelPlacement: value as LabelPlacement } } });
    },
  });

  let edgeLabelsVisible = true;
  mountCanvasMenu(el, {
    caption: '操作',
    action: true,
    items: [
      { value: 'edge-labels', label: '切换边标签' },
      { value: 'circular', label: 'circular' },
      { value: 'force', label: 'force' },
    ],
    value: '',
    onSelect(value) {
      if (value === 'edge-labels') {
        edgeLabelsVisible = !edgeLabelsVisible;
        graph.updateOptions({
          edge: {
            style: {
              label: edgeLabelsVisible
                ? ((_source: GraphNode, _target: GraphNode, edge: GraphEdge) =>
                    (edge.data?.label as string | undefined) ?? '')
                : false,
            },
          },
        });
        return;
      }
      const applyLayout = async () => {
        if (value === 'circular') graph.setLayout({ type: 'circular', radius: 180 });
        else graph.setLayout({ type: 'd3-force' });
        await graph.layout();
        graph.fitView();
      };
      void applyLayout();
    },
  });

  return {
    fitView: () => graph.fitView(),
    destroy() {
      graph.destroy();
      el.querySelector(':scope > [data-canvas-controls]')?.remove();
    },
  };
}
`;export{e as default};
