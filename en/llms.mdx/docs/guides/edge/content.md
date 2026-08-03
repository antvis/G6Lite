# Edges (/en/docs/guides/edge)



```ts
edge: {
  type: 'line',
  style: {
    stroke: '#91a3b0',
    lineWidth: 2,
    endArrow: true,
  },
  stateStyles: {
    highlight: { stroke: '#1677ff', lineWidth: 3 },
    inactive: { opacity: 0.2 },
  },
}
```

Use line, arc, cubic, or polyline edges according to the topology. Enable `process-parallel-edges` when multiple edges share endpoints. See [parallel edges](/en/docs/guides/parallel-edges).
