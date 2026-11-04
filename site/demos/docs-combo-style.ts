import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const groups = [{ id: 'global', x: 100 }, { id: 'local', x: 320 }, { id: 'callback', x: 540 }];
  const graph = new Graph({
    container,
    data: {
      nodes: groups.flatMap(({ id, x }) => [
        { id: id + '-a', x, y: 100, comboId: id },
        { id: id + '-b', x, y: 160, comboId: id },
      ]),
      edges: [],
      combos: [
        { id: 'global', data: { name: 'Global' } },
        { id: 'local', data: { name: 'Local' }, style: {
          fill: 'rgba(246,144,61,0.15)', stroke: '#f6903d', strokeWidth: 3,
          opacity: 0.75, borderRadius: 0, padding: 32,
          labelFontSize: 14, labelColor: '#7c2d12', labelPlacement: 'inside',
        } },
        { id: 'callback', style: {
          fill: (combo) => combo.childNodeIds.size >= 2 ? 'rgba(135,59,244,0.12)' : 'transparent',
          stroke: '#873bf4', borderRadius: 20, padding: [8, 40, 12, 24],
          label: (combo) => 'Members: ' + combo.childNodeIds.size, labelPlacement: 'bottom',
        } },
      ],
    },
    node: { style: { size: 22 } },
    combo: { style: {
      fill: 'rgba(23,131,255,0.08)', stroke: '#1783FF', strokeWidth: 2,
      opacity: 1, borderRadius: 12, padding: 40,
      label: (combo) => String(combo.data?.name ?? combo.id),
      labelFontSize: 12, labelColor: '#1e3a8a', labelPlacement: 'top',
    } },
    behaviors: [],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
