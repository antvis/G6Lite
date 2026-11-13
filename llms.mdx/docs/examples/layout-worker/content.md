# Worker 布局 (/docs/examples/layout-worker)





请求 Worker 计算力导向布局，并展示返回的节点坐标。

## 如何体验

等待力导向布局结束后再拖拽画布。

## 数据说明

80 个节点、79 条边，配置 worker: true 请求后台计算；是否真正使用 Worker 需在 Network/Performance 中确认，失败可能回退。

## 完整运行代码

```ts
// Local presentation helpers in this repository are used only for the example controls.
/**
 * Demo: run a force layout in a Web Worker.
 */
import { Graph } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

function createNetwork(count: number) {
  const nodes = Array.from({ length: count }, (_, index) => ({
    id: `n${index}`,
    data: { group: index % 4 },
  }));
  const edges = nodes.slice(1).map((node, index) => ({
    source: `n${index % 8}`,
    target: node.id,
  }));
  return { nodes, edges };
}

export async function run(container: string | HTMLElement) {
  const host = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  host.style.position = 'relative';
  const started = performance.now();
  const graph = new Graph({
    autoFit: true,
    container: host,
    data: createNetwork(80),
    node: {
      style: {
        size: 10,
        fill: (node) => ['#5B8FF9', '#5AD8A6', '#F6BD16', '#E86452'][Number(node.data?.group ?? 0)],
      },
    },
    edge: { style: { stroke: '#D0D7E2', lineWidth: 1 } },
    layout: { type: 'force', worker: true, linkDistance: 48, maxIteration: 80 },
    behaviors: ['zoom-canvas', 'drag-canvas'],
  });
  await graph.render();

  const ui = createDemoPanel(host);
  ui.setStatus(`force · worker requested · ${Math.round(performance.now() - started)} ms\nWorker success requires a Network/Performance check; failure may fall back.`);

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

- [Worker 指南](/docs/guides/layout-worker)
- [布局方法](/docs/api/graph#graph-layout)