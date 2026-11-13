import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const groups = [{ id: 'circle', x: 100 }, { id: 'rect', x: 300 }, { id: 'label', x: 500 }];
  const graph = new Graph({
    container,
    data: {
      nodes: groups.flatMap(({ id, x }) => [
        { id: id + '-a', x: x - 24, y: 100, comboId: id },
        { id: id + '-b', x: x + 24, y: 160, comboId: id },
      ]),
      edges: [],
      // #region collapsed-shapes
      combos: [
        { id: 'circle', collapsed: true },
        { id: 'rect', collapsed: true, style: {
          collapsedType: 'rect', collapsedSize: [120, 48],
          count: (combo) => 'Items: ' + combo.childNodeIds.size,
        } },
        { id: 'label', collapsed: true, style: {
          collapsedType: 'rect', collapsedSize: [120, 48], label: 'Archive',
        } },
      ],
      // #endregion collapsed-shapes
    },
    node: { style: { size: 22 } },
    combo: { style: {
      stroke: '#1783ff', strokeWidth: 2, padding: 24,
      collapsedType: 'circle', collapsedSize: 64, count: true,
    } },
    behaviors: [],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  graph.on('combo:click', ({ comboId }) => graph.toggleCombo(comboId));
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
