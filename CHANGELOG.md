# @antv/g6-lite

## Unreleased

### Branding and package name

- Restore the product brand to `G6Lite` and the published package coordinate to `@antv/g6-lite`.
- Treat `G6-GL` and `@antv/g6-gl` as historical names only; current installation and import examples use `@antv/g6-lite`.
- Keep the GitHub repository at `antvis/G6Lite`. Website domain naming and configuration are outside this rename and remain unchanged.

### Beta API rebaseline

- Keep `new Graph(options)` as the stable and recommended graph creation API. Core stateful engine modules remain classes.
- Add the unified `register()` and `extensionFactory()` extension model with consistent lifecycle isolation for behaviors, layouts, transforms, and plugins.
- Add scoped `ExtensionContext.data`, `.state`, `.viewport`, and `requestRender()` capabilities. Direct `context.graph` access remains deprecated beta compatibility only.
- Return read-only extension data snapshots, isolate legacy object state on a best-effort basis, and guarantee stateful isolation through `extensionFactory()`.
- Add public read-only `NodeModel`, `EdgeModel`, `ComboModel`, and `ElementModel` query types.
- Remove `DataModel`, `RenderScheduler`, `RefreshLevel`, `RendererData`, and `Internal*` types from the package-root compatibility contract.
- Convert the built-in mindmap, indented, and fishbone implementations to stateless layout executors without changing their configuration API.
- Harden render/layout cancellation, per-request Worker isolation, Combo membership cleanup, and async label image teardown.
- Isolate Node/Edge extension callback failures so custom styles, overlays, and boundary calculations cannot abort the render pipeline.
- Retain `BaseNode`, `BreathingNode`, `registerNode()`, unmarked factories, and class constructors as deprecated beta migration adapters.
- Keep the package ESM-only. Internal relative `.js` import suffixes remain required by the current TypeScript-to-Node-ESM build and are not a consumer-facing import convention.

See the [G6 v5 migration guide](./site/content/docs/zh/compatibility/g6-v5-migration.mdx) for upgrade steps.

## 0.1.0

### Patch Changes

- First public release under the historical G6-GL brand (0.1.0).

  A high-performance WebGL graph analysis engine for large-scale graph data.

  - **Rendering**: WebGL renderer with zoom-stable edge/arrow clamping, arc smoothing, and configurable arrow size.
  - **Layouts**: pluggable layouts via `@antv/layout` (force, grid, circular, radial, dagre/mindmap, fishbone).
  - **Interaction**: unified element event dispatcher, tooltip support, brush-select, drag, and zoom behaviors.
  - **Combo & labels**: combo grouping and a dedicated label renderer.
  - **Theming**: light/dark theme support.
  - **Quality**: frozen public API surface, per-file coverage thresholds on core modules, and renderer regression tests.
