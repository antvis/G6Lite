# Mind map layout (/en/docs/guides/layout-mindmap)





## Overview [#overview]

Expand branches to one or both sides of a central topic.

## When to use it [#when-to-use-it]

Use it to organize ideas, knowledge, and categories.

## Basic usage [#basic-usage]

This layout is optional. Import and register it before setting `layout.type`. For CDN usage, see [Optional layouts](/en/docs/guides/layout-overview#optional-layouts).

```ts
import { Graph, register } from '@antv/g6-lite';
import mindmap from '@antv/g6-lite/layouts/mindmap';

register('layout', 'mindmap', mindmap);

const graph = new Graph({
  container,
  data,
  layout: { type: 'mindmap' },
});
```

## Options [#options]

| Option      | Description                                                            | Type                                     | Default           |
| ----------- | ---------------------------------------------------------------------- | ---------------------------------------- | ----------------- |
| `direction` | `'LR'` goes right, `'RL'` goes left, and `'H'` uses `getSide`.         | `'H'` \| `'LR'` \| `'RL'`                | `'H'`             |
| `getSide`   | Select a side using the node, its branch index, and its parent’s side. | Function returning `'left'` or `'right'` | Returns `'right'` |
| `levelGap`  | Horizontal gap between a parent and its child.                         | `number`                                 | `120`             |
| `nodeGap`   | Vertical gap between siblings on the same side.                        | `number`                                 | `30`              |

[Common layout options](/en/docs/guides/layout) · [Layout reference](/en/docs/api/options#config-tree-layout-fields)

## Code example [#code-example]

Define parent-child relationships as edges. Use the parent ID as `source` and the child ID as `target`.

`getSide` places branches A and C on the left and B and D on the right.



```ts
import { Graph, register, type GraphNode, type GraphOptions, type LayoutConfig } from '@antv/g6-lite';

import mindmap from '@antv/g6-lite/layouts/mindmap';

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
  register('layout', 'mindmap', mindmap);
  const layout: LayoutConfig = {
    type: 'mindmap',
    direction: 'H',
    levelGap: 100,
    nodeGap: 24,
    getWidth: () => 16,
    getHeight: (node: GraphNode) => node.id.length === 1 ? 64 : 16,
    getSide: (node: GraphNode) => /^[AC]/.test(node.id) ? 'left' : 'right',
  };
  return render(container, layout, tree(layout.type));
}
```



[Compare tree layouts](/en/docs/guides/layout-trees)
