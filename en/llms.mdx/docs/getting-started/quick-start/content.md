# Quick start (/en/docs/getting-started/quick-start)





Choose an integration method. Both create the same team collaboration graph with 6 nodes and 7 edges.

* [Package manager](#package-manager) works with projects that use a bundler such as Vite or Webpack. Install the package and import `Graph` from `@antv/g6-lite`.
* [CDN](#cdn) works directly in HTML. Import `Graph` with a `<script type="module">` tag.

## Package manager [#package-manager]

### Install [#install]

For projects using a bundler such as Vite or Webpack, install G6Lite with one of the following package managers:

<div className="quick-start-install">
  ```bash
  # npm
  npm install @antv/g6-lite@0.1.0
  ```

  ```bash
  # pnpm
  pnpm add @antv/g6-lite@0.1.0
  ```

  ```bash
  # Yarn
  yarn add @antv/g6-lite@0.1.0
  ```
</div>

### Create the graph [#create-the-graph]

After installation, add a container with an explicit size:

```html
<div id="container" style="width: 100%; height: 360px"></div>
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
  behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'hover-highlight'],
});

try {
  await graph.render();
  graph.fitView({ padding: 48, maxZoom: 1.2 });
} catch (error) {
  graph.destroy();
  throw error;
}
```

TypeScript declarations are included in the package.

Call `graph.destroy()` before removing the container or unmounting the component.

## CDN [#cdn]

```js
import { Graph } from 'https://esm.sh/@antv/g6-lite@0.1.0?bundle';
```

### Create the graph [#create-the-graph-1]

Save the HTML below as `index.html` and open it in your browser.

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
    <script type="module">
      import { Graph } from 'https://esm.sh/@antv/g6-lite@0.1.0?bundle';

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
        behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'hover-highlight'],
      });

      graph.render().then(() => {
        graph.fitView({ padding: 48, maxZoom: 1.2 });
      }).catch((error) => {
        graph.destroy();
        console.error(error);
      });
      window.addEventListener('pagehide', () => graph.destroy(), { once: true });
    </script>
  </body>
</html>
```

The single-page example destroys the instance on `pagehide`. Recreate it if the browser restores the page from its back/forward cache.

<span id="verify-and-clean-up" style="{ scrollMarginTop: '8rem' }" />

## Result [#result]

Both methods render the team collaboration graph below, with 6 labeled nodes and 7 edges. Drag the background to pan the canvas.

<QuickStartExample locale="en" variant="network" />

For a blank graph, check the container dimensions, WebGL support, and browser console.

## Use in frontend frameworks [#use-in-frontend-frameworks]

In React and Vue, obtain the DOM element through a ref, create the graph after client-side mount, and call `graph.destroy()` on unmount.

<Cards>
  <Card title="Use with React" href="/en/docs/getting-started/react#use-with-react">
    Mount a graph in an effect, update its data, and clean up on unmount.
  </Card>

  <Card title="Use with Vue" href="/en/docs/getting-started/vue">
    Manage a graph with template refs and lifecycle hooks.
  </Card>
</Cards>
