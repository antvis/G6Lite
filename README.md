English | [简体中文](./README.zh-CN.md)

<h1 align="center">G6Lite</h1>

<p align="center">
  <strong>Lightweight graph visualization, built for large-scale relationship data</strong>
</p>

<p align="center">
  Flexible layouts and interactions, paired with lightweight, efficient WebGL rendering, bring large-scale relationships into focus and make data exploration feel fluid.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@antv/g6-lite"><img alt="npm version" src="https://img.shields.io/npm/v/@antv/g6-lite.svg"></a>
  <a href="https://github.com/antvis/G6Lite/actions/workflows/build.yml"><img alt="build" src="https://github.com/antvis/G6Lite/actions/workflows/build.yml/badge.svg"></a>
  <a href="https://bundlephobia.com/package/@antv/g6-lite"><img alt="minified and gzipped size" src="https://img.shields.io/bundlephobia/minzip/@antv/g6-lite"></a>
  <a href="https://cdn.jsdelivr.net/npm/@antv/g6-lite@beta/dist/g6-lite.umd.min.js"><img alt="UMD gzip size" src="https://img.badgesize.io/https://cdn.jsdelivr.net/npm/@antv/g6-lite@beta/dist/g6-lite.umd.min.js?compression=gzip&amp;label=UMD%20gzip"></a>
  <a href="./LICENSE"><img alt="MIT license" src="https://img.shields.io/npm/l/@antv/g6-lite.svg"></a>
</p>

<p align="center">
  <a href="https://g6lite.antv.vision/en">Website</a> ·
  <a href="https://g6lite.antv.vision/en/docs/getting-started/quick-start">Quick Start</a> ·
  <a href="https://g6lite.antv.vision/en/docs/api">API</a> ·
  <a href="https://g6lite.antv.vision/en/docs/examples">Examples</a>
</p>

![G6Lite rendering a large relationship graph](./site/public/examples/large.png)

## Why G6Lite

- **GPU-first graph rendering** — Nodes and edges share a batched WebGL pipeline designed for responsive relationship exploration.
- **Refresh by change level** — State, position, and data changes are scheduled by refresh level, with support for partial updates; edge state changes and other cases trigger full rebuilds.
- **Built-in layouts and interactions** — Select layouts from `@antv/layout` and other built-in algorithms through `layout`, and configure zoom, pan, drag, select, and highlight through `behaviors`; omitting `behaviors` enables only zoom and pan by default.
- **An explicit extension surface** — Import from the package root, map data to styles with functions, and add capabilities through the unified `register()` API.

## Install

```bash
npm install @antv/g6-lite
```

## Quick Start

Create a container with an explicit size:

```html
<div id="container" style="width: 800px; height: 500px"></div>
```

Then create and render an interactive graph:

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: '#container',
  data: {
    nodes: [
      { id: 'gateway', data: { role: 'core' } },
      { id: 'orders', data: { role: 'service' } },
      { id: 'inventory', data: { role: 'service' } },
    ],
    edges: [
      { source: 'gateway', target: 'orders' },
      { source: 'gateway', target: 'inventory' },
    ],
  },
  node: {
    type: 'circle',
    style: {
      size: 18,
      fill: (node) => (node.data?.role === 'core' ? '#1677ff' : '#36cfc9'),
    },
  },
  edge: { type: 'line', style: { lineWidth: 2 } },
  layout: { type: 'circular', radius: 140 },
  behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'hover-highlight'],
});

await graph.render();
```

Only package-root exports from `@antv/g6-lite` and `package.json#exports` are public API. Deep `src/` paths are internal and may change without notice.

## CDN / UMD

Use the UMD build directly in a browser without a bundler. It exposes `window.G6Lite` and includes the runtime dependencies, layouts, and an inline layout Worker:

```html
<div id="container" style="width: 100%; height: 500px"></div>
<script src="https://cdn.jsdelivr.net/npm/@antv/g6-lite@beta/dist/g6-lite.umd.min.js"></script>
<script>
  const graph = new G6Lite.Graph({
    container: '#container',
    data: {
      nodes: [{ id: 'gateway' }, { id: 'orders' }, { id: 'inventory' }],
      edges: [
        { source: 'gateway', target: 'orders' },
        { source: 'gateway', target: 'inventory' },
      ],
    },
    layout: { type: 'circular', radius: 140 },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node'],
  });
  graph.render().catch(console.error);
</script>
```

- [jsDelivr](https://cdn.jsdelivr.net/npm/@antv/g6-lite@beta/dist/g6-lite.umd.min.js)
- [UNPKG](https://unpkg.com/@antv/g6-lite@beta/dist/g6-lite.umd.min.js)

These URLs and the UMD gzip badge become available after a release containing the UMD build is published to npm under the `beta` tag. Pin `beta` to an exact published version in production. The UMD badge measures the complete CDN download; the Bundlephobia badge measures the npm entry bundled by that service.

## Learn More

- [Website](https://g6lite.antv.vision/en)
- [Quick Start](https://g6lite.antv.vision/en/docs/getting-started/quick-start)
- [Core Concepts](https://g6lite.antv.vision/en/docs/concepts/overview)
- [Data and Configuration](https://g6lite.antv.vision/en/docs/guides/data)
- [API Reference](https://g6lite.antv.vision/en/docs/api)
- [Examples](https://g6lite.antv.vision/en/docs/examples)
- [Performance Metrics](https://g6lite.antv.vision/en/docs/metrics/performance)
- [Browser Compatibility](https://g6lite.antv.vision/en/docs/compatibility/browser)

## Local Development

```bash
npm install
npm run dev
```

Run the project verification pipeline with `npm run ci`, and build the documentation site with `npm run site`.

`npm run build` generates both the ESM output and `dist/g6-lite.umd.min.js` (with a source map). Use `npm run build:umd` to rebuild only UMD, and `npm run check:umd` to verify the built script and its layout Worker in Chrome/Chromium.

## Contributing

Before opening a pull request, read the [contributing guide](./CONTRIBUTING.md). Report bugs, feature requests, and usage questions through [GitHub Issues](https://github.com/antvis/G6Lite/issues).

## License

[MIT](./LICENSE) © AntV
