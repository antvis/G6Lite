# Overview (/en/docs)



**G6Lite · Lightweight graph visualization, built for large-scale relationship data**

Flexible layouts and interactions, paired with lightweight, efficient WebGL rendering, bring large-scale relationships into focus and make data exploration feel fluid.

Follow the documentation from the first graph to concepts, configuration, examples, reproducible metrics, and compatibility boundaries.

## Start here [#start-here]

<Cards>
  <Card title="Install and render your first graph" href="/en/docs/getting-started/quick-start" />

  <Card title="Build G6Lite graphs with AI" href="/en/docs/ai" />

  <Card title="Use with React and Vue" href="/en/docs/getting-started/react" />

  <Card title="Browse examples" href="/en/docs/examples" />

  <Card title="Open the API reference" href="/en/docs/api" />
</Cards>

## Documentation structure [#documentation-structure]

<Cards>
  <Card title="Core concepts" href="/en/docs/concepts/overview" />

  <Card title="Technical architecture" href="/en/docs/concepts/architecture" />

  <Card title="Configuration" href="/en/docs/guides/data" />

  <Card title="API" href="/en/docs/api" />

  <Card title="Examples" href="/en/docs/examples" />

  <Card title="Technical metrics" href="/en/docs/metrics/performance" />

  <Card title="Compatibility" href="/en/docs/compatibility/browser" />
</Cards>

## Core capabilities [#core-capabilities]

* **GPU-first graph rendering** — Nodes and edges share a batched WebGL pipeline designed for responsive relationship exploration.
* **Refresh by change level** — State, position, and data changes are scheduled by refresh level, with support for partial updates; edge state changes and other cases trigger full rebuilds.
* **Built-in layouts and interactions** — Select layouts from `@antv/layout` and other built-in algorithms through `layout`, and configure zoom, pan, drag, select, and highlight through `behaviors`; omitting `behaviors` enables only zoom and pan by default.
* **An explicit extension surface** — Import from the package root, map data to styles with functions, and add capabilities through the unified `register()` API.

## Choosing G6Lite [#choosing-g6lite]

Use G6Lite when WebGL rendering, refresh by change level, built-in layouts, and a controlled extension boundary match your product. If you need the complete G6 plugin and animation ecosystem, evaluate G6 v5 first.
