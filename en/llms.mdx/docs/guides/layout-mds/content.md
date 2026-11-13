# MDS layout (/en/docs/guides/layout-mds)





## Overview [#overview]

Multidimensional scaling (MDS) approximates shortest-path distances in two dimensions.

## When to use it [#when-to-use-it]

Use it to examine how close or far apart nodes are in a network.

## Basic usage [#basic-usage]

This layout is optional. Import and register it before setting `layout.type`. For CDN usage, see [Optional layouts](/en/docs/guides/layout-overview#optional-layouts).

```ts
import { Graph, register } from '@antv/g6-lite';
import mds from '@antv/g6-lite/layouts/mds';

register('layout', 'mds', mds);

const graph = new Graph({
  container,
  data,
  layout: { type: 'mds' },
});
```

## Options [#options]

| Option         | Description                                     | Type               | Default                   |
| -------------- | ----------------------------------------------- | ------------------ | ------------------------- |
| `linkDistance` | Reference length used to scale graph distances. | `number`           | `50`                      |
| `center`       | Center of the layout in graph coordinates.      | `[number, number]` | Center of the layout area |

[Common layout options](/en/docs/guides/layout) · [Layout reference](/en/docs/api/options#config-library-layout-fields)

## Code example [#code-example]

The example uses a scale of 80. Nodes farther apart in the network generally appear farther apart on the canvas.



```ts
import { Graph, register, type GraphOptions, type LayoutConfig } from '@antv/g6-lite';

import mds from '@antv/g6-lite/layouts/mds';

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
  register('layout', 'mds', mds);
  const layout: LayoutConfig = { type: 'mds', linkDistance: 80 };
  return render(container, layout, network(layout.type));
}
```



[Compare network layouts](/en/docs/guides/layout-networks)
