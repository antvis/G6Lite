# 事件面板 (/docs/examples/event-log)





点击、拖拽和选择节点时，查看 Graph 发出的公开事件。

## 如何体验

点击或拖拽节点，左下角列出最近的事件。

## 数据说明

四个节点同时启用点击选择和拖拽。

## 完整运行代码

```ts
// Local presentation helpers in this repository are used only for the example controls.
/**
 * Demo: listen to click, drag, and selection events.
 */
import { Graph } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: 'a', data: { label: 'A' }, x: 140, y: 180 },
        { id: 'b', data: { label: 'B' }, x: 320, y: 100 },
        { id: 'c', data: { label: 'C' }, x: 320, y: 260 },
        { id: 'd', data: { label: 'D' }, x: 500, y: 180 },
      ],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'a', target: 'c' },
        { source: 'b', target: 'd' },
        { source: 'c', target: 'd' },
      ],
    },
    node: {
      style: {
        size: 36,
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'center',
        labelColor: '#fff',
      },
    },
    behaviors: ['zoom-canvas', 'drag-canvas', 'click-select', 'drag-node'],
  });
  await graph.render();

  const ui = createDemoPanel(container, '点击或拖拽节点，查看最近的公开事件。');
  const lines: string[] = ['点击或拖拽节点'];
  const push = (line: string) => {
    lines.unshift(line);
    ui.setStatus(lines.slice(0, 4).join('\n'));
  };
  graph.on('node:click', ({ nodeId }) => push(`node:click ${nodeId}`));
  graph.on('node:dragend', ({ nodeId }) => push(`node:dragend ${nodeId}`));
  graph.on('node:selectchange', ({ nodeId, selected }) => push(`node:selectchange ${nodeId} ${selected}`));
  ui.setStatus(lines[0]);

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

点击节点查看 node:selectchange，拖动节点查看 node:dragend；拖拽后的手势不会再触发一次节点 click。接入步骤见[事件指南](/docs/guides/events)，字段与时机查[事件参考](/docs/api/graph/events)。


## 继续阅读

- [事件指南](/docs/guides/events)
- [事件参考](/docs/api/graph/events)