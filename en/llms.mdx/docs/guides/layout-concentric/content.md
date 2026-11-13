# Concentric layout (/en/docs/guides/layout-concentric)





## Overview [#overview]

Place nodes in rings by a ranking metric, with higher values near the center.

## When to use it [#when-to-use-it]

Use it to emphasize hubs by their number of connections.

## Basic usage [#basic-usage]

Set the layout type with `layout.type`.

```ts
const graph = new Graph({
  container,
  data,
  layout: { type: 'concentric' },
});
```

## Options [#options]

| Option           | Description                                                         | Type                             | Default                |
| ---------------- | ------------------------------------------------------------------- | -------------------------------- | ---------------------- |
| `sortBy`         | Ranking metric. `'degree'` ranks by node degree.                    | `'degree'` \| `(node) => number` | `'degree'`             |
| `maxLevelDiff`   | Ranking values in the same ring differ by less than this threshold. | `number`                         | Computed automatically |
| `preventOverlap` | Whether to space nodes to avoid overlap.                            | `boolean`                        | `false`                |
| `nodeSpacing`    | Gap reserved between nodes when preventing overlap.                 | `number`                         | `10`                   |

[Common layout options](/en/docs/guides/layout) · [Layout reference](/en/docs/api/options#config-library-layout-fields)

## Code example [#code-example]

Nodes are grouped by degree. The purple hub has five connections and sits at the center. Each blue node has three connections and sits on the inner ring. Each green node has one connection and sits on the outer ring.



```ts
import { Graph, register, type GraphOptions, type LayoutConfig } from '@antv/g6-lite';

type ExampleOptions = Pick<GraphOptions, 'data' | 'node' | 'edge'>;

function concentric(): ExampleOptions {
  const hub = 'Hub';
  const inner = ['A', 'B', 'C', 'D', 'E'];
  const edges = inner.flatMap((id) => [
    { source: hub, target: id },
    { source: id, target: `${id}1` },
    { source: id, target: `${id}2` },
  ]);
  return {
    data: {
      nodes: [{ id: hub }, ...edges.map(({ target }) => ({ id: target }))],
      edges,
    },
    node: {
      style: {
        size: 24,
        fill: (node) => node.id === hub ? '#6d28d9' : inner.includes(node.id) ? '#1677ff' : '#0f766e',
      },
    },
    edge: { style: { endArrow: false, stroke: '#91a5c1', lineWidth: 1.5 } },
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
  const layout: LayoutConfig = {
    type: 'concentric',
    sortBy: 'degree',
    maxLevelDiff: 1,
    preventOverlap: true,
    nodeSize: 24,
    nodeSpacing: 28,
  };
  return render(container, layout, concentric());
}
```



[Compare network layouts](/en/docs/guides/layout-networks)
