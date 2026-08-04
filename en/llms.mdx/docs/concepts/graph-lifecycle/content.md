# Graph lifecycle (/en/docs/concepts/graph-lifecycle)



`Graph` is the main public entry point.

```ts
const graph = new Graph({ container: 'graph', data, layout: { type: 'force' } });
await graph.render();
```

Construction resolves the container and prepares the rendering surface. `render()` sizes the canvases, resolves the theme, runs layout, initializes data and transforms, starts WebGL and interaction layers, fits the viewport, and emits `afterrender`.

Use `setData()` for complete replacement. Use `addNode`, `addEdge`, update, remove, and state APIs for incremental changes. To run another layout:

```ts
graph.setLayout({ type: 'dagre', rankdir: 'LR' });
await graph.layout();
```

Viewport APIs include `fitView()`, `focusItem()`, `setCamera()`, `screenToGraph()`, and `graphToScreen()`. Always call `graph.destroy()` during page or component cleanup.

## Container resize [#container-resize]

G6Lite uses `ResizeObserver` to keep the canvas dimensions synchronized with its container. Calling `setSize(width, height)` uses the same viewport update path. Both preserve the current camera by default so a user's zoom and pan are not overwritten.

Enable automatic fitting for resizable panels or expanding sidebars:

```ts
const graph = new Graph({
  container: 'graph',
  data,
  autoFitOnResize: {
    padding: 24,
    minZoom: 0.2,
    maxZoom: 1.5,
  },
});
```

`autoFitOnResize: true` is equivalent to calling `fitView(0.9)` after a size change. A numeric scale or `FitViewOptions` can also be passed directly. The `resize` event is emitted after the optional fit finishes, so listeners observe the final camera. Leave the option disabled for large graphs or flows that must preserve the user's viewport.
