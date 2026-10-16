/**
 * Demo: 布局 — 同一数据切换 circular / force / grid / dagre
 */
import { Graph } from '../../src/index.ts';
import { mountChoiceSelect } from './demo-panel.ts';

const data = {
  nodes: [
    { id: '0' }, { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' },
    { id: '5' }, { id: '6' }, { id: '7' }, { id: '8' }, { id: '9' },
  ],
  edges: [
    { source: '0', target: '1' }, { source: '0', target: '2' }, { source: '1', target: '3' },
    { source: '2', target: '4' }, { source: '3', target: '5' }, { source: '4', target: '5' },
    { source: '5', target: '6' }, { source: '6', target: '7' }, { source: '6', target: '8' },
    { source: '7', target: '9' }, { source: '8', target: '9' },
  ],
};

const LAYOUTS = [
  { type: 'circular', radius: 180 },
  { type: 'force', linkDistance: 80 },
  { type: 'grid', rows: 2, cols: 5 },
  { type: 'dagre', rankdir: 'TB', nodesep: 30, ranksep: 40 },
] as const;

let currentGraph: Graph | null = null;

export async function run(container: string | HTMLElement) {
  const wrapper = typeof container === 'string'
    ? document.querySelector<HTMLElement>(container)!
    : container;
  wrapper.replaceChildren();
  wrapper.style.cssText = 'position:relative;width:100%;height:100%;min-height:0;';

  const canvasParent = document.createElement('div');
  canvasParent.style.cssText = 'position:absolute;inset:0;';
  wrapper.appendChild(canvasParent);

  async function renderLayout(index: number) {
    currentGraph?.destroy();
    const layout = LAYOUTS[index];
    currentGraph = new Graph({
      autoFitOnResize: true,
      container: canvasParent,
      data,
      node: { type: 'circle', style: { size: 10 } },
      edge: { type: 'line', style: { endArrow: true } },
      layout: { ...layout },
      behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node'],
      theme: 'light',
    });
    await currentGraph.render();
  }

  await renderLayout(0);

  mountChoiceSelect(wrapper, '布局', ['Circular', 'Force', 'Grid', 'Dagre'], 'Circular', (value) => {
    const index = ['Circular', 'Force', 'Grid', 'Dagre'].indexOf(value);
    if (index >= 0) void renderLayout(index);
  });

  return {
    fitView: () => currentGraph?.fitView({ padding: 64, maxZoom: 1.5 }),
    destroy: () => {
      currentGraph?.destroy();
      currentGraph = null;
      wrapper.querySelector('[data-canvas-controls]')?.remove();
    },
  };
}
