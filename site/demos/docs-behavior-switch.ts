import { Graph } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'A', x: 0, y: 0 },
        { id: 'B', x: 150, y: -65 },
        { id: 'C', x: 150, y: 65 },
      ],
      edges: [{ source: 'A', target: 'B' }, { source: 'A', target: 'C' }],
    },
    node: {
      style: { size: 28, label: (node) => node.id, labelOffsetY: 8 },
      stateStyles: { selected: { fill: '#8050d2', haloWidth: 10 } },
    },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 55, maxZoom: 1 },
  });

  const ui = createDemoPanel(container);
  const switchMode = (mode: string) => {
    // #region switch
    if (mode === 'select') {
      graph.updateOptions({ behaviors: ['zoom-canvas', 'click-select', 'brush-select'] });
    } else if (mode === 'browse') {
      graph.setBehaviors(['zoom-canvas', 'drag-canvas']);
    } else {
      graph.setBehaviors([]);
    }
    // #endregion switch
  };
  const showSelection = () => {
    ui.setStatus(`Selected: ${graph.findNodesByState('selected').join(', ') || 'none'}`);
  };
  graph.on('node:selectchange', showSelection);
  graph.on('selection:clear', showSelection);
  graph.on('brush:end', showSelection);

  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    ui.destroy();
    destroy();
  };
  try {
    await graph.render();
    showSelection();
    ui.addChoice('Mode', { Browse: 'browse', Select: 'select', Off: 'off' }, 'browse', switchMode);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
