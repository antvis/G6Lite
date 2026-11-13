import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const groups = [
    { id: 'Base', x: 100 }, { id: 'Selected', x: 270 },
    { id: 'Local', x: 440 }, { id: 'Inactive', x: 610 },
  ];
  const graph = new Graph({
    container,
    data: {
      nodes: groups.flatMap(({ id, x }) => [
        { id: id + '-a', x, y: 100, comboId: id },
        { id: id + '-b', x, y: 160, comboId: id },
      ]),
      edges: [],
      combos: [
        { id: 'Base' },
        { id: 'Selected', states: ['selected'] },
        { id: 'Local', states: ['selected'], style: {
          stateStyles: { selected: { stroke: '#f6903d', labelColor: '#9a3412' } },
        } },
        { id: 'Inactive', states: ['selected', 'inactive'] },
      ],
    },
    node: { style: { size: 22 } },
    // #region state-styles
    combo: { style: {
      padding: 28, label: (combo) => combo.id,
      stateStyles: {
        selected: { fill: 'rgba(135,59,244,0.12)', stroke: '#873bf4', strokeWidth: 3 },
        inactive: { opacity: 0.3 },
      },
    } },
    // #endregion state-styles
    behaviors: [],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  graph.on('combo:click', ({ comboId }) => {
    const selected = graph.getComboData(comboId)?.states.has('selected') ?? false;
    graph.setItemState(comboId, 'selected', !selected);
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
