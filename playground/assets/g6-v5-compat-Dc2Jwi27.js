const e=`/**
 * Custom node extension demo.
 * Demonstrates: function-style node registration, explicit edge IDs, and Combo state API.
 */

import { Graph, register, type NodeExtension } from '../../src/index.ts';
import { createDemoPanel } from './demo-panel.ts';

const statusBadgeNode: NodeExtension = {
  base: 'rect',
  style: {
    size: 42,
    width: 96,
    height: 34,
    borderRadius: 8,
    strokeWidth: 2,
    label: (node) => String(node.data?.label ?? node.id),
    labelPlacement: 'center' as const,
    labelFontSize: 11,
    labelColor: '#fff',
    iconType: 'text' as const,
    icon: (node) => String(node.data?.icon ?? ''),
    iconFontSize: 13,
    iconColor: '#fff',
    iconOffsetX: -32,
  },

  getStyle(node: { data?: Record<string, unknown> }) {
    const role = node.data?.role;
    if (role === 'entry') return { fill: '#2E8B57', stroke: '#1F6B43' };
    if (role === 'compute') return { fill: '#D8911B', stroke: '#A86E12' };
    if (role === 'storage') return { fill: '#4E6E8E', stroke: '#35506B' };
    return { fill: '#64748b', stroke: '#475569' };
  },
};

register('node', 'status-badge-node', statusBadgeNode);

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: 'gateway', comboId: 'demo-combo', data: { label: 'Gateway', role: 'entry', icon: 'G' }, states: ['selected'] },
        { id: 'worker-a', comboId: 'demo-combo', data: { label: 'Worker A', role: 'compute', icon: 'A' } },
        { id: 'worker-b', comboId: 'demo-combo', data: { label: 'Worker B', role: 'compute', icon: 'B' } },
        { id: 'store', comboId: 'demo-combo', data: { label: 'Store', role: 'storage', icon: 'S' } },
        { id: 'index', comboId: 'demo-combo', data: { label: 'Index', role: 'storage', icon: 'I' } },
      ],
      edges: [
        { id: 'edge-gateway-worker-a', source: 'gateway', target: 'worker-a' },
        { id: 'edge-gateway-worker-b', source: 'gateway', target: 'worker-b' },
        { id: 'edge-worker-a-store', source: 'worker-a', target: 'store' },
        { id: 'edge-worker-b-index', source: 'worker-b', target: 'index' },
      ],
      combos: [
        { id: 'demo-combo', data: { name: 'Demo Combo' } },
      ],
    },
    node: {
      type: 'status-badge-node',
      stateStyles: {
        selected: { stroke: '#003eb3', strokeWidth: 3, haloWidth: 16 },
        active: { stroke: '#1677ff', strokeWidth: 3 },
        highlight: { stroke: '#1677ff', strokeWidth: 3 },
      },
    },
    edge: {
      style: {
        stroke: '#9ca3af',
        lineWidth: 2,
        endArrow: true,
        label: (_s, _t, edge) => edge.id ?? '',
        labelFontSize: 10,
        labelBackground: 'rgba(255,255,255,0.86)',
      },
      stateStyles: {
        selected: { stroke: '#1677ff', lineWidth: 3 },
      },
    },
    combo: {
      style: {
        padding: 42,
        borderRadius: 10,
        fill: 'rgba(22, 119, 255, 0.06)',
        stroke: 'rgba(22, 119, 255, 0.28)',
        label: (combo) => String(combo.data?.name ?? combo.id),
        labelFontSize: 13,
      },
    },
    layout: { type: 'dagre', rankdir: 'LR', nodesep: 45, ranksep: 90, nodeSize: [96, 34] },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'click-select', 'hover-highlight'],
  });

  await graph.render();
  graph.setComboState('demo-combo', 'selected', true);

  const containerEl =
    typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;

  const ui = createDemoPanel(
    containerEl,
    '自定义节点',
    'demo-combo states: selected',
    '<button data-action="combo">切换 Combo 状态</button><button data-action="edge">选中显式边 ID</button>',
  );

  ui.controls.addEventListener('click', (event) => {
    const action = (event.target as HTMLElement).dataset.action;
    if (action === 'combo') {
      const selected = graph.getComboStates('demo-combo').includes('selected');
      graph.setComboState('demo-combo', 'selected', !selected);
      ui.setStatus(\`demo-combo states: \${graph.getComboStates('demo-combo').join(', ') || '(none)'}\`);
      return;
    }
    if (action === 'edge') {
      graph.setItemState('edge-worker-a-store', 'selected', true);
      ui.setStatus('selected edgeId: edge-worker-a-store');
    }
  });

  graph.on('edge:click', (payload: { edgeId?: string }) => {
    ui.setStatus(\`edge:click edgeId=\${payload.edgeId}\`);
  });
  graph.on('combo:click', (payload: { comboId: string }) => {
    ui.setStatus(\`combo:click comboId=\${payload.comboId}\`);
  });

  return {
    fitView: () => graph.fitView(),
    destroy() {
      graph.destroy();
      ui.panel.remove();
    },
  };
}
`;export{e as default};
