import { Graph } from '@antv/g6-lite';

const imageUrl = new URL('../src/app/icon.svg', import.meta.url).href;

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'text', name: 'Text', x: 100, y: 100 },
        { id: 'image', name: 'Image', x: 260, y: 100 },
      ],
      edges: [],
    },
    // #region icon-style
    node: {
      style: {
        size: 56,
        fill: (node) => node.id === 'image' ? '#e6f4ff' : '#1783ff',
        iconType: (node) => node.id === 'image' ? 'image' : 'text',
        icon: (node) => node.id === 'image' ? imageUrl : 'A',
        iconWidth: 24,
        iconHeight: 21,
        iconOffsetY: -4,
        iconFontSize: 24,
        iconColor: '#fff',
        label: (node) => node.name ?? node.id,
        labelOffsetY: 6,
      },
    },
    // #endregion icon-style
    autoFit: { padding: 48, maxZoom: 1 },
    behaviors: [],
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
