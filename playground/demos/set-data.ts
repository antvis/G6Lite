/**
 * Demo: setData + layout() 端到端验证
 * 测试运行时整体数据替换和布局切换
 */
import { Graph } from '../../src/index.ts';

const DATA_A = {
  nodes: [
    { id: 'a1' },
    { id: 'a2' },
    { id: 'a3' },
    { id: 'a4' },
    { id: 'a5' },
  ],
  edges: [
    { source: 'a1', target: 'a2' },
    { source: 'a1', target: 'a3' },
    { source: 'a2', target: 'a4' },
    { source: 'a3', target: 'a5' },
    { source: 'a4', target: 'a5' },
  ],
};

const DATA_B = {
  nodes: [
    { id: 'b1' },
    { id: 'b2' },
    { id: 'b3' },
    { id: 'b4' },
    { id: 'b5' },
    { id: 'b6' },
    { id: 'b7' },
    { id: 'b8' },
  ],
  edges: [
    { source: 'b1', target: 'b2' },
    { source: 'b1', target: 'b3' },
    { source: 'b2', target: 'b4' },
    { source: 'b3', target: 'b5' },
    { source: 'b4', target: 'b6' },
    { source: 'b5', target: 'b7' },
    { source: 'b6', target: 'b8' },
    { source: 'b7', target: 'b8' },
  ],
};

export async function run(container: string | HTMLElement) {
  const el = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;

  const toolbar = document.createElement('div');
  toolbar.style.cssText = 'position:absolute;top:8px;left:8px;z-index:10;display:flex;gap:6px;';
  toolbar.innerHTML = `
    <button id="btn-set-data-a">setData(A) 5节点</button>
    <button id="btn-set-data-b">setData(B) 8节点</button>
    <button id="btn-layout-grid">layout: grid</button>
    <button id="btn-layout-circular">layout: circular</button>
    <button id="btn-layout-force">layout: force</button>
    <button id="btn-hide">hideItem(b1)</button>
    <button id="btn-show">showItem(b1)</button>
    <button id="btn-focus">focusItem(b8)</button>
  `;
  el.style.position = 'relative';
  el.appendChild(toolbar);

  const graph = new Graph({
    autoFitOnResize: true,
    container: el,
    data: DATA_A,
    layout: { type: 'circular', radius: 120 },
    behaviors: [
      'zoom-canvas',
      'drag-canvas',
      'drag-node',
      { type: 'click-select', multiple: true, trigger: 'shift' },
      'highlight-node',
      'highlight-edge',
    ],
    node: { style: { size: 20, fill: '#5B8FF9' } },
    theme: 'light',
  });
  await graph.render();

  const log = (msg: string) => console.log(`[setData demo] ${msg}`);

  graph.on('datachange', (e: any) => log(`datachange: ${e.nodeCount} nodes, ${e.edgeCount} edges`));
  graph.on('layout:start', () => log('layout:start'));
  graph.on('layout:end', (e: any) => log(`layout:end: ${e.duration.toFixed(1)}ms`));

  document.getElementById('btn-set-data-a')!.onclick = async () => {
    log('setData → DATA_A');
    await graph.setData(DATA_A);
    graph.fitView();
    log(`done. nodeCount=${graph.getNodeCount()}`);
  };

  document.getElementById('btn-set-data-b')!.onclick = async () => {
    log('setData → DATA_B');
    await graph.setData(DATA_B);
    graph.fitView();
    log(`done. nodeCount=${graph.getNodeCount()}`);
  };

  document.getElementById('btn-layout-grid')!.onclick = async () => {
    log('setLayout(grid) + layout()');
    graph.setLayout({ type: 'grid' });
    await graph.layout();
    graph.fitView();
    log('grid done');
  };

  document.getElementById('btn-layout-circular')!.onclick = async () => {
    log('setLayout(circular) + layout()');
    graph.setLayout({ type: 'circular', radius: 150 });
    await graph.layout();
    graph.fitView();
    log('circular done');
  };

  document.getElementById('btn-layout-force')!.onclick = async () => {
    log('setLayout(force) + layout()');
    graph.setLayout({ type: 'd3-force' });
    await graph.layout();
    graph.fitView();
    log('force done');
  };

  document.getElementById('btn-hide')!.onclick = () => {
    const id = graph.hasNode('b1') ? 'b1' : 'a1';
    log(`hideItem(${id})`);
    graph.hideItem(id);
    log(`states after hide: ${JSON.stringify(graph.getItemStates(id))}`);
    const nd = graph.getNodeData(id);
    log(`dataModel states: ${nd ? JSON.stringify([...nd.states]) : 'not found'}`);
  };

  document.getElementById('btn-show')!.onclick = () => {
    const id = graph.hasNode('b1') ? 'b1' : 'a1';
    log(`showItem(${id})`);
    graph.showItem(id);
    log(`states after show: ${JSON.stringify(graph.getItemStates(id))}`);
    const nd = graph.getNodeData(id);
    log(`dataModel states: ${nd ? JSON.stringify([...nd.states]) : 'not found'}`);
  };

  document.getElementById('btn-focus')!.onclick = () => {
    const id = graph.hasNode('b8') ? 'b8' : 'a5';
    log(`focusItem(${id})`);
    graph.focusItem(id);
  };

  return graph;
}
