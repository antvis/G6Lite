import { Graph } from '../../src/index.ts';
import { createDemoPanel } from './demo-panel.ts';

const EDGE_TYPES = [
  { type: 'line' as const, title: '直线 + 箭头' },
  { type: 'arc' as const, title: '弧线 / 平行边' },
  { type: 'cubic' as const, title: '三次曲线' },
  { type: 'polyline' as const, title: '折线' },
];

export async function run(container: string | HTMLElement) {
  const root =
    typeof container === 'string' ? (document.querySelector(container)! as HTMLElement) : container;
  const graphs: Graph[] = [];
  const board = document.createElement('div');
  board.style.cssText =
    'display:grid;grid-template-columns:repeat(2,minmax(280px,1fr));gap:12px;width:100%;height:100%;padding:16px;box-sizing:border-box;';
  root.appendChild(board);

  const ui = createDemoPanel(
    root,
    '边交互热区',
    '边保持 1.5px 视觉宽度，但中心线两侧约 8px 都可悬停或点击。缩放后屏幕热区保持不变。',
    '',
  );

  for (const [index, item] of EDGE_TYPES.entries()) {
    const panel = document.createElement('div');
    panel.className = 'demo-canvas-card';
    panel.style.cssText = 'position:relative;min-height:210px;';
    const title = document.createElement('div');
    title.textContent = item.title;
    title.style.cssText =
      'position:absolute;z-index:2;left:12px;top:10px;font:12px/1.5 system-ui;color:#475569;pointer-events:none;';
    const canvasHost = document.createElement('div');
    canvasHost.style.cssText = 'position:absolute;inset:0;';
    panel.append(title, canvasHost);
    board.appendChild(panel);

    const sourceId = `source-${index}`;
    const targetId = `target-${index}`;
    const graph = new Graph({
      autoFitOnResize: true,
      container: canvasHost,
      data: {
        nodes: [
          { id: sourceId, x: 100, y: 120 },
          { id: targetId, x: 340, y: index === 2 || index === 3 ? 150 : 120 },
        ],
        edges: [
          { id: `edge-${index}`, source: sourceId, target: targetId },
          ...(item.type === 'line'
            ? [{ id: `loop-${index}`, source: sourceId, target: sourceId }]
            : []),
        ],
      },
      node: {
        type: 'circle',
        style: { size: 26, fill: '#1677ff', stroke: '#fff', strokeWidth: 2 },
      },
      edge: {
        type: item.type,
        style: {
          stroke: '#64748b',
          lineWidth: 1.5,
          hitAreaWidth: 16,
          endArrow: true,
          curvature: 0.35,
          curveOffset: 80,
          router: 'orth',
        },
        stateStyles: {
          highlight: { stroke: '#1677ff', lineWidth: 2 },
          selected: { stroke: '#873bf4', lineWidth: 2, hitAreaWidth: 20 },
        },
      },
      behaviors: ['zoom-canvas', 'highlight-edge', 'click-select'],
      theme: 'light',
    });
    graph.on('edge:pointerover', ({ edgeId }) => ui.setStatus(`hover: ${edgeId ?? '-'}`));
    graph.on('edge:pointerleave', () => ui.setStatus('move near a thin edge'));
    graph.on('edge:selectchange', ({ edgeId, selected }) =>
      ui.setStatus(`${selected ? 'selected' : 'unselected'}: ${edgeId ?? '-'}`),
    );
    await graph.render();
    graphs.push(graph);
  }

  ui.setStatus('move near a thin edge');
  return {
    fitView: () => graphs.forEach((graph) => graph.fitView()),
    destroy: () => {
      graphs.forEach((graph) => graph.destroy());
      board.remove();
      ui.panel.remove();
    },
  };
}
