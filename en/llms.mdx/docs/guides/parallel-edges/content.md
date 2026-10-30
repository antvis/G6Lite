# Parallel and self-loop edges (/en/docs/guides/parallel-edges)



```ts
const graph = new Graph({
  container: 'container',
  data,
  edge: { type: 'line', style: { endArrow: true } },
  transforms: [{ type: 'process-parallel-edges', distance: 20 }],
});
```

The transform assigns different paths to same-direction, reverse, and self-loop edges. Keep stable edge IDs when updates need to preserve identity.
