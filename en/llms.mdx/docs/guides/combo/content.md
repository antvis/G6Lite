# Combos (/en/docs/guides/combo)



Combo capabilities are experimental during `0.1.x`.

```ts
const graph = new Graph({
  container: 'container',
  data: {
    nodes: [
      { id: 'n1', comboId: 'frontend' },
      { id: 'n2', comboId: 'frontend' },
    ],
    edges: [],
    combos: [{ id: 'frontend', data: { label: 'Frontend' } }],
  },
  combo: { style: { padding: 24, fill: 'rgba(22,119,255,0.06)' } },
});
```

Use `collapseCombo()`, `expandCombo()`, and `toggleCombo()` for visibility. Runtime grouping APIs include `addToCombo()`, `removeFromCombo()`, `createCombo()`, and `removeCombo()`.
