# Dagre layout (/en/docs/guides/layout-dagre)





## Overview [#overview]

Arrange nodes in layers based on directed edges.

## When to use it [#when-to-use-it]

Use it for workflows, call chains, and dependency graphs.

## Basic usage [#basic-usage]

Set the layout type with `layout.type`.

```ts
const graph = new Graph({
  container,
  data,
  layout: { type: 'dagre' },
});
```

## Options [#options]

| Option     | Description                                                               | Type                                 | Default  |
| ---------- | ------------------------------------------------------------------------- | ------------------------------------ | -------- |
| `rankdir`  | Layer direction. `'LR'` goes left to right and `'TB'` goes top to bottom. | `'TB'` \| `'BT'` \| `'LR'` \| `'RL'` | `'TB'`   |
| `nodesep`  | Gap between nodes on the same layer.                                      | `number`                             | `50`     |
| `ranksep`  | Gap between layers.                                                       | `number`                             | `50`     |
| `nodeSize` | Node dimensions used by the layout.                                       | `number` \| `[number, number]`       | `[0, 0]` |

[Common layout options](/en/docs/guides/layout) · [Layout reference](/en/docs/api/options#config-library-layout-fields)

## Code example [#code-example]

The workflow runs left to right, with Review and Check on the same layer.



```ts
import { Graph, register, type GraphOptions, type LayoutConfig } from '@antv/g6-lite';

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
  const layout: LayoutConfig = { type: 'dagre', rankdir: 'LR', nodesep: 32, ranksep: 80, nodeSize: [80, 32] };
  return render(container, layout, arrangement(layout.type));
}
```



[Compare Grid, Circular, and Dagre](/en/docs/guides/layout-arrangements)
