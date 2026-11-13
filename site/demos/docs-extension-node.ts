import { Graph, register, type NodeExtension } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

// #region descriptor
const statusNode: NodeExtension = {
  base: 'rect',
  style: { size: 40, width: 100, height: 40, borderRadius: 6, strokeWidth: 2 },
  getStyle(node) {
    return node.data?.status === 'error'
      ? { fill: '#fff1f0', stroke: '#cf1322' }
      : { fill: '#e6f4ff', stroke: '#1677ff' };
  },
  // #region overlay-and-anchor
  drawOverlay(ctx, { x, y, zoom }) {
    ctx.save();
    ctx.fillStyle = '#5366ad';
    ctx.fillRect(x - 44 * zoom, y - 12 * zoom, 4 * zoom, 24 * zoom);
    ctx.restore();
  },
  getBoundaryAnchor({ placement, width, height, crossOffsetRatio }) {
    if (placement === 'right') return { x: width / 2, y: -height / 4 };
    if (placement === 'left') return { x: -width / 2, y: height * crossOffsetRatio };
    return { x: width * crossOffsetRatio, y: placement === 'top' ? -height / 2 : height / 2 };
  },
  // #endregion overlay-and-anchor
};
register('node', 'docs-status-node', statusNode);
// #endregion descriptor

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'A', x: 0, y: 0, data: { status: 'ok' } },
        { id: 'B', x: 240, y: 0, data: { status: 'error' } },
      ],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }],
    },
    node: {
      type: 'docs-status-node',
      style: { label: (node) => node.id, labelPlacement: 'center', labelColor: '#1f2937' },
      stateStyles: { selected: { stroke: '#873bf4', strokeWidth: 4 } },
      decorations: [{ renderer: 'builtin-badge', placement: 'right', attachment: 'boundary', data: { kind: 'count', value: 3 } }],
    },
    edge: { style: { endArrow: true } },
    behaviors: ['click-select', 'zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 64, maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { ui.destroy(); destroy(); };
  try {
    await graph.render();
    ui.addAction('Toggle B status', () => {
      const status = graph.getNodeData('B')?.data?.status === 'error' ? 'ok' : 'error';
      graph.updateNodeData('B', { status });
    });
    return graph;
  }
  catch (error) { graph.destroy(); throw error; }
}
