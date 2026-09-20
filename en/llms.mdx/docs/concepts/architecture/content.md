# Technical architecture (/en/docs/concepts/architecture)





G6Lite does not try to cover every shape and runtime. Its architecture combines a controlled public API, efficient graph-data paths, and specialized WebGL programs for large relationship graphs and frequent analytical interaction in modern browsers.

<ArchitectureDiagram locale="en" />

## Design boundary [#design-boundary]

* `Graph` is the application entry point for data, layout, rendering, interaction, and lifecycle.
* The package root exposes stable types and extension contracts; DataModel, Renderer, Picking, and GPU buffers remain internal.
* Nodes and edges use batched WebGL drawing. Labels and icons use a Canvas 2D overlay, while Combo boundaries use a Canvas 2D underlay.
* Layouts are lazy-loaded from `@antv/layout` and can run in a Worker when configured.
* G6Lite keeps graph-specific programs, batches, picking, and incremental updates instead of adopting a complete scene-graph engine.

## First-render data flow [#first-render-data-flow]

After `await graph.render()`, the runtime works in this order:

1. Create the current render generation, run registered transforms, and resolve the theme and container dimensions.
2. Lazy-load the selected layout and optionally calculate node positions in a Worker.
3. Create the DataModel and write nodes, edges, Combo, states, and positioned coordinates.
4. Convert nodes and edges into the contiguous typed arrays and GPU buffers required by renderer programs.
5. Mount InteractionDispatcher, Behaviors, LabelLayerRenderer, and ComboRenderer.
6. Update the camera through `fitView()`, then draw the Canvas 2D Combo underlay.
7. Draw nodes and edges in the WebGL normal pass, maintain the picking pass when needed, and draw the Canvas 2D label overlay.
8. Emit `afterrender` after the first frame, then mount ResizeObserver and Plugins.

After asynchronous layouts, extension initialization, or browser yields, Graph checks the active generation and destroyed state again so stale results cannot replace newer data.

## Frequent-update paths [#frequent-update-paths]

State, position, and data changes do not all rebuild the graph. RenderScheduler selects a path based on the change level:

| Change                                | Main path                                                                  |
| ------------------------------------- | -------------------------------------------------------------------------- |
| selected / highlight / inactive       | Resolve state and patch the affected GPU ranges                            |
| Batched node positions                | Update adjacency data, upload affected buffer ranges, redraw Canvas layers |
| Label or Combo information            | Redraw the corresponding Canvas 2D information layer                       |
| Camera pan and zoom                   | Update uniforms and draw without rebuilding graph-data buffers             |
| Full replacement or structural change | Rebuild DataModel and the affected render batches                          |

Frequent selection, highlighting, and drag interactions should use state, position, and batch APIs instead of repeatedly creating a new Graph.

## Why WebGL and Canvas 2D coexist [#why-webgl-and-canvas-2d-coexist]

WebGL is effective for batched homogeneous nodes and edges, GPU picking, and partial buffer updates. Text layout, icons, label collision, and Combo boundaries fit Canvas 2D better because measurements stay direct and the information layer does not need to move entirely into shaders.

These layers share the camera, dimensions, DPR, and scheduling signals. The Combo underlay sits below the primary WebGL canvas, while the label and icon overlay sits above it. They are not separate Graph instances.

## Layout and Worker boundary [#layout-and-worker-boundary]

Layout is not a Renderer responsibility. Graph invokes the layout layer and passes positioned data to DataModel and Renderer:

```text
GraphData → Layout → positioned nodes → DataModel → Renderer
```

Official layouts are dynamically loaded by `layout.type`. `worker: true` can reduce main-thread blocking, but it does not remove algorithm cost; iteration limits, cancellation, and real data scale still need validation.

When coordinates already exist, omit layout and provide node `x` / `y` values directly.

## Interaction and picking [#interaction-and-picking]

InteractionDispatcher centralizes pointer events and hit detection before it distributes normalized events to Behaviors:

```text
native event → GPU/CPU pick → graph event → Behavior → public state/data API
```

Nodes and edges prefer GPU Picking with a controlled CPU fallback. Combo is drawn in the Canvas 2D underlay and uses its own geometric hit path. A Behavior should not access framebuffers or reimplement picking.

## Extension boundary [#extension-boundary]

G6Lite supports eight extension categories: node, edge, label, decoration, layout, behavior, transform, and plugin. Prefer the factory pattern:

```ts
register(
  'behavior',
  name,
  extensionFactory(() => ({
    init(context, options) {},
    getEvents() {
      return {};
    },
    destroy() {},
  })),
);
```

Extensions work through controlled data, state, viewport, and `requestRender()` capabilities, reading snapshots and updating data through public methods. New extensions should not hold DataModel, Renderer, WebGL contexts, or GPU buffers directly.

## Browser platform and fallback [#browser-platform-and-fallback]

* Prefer a WebGL2 context and fall back to WebGL1 when required.
* Fall back to CPU hit detection when the picking framebuffer is incomplete or unavailable.
* Keep labels and Combo on Canvas 2D paths.
* Handle WebGL context loss/restoration, ResizeObserver, Worker cancellation, and Graph destruction through explicit lifecycles.
* The package is ESM-only and requires real DOM, Canvas, and WebGL; it does not support server-side graph rendering.

See [Browsers and runtime](/en/docs/compatibility/browser) and [API stability](/en/docs/compatibility/api-stability) for the complete boundary.

## Constraints for AI agents [#constraints-for-ai-agents]

AI-generated G6Lite code should depend only on the public API layer at the top of the diagram. Internal layers explain performance and troubleshooting, but they are not business imports.

Use [`$antv-g6lite-graph`](/en/docs/ai) to make an agent check package-root imports, runtime constraints, supported capabilities, and real validation before it generates code.
