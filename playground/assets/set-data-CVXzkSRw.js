const n=`/**
 * Demo: setData + layout() 端到端验证
 * 测试运行时整体数据替换和布局切换
 */
import { Graph } from '../../src/index.ts';
import { mountCanvasMenu } from './demo-panel.ts';

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

  el.style.position = 'relative';

  const graph = new Graph({
    autoFit: true,
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

  const log = (msg: string) => console.log(\`[setData demo] \${msg}\`);

  graph.on('datachange', (e: any) => log(\`datachange: \${e.nodeCount} nodes, \${e.edgeCount} edges\`));
  graph.on('layout:start', () => log('layout:start'));
  graph.on('layout:end', (e: any) => log(\`layout:end: \${e.duration.toFixed(1)}ms\`));

  mountCanvasMenu(el, {
    caption: '数据',
    items: [
      { value: 'a', label: 'A · 5 节点' },
      { value: 'b', label: 'B · 8 节点' },
    ],
    value: 'a',
    onSelect(value) {
      const next = value === 'b' ? DATA_B : DATA_A;
      log(\`setData → DATA_\${value.toUpperCase()}\`);
      void graph.setData(next).then(() => {
        graph.fitView();
        log(\`done. nodeCount=\${graph.getNodeCount()}\`);
      });
    },
  });

  mountCanvasMenu(el, {
    caption: '布局',
    items: [
      { value: 'circular', label: 'circular' },
      { value: 'grid', label: 'grid' },
      { value: 'force', label: 'force' },
    ],
    value: 'circular',
    onSelect(value) {
      const apply = async () => {
        log(\`setLayout(\${value}) + layout()\`);
        if (value === 'grid') graph.setLayout({ type: 'grid' });
        else if (value === 'force') graph.setLayout({ type: 'd3-force' });
        else graph.setLayout({ type: 'circular', radius: 150 });
        await graph.layout();
        graph.fitView();
        log(\`\${value} done\`);
      };
      void apply();
    },
  });

  mountCanvasMenu(el, {
    caption: '操作',
    action: true,
    items: [
      { value: 'hide', label: 'hideItem' },
      { value: 'show', label: 'showItem' },
      { value: 'focus', label: 'focusItem' },
    ],
    value: '',
    onSelect(value) {
      if (value === 'focus') {
        const id = graph.hasNode('b8') ? 'b8' : 'a5';
        log(\`focusItem(\${id})\`);
        graph.focusItem(id);
        return;
      }
      const id = graph.hasNode('b1') ? 'b1' : 'a1';
      if (value === 'hide') {
        log(\`hideItem(\${id})\`);
        graph.hideItem(id);
      } else {
        log(\`showItem(\${id})\`);
        graph.showItem(id);
      }
      log(\`states after \${value}: \${JSON.stringify(graph.getItemStates(id))}\`);
    },
  });

  return {
    fitView: () => graph.fitView(),
    destroy() {
      graph.destroy();
      el.querySelector(':scope > [data-canvas-controls]')?.remove();
    },
  };
}
`;export{n as default};
