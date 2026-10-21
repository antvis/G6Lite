# Extensions (/en/docs/api/extensions)



When configuration cannot express a difference, register it with `register()` and refer to it by name from `GraphOptions`. Tutorials are in [Extensions](/en/docs/guides/extensions), [Custom node](/en/docs/guides/custom-node), and [Custom behavior](/en/docs/guides/custom-behavior).

```ts
import { extensionFactory, register } from '@antv/g6-lite';
```

## `register()` [#register]

```ts
register(type, name, extension): void
```

`type` is the extension category. `name` is the string later written into configuration, and it cannot be empty. A later registration with the same category and name replaces the previous definition.

| `type`         | Where the name is used                       | What the extension provides                                                                                                                                                                                 |
| -------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `'node'`       | `node.type`                                  | `base?: 'circle' \| 'rect'`, default `style`, `stateStyles`, and `getStyle(node)`. Optional `drawOverlay()` draws a screen-space decoration, and `getBoundaryAnchor()` returns a point on the node boundary |
| `'edge'`       | `edge.type`                                  | `base?: 'line' \| 'arc' \| 'polyline' \| 'cubic'`, default `style`, `stateStyles`, and `getStyle(source, target, edge)`                                                                                     |
| `'label'`      | `node.labelRenderer` or `edge.labelRenderer` | `measure(params)` returns width and height; `draw(params)` paints onto the canvas                                                                                                                           |
| `'decoration'` | `node.decorations[].renderer`                | The same `measure` / `draw` pair, with data from the decoration config                                                                                                                                      |
| `'layout'`     | `layout.type`                                | `execute(data, context)` returns nodes with `x` and `y`. `context` includes `width`, `height`, `signal`, and the current `options`                                                                          |
| `'behavior'`   | `type` inside `behaviors`                    | `getEvents()` maps event names to handlers. Implement `init(context, options)` and `destroy()` when the behavior has a lifecycle                                                                            |
| `'transform'`  | `type` inside `transforms`                   | `beforeRender(data)` returns the next `GraphData`. Implement `update(options)` when options can change                                                                                                      |
| `'plugin'`     | `type` inside `plugins`                      | `mount(container)` attaches independent DOM. Use `init` / `destroy` for its lifecycle                                                                                                                       |

Node and edge extensions are usually stateless style objects. Layouts, behaviors, transforms, and plugins usually keep state, so wrap them in `extensionFactory()`.

```ts
register('edge', 'dependency', {
  base: 'arc',
  style: { stroke: '#91caff', curvature: 0.2, endArrow: true },
});

register(
  'behavior',
  'pin-click',
  extensionFactory(() => {
    let context: ExtensionContext | undefined;
    return {
      init(next) {
        context = next;
      },
      getEvents() {
        return {
          'node:click': ({ nodeId }) => context?.state.set(nodeId, ['selected']),
        };
      },
    };
  }),
);
```

Register before creating the Graph, or before a render that reads the name. Behaviors, transforms, and plugins resolve names from the registry at render time.

A plain object or a zero-argument class can still be registered. Objects are cloned on a best-effort basis, and classes are constructed again. Use `extensionFactory()` when a stateful extension needs a predictable instance per graph.

## `extensionFactory()` [#extensionfactory]

```ts
extensionFactory(factory: () => Extension): () => Extension
```

Marks the function as an extension factory. The engine calls it once per Graph, so graphs do not share one closure.

## Extension context [#extension-context]

Behaviors, plugins, and some layouts receive `ExtensionContext` from `init(context, options)`. `options` is read-only.

| Member                                                       | Use                                         |
| ------------------------------------------------------------ | ------------------------------------------- |
| `context.data.getNode(id)` / `getEdge(id)`                   | Read a read-only snapshot                   |
| `context.data.getNodeIds()` / `getEdgeIds()`                 | Current id lists                            |
| `context.data.updateNode(id, data)` / `updateEdge(id, data)` | Merge business fields                       |
| `context.state.set(id, states)`                              | Replace one element's state list            |
| `context.state.setAll(stateMap)`                             | Replace many elements at once               |
| `context.state.get(id)` / `clear(id)`                        | Read or clear state                         |
| `context.viewport.screenToGraph(point)`                      | Client coordinates to graph coordinates     |
| `context.viewport.graphToScreen(point)`                      | Graph coordinates to client coordinates     |
| `context.viewport.getZoom()`                                 | Current zoom                                |
| `context.requestRender()`                                    | Request a draw on the next frame            |
| `context.isDestroyed()`                                      | Whether the owning Graph has been destroyed |

Snapshots from `data` cannot be mutated in place. Write through `updateNode`, `updateEdge`, and `state`.

`context.graph`, and the flat `screenToGraph()`, `graphToScreen()`, and `getZoom()` on the context, remain for existing extensions. New extensions use `data`, `state`, `viewport`, and `requestRender()`.

## `runLayout()` [#runlayout]

Compute positions without creating a Graph:

```ts
import { runLayout } from '@antv/g6-lite';

const result = await runLayout(
  { nodes, edges },
  { type: 'dagre', rankdir: 'LR' },
  { width: 800, height: 600 },
);

result.nodes.forEach((node) => {
  node.x;
  node.y;
});
```

```ts
runLayout(
  data: GraphData,
  config: LayoutConfig,
  viewport?: { width: number; height: number },
): Promise<LayoutResult>
```

`LayoutResult` is `{ nodes }`, and every node has numeric `x` and `y`. A registered layout of the same name, and the built-in `mindmap`, `indented`, and `fishbone` layouts, run before `@antv/layout`. With `config.worker: true`, algorithms that support a Worker run there and fall back to the same algorithm on the main thread if the Worker fails.

To rerun layout on a Graph that is already rendered, use [`graph.setLayout()`](/en/docs/api/graph#layout) and `graph.layout()`. Those calls write coordinates back into the current graph and draw.
