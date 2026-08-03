# Graph library comparison (/en/docs/compatibility/library-comparison)



This page is a capability guide, not a performance ranking. Versions were checked on **2026-08-03**: G6Lite `0.1.0-beta.22`, AntV G6 `5.1.1`, sigma.js `3.0.3`, and Cytoscape.js `3.34.0`. Sigma v4 was still alpha, so the stable v3 line is used here.

Status terms: **Supported** means the core package or an official built-in capability can be used directly; **Partial** means clear boundaries apply; **External** means an official companion package, ecosystem extension, or application code is normally required; **Not supported** means the current public API has no equivalent.

## Short recommendation [#short-recommendation]

* **G6Lite** is a compact WebGL graph engine for products that need frequent picking, state, and incremental updates after a large graph is rendered and can work within a controlled extension surface.
* **AntV G6 v5** is a full graph visualization framework for rich elements, animation, components, plugins, multiple renderers, and the broader AntV ecosystem.
* **sigma.js v3** is a WebGL renderer built on Graphology, well suited to large-network exploration with existing coordinates or a separate layout pipeline.
* **Cytoscape.js** combines a graph-theory model with interactive visualization and fits applications that need graph queries, algorithms, mature extensions, and Node.js analysis.

## Rendering, data, and layout [#rendering-data-and-layout]

| Dimension                | G6Lite                                                                                         | AntV G6 v5                                                                                               | sigma.js v3                                                                            | Cytoscape.js                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Rendering                | **Supported**: WebGL 2/1 for nodes and edges; Canvas 2D for labels and combos                  | **Supported**: AntV G renderers include Canvas, SVG, and WebGL, plus documented Node.js server rendering | **Supported**: WebGL renderer aimed at graphs with thousands of nodes and edges        | **Supported**: browser Canvas renderer; graph model can also run without a renderer |
| Data model               | **Supported**: `GraphData` and one Graph API with business `data` and states                   | **Supported**: complete graph and element model                                                          | **External**: Graphology is the required graph model                                   | **Supported**: built-in graph-theory model, collections, selectors, and queries     |
| Layouts                  | **Supported**: 14 layouts from AntV Layout plus mindmap, indented, and fishbone                | **Supported**: more than ten layouts and custom layout support                                           | **External**: normally Graphology layout packages, workers, or precomputed coordinates | **Supported**: core layouts plus a large layout-extension ecosystem                 |
| Worker / parallel layout | **Partial**: common layouts accept `worker: true`; custom layouts receive cancellation signals | **Supported**: official layout system includes parallel and extension options                            | **External**: Graphology layout workers or application infrastructure                  | **External**: depends on the selected layout extension                              |
| Incremental updates      | **Supported**: node, edge, state, visibility, and camera batch/incremental APIs                | **Supported**: complete runtime data and element update APIs                                             | **Supported**: renderer reacts to Graphology mutations                                 | **Supported**: collection mutations, batching, and style updates                    |

Layout time and rendering-only time must be measured separately. A sigma.js case that reuses coordinates cannot be fairly compared with another candidate that recomputes a force layout as part of first render.

## Elements, labels, and grouping [#elements-labels-and-grouping]

| Dimension             | G6Lite                                                                                                                 | AntV G6 v5                                                                      | sigma.js v3                                                                                                         | Cytoscape.js                                                         |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Nodes                 | **Partial**: circle and rect built in; registered extensions reuse built-in primitives and overlays                    | **Supported**: rich built-in nodes, custom elements, and a React-node ecosystem | **Partial**: built-in node programs and custom WebGL programs                                                       | **Supported**: multiple shapes, mapped styles, and extensions        |
| Edges                 | **Partial**: line, arc, polyline, cubic, arrows, routing, parallel edges, and edge extensions                          | **Supported**: rich edge types, routing, decorations, and custom elements       | **Partial**: built-in edge programs and custom WebGL programs                                                       | **Supported**: multiple curves, arrows, endpoints, and mapped styles |
| Labels                | **Supported**: Canvas 2D labels, backgrounds, rotation, width limits, and custom Label Renderers                       | **Supported**: node, edge, and combo labels with rich styling                   | **Partial**: node labels are core; edge labels and advanced typography commonly require extensions or customization | **Supported**: node and edge labels with rich text styling           |
| Combo / compound node | **Partial**: declaration, nesting, collapse, regrouping, states, and group drag are supported but experimental in beta | **Supported**: complete Combo element and interaction ecosystem                 | **Not supported**: no equivalent visual group container in the core renderer                                        | **Supported**: compound nodes are part of the core model             |
| Visual states         | **Supported**: built-in/custom states, batching, state styles, queries, and visibility                                 | **Supported**: element states and interaction integration                       | **Partial**: commonly represented with Graphology attributes, reducers, and application state                       | **Supported**: classes, selectors, styles, and interaction state     |

G6Lite node and edge extensions preserve its WebGL batching primitives. They are not direct replacements for arbitrary G6 v5 Canvas/SVG scene-graph subclasses. Validate G6 v5 or Cytoscape.js first when the product requires arbitrary paths, complex DOM/React nodes, or a complete shape tree.

## Interaction, extension, and ecosystem [#interaction-extension-and-ecosystem]

| Dimension            | G6Lite                                                                                                               | AntV G6 v5                                                                                          | sigma.js v3                                                                                                       | Cytoscape.js                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Built-in interaction | **Supported**: 11 Behaviors for zoom, pan, drag, selection, highlight, brush, lasso, tooltip, and edge endpoint drag | **Supported**: more than ten Behaviors with a broader feature surface                               | **Partial**: camera, hover, click, and basic drag building blocks; editing is usually composed in the application | **Supported**: core gestures, selection, dragging, and events                                   |
| Custom interaction   | **Supported**: Behavior registration with `create → init → getEvents → destroy`                                      | **Supported**: BaseBehavior and registration system                                                 | **Supported**: events, camera, reducers, and application logic                                                    | **Supported**: event system, extensions, and application logic                                  |
| Extension categories | **Supported**: node, edge, label, decoration, layout, behavior, transform, plugin                                    | **Supported**: full element, Behavior, Layout, Transform, and Plugin system                         | **Partial**: custom programs, renderer settings, and the Graphology ecosystem                                     | **Supported**: layout, renderer, interaction, import/export, and analysis extensions            |
| Plugins              | **Partial**: public Plugin lifecycle exists, but built-ins and community ecosystem are still small                   | **Supported**: mature built-in and ecosystem plugins such as toolbar, minimap, tooltip, and history | **External**: community packages and framework integrations provide many product components                       | **Supported**: mature extension directory across layout, analysis, and UI                       |
| Animation            | **Partial**: no general Graph animation orchestration API; isolated element effects or extensions are possible       | **Supported**: element, layout, viewport, and transition animation system                           | **Partial**: camera and node-attribute animation utilities; complex timelines stay in application code            | **Supported**: element and viewport animation APIs                                              |
| Graph algorithms     | **Not supported**: neighbor and adjacent-edge queries only; no built-in shortest-path or centrality suite            | **Supported**: official package integrates `@antv/algorithm`                                        | **External**: use Graphology standard-library algorithm packages                                                  | **Supported**: traversal, shortest paths, centrality, connectivity, and other graph-theory APIs |

## Runtime and package shape [#runtime-and-package-shape]

| Dimension            | G6Lite                                                         | AntV G6 v5                                                               | sigma.js v3                                                                                               | Cytoscape.js                                                        |
| -------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Browser requirements | Modern ESM, real DOM/Canvas, and WebGL 1.0+                    | Depends on the selected renderer and build target                        | Modern browser with WebGL                                                                                 | Browser Canvas; can also run headless                               |
| Node.js / SSR        | **No rendering**: create Graph only in a client lifecycle      | **Supported**: official documentation describes Node.js server rendering | **Partial**: Graphology runs in Node.js, while the Sigma renderer still needs a browser/WebGL environment | **Supported**: graph model and algorithms run headlessly in Node.js |
| TypeScript           | Bundled types; package-root exports define the public contract | TypeScript source and complete types                                     | Bundled types                                                                                             | Type declarations included                                          |
| Maturity             | `0.1.x` beta with a controlled API surface and young ecosystem | Stable `5.1.1` with the broader AntV ecosystem                           | Stable `3.0.3`; v4 is alpha                                                                               | Stable `3.34.0` with long-running maintenance and extensions        |

## How to choose [#how-to-choose]

Prefer G6Lite when the target environment reliably supports WebGL; post-render picking, state, and batch updates are the main bottleneck; circle/rect nodes, common edge primitives, and controlled extensions cover the visual requirements; and SSR, a general animation system, and graph algorithms are not required.

Prefer G6 v5 when the product needs rich elements, the complete plugin and animation systems, multiple renderers, React nodes, 3D, or server-side rendering, and a broader capability surface matters more than the smallest runtime.

Prefer sigma.js when the team already uses Graphology, coordinates come from a backend or separate layout pipeline, and the main product workflow is browsing, filtering, and exploring large networks.

Prefer Cytoscape.js when graph-theory analysis, compound nodes, complex selectors, headless Node.js, and mature scientific/network-analysis extensions are central requirements.

## Fair validation checklist [#fair-validation-checklist]

1. Pin candidate versions, data, coordinates, styles, label policy, viewport, DPR, browser, and hardware.
2. Split preset-coordinate and relayout cases, and report layout versus rendering-only time separately.
3. Test drag, zoom, picking, highlighting, batch updates, and post-destroy memory trends in addition to first render.
4. Use realistic combos, labels, arrows, and state counts instead of bare points and lines only.
5. Record median, P95, sample count, and error, and archive the complete adapter and configuration.

See [performance metrics](/en/docs/metrics/performance) and [performance tuning](/en/docs/metrics/performance-tuning) for the G6Lite measurement workflow.

## Official sources [#official-sources]

* [AntV G6 README](https://github.com/antvis/G6#readme) and [G6 documentation](https://g6.antv.antgroup.com/)
* [sigma.js README](https://github.com/jacomyal/sigma.js#readme), [sigma.js documentation](https://www.sigmajs.org/docs/), and [Graphology](https://graphology.github.io/)
* [Cytoscape.js README](https://github.com/cytoscape/cytoscape.js#readme) and [Cytoscape.js documentation](https://js.cytoscape.org/)
