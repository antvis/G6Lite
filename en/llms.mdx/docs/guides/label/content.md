# Labels and icons (/en/docs/guides/label)



```ts
node: {
  style: {
    label: (node) => String(node.data?.name ?? node.id),
    labelPlacement: 'bottom',
    labelFill: '#344054',
  },
}
```

Edge labels can read source, target, and edge data. Labels and combo outlines use Canvas 2D above the WebGL surface. For large graphs, show only important labels initially and reveal more by zoom level, selection, or focus.

## Global label policies [#global-label-policies]

Use the top-level `label` option to configure zoom thresholds and collision behavior:

```ts
const graph = new Graph({
  label: {
    scaleWithZoom: true,
    hideOnLowZoom: true,
    hideOnCollision: true,
    nodeMinZoom: 0.5,
    edgeMinZoom: 0.5,
  },
});
```

Node labels default to a minimum zoom of `0.3`; edge labels default to `0.5`. Setting `hideOnLowZoom` to `false` bypasses both thresholds. These options can be updated at runtime with `graph.updateOptions({ label: ... })` without rerunning layout.
