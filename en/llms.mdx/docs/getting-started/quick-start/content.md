# Install and render your first graph (/en/docs/getting-started/quick-start)



Install the package:

```bash
npm install @antv/g6-lite
```

The canvas enables smooth wheel zoom and canvas dragging when `behaviors` is omitted. Node dragging, selection, and highlighting remain explicit. See [zoom feel and bounds](/en/docs/guides/interactions#zoom-feel-and-bounds) for sensitivity configuration.

The container must have an explicit size:

```html
<div id="container" style="width: 800px; height: 500px"></div>
```

Create and render the graph using package-root APIs:

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: 'container',
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

Next: [Use with React and Vue](/en/docs/getting-started/react), [data configuration](/en/docs/guides/data), and [examples](/en/docs/examples).
