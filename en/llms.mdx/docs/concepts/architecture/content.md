# Technical architecture (/en/docs/concepts/architecture)





This page explains module responsibilities and collaboration for readers exploring rendering, performance paths, or extension boundaries. See [Graph lifecycle](/en/docs/concepts/graph-lifecycle) for the application calling sequence.

## Architecture layers [#architecture-layers]

<ArchitectureDiagram locale="en" />

Applications use `Graph` and extension contracts from the package root. Graph orchestrates transforms, layouts, and the runtime; DataModel owns graph data and states; RenderScheduler coordinates drawing based on the scope of each change. Renderer, Picking, and GPU buffers are internal implementation details.

These layers share one graph runtime. Layouts provide positions, interactions produce data or state changes, and the scheduler sends changes to the appropriate drawing layers. This division lets layouts, information layers, and interactions be extended independently.

## Drawing layers [#drawing-layers]

G6Lite batches nodes and edges through WebGL and uses Canvas 2D for text measurement, label collision, and grouping bounds:

| Layer, bottom to top | Content                        | Reason                                                    |
| -------------------- | ------------------------------ | --------------------------------------------------------- |
| Canvas 2D underlay   | Combo boundaries               | Fits group bounds and background information              |
| Main WebGL canvas    | Nodes, edges, and arrows       | Supports batched geometry and buffer updates              |
| Canvas 2D overlay    | Labels, icons, and decorations | Supports text measurement, layout, and collision handling |

The layers share the camera, dimensions, DPR, and scheduling signals within one Graph. WebGL prefers WebGL2 and falls back to WebGL1. See [Browsers and runtime](/en/docs/compatibility/browser) for environment requirements.

## Rendering and update paths [#rendering-and-update-paths]

### First-render data flow [#first-render-data-flow]

Calling `render()` prepares input, builds the runtime, and draws the first frame:

<FirstRenderFlow locale="en" />

When asynchronous layout or extension initialization returns, Graph checks the active render generation and destroyed state so stale results cannot replace newer data. Generations are an internal cancellation and result-commit mechanism; applications manage instances through public lifecycle methods.

### Frequent-update paths [#frequent-update-paths]

RenderScheduler selects processing based on the change level:

| Change                                | Main path                                                                    |
| ------------------------------------- | ---------------------------------------------------------------------------- |
| Node selected / highlight / inactive  | Resolve state and patch GPU styles, reprocessing when required               |
| Edge business fields or states        | Fully process data to keep edge types, visibility, and arrow batches aligned |
| Batched node positions                | Update adjacency data, upload affected buffer ranges, redraw Canvas layers   |
| Label or Combo information            | Redraw the corresponding Canvas 2D information layer                         |
| Camera pan and zoom                   | Update uniforms and draw without rebuilding graph-data buffers               |
| Full replacement or structural change | Update DataModel and fully or partially process render data and buffers      |

Selection, highlighting, and dragging should update the existing instance through state, position, and batch APIs. See [Data](/en/docs/guides/data) for choosing update methods and [Performance tuning](/en/docs/metrics/performance-tuning) for practical guidance.

## Layout and interaction collaboration [#layout-and-interaction-collaboration]

### Layout and Worker [#layout-and-worker]

The layout layer computes positions from graph data and configuration. Graph commits the result to DataModel and passes it to Renderer. Official algorithms are lazy-loaded by `layout.type`; supported expensive layouts can run in a Worker to reduce main-thread blocking.

Cancelled layout results are not committed to the active render generation. A Worker does not remove algorithm cost, and data with existing coordinates can omit layout. See [Layout configuration](/en/docs/guides/layout) for algorithms, options, and Worker limits.

### Interaction and picking [#interaction-and-picking]

InteractionDispatcher centralizes pointer events and hit detection, then delivers normalized events to Behaviors:

```text
Native event → Hit detection → Graph event → Behavior → Public data or state API
```

Nodes and edges prefer GPU Picking and fall back to CPU detection when the picking buffer is unavailable. Combo uses its own geometric hit path. Picking buffers are maintained on demand; drawing does not always require a picking pass.

Interaction changes return through the update scheduler, so Behaviors do not need to manipulate framebuffers. See [Interactions](/en/docs/guides/interactions) and [Events](/en/docs/guides/events) for application usage.

## Extension boundary [#extension-boundary]

G6Lite supports node, edge, label, decoration, layout, behavior, transform, and plugin extensions. These contribute shape descriptions, information layers, positions, event responses, or runtime orchestration.

Stateful extensions collaborate through the data, state, viewport, and `requestRender()` capabilities of `ExtensionContext`. They should not hold internal DataModel, Renderer, WebGL contexts, or GPU buffers.

See [Extensions](/en/docs/guides/extensions) for registration, instance scope, and cleanup, and [API stability](/en/docs/compatibility/api-stability) for public contract stability.
