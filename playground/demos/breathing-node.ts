/**
 * Breathing node demo.
 * Demonstrates the built-in breathing-node extension on selected/highlight states.
 */

import { Graph } from '../../src/index.ts';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: 'selected', x: 180, y: 180, data: { label: 'Selected' }, states: ['selected'] },
        { id: 'highlight', x: 360, y: 180, data: { label: 'Highlight' }, states: ['highlight'] },
        { id: 'normal', x: 540, y: 180, data: { label: 'Normal' } },
      ],
      edges: [
        { id: 'edge-selected-highlight', source: 'selected', target: 'highlight' },
        { id: 'edge-highlight-normal', source: 'highlight', target: 'normal' },
      ],
    },
    node: {
      type: 'breathing-node',
      style: {
        size: 36,
        fill: '#1677ff',
        stroke: '#fff',
        strokeWidth: 2,
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'bottom',
        labelFontSize: 12,
      },
      stateStyles: {
        selected: { fill: '#1677ff', stroke: '#003eb3', strokeWidth: 3, haloWidth: 16 },
        highlight: { fill: '#2E8B57', stroke: '#1F6B43', strokeWidth: 3, haloWidth: 12 },
      },
    },
    edge: {
      style: {
        stroke: '#d1d5db',
        lineWidth: 2,
        endArrow: true,
      },
    },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'click-select'],
  });

  await graph.render();

  const containerEl =
    typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;

  const ui = createDemoPanel(
    containerEl,
    '呼吸节点',
    '切换选中和高亮，观察节点呼吸动画。',
    '<button data-action="selected">切换选中</button><button data-action="highlight">切换高亮</button>',
  );
  ui.controls.addEventListener('click', (event) => {
    const action = (event.target as HTMLElement).dataset.action;
    if (action !== 'selected' && action !== 'highlight') return;
    const active = graph.getItemStates(action).includes(action);
    graph.setItemState(action, action, !active);
  });

  return {
    fitView: () => graph.fitView(),
    destroy() {
      graph.destroy();
      ui.panel.remove();
    },
  };
}
