const n=`import { Graph } from '../../src/index.ts';
import { buttonStyle, createDemoPanel } from './demo-panel.ts';

const button = (action: string, label: string) =>
  \`<button data-action="\${action}" style="\${buttonStyle}">\${label}</button>\`;

const NODES = Array.from({ length: 18 }, (_, index) => ({
  id: \`service-\${index + 1}\`,
  x: (index % 6) * 160,
  y: Math.floor(index / 6) * 180,
  data: {
    label: \`Service \${String(index + 1).padStart(2, '0')}\`,
    fill: ['#5B8FF9', '#5AD8A6', '#F6BD16'][Math.floor(index / 6)],
  },
}));

const EDGES = NODES.slice(1).map((node, index) => ({
  id: \`route-\${index + 1}\`,
  source: NODES[index].id,
  target: node.id,
  data: { label: \`route \${index + 1}\` },
}));

export async function run(container: string | HTMLElement) {
  const root =
    typeof container === 'string' ? (document.querySelector(container)! as HTMLElement) : container;
  // Reserve left room for the bottom-left status block. Scale the reservation
  // with the container so narrow hosts (e.g. the docs site preview) are not
  // squeezed against the right edge while wide canvases keep the full gap.
  const leftReserve = Math.round(Math.min(360, Math.max(160, root.clientWidth * 0.28)));
  const viewPadding: [number, number, number, number] = [90, 70, 70, leftReserve];
  const graph = new Graph({
    autoFit: { padding: viewPadding, maxZoom: 0.4 },
    container: root,
    data: { nodes: NODES, edges: EDGES },
    label: {
      scaleWithZoom: false,
      hideOnLowZoom: false,
      hideOnCollision: false,
    },
    node: {
      style: {
        size: 30,
        fill: (node) => String(node.data?.fill ?? '#5B8FF9'),
        stroke: '#fff',
        strokeWidth: 2,
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'bottom',
        labelFontSize: 12,
        labelColor: '#1e293b',
        labelBackground: 'rgba(255,255,255,0.9)',
        labelBackgroundPadding: 3,
      },
    },
    edge: {
      style: {
        stroke: '#94a3b8',
        endArrow: true,
        label: (_source, _target, edge) => String(edge.data?.label ?? edge.id ?? ''),
        labelFontSize: 10,
        labelColor: '#475569',
        labelBackground: 'rgba(255,255,255,0.88)',
        labelBackgroundPadding: 2,
      },
    },
    behaviors: ['zoom-canvas', 'drag-canvas'],
  });
  await graph.render();

  const ui = createDemoPanel(
    root,
    '标签渲染策略开关',
    '对比字号随 zoom 缩放、低 zoom 隐藏和碰撞隐藏。初始为三项全部关闭。',
    [
      button('all-labels', '全部标签'),
      button('default-policy', '默认策略'),
      button('zoom-02', 'zoom 0.2'),
      button('zoom-04', 'zoom 0.4'),
      button('zoom-10', 'zoom 1.0'),
    ].join(''),
  );

  let allLabels = true;
  let zoom = 0.4;

  const updateStatus = () => {
    ui.setStatus(
      \`\${allLabels ? '全部标签：三项策略关闭' : '默认策略：三项策略开启'}\\n\` +
        \`zoom=\${zoom.toFixed(1)}\\n\` +
        \`\${allLabels ? '固定字号 · 不做低 zoom 隐藏 · 不做碰撞隐藏' : '字号随 zoom · 节点<0.3/边<0.5 隐藏 · 碰撞隐藏'}\`,
    );
  };

  const setZoom = (nextZoom: number) => {
    zoom = nextZoom;
    graph.fitView({ padding: viewPadding, minZoom: zoom, maxZoom: zoom });
    updateStatus();
  };

  const setLabelPolicy = (showAll: boolean) => {
    allLabels = showAll;
    graph.updateOptions({
      label: {
        scaleWithZoom: !showAll,
        hideOnLowZoom: !showAll,
        hideOnCollision: !showAll,
      },
    });
    updateStatus();
  };

  ui.controls.addEventListener('click', (event) => {
    const action = (event.target as HTMLElement).dataset.action;
    if (action === 'all-labels') setLabelPolicy(true);
    else if (action === 'default-policy') setLabelPolicy(false);
    else if (action === 'zoom-02') setZoom(0.2);
    else if (action === 'zoom-04') setZoom(0.4);
    else if (action === 'zoom-10') setZoom(1);
  });

  setZoom(zoom);

  return {
    fitView: () => setZoom(zoom),
    destroy() {
      graph.destroy();
      ui.panel.remove();
    },
  };
}
`;export{n as default};
