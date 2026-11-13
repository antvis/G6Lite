/**
 * Demo: 节点标签 / 边标签 / 节点图标
 */
import { Graph, type GraphEdge, type GraphNode, type LabelPlacement } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

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

// Text icons use the first letter of each node's business type.
const iconForNode = (node: GraphNode) => String(node.data?.type ?? '').slice(0, 1).toUpperCase();

export async function run(container: string | HTMLElement) {
  const el = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;

  el.style.position = 'relative';

  const graph = new Graph({
    autoFit: true,
    container: el,
    data: DATA,
    layout: { type: 'circular', radius: 180 },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node'],
    node: {
      style: {
        size: 20,
        fill: '#5B8FF9',
        icon: iconForNode,
        iconType: 'text',
        iconFontSize: 12,
        iconColor: '#fff',
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

  const ui = createDemoPanel(el);
  ui.addChoice<LabelPlacement>('标签', ['bottom', 'center', 'top', 'left', 'right'], 'bottom', (value) => {
    graph.updateOptions({ node: { style: { labelPlacement: value } } });
  });

  let edgeLabelsVisible = true;
  let iconsVisible = true;
  ui.addAction('切换边标签', () => {
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
  });
  ui.addAction('切换节点图标', () => {
    iconsVisible = !iconsVisible;
    graph.updateOptions({ node: { style: { icon: iconsVisible ? iconForNode : false } } });
  });
  ui.addChoice('布局', ['circular', 'force'], 'circular', async (value) => {
    graph.setLayout(value === 'circular' ? { type: 'circular', radius: 180 } : { type: 'd3-force' });
    await graph.layout();
    graph.fitView();
  });

  return {
    getData: () => graph.getData(),
    fitView: () => graph.fitView(),
    destroy() {
      graph.destroy();
      ui.destroy();
    },
  };
}
