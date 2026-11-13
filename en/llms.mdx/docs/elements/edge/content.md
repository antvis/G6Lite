# Edge overview (/en/docs/elements/edge)





## What is an edge? [#what-is-an-edge]

An edge connects two nodes and represents a relationship such as a service call or process dependency. `source` identifies the starting node, and `target` identifies the destination. Use `endArrow` for an arrow at the target or `startArrow` for an arrow at the source.

Two nodes can share several edges, such as separate read and write connections. When `source` and `target` are the same node, the edge draws as a self-loop.

## Edge types [#edge-types]

| Built-in type | Use                                                               | Main options             |
| ------------- | ----------------------------------------------------------------- | ------------------------ |
| `line`        | Default type for a direct connection                              | Width, color, and arrows |
| `arc`         | Curves for separating relationships or controlling the bend       | `curvature`              |
| `cubic`       | Smooth cubic Bézier connections between horizontal levels         | `curveOffset`            |
| `polyline`    | Routed connections in flowcharts, org charts, and directory trees | `router`, `radius`       |

See [Common edge options](/en/docs/guides/edge) for path parameters and parallel-edge settings.

## Data structure [#data-structure]

List edges in `data.edges`. Each item is a [`GraphEdge`](/en/docs/guides/data#graphedge).

| Field    | Type          | Required | Meaning                                                                                                             |
| -------- | ------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `source` | `string`      | Yes      | Starting node ID from `data.nodes`                                                                                  |
| `target` | `string`      | Yes      | Destination node ID from `data.nodes`                                                                               |
| `id`     | `string`      | No       | Unique edge ID, generated if omitted. Supply one to update, select, or distinguish edges between the same endpoints |
| `data`   | `EdgeData`    | No       | Application data such as protocol, latency, or weight                                                               |
| `states` | `EdgeState[]` | No       | Initial states such as `['selected']`                                                                               |

## Configuration methods [#configuration-methods]

Set `edge` in `new Graph()` to configure the graph-wide edge type and appearance. Store each edge’s properties in `data.edges` and read them with style functions in `edge.style`. This example labels the edge by protocol and sets its width by latency.

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: '#container',
  data: {
    nodes: [{ id: 'api', x: 80, y: 100 }, { id: 'db', x: 260, y: 100 }],
    edges: [{ id: 'api-db', source: 'api', target: 'db', data: { protocol: 'SQL', latency: 120 } }],
  },
  edge: {
    type: 'line',
    style: {
      endArrow: true,
      label: (_source, _target, edge) => String(edge.data?.protocol ?? ''),
      lineWidth: (_source, _target, edge) => Number(edge.data?.latency ?? 0) >= 100 ? 4 : 2,
    },
  },
});

await graph.render();
```

After rendering, call `graph.updateEdgeData('api-db', { latency: 60 })` to update that edge, or `graph.updateOptions({ edge: { style: { stroke: '#1783FF' } } })` to change all edge colors. See [Update edges dynamically](/en/docs/guides/edge#update-edges-dynamically).

## Custom edges [#custom-edges]

Use an `EdgeExtension` to package a built-in path with reusable styles, such as an arc whose color and width depend on its weight. See [Custom edges](/en/docs/guides/custom-edge).
