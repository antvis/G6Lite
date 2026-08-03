# Install and render your first graph (/en/docs/getting-started/quick-start)



Install the package:

```bash
npm install @antv/g6-lite
```

The container must have an explicit size:

```html
<div id="graph" style="width: 800px; height: 500px"></div>
```

Create and render the graph using package-root APIs:

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: 'graph',
  data: {
    nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
    edges: [
      { source: 'a', target: 'b' },
      { source: 'a', target: 'c' },
    ],
  },
  layout: { type: 'circular', radius: 140 },
  behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'hover-highlight'],
});

await graph.render();
```

Use `setData()` for a complete replacement and the add/update/remove/state APIs for incremental changes. Call `graph.destroy()` when the page or component unmounts.

Next: [React integration](/en/docs/getting-started/react), [data configuration](/en/docs/guides/data), and [examples](/en/docs/examples).
