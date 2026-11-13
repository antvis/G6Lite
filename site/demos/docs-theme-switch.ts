import { Graph, resolveTheme, type ThemeOption } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: HTMLElement) {
  // #region theme-options
  const themes: Record<string, ThemeOption> = {
    light: 'light',
    dark: 'dark',
    brand: {
      type: 'light', nodeFill: '#00A876', nodeSize: 36,
      edgeStroke: '#00A876', edgeLineWidth: 2, canvasBackground: '#F1F8F5',
      nodeStateStyles: {
        ...resolveTheme('light').nodeStateStyles,
        selected: { stroke: '#005C41', strokeWidth: 3, haloWidth: 12 },
      },
    },
  };
  // #endregion theme-options
  const graph = new Graph({
    container,
    theme: themes.light,
    data: {
      nodes: [
        { id: 'Default', x: 0, y: 0 },
        { id: 'Selected', x: 160, y: 0, states: ['selected'] },
        { id: 'Disabled', x: 320, y: 0, states: ['disabled'] },
      ],
      edges: [{ source: 'Default', target: 'Selected' }, { source: 'Selected', target: 'Disabled' }],
    },
    node: { style: { label: (node) => node.id, labelColor: '#334155', labelOffsetY: 8 } },
    behaviors: [],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { ui.destroy(); destroy(); };
  try {
    await graph.render();
    ui.addChoice('Theme', Object.keys(themes), 'light', (value) => {
      graph.updateOptions({
        theme: themes[value],
        node: { style: { labelColor: value === 'dark' ? '#E2E8F0' : '#334155' } },
      });
      // Keep non-white theme backgrounds accurate inside the dotted docs canvas.
      graph.getCanvas().style.mixBlendMode = value === 'light' ? 'multiply' : 'normal';
    });
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
