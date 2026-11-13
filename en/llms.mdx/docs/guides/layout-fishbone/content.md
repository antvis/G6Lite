# Fishbone layout (/en/docs/guides/layout-fishbone)





## Overview [#overview]

Place the problem at the end of the spine. Each cause category joins the spine with a diagonal branch, and shorter horizontal lines attach individual causes to that branch.

## When to use it [#when-to-use-it]

Use it for three-level structures such as a problem, cause categories, and specific causes.

## Basic usage [#basic-usage]

This layout is optional. Import and register it before setting `layout.type`. For CDN usage, see [Optional layouts](/en/docs/guides/layout-overview#optional-layouts).

```ts
import { Graph, register } from '@antv/g6-lite';
import fishbone from '@antv/g6-lite/layouts/fishbone';

register('layout', 'fishbone', fishbone);

const graph = new Graph({
  container,
  data,
  layout: { type: 'fishbone' },
  edge: { type: 'polyline', style: { router: 'fishbone', endArrow: false } },
});
```

## Options [#options]

| Option             | Description                                                    | Type                       | Default      |
| ------------------ | -------------------------------------------------------------- | -------------------------- | ------------ |
| `categoryGap`      | Gap between categories along the spine.                        | `number`                   | `180`        |
| `categoryDistance` | Vertical distance from a category to the spine.                | `number`                   | `200`        |
| `itemHStep`        | Additional horizontal offset for item nodes.                   | `number`                   | `20`         |
| `getWidth`         | Node width used by the layout. Match it to the rendered width. | Function returning a width | Returns `80` |
| `direction`        | `'RL'` mirrors the `'LR'` arrangement horizontally.            | `'LR'` \| `'RL'`           | `'LR'`       |

[Common layout options](/en/docs/guides/layout) · [Layout reference](/en/docs/api/options#config-tree-layout-fields)

## Code example [#code-example]

Define parent-child relationships as edges. Use the parent ID as `source` and the child ID as `target`.

This diagram breaks down a late release into four categories. People, Tools, Process, and Scope each have two specific causes.



```ts
import { Graph, register, type GraphOptions, type LayoutConfig } from '@antv/g6-lite';

import fishboneLayout from '@antv/g6-lite/layouts/fishbone';

type ExampleOptions = Pick<GraphOptions, 'data' | 'node' | 'edge'>;

function fishbone(): ExampleOptions {
  const head = 'Late release';
  const causes = [
    { category: 'People', items: ['Staff shortage', 'Late handoff'] },
    { category: 'Tools', items: ['Slow build', 'Test outages'] },
    { category: 'Process', items: ['Review queue', 'Manual checks'] },
    { category: 'Scope', items: ['New requests', 'Rework'] },
  ];
  const edges = causes.flatMap(({ category, items }) => [
    { source: head, target: category },
    ...items.map((item) => ({ source: category, target: item })),
  ]);
  const categories = new Set(causes.map(({ category }) => category));
  // #region edge-router
  const edge = {
    type: 'polyline',
    style: { router: 'fishbone', endArrow: false, stroke: '#7086a8', lineWidth: 2 },
  } as const;
  // #endregion edge-router
  return {
    data: { nodes: [{ id: head }, ...edges.map(({ target }) => ({ id: target }))], edges },
    node: {
      type: 'rect',
      style: {
        width: 96,
        height: (node) => node.id === head || categories.has(node.id) ? 30 : 22,
        borderRadius: 5,
        fill: (node) => node.id === head ? '#3730a3' : categories.has(node.id) ? '#1d4ed8' : '#eff6ff',
        label: (node) => node.id,
        labelPlacement: 'center',
        labelColor: (node) => node.id === head || categories.has(node.id) ? '#fff' : '#1e3a5f',
      },
    },
    edge,
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
  register('layout', 'fishbone', fishboneLayout);
  const layout: LayoutConfig = {
    type: 'fishbone',
    direction: 'LR',
    categoryGap: 200,
    categoryDistance: 138,
    itemHStep: 26,
    getWidth: () => 96,
  };
  return render(container, layout, fishbone());
}
```



[Compare tree layouts](/en/docs/guides/layout-trees)
