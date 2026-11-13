# Circular layout (/en/docs/guides/layout-circular)





## Overview [#overview]

Arrange nodes around a circle or vary the radius to form a spiral.

## When to use it [#when-to-use-it]

Use a circle for networks without a hierarchy, or a spiral for ordered nodes.

## Basic usage [#basic-usage]

Set the layout type with `layout.type`.

```ts
const graph = new Graph({
  container,
  data,
  layout: { type: 'circular' },
});
```

## Options [#options]

| Option                     | Description                                                             | Type                                                | Default                           |
| -------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------- |
| `radius`                   | Fixed circle radius. Set only the start and end radii to make a spiral. | `number`                                            | Half the smaller layout dimension |
| `startRadius`, `endRadius` | Spiral start and end radii, used when `radius` is omitted.              | `number`                                            | —                                 |
| `clockwise`                | Whether to arrange nodes clockwise.                                     | `boolean`                                           | `true`                            |
| `ordering`                 | Node order by topology, directed topology, or degree.                   | `'topology'` \| `'topology-directed'` \| `'degree'` | Input order                       |

[Common layout options](/en/docs/guides/layout) · [Layout reference](/en/docs/api/options#config-library-layout-fields)

## Code example [#code-example]

Eight nodes sit on a circle with a radius of 100.



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
  const layout: LayoutConfig = { type: 'circular', radius: 100 };
  return render(container, layout, arrangement(layout.type));
}
```



### Spiral arrangement [#spiral-arrangement]

Set `startRadius` and `endRadius` to different values and omit `radius`.

```ts
const layout = { type: 'circular', startRadius: 30, endRadius: 140 };
```

[Compare Grid, Circular, and Dagre](/en/docs/guides/layout-arrangements)
