---
name: antv-g6lite-graph
description: 'Create, customize, migrate, optimize, or troubleshoot graph and network visualizations built with @antv/g6-lite. Use for G6Lite relationship graphs, topology diagrams, trees, flowcharts, mind maps, fishbone diagrams, WebGL rendering, layouts, nodes, edges, labels, Combo, behaviors, events, states, extensions, large-graph performance, browser compatibility, or G6 v5 migration. Do not use for @antv/g6 v5 implementation details, G2 statistical charts, X6 editors, or S2 tables.'
---

# AntV G6Lite Graph

Build and review G6Lite visualizations using the package-root contract. Keep generated code aligned with the installed version instead of filling gaps from G6 v5 memory.

## Workflow

1. Identify the runtime, framework, data shape, graph size, interaction needs, and browser constraints.
2. Start with the smallest public `Graph` configuration that proves the data and container work.
3. Choose a layout from the supported set, or preserve supplied `x` / `y` coordinates.
4. Add behaviors, labels, states, Combo, and extensions incrementally.
5. Prefer batch and state APIs for frequent updates; do not recreate the Graph for every change.
6. Validate the result in a real, sized browser container and destroy the Graph on unmount.
7. Check current package types, official examples, and documentation before using an uncertain option.

## Minimal graph

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: '#container',
  data: {
    nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
    edges: [
      { source: 'a', target: 'b' },
      { source: 'a', target: 'c' },
    ],
  },
  layout: { type: 'circular', radius: 140 },
  behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'hover-highlight'],
});

await graph.render();
```

`container` accepts a CSS selector or an `HTMLElement`. For `<div id="container">`, use `'#container'`. The element must already exist and have an explicit width and height. Call `graph.destroy()` when the page or component unmounts.

## CDN / standalone HTML

For a single HTML file or an online preview without a bundler, load the published UMD build and use `window.G6Lite`. Use npm ESM imports for existing bundled applications. Pin the CDN version; this example uses `0.1.0`.

- UNPKG: `https://unpkg.com/@antv/g6-lite@0.1.0/dist/g6-lite.min.js`
- jsDelivr: `https://cdn.jsdelivr.net/npm/@antv/g6-lite@0.1.0/dist/g6-lite.min.js`

Use one CDN URL. If it cannot be fetched, replace it with the other URL. The preview environment needs to allow external scripts and WebGL.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>G6Lite graph</title>
  </head>
  <body>
    <div id="container" style="width: 100%; height: 500px"></div>
    <script src="https://unpkg.com/@antv/g6-lite@0.1.0/dist/g6-lite.min.js"></script>
    <script>
      const graph = new window.G6Lite.Graph({
        container: '#container',
        data: {
          nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
          edges: [
            { source: 'a', target: 'b' },
            { source: 'a', target: 'c' },
          ],
        },
        layout: { type: 'circular', radius: 140 },
        behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'hover-highlight'],
      });
      graph.render().catch(console.error);
    </script>
  </body>
</html>
```

The main UMD script includes runtime dependencies and built-in layouts. For optional layouts, follow the [layout overview](https://g6lite.antv.vision/en/docs/guides/layout-overview#optional-layouts) and keep companion scripts on the same package version. Do not put a bare `import ... from '@antv/g6-lite'` in plain HTML without a bundler or an import map.

## Critical rules

### Package and runtime

- In bundled applications, import only from the public `@antv/g6-lite` package entry or its documented exports. Never deep-import `src/...`, `dist/...`, or repository internals; the published CDN script above is a browser distribution entry.
- The npm package uses ESM imports; the CDN UMD build exposes `window.G6Lite`. Do not generate synchronous `require('@antv/g6-lite')` examples.
- Create `Graph` only in a client lifecycle with real DOM, Canvas, and WebGL. Do not claim server-side rendering support.
- Await `graph.render()`, `graph.setData()`, and `graph.layout()` when using their asynchronous work.

### Data and configuration

- Give every node a unique string `id`; define edges with `source` and `target` node IDs.
- Use supplied node `x` / `y` coordinates when the application already owns layout output.
- Omit `behaviors` to use the default canvas zoom and drag behaviors. Use `behaviors: []` to disable defaults.
- Update the complete dataset with `setData()`. Use add, update, remove, state, visibility, and position APIs for incremental work.
- Use `setLayout()` followed by `await graph.layout()` for runtime layout changes.

### Supported capability boundary

- Built-in node primitives are `circle` and `rect`.
- Built-in edge paths cover `line`, `arc`, `polyline`, and `cubic`, including self-loop and arrow handling where configured.
- Official layouts include `circular`, `concentric`, `dagre`, `d3-force`, `force`, `force-atlas2`, `fruchterman`, `grid`, `mds`, `radial`, `random`, `fishbone`, `indented`, and `mindmap`.
- Common built-in behaviors include canvas zoom/drag, node drag, click selection, hover highlighting, edge drag, brush/lasso selection, and tooltip.
- Use `register()` for custom node, edge, label, decoration, layout, behavior, transform, and plugin extensions. Pass a factory that returns a fresh instance for stateful extensions.
- Do not invent arbitrary HTML/SVG node trees, G6 v5 plugins, animation orchestration, graph algorithms, Node.js rendering, or a mature community plugin ecosystem.

## Choose the implementation path

| Need                           | Preferred path                                      |
| ------------------------------ | --------------------------------------------------- |
| Known coordinates              | Omit layout and provide node `x` / `y`              |
| Deterministic overview         | `circular` or `grid`                                |
| Hierarchy or flow              | `dagre`                                             |
| Relationship network           | `force`, `d3-force`, or `force-atlas2`              |
| Tree presentation              | `mindmap`, `indented`, or `fishbone`                |
| Frequent highlight/selection   | State APIs and `batchSetState()`                    |
| Bulk position changes          | `updateNodePositions()`                             |
| Custom interaction             | Registered Behavior using public `ExtensionContext` |
| Peripheral DOM/controller      | Registered Plugin with explicit cleanup             |
| Render-time data preprocessing | Registered Transform                                |

## Performance checklist

- Measure data preparation, layout, first render, interaction, and memory separately.
- For large graphs, reduce label density and expensive functional style work before changing renderer internals.
- Use layout workers where supported, while still controlling iterations and validating cancellation.
- Prefer state and position patches for high-frequency interaction.
- Test real topology, viewport, DPR, browser, GPU, and target device; do not generalize from a single headless benchmark.
- Respect the documented WebGL, CSP, ESM, Worker, and context-count boundaries.

## Troubleshooting order

1. Confirm the container exists and has non-zero dimensions.
2. Confirm node IDs and edge endpoints are valid.
3. Remove optional styles, behaviors, labels, Combo, and extensions until the minimal graph renders.
4. Check browser WebGL availability and console errors.
5. Check the installed `@antv/g6-lite` types and package version.
6. Reintroduce layout and extensions one at a time.
7. Reproduce with an official example or a small dataset before proposing internal changes.

## G6 v5 migration guardrails

- Replace `@antv/g6` imports with `@antv/g6-lite` only after checking the capability matrix.
- Do not mechanically copy v5 element, plugin, animation, renderer, or event payload options.
- Map data, layout, behaviors, events, Graph APIs, and extensions explicitly.
- Keep G6 v5 when the application requires multiple renderers, SSR, React/HTML nodes, 3D, complete animation, rich built-in plugins, or graph algorithms.

## Example prompts

- `Use $antv-g6lite-graph to build a force-directed dependency graph with hover highlighting and node dragging.`
- `Use $antv-g6lite-graph to create a single HTML relationship graph using the pinned CDN script, with zooming, dragging, and hover highlighting.`
- `Use $antv-g6lite-graph to migrate this G6 v5 configuration and list unsupported capabilities before editing code.`
- `Use $antv-g6lite-graph to diagnose why this graph renders blank in React.`
- `Use $antv-g6lite-graph to optimize a 10k-node graph without changing its public behavior.`
