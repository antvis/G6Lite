/**
 * Breathing node demo.
 * Demonstrates the built-in breathing-node extension on selected/highlight states.
 */

import { Graph } from '../../src/index.ts';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
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
  containerEl.style.position = 'relative';

  const panel = document.createElement('div');
  panel.style.cssText =
    'position:absolute;top:10px;right:10px;background:#fff;padding:12px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:12px;z-index:10;';
  panel.innerHTML = `
    <div style="font-weight:600;margin-bottom:8px">Breathing Node</div>
    <button id="toggle-selected">Toggle selected</button>
    <button id="toggle-highlight" style="margin-left:4px">Toggle highlight</button>
  `;
  containerEl.appendChild(panel);

  panel.querySelector('#toggle-selected')!.addEventListener('click', () => {
    const selected = graph.getItemStates('selected').includes('selected');
    graph.setItemState('selected', 'selected', !selected);
  });
  panel.querySelector('#toggle-highlight')!.addEventListener('click', () => {
    const highlighted = graph.getItemStates('highlight').includes('highlight');
    graph.setItemState('highlight', 'highlight', !highlighted);
  });

  return {
    destroy() {
      graph.destroy();
      panel.remove();
    },
  };
}
