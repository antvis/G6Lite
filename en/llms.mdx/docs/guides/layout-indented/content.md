# Indented tree layout (/en/docs/guides/layout-indented)





## Overview [#overview]

List nodes in traversal order and indent them by depth.

## When to use it [#when-to-use-it]

Use it for file directories, navigation menus, and taxonomies.

## Basic usage [#basic-usage]

This layout is optional. Import and register it before setting `layout.type`. For CDN usage, see [Optional layouts](/en/docs/guides/layout-overview#optional-layouts).

```ts
import { Graph, register } from '@antv/g6-lite';
import indented from '@antv/g6-lite/layouts/indented';

register('layout', 'indented', indented);

const graph = new Graph({
  container,
  data,
  layout: { type: 'indented' },
});
```

## Options [#options]

| Option      | Description                                   | Type             | Default                     |
| ----------- | --------------------------------------------- | ---------------- | --------------------------- |
| `indent`    | Horizontal indent per level.                  | `number`         | `80`                        |
| `rowHeight` | Vertical distance between adjacent rows.      | `number`         | `40`                        |
| `direction` | `'LR'` indents right and `'RL'` indents left. | `'LR'` \| `'RL'` | `'LR'`                      |
| `rootId`    | Root node ID.                                 | `string`         | First node without a parent |

[Common layout options](/en/docs/guides/layout) · [Layout reference](/en/docs/api/options#config-tree-layout-fields)

## Code example [#code-example]

Define parent-child relationships as edges. Use the parent ID as `source` and the child ID as `target`.

Each level indents by 72. The `indented` router draws the directory-style connectors.



```ts
import { Graph, register, type GraphOptions, type LayoutConfig } from '@antv/g6-lite';

import indented from '@antv/g6-lite/layouts/indented';

type ExampleOptions = Pick<GraphOptions, 'data' | 'node' | 'edge'>;

function tree(type: string): ExampleOptions {
  const edges = ['A', 'B', 'C', 'D'].flatMap((branch) => [
    { source: 'Root', target: branch },
    { source: branch, target: `${branch}1` },
    { source: branch, target: `${branch}2` },
  ]);
  return {
    data: {
      nodes: [{ id: 'Root' }, ...edges.map(({ target }) => ({ id: target }))],
      edges,
    },
    node: {
      style: {
        size: 16,
        label: (node) => node.id,
        labelPlacement: type === 'indented' ? 'right' : 'bottom',
      },
    },
    edge: type === 'indented'
      ? { type: 'polyline', style: { router: type, endArrow: false } }
      : { style: { endArrow: false } },
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
  register('layout', 'indented', indented);
  const layout: LayoutConfig = { type: 'indented', direction: 'LR', indent: 72, rowHeight: 30 };
  return render(container, layout, tree(layout.type));
}
```



[Compare tree layouts](/en/docs/guides/layout-trees)
