import { Graph, type LayoutConfig } from '../../src/index.ts';
import { buttonStyle, createDemoPanel } from './demo-panel.ts';

const NODES = Array.from({ length: 18 }, (_, index) => ({ id: String(index), data: { label: String(index) } }));
const EDGES = Array.from({ length: 17 }, (_, index) => ({ id: `e-${index}`, source: String(Math.floor(index / 2)), target: String(index + 1) }));

const LAYOUTS: Array<{ label: string; config: LayoutConfig }> = [
  { label: 'Radial', config: { type: 'radial', unitRadius: 68, linkDistance: 60 } },
  { label: 'Concentric', config: { type: 'concentric', nodeSize: 28, minNodeSpacing: 18 } },
  { label: 'ForceAtlas2', config: { type: 'force-atlas2', maxIteration: 60, barnesHut: true, prune: false } },
  { label: 'Fruchterman', config: { type: 'fruchterman', maxIteration: 80, gravity: 8, speed: 5 } },
  { label: 'MDS', config: { type: 'mds', linkDistance: 70 } },
  { label: 'Random', config: { type: 'random' } },
];

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    container,
    data: { nodes: NODES, edges: EDGES },
    layout: LAYOUTS[0].config,
    node: { style: { size: 24, label: (node) => String(node.data?.label ?? node.id), labelPlacement: 'center', labelColor: '#fff' } },
    edge: { style: { stroke: '#94a3b8', endArrow: true } },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node'],
  });
  await graph.render();
  graph.fitView({ padding: 72, maxZoom: 1.4 });

  const ui = createDemoPanel(
    container,
    '内置布局补全',
    '覆盖原 Playground 缺失的 radial、concentric、ForceAtlas2、fruchterman、MDS 和 random。',
    LAYOUTS.map((layout, index) => `<button data-layout="${index}" style="${buttonStyle}">${layout.label}</button>`).join(''),
  );

  ui.controls.addEventListener('click', async (event) => {
    const index = Number((event.target as HTMLElement).dataset.layout);
    if (!Number.isInteger(index) || !LAYOUTS[index]) return;
    ui.setStatus(`running ${LAYOUTS[index].label}…`);
    graph.setLayout(LAYOUTS[index].config);
    await graph.layout();
    graph.fitView({ padding: 72, maxZoom: 1.4 });
    ui.setStatus(`${LAYOUTS[index].label} complete\nnodes=${graph.getNodeCount()} edges=${graph.getEdgeCount()}`);
  });

  ui.setStatus('Radial complete');
  return { destroy: () => { graph.destroy(); ui.panel.remove(); } };
}
