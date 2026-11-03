# Quick start (/en/docs/getting-started/quick-start)





This small collaboration network has 6 nodes, with colors and sizes distinguishing the members. Drag nodes or hover to highlight their connections.

<QuickStartExample locale="en" variant="network" />

There are two ways to run this example:

* [Package manager](#package-manager)
* [CDN](#cdn)

## Package manager [#package-manager]

For projects using a bundler such as Vite or Webpack, install G6Lite with one of the following package managers:

<div className="quick-start-install">
  ```bash
  # npm
  npm install @antv/g6-lite
  ```

  ```bash
  # pnpm
  pnpm add @antv/g6-lite
  ```

  ```bash
  # Yarn
  yarn add @antv/g6-lite
  ```
</div>

After installation, add a container with an explicit size:

```html
<div id="container" style="height: 360px"></div>
```

Then create a graph in your JavaScript or TypeScript entry after the container has mounted. Use `await` in an ES module or an `async` function.

```ts
import { Graph } from '@antv/g6-lite';

const data = {
  nodes: [
    { id: 'Alice', data: { color: '#5B8FF9', size: 40 } },
    { id: 'Bob', data: { color: '#5B8FF9', size: 28 } },
    { id: 'Carol', data: { color: '#5B8FF9', size: 28 } },
    { id: 'David', data: { color: '#61DDAA', size: 40 } },
    { id: 'Eva', data: { color: '#61DDAA', size: 28 } },
    { id: 'Frank', data: { color: '#61DDAA', size: 28 } },
  ],
  edges: [
    { source: 'Alice', target: 'Bob' },
    { source: 'Alice', target: 'Carol' },
    { source: 'David', target: 'Eva' },
    { source: 'David', target: 'Frank' },
    { source: 'Alice', target: 'David' },
    { source: 'Bob', target: 'Eva' },
    { source: 'Carol', target: 'Frank' },
  ],
};

const graph = new Graph({
  container: '#container',
  data,
  node: {
    style: {
      size: (node) => Number(node.data?.size ?? 26),
      fill: (node) => String(node.data?.color ?? '#5B8FF9'),
      stroke: '#fff',
      strokeWidth: 2,
      label: (node) => node.id,
      labelPlacement: 'bottom',
      labelColor: '#334155',
    },
  },
  edge: { style: { stroke: '#CBD5E1', lineWidth: 1.5 } },
  layout: {
    type: 'd3-force',
    linkDistance: 100,
    nodeStrength: -400,
    collideRadius: 32,
  },
  autoFit: { padding: 48, maxZoom: 1.2 },
  behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'hover-highlight'],
});

await graph.render();
```

The force-directed layout positions the nodes automatically. Node data controls their colors and sizes, and `behaviors` enables zoom, pan, node dragging, and hover highlighting. TypeScript declarations are included in the package.

## CDN [#cdn]

The UMD build exposes the public API through `window.G6Lite`, allowing `new G6Lite.Graph()` in a plain HTML page.

This complete HTML example needs no additional dependency scripts: the UMD file includes the runtime dependencies and layout algorithms.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>G6Lite team collaboration network</title>
  </head>
  <body>
    <div id="container" style="height: 360px"></div>
    <script src="https://cdn.jsdelivr.net/npm/@antv/g6-lite@beta/dist/g6-lite.min.js"></script>
    <script>
      const data = {
        nodes: [
          { id: 'Alice', data: { color: '#5B8FF9', size: 40 } },
          { id: 'Bob', data: { color: '#5B8FF9', size: 28 } },
          { id: 'Carol', data: { color: '#5B8FF9', size: 28 } },
          { id: 'David', data: { color: '#61DDAA', size: 40 } },
          { id: 'Eva', data: { color: '#61DDAA', size: 28 } },
          { id: 'Frank', data: { color: '#61DDAA', size: 28 } },
        ],
        edges: [
          { source: 'Alice', target: 'Bob' },
          { source: 'Alice', target: 'Carol' },
          { source: 'David', target: 'Eva' },
          { source: 'David', target: 'Frank' },
          { source: 'Alice', target: 'David' },
          { source: 'Bob', target: 'Eva' },
          { source: 'Carol', target: 'Frank' },
        ],
      };

      const graph = new G6Lite.Graph({
        container: '#container',
        data,
        node: {
          style: {
            size: (node) => Number(node.data?.size ?? 26),
            fill: (node) => String(node.data?.color ?? '#5B8FF9'),
            stroke: '#fff',
            strokeWidth: 2,
            label: (node) => node.id,
            labelPlacement: 'bottom',
            labelColor: '#334155',
          },
        },
        edge: { style: { stroke: '#CBD5E1', lineWidth: 1.5 } },
        layout: {
          type: 'd3-force',
          linkDistance: 100,
          nodeStrength: -400,
          collideRadius: 32,
        },
        autoFit: { padding: 48, maxZoom: 1.2 },
        behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'hover-highlight'],
      });

      graph.render().catch(console.error);
    </script>
  </body>
</html>
```

For production CDN use, pin an exact published version containing the UMD file. The ESM entry loads layouts on demand, while UMD bundles them, so their download sizes differ. See [bundle size](/en/docs/metrics/bundle-size).

## Use in frontend frameworks [#use-in-frontend-frameworks]

In React and Vue, obtain the DOM element through a ref, create the graph after client-side mount, and call `graph.destroy()` on unmount.

<Cards>
  <Card title="Use with React" href="/en/docs/getting-started/react#use-with-react">
    Mount a graph in an effect, update its data, and clean up on unmount.
  </Card>

  <Card title="Use with Vue" href="/en/docs/getting-started/react#use-with-vue">
    Manage a graph with template refs and lifecycle hooks.
  </Card>
</Cards>

In frameworks such as Next.js and Nuxt, create `Graph` only on the client, after the DOM is available.
