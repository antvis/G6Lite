# Event log (/en/docs/examples/event-log)





Inspect the public events emitted by click, drag, and selection.

## Try it

Click or drag a node and read the latest events.

## Data

Four nodes enable click selection and dragging together.

## Complete runnable code

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

Click a node for node:selectchange, or drag it for node:dragend. A completed drag suppresses its subsequent node click. See the [event guide](/en/docs/guides/events) for integration and the [event reference](/en/docs/api/graph/events) for payloads and timing.


## Related documentation

- [Event guide](/en/docs/guides/events)
- [Event reference](/en/docs/api/graph/events)