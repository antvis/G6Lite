/**
 * Demo: 布局 — 同一数据切换 circular / force / grid / dagre
 */
import { Graph } from '../../src/index.ts';

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
    ? document.querySelector(container)!
    : container;
  const canvasParent = document.createElement('div');
  canvasParent.id = 'layout-demo-canvas';
  canvasParent.style.cssText = 'flex:1;min-height:0;';
  wrapper.innerHTML = '';
  wrapper.appendChild(canvasParent);

  async function renderLayout(index: number) {
    currentGraph?.destroy();
    const layout = LAYOUTS[index];
    currentGraph = new Graph({
      container: canvasParent,
      data,
      node: { type: 'circle', style: { size: 10 } },
      edge: { type: 'line' },
      layout: { ...layout },
      behaviors: ['zoom-canvas', 'drag-canvas'],
      theme: 'light',
    });
    await currentGraph.render();
  }

  const btnBar = document.createElement('div');
  btnBar.style.cssText = 'padding:8px 12px;display:flex;gap:8px;flex-wrap:wrap;background:#f0f0f0;';
  ['Circular', 'Force', 'Grid', 'Dagre'].forEach((label, i) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = 'padding:6px 12px;cursor:pointer;border-radius:4px;border:1px solid #ccc;background:#fff;color:#333;';
    btn.onclick = () => renderLayout(i);
    btnBar.appendChild(btn);
  });
  wrapper.insertBefore(btnBar, canvasParent);

  await renderLayout(0);

  return {
    destroy: () => {
      currentGraph?.destroy();
      currentGraph = null;
    },
  };
}
