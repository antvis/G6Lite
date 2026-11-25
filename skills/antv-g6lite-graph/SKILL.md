---
name: antv-g6lite-graph
description: 'Build, customize, debug, optimize, or migrate graph visualizations using @antv/g6-lite: standalone HTML, React integration, relationship networks, topology, flowcharts, trees, and mind maps. Use for G6Lite layouts, styles, interactions, data updates, extensions, and WebGL issues. For G6 v5, use only when assessing or performing migration to G6Lite; not for G6 v5 implementation, G2 charts, X6 editors, or S2 tables.'
---

# AntV G6Lite Graph

Deliver a runnable graph that fits the user's data, environment, and interactions. Use G6Lite's public contract; do not fill API gaps from G6 v5 memory.

## Choose the task path

Read only the resources needed for the current task. Paths below are relative to this skill directory and remain usable when the skill is installed outside the G6Lite repository.

| Task | Start here |
| --- | --- |
| Single HTML file or browser preview | Adapt [references/templates/standalone.html](references/templates/standalone.html); use the default CDN below |
| React application | Adapt [references/templates/react-graph.tsx](references/templates/react-graph.tsx); retain the existing project's dependency version and styling conventions |
| Data, styles, events, selection, updates, or Combo | [references/api-recipes.md](references/api-recipes.md) |
| Choose, configure, register, or switch layouts | [references/layouts.md](references/layouts.md) |
| Improve visual clarity and interaction feedback | [references/visual-design.md](references/visual-design.md) |
| Blank canvas, incorrect behavior, or slow graph | [references/troubleshooting.md](references/troubleshooting.md) |
| Move an existing G6 v5 visualization | [references/migration.md](references/migration.md) |
| Custom node, edge, label, decoration, behavior, layout, transform, or plugin | Read the relevant section of the [extension guide](https://g6lite.antv.vision/en/docs/guides/extensions) and [extension contract](https://g6lite.antv.vision/en/docs/api/extensions) |

## Work from the actual environment

1. Identify the runtime/framework, input data, approximate node/edge counts, required interactions, and target viewport. Infer routine choices from the project; ask only when missing information changes the implementation.
2. In an existing project, inspect the installed package version and public declarations before choosing options. These recipes reflect the 0.1.0 contract; a moving CDN may resolve a newer release. Match code to the version actually loaded.
3. For a new graph, prove the container and data with a small runnable configuration. Preserve an existing working instance when modifying a graph.
4. Add the selected layout, visual encoding, and interactions. Use public state/data APIs for updates and destroy the instance on unmount.
5. Validate the requested behavior in a browser when available. Report the delivered files, how to run them, what was checked, and any capability still unverified.

For uncertain APIs, check installed declarations, then version-matched official documentation/examples. In a G6Lite source checkout, `src/index.ts`, `src/types.ts`, `site/content/docs/en/`, and `site/demos/` are useful evidence. Generated application code must not depend on those repository paths or demo tooling.

## CDN and package entry

Default to this unversioned URL for standalone examples and previews:

```html
<script src="https://unpkg.com/@antv/g6-lite"></script>
```

It resolves npm's `latest` tag and the package's UMD entry, exposing `window.G6Lite`. Do not hardcode `0.1.0` throughout generated examples. When the user requests a fixed release or reproducible deployment, resolve and use that exact version. The unversioned URL does not upgrade an already loaded page.

For an alternative CDN, use `https://cdn.jsdelivr.net/npm/@antv/g6-lite/dist/g6-lite.min.js`. Load one main script, not both. Optional layouts need an additional bundle and registration; see [layouts.md](references/layouts.md). When using companion bundles, resolve one version for all scripts rather than independently resolving `latest` during a release.

In bundled applications, use ESM:

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: '#container',
  data: {
    nodes: [{ id: 'a' }, { id: 'b' }],
    edges: [{ id: 'a-b', source: 'a', target: 'b' }],
  },
  node: { style: { label: (node) => node.name ?? node.id } },
  layout: { type: 'dagre', rankdir: 'LR', ranksep: 80 },
  behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'hover-highlight'],
});
await graph.render();
// When the owning page/component is removed: graph.destroy();
```

The container must already exist, have nonzero width/height, and use `position: relative` for overlays. `container` accepts an HTMLElement or CSS selector (`'#container'`, not `'container'`). Create Graph only on the client with DOM, Canvas, and WebGL. Do not put bare npm imports in plain HTML without a bundler/import map or use synchronous `require('@antv/g6-lite')`.

## Contract details that prevent common failures

- Import runtime APIs from the package root or documented exports such as `@antv/g6-lite/layouts/mindmap`. Do not deep-import source or distribution internals in application code; CDN browser distribution URLs are separate.
- Nodes need unique string IDs and edges must reference existing node IDs. Give edges stable explicit IDs when selection or updates must survive data replacement.
- Node borders use `node.style.strokeWidth`; labels use `node.style.label`, `labelColor`, `labelFontSize`, and `labelPlacement`. Do not use nested `node.label` objects.
- Arrows use `edge.style.endArrow: true` and `arrowSize: 6`; `startArrow` is also boolean. Arrow objects such as `{ fill, size }` are unsupported and can cause rendering errors during dragging in 0.1.0.
- Node/edge states belong in `node.stateStyles` / `edge.stateStyles`; Combo states belong in `combo.style.stateStyles`. Prefer per-field node style callbacks when combining data-driven styles and state styles.
- Use `hover-highlight`, not `hover-element`. To dim unrelated elements, combine `{ type: 'hover-highlight', inactiveState: 'inactive' }` with `stateStyles.inactive`; related elements use `stateStyles.highlight`.
- Omitting `behaviors` enables default canvas zoom/drag. A supplied array replaces defaults; `[]` disables them. Include each required behavior explicitly.
- Await `render()`, `setData()`, and `layout()`. `setData()` replaces data and normally fits the view; pass `{ fitView: false }` to retain the camera. Incremental mutations schedule drawing without another `render()`.
- `setLayout()` configures only; follow it with `await graph.layout()`. Registered optional layouts execute on the main thread. A resolved Promise alone does not prove that a Worker ran or a cancelled layout was applied.
- Custom stateful extensions need a factory returning a fresh instance and cleanup of owned listeners, DOM, timers, or Workers. Use public `ExtensionContext` rather than renderer internals.

## Capability boundary

Built-in node primitives are `circle` and `rect`; edge paths include `line`, `arc`, `polyline`, and `cubic`. Layout choices and optional imports are listed in [layouts.md](references/layouts.md). Common behaviors cover canvas zoom/drag, node/edge drag, click/brush/lasso selection, hover highlighting, and tooltip.

Do not promise arbitrary React/HTML/SVG node trees, multiple renderers, Node.js rendering/SSR, 3D, complete animation orchestration, G6 v5 plugins, or graph algorithms. For such requirements, explain the gap and propose a supported alternative before changing the user's implementation.

## Validate the delivered result

- Check script/import loading, the actual package version, nonzero container size, and browser console errors.
- Confirm expected nodes/edges, readable labels, layout direction, and no unintended clipping at the target viewport.
- Exercise the requested zoom, pan, drag, hover, click, and search actions. Confirm state clearing preserves other state the application owns.
- For dynamic integration, change data, resize the container, and unmount/remount. Check that old asynchronous work does not update a destroyed graph or overwrite newer application results. The React template includes a latest-pending-data queue for this case.
- For performance tasks, measure layout, first render, interaction, and memory separately on representative data and hardware. Do not convert one benchmark into a capacity guarantee.

When browser execution is unavailable, still check syntax/types and data invariants, and state that visual/interaction checks were not run.
