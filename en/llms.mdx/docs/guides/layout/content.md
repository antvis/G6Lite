# Layout configuration (/en/docs/guides/layout)



```ts
layout: { type: 'force', linkDistance: 100, worker: true }
```

Use circular or grid for deterministic overviews, dagre for hierarchies, force and d3-force for networks, and mindmap, indented, or fishbone for tree-oriented presentation. If coordinates already exist, omit layout and use node `x` / `y`.

Run another layout at runtime:

```ts
graph.setLayout({ type: 'dagre', rankdir: 'LR' });
await graph.layout();
```

Worker execution reduces main-thread blocking but does not make expensive layouts free. Control iterations and measure with real data.
