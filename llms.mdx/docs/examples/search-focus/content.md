# 搜索并聚焦 (/docs/examples/search-focus)





按名称搜索节点，高亮匹配项并把视口移过去。

## 如何体验

输入名称片段，匹配节点会高亮并移入视口。

## 数据说明

12 个带名称的节点，按名称片段匹配。

## 完整运行代码

```ts
// Local presentation helpers in this repository are used only for the example controls.
/**
 * Demo: search nodes by name, highlight matches, and focus the viewport.
 */
import { Graph } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

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

  const hint = '输入名称片段，例如 al';
  const ui = createDemoPanel(host, hint);
  let highlighted: string[] = [];
  ui.gui.add({ query: '' }, 'query').name('搜索节点').onChange((value: string) => {
    for (const id of highlighted) graph.clearItemStates(id);
    const query = value.trim().toLowerCase();
    highlighted = query
      ? graph
          .getNodes()
          .filter((node) => String(node.data?.label ?? node.id).toLowerCase().includes(query))
          .map((node) => node.id)
      : [];
    for (const id of highlighted) graph.setItemState(id, 'highlight', true);
    if (highlighted.length > 0) graph.focusItem(highlighted, 48);
    ui.setStatus(query ? `${highlighted.length} 个匹配` : hint);
  });

  return {
    getData: () => graph.getData(),
    fitView: () => graph.fitView(),
    destroy() {
      graph.destroy();
      ui.destroy();
    },
  };
}
```


## 继续阅读

- [视口指南](/docs/guides/viewport)
- [视口方法](/docs/api/graph#graph-viewport)