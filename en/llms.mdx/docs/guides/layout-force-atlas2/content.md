# ForceAtlas2 layout (/en/docs/guides/layout-force-atlas2)





## Overview [#overview]

Connected nodes attract while repulsion and gravity shape the network.

## When to use it [#when-to-use-it]

Use it to see densely connected groups and the links between them.

## Basic usage [#basic-usage]

Set the layout type with `layout.type`.

```ts
const graph = new Graph({
  container,
  data,
  layout: { type: 'force-atlas2' },
});
```

## Options [#options]

| Option         | Description                                             | Type      | Default                          |
| -------------- | ------------------------------------------------------- | --------- | -------------------------------- |
| `kr`           | Repulsion coefficient between nodes.                    | `number`  | `5`                              |
| `kg`           | Gravity coefficient that pulls nodes toward the center. | `number`  | `1`                              |
| `barnesHut`    | Whether to approximate repulsion with Barnes–Hut.       | `boolean` | `true`                           |
| `maxIteration` | Maximum number of iterations.                           | `number`  | `100`, or `50` above 5,000 nodes |

[Common layout options](/en/docs/guides/layout) · [Layout reference](/en/docs/api/options#config-library-layout-fields)

## Code example [#code-example]

Stronger repulsion and gravity reveal three connected groups.



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
  const layout: LayoutConfig = { type: 'force-atlas2', kr: 8, kg: 2 };
  return render(container, layout, network(layout.type));
}
```



[Compare network layouts](/en/docs/guides/layout-networks)
