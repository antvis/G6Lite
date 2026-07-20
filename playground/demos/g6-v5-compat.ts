/**
 * Custom node extension demo.
 * Demonstrates: BaseNode/registerNode, explicit edge IDs, and Combo state API.
 */

import { BaseNode, Graph, registerNode } from '../../src/index.ts';

class StatusBadgeNode extends BaseNode {
  base = 'rect' as const;
  style = {
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
  };

  getStyle(node: { data?: Record<string, unknown> }) {
    const role = node.data?.role;
    if (role === 'entry') return { fill: '#2E8B57', stroke: '#1F6B43' };
    if (role === 'compute') return { fill: '#D8911B', stroke: '#A86E12' };
    if (role === 'storage') return { fill: '#4E6E8E', stroke: '#35506B' };
    return { fill: '#64748b', stroke: '#475569' };
  }
}

registerNode('status-badge-node', StatusBadgeNode);

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
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
    layout: { type: 'dagre', rankdir: 'LR', nodesep: 45, ranksep: 90 },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'click-select', 'hover-highlight'],
  });

  await graph.render();
  graph.setComboState('demo-combo', 'selected', true);

  const containerEl =
    typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  containerEl.style.position = 'relative';

  const panel = document.createElement('div');
  panel.style.cssText =
    'position:absolute;top:10px;right:10px;background:#fff;padding:12px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:12px;z-index:10;min-width:220px;';
  panel.innerHTML = `
    <div style="font-weight:600;margin-bottom:8px">Custom Node + Edge ID</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button id="combo-state">Toggle combo state</button>
      <button id="edge-state">Select explicit edgeId</button>
    </div>
    <div id="compat-log" style="margin-top:8px;color:#666;font:11px ui-monospace,SFMono-Regular,Menlo,monospace">
      demo-combo states: selected
    </div>
  `;
  containerEl.appendChild(panel);

  const log = panel.querySelector<HTMLElement>('#compat-log')!;
  const setLog = (text: string) => {
    log.textContent = text;
  };

  panel.querySelector('#combo-state')!.addEventListener('click', () => {
    const selected = graph.getComboStates('demo-combo').includes('selected');
    graph.setComboState('demo-combo', 'selected', !selected);
    setLog(`demo-combo states: ${graph.getComboStates('demo-combo').join(', ') || '(none)'}`);
  });

  panel.querySelector('#edge-state')!.addEventListener('click', () => {
    graph.setItemState('edge-worker-a-store', 'selected', true);
    setLog('selected edgeId: edge-worker-a-store');
  });

  graph.on('edge:click', (payload: { edgeId?: string }) => {
    setLog(`edge:click edgeId=${payload.edgeId}`);
  });
  graph.on('combo:click', (payload: { comboId: string }) => {
    setLog(`combo:click comboId=${payload.comboId}`);
  });

  return {
    destroy() {
      graph.destroy();
      panel.remove();
    },
  };
}
