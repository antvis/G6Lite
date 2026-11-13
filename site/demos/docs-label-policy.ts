import { Graph, type LabelOptions } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: HTMLElement) {
  // #region label-options
  const policy: Required<LabelOptions> = {
    scaleWithZoom: false,
    hideOnLowZoom: true,
    hideOnCollision: true,
    nodeMinZoom: 0.3,
    edgeMinZoom: 0.5,
  };
  // #endregion label-options
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'Client alpha', x: 0, y: 100 },
        { id: 'Client beta', x: 100, y: 100 },
        { id: 'API gateway', x: 900, y: 100 },
      ],
      edges: [{ id: 'Request', source: 'Client beta', target: 'API gateway' }],
    },
    node: { style: { size: 48, label: (node) => node.id, labelFontSize: 14 } },
    edge: { style: { label: (_s, _t, edge) => edge.id ?? '', labelFontSize: 14 } },
    label: policy,
    behaviors: [],
    autoFit: { minZoom: 0.4, maxZoom: 0.4 },
  });
  const ui = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { ui.destroy(); destroy(); };
  try {
    await graph.render();
    const settings = { ...policy };
    for (const key of ['scaleWithZoom', 'hideOnLowZoom', 'hideOnCollision'] as const) {
      ui.gui.add(settings, key).onChange((checked: boolean) => {
        graph.updateOptions({ label: { [key]: checked } });
      });
    }
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
