import { Graph } from '@antv/g6-lite';
import { buttonStyle } from './demo-panel.ts';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: ['A', 'B', 'C', 'D'].map((id) => ({ id })),
      edges: [
        { id: 'A-B', source: 'A', target: 'B' },
        { id: 'A-C', source: 'A', target: 'C' },
        { id: 'B-D', source: 'B', target: 'D' },
        { id: 'C-D', source: 'C', target: 'D' },
      ],
    },
    node: {
      type: 'rect',
      style: { width: 84, height: 32, borderRadius: 5, label: (node) => node.id, labelPlacement: 'center', labelColor: '#fff' },
    },
    // #region routing
    layout: {
      type: 'dagre', rankdir: 'LR',
      nodesep: 40, ranksep: 96, nodeSize: [84, 32],
    },
    edge: {
      type: 'polyline',
      style: { router: 'orth', radius: 16, endArrow: true, lineWidth: 2 },
    },
    // #endregion routing
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 48, maxZoom: 1 },
  });
  const controls = document.createElement('div');
  controls.style.cssText = 'position:absolute;left:12px;top:12px;z-index:20;display:flex;gap:6px;';
  for (const radius of [0, 16]) {
    const button = document.createElement('button');
    button.textContent = `radius ${radius}`;
    button.style.cssText = buttonStyle;
    button.type = 'button';
    button.setAttribute('aria-pressed', String(radius === 16));
    button.addEventListener('click', () => {
      // #region rounding
      graph.updateOptions({ edge: { style: { radius } } });
      // #endregion rounding
      for (const item of controls.querySelectorAll('button')) {
        item.setAttribute('aria-pressed', String(item === button));
      }
    });
    controls.append(button);
  }
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { controls.remove(); destroy(); };
  try {
    await graph.render();
    container.append(controls);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
