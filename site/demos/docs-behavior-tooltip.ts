import { Graph, type BuiltInBehaviorOptionsMap } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const tooltip: BuiltInBehaviorOptionsMap['tooltip'] = {
    type: 'tooltip', trigger: 'click', className: 'docs-click-tooltip',
    enable: (ctx) => ctx.nodeId !== 'Cache',
    getContent: (ctx) => {
      const card = document.createElement('div');
      card.style.cssText = 'padding:10px 14px;border-radius:8px;background:#163B65;color:white;font:12px system-ui;box-shadow:0 4px 16px #163b6533;';
      const title = document.createElement('strong');
      title.textContent = String(ctx.data?.label ?? ctx.nodeId ?? ctx.edgeId ?? '');
      const detail = document.createElement('div');
      detail.textContent = ctx.itemType === 'node'
        ? `Requests: ${Number(ctx.data?.requests ?? 0)}`
        : `${ctx.source} → ${ctx.target}`;
      card.append(title, detail);
      return card;
    },
  };
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'API', x: 0, y: 0, data: { label: '<API Gateway>', requests: 1280 } },
        { id: 'DB', x: 180, y: 0, data: { label: 'Database', requests: 960 } },
        { id: 'Cache', x: 360, y: 0 },
      ],
      edges: [
        { id: 'request', source: 'API', target: 'DB', data: { label: 'Request' } },
        { id: 'warm', source: 'DB', target: 'Cache', data: { label: 'Warm cache' } },
      ],
    },
    node: { style: { size: 32, label: (node) => node.id, labelOffsetY: 8 } },
    edge: { style: { hitAreaWidth: 12 } },
    behaviors: [tooltip],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
