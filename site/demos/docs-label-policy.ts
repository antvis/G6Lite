import { Graph, type LabelOptions } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const policy: Required<LabelOptions> = {
    scaleWithZoom: false,
    hideOnLowZoom: true,
    hideOnCollision: true,
    nodeMinZoom: 0.3,
    edgeMinZoom: 0.5,
  };
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
  const controls = document.createElement('div');
  controls.style.cssText =
    'position:absolute;left:12px;bottom:12px;z-index:20;display:flex;flex-wrap:wrap;gap:12px;font:12px system-ui;';
  for (const key of ['scaleWithZoom', 'hideOnLowZoom', 'hideOnCollision'] as const) {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = policy[key];
    input.addEventListener('change', () => {
      graph.updateOptions({ label: { [key]: input.checked } });
    });
    label.append(input, ' ' + key);
    controls.append(label);
  }
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { controls.remove(); destroy(); };
  try {
    await graph.render();
    container.append(controls);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
