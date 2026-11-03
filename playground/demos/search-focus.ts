/**
 * Demo: search nodes by name, highlight matches, and focus the viewport.
 */
import { Graph } from '../../src/index.ts';
import { mountCanvasControl } from './demo-panel.ts';

const PEOPLE = [
  'Alice',
  'Bob',
  'Carol',
  'David',
  'Emma',
  'Frank',
  'Grace',
  'Helen',
  'Ivan',
  'Julia',
  'Kevin',
  'Laura',
];

export async function run(container: string | HTMLElement) {
  const host = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  host.style.position = 'relative';

  const graph = new Graph({
    autoFit: true,
    container: host,
    data: {
      nodes: PEOPLE.map((name, index) => ({
        id: name.toLowerCase(),
        data: { label: name, group: index % 3 },
      })),
      edges: PEOPLE.slice(1).map((name, index) => ({
        source: PEOPLE[index % 4].toLowerCase(),
        target: name.toLowerCase(),
      })),
    },
    node: {
      style: {
        size: 32,
        fill: (node) => ['#5B8FF9', '#5AD8A6', '#F6BD16'][Number(node.data?.group ?? 0)],
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'bottom',
      },
    },
    layout: { type: 'circular', radius: 180 },
    behaviors: ['zoom-canvas', 'drag-canvas'],
  });
  await graph.render();

  const box = document.createElement('label');
  box.style.cssText =
    'display:inline-flex;gap:8px;align-items:center;color:#64748b;font:500 12px/1 system-ui,sans-serif;';
  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = '搜索节点，例如 al';
  input.setAttribute('aria-label', '搜索节点');
  input.style.cssText =
    'width:180px;height:28px;padding:0 10px;border:0;border-radius:8px;background:rgba(255,255,255,.96);color:#334155;box-shadow:0 1px 2px rgba(15,23,42,.08);';
  const status = document.createElement('span');
  box.append(input, status);
  mountCanvasControl(host, box);

  let highlighted: string[] = [];
  const search = () => {
    for (const id of highlighted) graph.clearItemStates(id);
    const query = input.value.trim().toLowerCase();
    highlighted = query
      ? graph
          .getNodes()
          .filter((node) => String(node.data?.label ?? node.id).toLowerCase().includes(query))
          .map((node) => node.id)
      : [];
    for (const id of highlighted) graph.setItemState(id, 'highlight', true);
    if (highlighted.length > 0) graph.focusItem(highlighted, 48);
    status.textContent = query ? `${highlighted.length} 个匹配` : '输入名称片段';
  };
  input.addEventListener('input', search);
  status.textContent = '输入名称片段';

  return {
    fitView: () => graph.fitView(),
    destroy() {
      graph.destroy();
      host.querySelector(':scope > [data-canvas-controls]')?.remove();
    },
  };
}
