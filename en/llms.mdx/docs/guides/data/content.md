# Data and Graph options (/en/docs/guides/data)



`GraphData` contains nodes, edges, and optional combos. IDs must be stable; put application fields under `data`.

```ts
const graph = new Graph({
  container: 'graph',
  data: {
    nodes: [{ id: 'a', data: { type: 'service' } }, { id: 'b' }],
    edges: [{ source: 'a', target: 'b', data: { relation: 'calls' } }],
  },
  node: { type: 'circle' },
  edge: { type: 'line' },
  layout: { type: 'circular' },
  behaviors: ['zoom-canvas', 'drag-canvas'],
  theme: 'light',
});

await graph.render();
```

Use `transforms` for reusable data processing such as parallel-edge separation and `plugins` for managed capabilities. Destroy the graph when its container is removed.
