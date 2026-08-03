[简体中文](./README.zh-CN.md) | English

<h1 align="center">G6Lite</h1>

<p align="center">
  A lightweight, high-performance WebGL engine for interactive graph visualization.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@antv/g6-lite"><img alt="npm version" src="https://img.shields.io/npm/v/@antv/g6-lite.svg"></a>
  <a href="https://github.com/antvis/G6Lite/actions/workflows/build.yml"><img alt="build" src="https://github.com/antvis/G6Lite/actions/workflows/build.yml/badge.svg"></a>
  <a href="https://bundlephobia.com/package/@antv/g6-lite"><img alt="minified and gzipped size" src="https://img.shields.io/bundlephobia/minzip/@antv/g6-lite"></a>
  <a href="./LICENSE"><img alt="MIT license" src="https://img.shields.io/npm/l/@antv/g6-lite.svg"></a>
</p>

<p align="center">
  <a href="https://g6-gl.antv.vision/en">Website</a> ·
  <a href="https://g6-gl.antv.vision/en/docs/getting-started/quick-start">Quick Start</a> ·
  <a href="https://g6-gl.antv.vision/en/docs/api">API</a> ·
  <a href="https://g6-gl.antv.vision/en/docs/examples">Examples</a>
</p>

![G6Lite rendering a large relationship graph](./site/public/examples/large.png)

## Why G6Lite

- **GPU-first graph rendering** — Nodes and edges share a batched WebGL pipeline designed for responsive relationship exploration.
- **Incremental by design** — State, position, and data changes are scheduled by refresh level, avoiding unrelated full rebuilds.
- **Layouts and interactions included** — Use `@antv/layout` algorithms together with configurable zoom, pan, drag, select, and highlight behaviors.
- **An explicit extension surface** — Import from the package root, map data to styles with functions, and add capabilities through the unified `register()` API.

## Install

```bash
npm install @antv/g6-lite
```

## Quick Start

Create a container with an explicit size:

```html
<div id="graph" style="width: 800px; height: 500px"></div>
```

Then create and render an interactive graph:

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: 'graph',
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

## Learn More

- [Website](https://g6-gl.antv.vision/en)
- [Quick Start](https://g6-gl.antv.vision/en/docs/getting-started/quick-start)
- [Core Concepts](https://g6-gl.antv.vision/en/docs/concepts/overview)
- [Data and Configuration](https://g6-gl.antv.vision/en/docs/guides/data)
- [API Reference](https://g6-gl.antv.vision/en/docs/api)
- [Examples](https://g6-gl.antv.vision/en/docs/examples)
- [Performance Metrics](https://g6-gl.antv.vision/en/docs/metrics/performance)
- [Browser Compatibility](https://g6-gl.antv.vision/en/docs/compatibility/browser)

## Local Development

```bash
npm install
npm run dev
```

Run the project verification pipeline with `npm run ci`, and build the documentation site with `npm run site:build`.

## Contributing

Before opening a pull request, read the [contributing guide](./CONTRIBUTING.md). Report bugs, feature requests, and usage questions through [GitHub Issues](https://github.com/antvis/G6Lite/issues).

## License

[MIT](./LICENSE) © AntV
