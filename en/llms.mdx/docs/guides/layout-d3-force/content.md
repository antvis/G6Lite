# D3 force layout (/en/docs/guides/layout-d3-force)





## Overview [#overview]

Use D3’s force simulation to position nodes.

## When to use it [#when-to-use-it]

Use it when a network needs control over repulsion, link distance, or cooling speed.

## Basic usage [#basic-usage]

Set the layout type with `layout.type`.

```ts
const graph = new Graph({
  container,
  data,
  layout: { type: 'd3-force' },
});
```

## Options [#options]

| Option           | Description                                      | Type                 | Default                     |
| ---------------- | ------------------------------------------------ | -------------------- | --------------------------- |
| `linkDistance`   | Target distance between linked nodes.            | `number` or function | `max(200, √nodeCount × 80)` |
| `nodeStrength`   | Force between nodes. Negative values repel.      | `number` or function | `-30`                       |
| `alphaDecay`     | Rate at which the simulation cools on each step. | `number`             | `0.1`                       |
| `preventOverlap` | Whether to enable node collision detection.      | `boolean`            | `false`                     |

[Common layout options](/en/docs/guides/layout) · [Layout reference](/en/docs/api/options#config-library-layout-fields)

## Code example [#code-example]

The target link distance is 100, and negative `nodeStrength` repels nodes.



```ts
import { Graph, register, type GraphOptions, type LayoutConfig } from '@antv/g6-lite';

type ExampleOptions = Pick<GraphOptions, 'data' | 'node' | 'edge'>;

function network(type: string): ExampleOptions {
  const links = [
    [0, 1], [0, 2], [0, 3], [1, 2], [1, 4], [1, 5],
    [2, 5], [2, 6], [3, 7], [3, 8], [3, 9],
    [7, 8], [8, 9], [4, 10], [4, 11], [10, 11],
  ];
  return {
    data: {
      nodes: Array.from({ length: 12 }, (_, index) => ({ id: String(index) })),
      edges: links.map(([source, target]) => ({ source: String(source), target: String(target) })),
    },
    node: {
      style: {
        size: 24,
        label: (node) => node.id,
        labelColor: '#fff',
        labelPlacement: 'center',
        fill: (node) => type === 'radial' && node.id === '0' ? '#6d28d9' : '#1677ff',
      },
    },
    edge: { style: { lineWidth: 2 } },
  };
}

async function render(container: HTMLElement, layout: LayoutConfig, options: ExampleOptions) {
  const graph = new Graph({
    container,
    ...options,
    layout,
    behaviors: ['drag-canvas', 'zoom-canvas'],
    autoFit: { padding: 36, maxZoom: 1 },
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}

export function run(container: HTMLElement) {
  const layout: LayoutConfig = { type: 'd3-force', linkDistance: 100, nodeStrength: -120, preventOverlap: true, nodeSize: 24 };
  return render(container, layout, network(layout.type));
}
```



[Compare network layouts](/en/docs/guides/layout-networks)
