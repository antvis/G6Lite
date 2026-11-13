# Graph overview (/en/docs/graph/overview)





## What is a Graph? [#what-is-a-graph]

A graph describes objects as nodes and relationships as edges. A G6Lite `Graph` instance draws that data in a container and provides methods to query elements, adjust the viewport, and listen for interactions.

A graph instance typically goes through four steps.

1. **Create.** Call `new Graph(options)` to bind the container and initialize rendering resources.
2. **Render.** Await `graph.render()` to complete the initial layout and draw the graph.
3. **Update.** Reuse the instance. Call `setData()` to replace graph data and `updateOptions()` to change supported options.
4. **Destroy.** Call `graph.destroy()` when leaving the page or unmounting the component to release the canvas and listeners.

<span id="working-with-a-graph" />

## Use G6Lite Graph [#use-g6lite-graph]

Follow the [quick start](/en/docs/getting-started/quick-start) to install `@antv/g6-lite`. Mount a container with nonzero width and height, then create and render the graph.

```html
<div id="container" style="width: 100%; height: 320px"></div>
```

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: '#container',
  data: {
    nodes: [
      { id: 'browser', x: 0, y: 0 },
      { id: 'api', x: 120, y: 0 },
    ],
    edges: [{ source: 'browser', target: 'api' }],
  },
});

await graph.render();
```

After the first render, you can focus a node or update the data. For method timing and cleanup, see the [Graph lifecycle API](/en/docs/api/graph#graph-lifecycle).

<span id="container-and-options" />

## Graph options [#graph-options]

`GraphOptions` is the configuration object passed to the constructor. See the [GraphOptions API](/en/docs/api/options#graphoptions) for the full type definitions and details.

| Option       | Type                                  | Default              | Purpose                                                                                |
| ------------ | ------------------------------------- | -------------------- | -------------------------------------------------------------------------------------- |
| `container`  | `string \| HTMLElement`               | Required             | Mounts the graph. String values are CSS selectors.                                     |
| `data`       | `GraphData`                           | Required             | Supplies nodes, edges, and optional Combo groups.                                      |
| `autoFit`    | `boolean \| number \| FitViewOptions` | `false`              | Controls refitting on container resize. The first render fits the graph automatically. |
| `node`       | `NodeConfig`                          | Circle nodes         | Sets node shapes, styles, and states.                                                  |
| `edge`       | `EdgeConfig`                          | Straight edges       | Sets edge shapes, arrowheads, and states.                                              |
| `combo`      | `ComboConfig`                         | Built-in styles      | Sets group appearance, labels, and collapsed shapes.                                   |
| `label`      | `LabelOptions`                        | Built-in policy      | Controls label scaling and visibility.                                                 |
| `layout`     | `LayoutConfig`                        | Input coordinates    | Chooses the algorithm and options for positioning nodes.                               |
| `behaviors`  | `BehaviorOption[]`                    | Canvas zoom and drag | Configures interactions such as zooming, dragging, and selection.                      |
| `theme`      | `ThemeOption`                         | `'light'`            | Sets default styles for the canvas and elements.                                       |
| `transforms` | `TransformOption[]`                   | None                 | Processes input data in order before layout.                                           |
| `plugins`    | `PluginOption[]`                      | None                 | Mounts registered plugins.                                                             |

The container sets the initial canvas dimensions. See [Viewport and coordinates](/en/docs/guides/viewport) for fitting and resizing.

## Graph properties [#graph-properties]

| Property                                                          | Type      | Description                                                                                                       |
| ----------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| [`graph.destroyed`](/en/docs/api/graph#graph-lifecycle-destroyed) | `boolean` | Read-only. Becomes `true` when destruction begins. Check it before using the graph after an asynchronous request. |

Use `await graph.render()` to wait for the initial render.

## Example [#example]

### Complete creation and configuration example [#complete-creation-and-configuration-example]

The example uses Dagre to lay out the dependencies from left to right and groups Cache and Database in a Combo. Click a node to see its selected style, or drag and zoom the canvas.



```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'web', name: 'Browser' },
        { id: 'api', name: 'API' },
        { id: 'cache', name: 'Cache', comboId: 'storage' },
        { id: 'db', name: 'Database', comboId: 'storage' },
      ],
      edges: [
        { source: 'web', target: 'api', data: { protocol: 'HTTPS' } },
        { source: 'api', target: 'cache', data: { protocol: 'GET' } },
        { source: 'api', target: 'db', data: { protocol: 'SQL' } },
      ],
      combos: [{ id: 'storage' }],
    },
    // #region element-options
    node: {
      type: 'rect',
      style: {
        width: 96,
        height: 38,
        borderRadius: 8,
        fill: '#eef2ff',
        stroke: '#6366f1',
        strokeWidth: 1,
        label: (node) => node.name ?? node.id,
        labelPlacement: 'center',
        labelColor: '#1e293b',
      },
      stateStyles: { selected: { stroke: '#4338ca', strokeWidth: 3 } },
    },
    edge: {
      style: {
        stroke: '#64748b',
        endArrow: true,
        label: (_source, _target, edge) => String(edge.data?.protocol ?? ''),
        labelColor: '#334155',
        labelBackground: '#fff',
        labelBackgroundPadding: 4,
      },
    },
    combo: {
      style: {
        label: 'Storage',
        labelPlacement: 'top',
        labelColor: '#065f46',
        padding: 20,
        borderRadius: 12,
        fill: 'rgba(16,185,129,0.08)',
        stroke: '#6ee7b7',
      },
    },
    // #endregion element-options
    layout: { type: 'dagre', rankdir: 'LR', ranksep: 84, nodesep: 16, nodeSize: 96 },
    label: { hideOnLowZoom: false, scaleWithZoom: false },
    behaviors: ['click-select', 'drag-canvas', 'zoom-canvas'],
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
```


