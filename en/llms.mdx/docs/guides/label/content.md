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
