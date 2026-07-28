# Data model (/en/docs/concepts/data-model)



`GraphData` contains `nodes`, `edges`, and optional `combos`:

```ts
const data = {
  nodes: [
    { id: 'gateway', data: { label: 'Gateway' } },
    { id: 'orders', data: { label: 'Orders' } },
  ],
  edges: [{ source: 'gateway', target: 'orders', data: { qps: 1200 } }],
};
```

Node IDs must be stable. Put business fields under `data`; use `x` and `y` when coordinates are already available. Edges declare `source` and `target` and may provide a stable `id`. Combos group nodes through `comboId` and remain experimental during the `0.1.x` beta.

Use states for selection, highlighting, and dimming:

```ts
graph.batchSetState([
  { id: 'gateway', state: 'selected', value: true },
  { id: 'orders', state: 'inactive', value: true },
]);
```

Query APIs return normalized read-only model views. Modify graph-owned data through update, position, and state APIs instead of mutating query results.
