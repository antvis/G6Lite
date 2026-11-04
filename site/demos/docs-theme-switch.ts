import { Graph, resolveTheme, type ThemeOption } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
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
  const control = document.createElement('label');
  control.style.cssText = 'position:absolute;left:12px;bottom:12px;z-index:20;padding:6px 10px;border-radius:6px;background:white;color:#334155;font:12px system-ui;';
  const select = document.createElement('select');
  select.setAttribute('aria-label', 'Theme');
  for (const name of Object.keys(themes)) select.add(new Option(name, name));
  select.addEventListener('change', () => {
    graph.updateOptions({
      theme: themes[select.value],
      node: { style: { labelColor: select.value === 'dark' ? '#E2E8F0' : '#334155' } },
    });
    // Keep non-white theme backgrounds accurate inside the dotted docs canvas.
    graph.getCanvas().style.mixBlendMode = select.value === 'light' ? 'multiply' : 'normal';
  });
  control.append('Theme ', select);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { control.remove(); destroy(); };
  try {
    await graph.render();
    container.append(control);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
