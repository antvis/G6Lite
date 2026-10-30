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
  container: 'container',
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

Give the container an explicit width and height. Call `graph.destroy()` when the page or component unmounts.

## Critical rules

### Package and runtime

- Import only from `@antv/g6-lite`. Never import from `@antv/g6-lite/src/...`, `dist/...`, or repository internals.
- Treat the current package as ESM-only. Do not generate synchronous `require('@antv/g6-lite')` examples.
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
- Use `register()` and `extensionFactory()` for custom node, edge, label, decoration, layout, behavior, transform, and plugin extensions.
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
- `Use $antv-g6lite-graph to migrate this G6 v5 configuration and list unsupported capabilities before editing code.`
- `Use $antv-g6lite-graph to diagnose why this graph renders blank in React.`
- `Use $antv-g6lite-graph to optimize a 10k-node graph without changing its public behavior.`
