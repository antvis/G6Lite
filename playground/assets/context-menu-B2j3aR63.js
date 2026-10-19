const n=`/**
 * Demo: open a node context menu from node:contextmenu.
 */
import { Graph } from '../../src/index.ts';

export async function run(container: string | HTMLElement) {
  const host = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  host.style.position = 'relative';

  const graph = new Graph({
    autoFitOnResize: true,
    container: host,
    data: {
      nodes: [
        { id: 'design', data: { label: '设计' }, x: 180, y: 160 },
        { id: 'review', data: { label: '评审' }, x: 380, y: 160 },
        { id: 'build', data: { label: '实现' }, x: 560, y: 160 },
      ],
      edges: [
        { source: 'design', target: 'review' },
        { source: 'review', target: 'build' },
      ],
    },
    node: {
      type: 'rect',
      style: {
        fill: '#5B8FF9',
        width: 88,
        height: 36,
        borderRadius: 8,
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'center',
        labelColor: '#fff',
      },
    },
    edge: { style: { endArrow: true, lineWidth: 1.5 } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
  });
  await graph.render();
  graph.fitView({ padding: 80, maxZoom: 1.3 });

  const menu = document.createElement('div');
  menu.hidden = true;
  menu.style.cssText =
    'position:absolute;z-index:30;display:flex;flex-direction:column;min-width:120px;padding:4px;border-radius:8px;background:#fff;box-shadow:0 8px 24px rgba(15,23,42,.12);';
  host.append(menu);

  let activeId = '';
  const close = () => {
    menu.hidden = true;
  };
  const addAction = (label: string, action: () => void) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.style.cssText =
      'height:28px;border:0;border-radius:6px;background:transparent;text-align:left;padding:0 8px;cursor:pointer;';
    button.addEventListener('click', () => {
      action();
      close();
    });
    menu.append(button);
  };
  addAction('聚焦', () => graph.focusItem(activeId, 80));
  addAction('高亮', () => {
    for (const node of graph.getNodes()) graph.clearItemStates(node.id);
    graph.setItemState(activeId, 'selected', true);
  });

  graph.on('node:contextmenu', ({ nodeId, nativeEvent }) => {
    nativeEvent.preventDefault();
    activeId = nodeId;
    const bounds = host.getBoundingClientRect();
    menu.hidden = false;
    menu.style.left = \`\${nativeEvent.clientX - bounds.left}px\`;
    menu.style.top = \`\${nativeEvent.clientY - bounds.top}px\`;
  });
  graph.on('canvas:click', close);

  return {
    fitView: () => graph.fitView({ padding: 80, maxZoom: 1.3 }),
    destroy() {
      graph.destroy();
      menu.remove();
    },
  };
}
`;export{n as default};
