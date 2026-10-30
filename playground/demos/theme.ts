/**
 * Demo: 主题 — light / dark 及 token 覆盖
 */
import { Graph } from '../../src/index.ts';
import { mountCanvasMenu } from './demo-panel.ts';

const data = {
  nodes: [{ id: '0' }, { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
  edges: [
    { source: '0', target: '1' },
    { source: '0', target: '2' },
    { source: '1', target: '3' },
    { source: '2', target: '4' },
    { source: '3', target: '4' },
  ],
};

type ThemeChoice = 'light' | 'dark' | 'light-override';

let currentGraph: Graph | null = null;

export async function run(container: string | HTMLElement) {
  const host = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  host.style.position = 'relative';

  async function renderTheme(theme: ThemeChoice) {
    currentGraph?.destroy();
    const themeOption =
      theme === 'light-override'
        ? { type: 'light' as const, edgeLineWidth: 3, canvasBackground: '#f0f4ff' }
        : theme;
    currentGraph = new Graph({
      autoFit: true,
      container: host,
      data,
      node: { type: 'circle', style: { size: 14 } },
      edge: { type: 'line' },
      layout: { type: 'circular', radius: 120 },
      behaviors: ['zoom-canvas', 'drag-canvas'],
      theme: themeOption,
    });
    await currentGraph.render();
  }

  mountCanvasMenu(host, {
    caption: '主题',
    items: [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'light-override', label: 'Light + 覆盖' },
    ],
    value: 'light',
    onSelect: (value) => {
      void renderTheme(value as ThemeChoice);
    },
  });

  await renderTheme('light');

  return {
    fitView: () => currentGraph?.fitView(),
    destroy: () => {
      currentGraph?.destroy();
      currentGraph = null;
      host.querySelector(':scope > [data-canvas-controls]')?.remove();
    },
  };
}
