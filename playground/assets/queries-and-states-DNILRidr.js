const t=`import { Graph, type GraphData } from '../../src/index.ts';
import { buttonStyle, createDemoPanel } from './demo-panel.ts';

const DATA: GraphData = {
  nodes: [
    { id: 'root', x: 180, y: 160, comboId: 'left', data: { label: 'Root' } },
    { id: 'n1', x: 340, y: 90, comboId: 'right', data: { label: 'N1' } },
    { id: 'n2', x: 340, y: 230, comboId: 'right', data: { label: 'N2' } },
    { id: 'n3', x: 500, y: 160, data: { label: 'N3' } },
  ],
  edges: [
    { id: 'e-root-n1', source: 'root', target: 'n1' },
    { id: 'e-root-n2', source: 'root', target: 'n2' },
    { id: 'e-n1-n3', source: 'n1', target: 'n3' },
    { id: 'e-n2-n3', source: 'n2', target: 'n3' },
  ],
  combos: [
    { id: 'left', data: { label: '入口' } },
    { id: 'right', data: { label: '处理' } },
  ],
};

const button = (action: string, label: string) =>
  \`<button data-action="\${action}" style="\${buttonStyle}">\${label}</button>\`;

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    container,
    data: DATA,
    node: {
      style: {
        size: 32,
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'center',
        labelColor: '#fff',
      },
      stateStyles: {
        selected: { fill: '#873BF4', stroke: '#5B21B6', strokeWidth: 3 },
        active: { fill: '#13C2C2', stroke: '#08979C', strokeWidth: 3 },
        highlight: { fill: '#FA8C16', stroke: '#D46B08', strokeWidth: 3 },
      },
    },
    edge: { style: { stroke: '#94a3b8', endArrow: true } },
    combo: { style: { padding: 24, label: (combo) => String(combo.data?.label ?? combo.id) } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
  });
  await graph.render();
  graph.fitView({ padding: 80, maxZoom: 1.4 });

  const ui = createDemoPanel(
    container,
    '查询、批量状态与可见性',
    '集中验证元素查询、邻接查询、批量状态替换、状态搜索和清理。',
    [
      button('query', '查询 root'),
      button('batch', '批量设状态'),
      button('replace', '替换状态'),
      button('combo', 'Combo 状态'),
      button('hide', '隐藏 n2'),
      button('clear', '全部清理'),
    ].join(''),
  );

  const showStateSummary = (prefix: string) => {
    ui.setStatus(
      \`\${prefix}\\nselected nodes=\${graph.findNodesByState('selected').join(', ') || '-'}\\n\` +
        \`active edges=\${graph.findEdgesByState('active').join(', ') || '-'}\\n\` +
        \`highlight combos=\${graph.findCombosByState('highlight').join(', ') || '-'}\`,
    );
  };

  ui.controls.addEventListener('click', (event) => {
    const action = (event.target as HTMLElement).dataset.action;
    if (action === 'query') {
      const element = graph.getElementData('root');
      const position = graph.getElementPosition('root');
      ui.setStatus(
        \`hasNode=\${graph.hasNode('root')} hasEdge=\${graph.hasEdge('e-root-n1')} hasElement=\${graph.hasElement('right')}\\n\` +
          \`element=\${element?.id} position=\${position?.x},\${position?.y}\\n\` +
          \`neighbors=\${graph.getNeighborNodes('root').join(', ')}\\n\` +
          \`adjacent=\${graph.getAdjacentEdges('root').map((edge) => edge.id).join(', ')}\`,
      );
    } else if (action === 'batch') {
      graph.batchSetState([
        { id: 'root', state: 'selected', value: true },
        { id: 'n3', state: 'selected', value: true },
        { id: 'e-root-n1', state: 'active', value: true },
      ]);
      showStateSummary('batchSetState');
    } else if (action === 'replace') {
      graph.setElementStates({ root: ['highlight'], n1: ['selected'], 'e-root-n2': ['active'] });
      showStateSummary('setElementStates');
    } else if (action === 'combo') {
      graph.setComboState('right', 'highlight', true);
      const children = graph.getComboChildren('right');
      ui.setStatus(\`combo=\${graph.getComboData('right')?.id}\\nchildren=\${children.nodes.join(', ')}\\nstates=\${graph.getComboStates('right').join(', ')}\`);
    } else if (action === 'hide') {
      const hidden = graph.getItemStates('n2').includes('hidden');
      if (hidden) graph.showItem('n2');
      else graph.hideItem('n2');
      ui.setStatus(\`n2 states=\${graph.getItemStates('n2').join(', ') || '-'}\`);
    } else if (action === 'clear') {
      for (const node of graph.getNodes()) graph.clearItemStates(node.id);
      for (const edge of graph.getEdges()) graph.clearItemStates(edge.id);
      for (const comboId of ['left', 'right']) graph.clearComboStates(comboId);
      showStateSummary('clearItemStates / clearComboStates');
    }
  });

  showStateSummary('ready');
  return {
    fitView: () => graph.fitView({ padding: 64, maxZoom: 1.4 }),
    destroy: () => {
      graph.destroy();
      ui.panel.remove();
    },
  };
}
`;export{t as default};
