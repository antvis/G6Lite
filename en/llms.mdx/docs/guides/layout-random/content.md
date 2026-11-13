# Random layout (/en/docs/guides/layout-random)





## Overview [#overview]

Scatter nodes randomly around the layout center.

## When to use it [#when-to-use-it]

Use it for a quick preview of graph data. Each run samples new positions.

## Basic usage [#basic-usage]

This layout is optional. Import and register it before setting `layout.type`. For CDN usage, see [Optional layouts](/en/docs/guides/layout-overview#optional-layouts).

```ts
import { Graph, register } from '@antv/g6-lite';
import random from '@antv/g6-lite/layouts/random';

register('layout', 'random', random);

const graph = new Graph({
  container,
  data,
  layout: { type: 'random' },
});
```

## Options [#options]

| Option   | Description                                | Type               | Default                   |
| -------- | ------------------------------------------ | ------------------ | ------------------------- |
| `width`  | Controls the horizontal spread.            | `number`           | Canvas width              |
| `height` | Controls the vertical spread.              | `number`           | Canvas height             |
| `center` | Center of the spread in graph coordinates. | `[number, number]` | Center of the layout area |

[Common layout options](/en/docs/guides/layout) · [Layout reference](/en/docs/api/options#config-library-layout-fields)

## Code example [#code-example]

Nodes are scattered around `[200, 120]`. Reset the example to sample new positions.



```ts
import { Graph, register, type GraphOptions, type LayoutConfig } from '@antv/g6-lite';

import random from '@antv/g6-lite/layouts/random';

type ExampleOptions = Pick<GraphOptions, 'data' | 'node' | 'edge'>;

function arrangement(type: string): ExampleOptions {
  if (type === 'dagre') {
    return {
      data: {
        nodes: ['Input', 'Review', 'Check', 'Publish'].map((id) => ({ id })),
        edges: [
          { source: 'Input', target: 'Review' },
          { source: 'Input', target: 'Check' },
          { source: 'Review', target: 'Publish' },
          { source: 'Check', target: 'Publish' },
        ],
      },
      node: {
        type: 'rect',
        style: {
          width: 80, height: 32, borderRadius: 6,
          label: (node) => node.id, labelColor: '#fff', labelPlacement: 'center',
        },
      },
      edge: { type: 'polyline', style: { router: 'orth', radius: 12, endArrow: true } },
    };
  }

  const ids = Array.from({ length: type === 'grid' ? 6 : 8 }, (_, i) => String.fromCharCode(65 + i));
  return {
    data: {
      nodes: ids.map((id) => ({ id })),
      edges: type === 'grid' ? [] : ids.map((source, i) => ({ source, target: ids[(i + 2) % ids.length] })),
    },
    node: { style: { size: 24, label: (node) => node.id, labelColor: '#fff', labelPlacement: 'center' } },
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
  register('layout', 'random', random);
  const layout: LayoutConfig = { type: 'random', width: 400, height: 240, center: [200, 120] };
  return render(container, layout, arrangement(layout.type));
}
```



[Browse the layout gallery](/en/docs/examples/layout-gallery)
