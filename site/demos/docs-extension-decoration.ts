import { Graph, register, type DecorationRenderer } from '@antv/g6-lite';

// #region renderer
const pill: DecorationRenderer = {
  measure({ ctx, data, dpr }) {
    const text = String(data ?? '');
    ctx.font = 12 * dpr + 'px sans-serif';
    return { width: ctx.measureText(text).width + 12 * dpr, height: 22 * dpr, data: { text, unit: dpr } };
  },
  draw({ ctx, layout }) {
    const value = layout.data as { text: string; unit: number } | undefined;
    if (!value) return;
    ctx.fillStyle = '#e6f4ff';
    ctx.fillRect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
    ctx.font = 12 * value.unit + 'px sans-serif';
    ctx.fillStyle = '#0958d9';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(value.text, 0, 0);
  },
};
register('decoration', 'docs-pill', pill);
// #endregion renderer

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 260, y: 0 }],
      edges: [{ source: 'A', target: 'B' }],
    },
    node: {
      style: { size: 40, label: (node) => node.id, labelPlacement: 'center', labelColor: '#fff' },
      // #region placement
      decorations: [{
        renderer: 'docs-pill', placement: 'right', attachment: 'outside',
        layout: 'stack', sort: 'width-desc', itemGap: 4, maxVisible: 2,
        overflow: 'hover-expand', overflowData: (count) => '+' + count,
        items: (node) => node.id === 'A' ? ['CPU 42%', 'API', 'DB', 'Cache', 'Queue'] : ['Ready'],
        hideOnCollision: false,
      }],
      // #endregion placement
    },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 96, maxZoom: 1 },
  });
  try { await graph.render(); return graph; }
  catch (error) { graph.destroy(); throw error; }
}
