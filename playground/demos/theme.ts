/**
 * Demo: 主题 — light / dark 及 token 覆盖
 */
import { Graph } from '../../src/index.ts';

const data = {
  nodes: [
    { id: '0' }, { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' },
  ],
  edges: [
    { source: '0', target: '1' }, { source: '0', target: '2' },
    { source: '1', target: '3' }, { source: '2', target: '4' }, { source: '3', target: '4' },
  ],
};

let currentGraph: Graph | null = null;

export async function run(container: string | HTMLElement) {
  const wrapper = typeof container === 'string'
    ? document.querySelector(container)!
    : container;
  const canvasParent = document.createElement('div');
  canvasParent.id = 'theme-demo-canvas';
  canvasParent.style.cssText = 'flex:1;min-height:0;';
  wrapper.innerHTML = '';
  wrapper.appendChild(canvasParent);

  async function renderTheme(theme: 'light' | 'dark' | 'light-override') {
    currentGraph?.destroy();
    const themeOption = theme === 'light-override'
      ? { type: 'light' as const, edgeLineWidth: 3, canvasBackground: '#f0f4ff' }
      : theme;
    currentGraph = new Graph({
      autoFitOnResize: true,
      container: canvasParent,
      data,
      node: { type: 'circle', style: { size: 14 } },
      edge: { type: 'line' },
      layout: { type: 'circular', radius: 120 },
      behaviors: ['zoom-canvas', 'drag-canvas'],
      theme: themeOption,
    });
    await currentGraph.render();
  }

  const btnBar = document.createElement('div');
  btnBar.style.cssText = 'padding:8px 12px;display:flex;gap:8px;flex-wrap:wrap;background:#f0f0f0;';
  [
    { label: 'Light', value: 'light' as const },
    { label: 'Dark', value: 'dark' as const },
    { label: 'Light + 覆盖', value: 'light-override' as const },
  ].forEach(({ label, value }) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = 'padding:6px 12px;cursor:pointer;border-radius:4px;border:1px solid #ccc;background:#fff;color:#333;';
    btn.onclick = () => renderTheme(value);
    btnBar.appendChild(btn);
  });
  wrapper.insertBefore(btnBar, canvasParent);

  await renderTheme('light');

  return {
    destroy: () => {
      currentGraph?.destroy();
      currentGraph = null;
    },
  };
}
