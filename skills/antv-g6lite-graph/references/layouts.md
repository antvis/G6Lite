# Layout selection and loading

Choose by the question the graph should answer, then tune against actual node sizes and labels. Preserve known `x`/`y` by omitting layout.

## Decision table

| Need | Layout | Useful starting options | Loading |
| --- | --- | --- | --- |
| Stable overview, compare groups | `circular`, `grid` | `radius: 140`; `cols: 4` | Built in |
| Dependency/flow direction | `dagre` | `rankdir: 'LR', ranksep: 100, nodesep: 48` | Built in |
| General relationship network | `force`, `d3-force` | `linkDistance: 100` | Built in |
| Network clusters | `force-atlas2`, `fruchterman` | Tune forces and iteration budget using the algorithm docs | Built in |
| Rank nodes in rings | `concentric` | `sortBy: 'degree'` | Built in |
| Focus-node distance rings | `radial` | `focusNode: 'root', unitRadius: 80` | Optional, register first |
| Distance-based overview | `mds` | `linkDistance: 80` | Optional, register first |
| Mind map | `mindmap` | `direction: 'H', levelGap: 140, nodeGap: 32` | Optional, register first |
| Directory tree | `indented` | `indent: 100, rowHeight: 44` | Optional, register first |
| Cause/category tree | `fishbone` | `categoryGap: 180` | Optional, register first |
| Random initial positions | `random` | `width: 800, height: 600` | Optional, register first |

These are starting points, not universal spacing rules. Force-layout options differ by algorithm; do not copy option names between them unchecked. Tree layouts expect a meaningful root-to-child edge structure. Validate multiple parents, cycles, and disconnected roots before presenting arbitrary network data as a tree.

## npm: import and register an optional layout

```ts
import { Graph, register } from '@antv/g6-lite';
import mindmap from '@antv/g6-lite/layouts/mindmap';

register('layout', 'mindmap', mindmap);
const graph = new Graph({
  container: '#container',
  data: {
    nodes: [
      { id: 'root', name: 'Plan' },
      { id: 'build', name: 'Build' },
      { id: 'verify', name: 'Verify' },
    ],
    edges: [
      { id: 'root-build', source: 'root', target: 'build' },
      { id: 'root-verify', source: 'root', target: 'verify' },
    ],
  },
  layout: { type: 'mindmap', direction: 'H', levelGap: 140, nodeGap: 32 },
  node: {
    type: 'rect',
    style: { width: 100, height: 36, label: (node) => node.name ?? node.id },
  },
  edge: { type: 'cubic' },
  behaviors: ['zoom-canvas', 'drag-canvas'],
});
await graph.render();
```

The same pattern applies to documented subpaths `layouts/mds`, `layouts/radial`, `layouts/indented`, `layouts/fishbone`, and `layouts/random`.

## CDN: load the companion bundle from the same release

The default main entry is `https://unpkg.com/@antv/g6-lite`. Optional layouts additionally need `dist/g6-lite-layouts.min.js`, exposing `window.G6LiteLayouts`. Then call `G6Lite.register('layout', 'mindmap', G6LiteLayouts.mindmap)` before rendering.

For a generated example using optional layouts, resolve `latest` once during authoring, then use the resulting version for both scripts. This fetch can run in the authoring terminal or JavaScript tool; it is not needed on every page visit:

```js
const response = await fetch('https://unpkg.com/@antv/g6-lite/package.json');
if (!response.ok) throw new Error(`Package lookup failed: ${response.status}`);
const { version } = await response.json();
const base = `https://unpkg.com/@antv/g6-lite@${version}/dist`;
console.log(`<script src="${base}/g6-lite.min.js"></script>`);
console.log(`<script src="${base}/g6-lite-layouts.min.js"></script>`);
```

Insert those two actual script tags, in order, before the graph's initialization script. Reuse the mindmap data/configuration above through `window.G6Lite` and register with `window.G6LiteLayouts`. Do not leave template version markers in the delivered HTML. When offline, use the user's known release or installed version and disclose that remote availability was not checked.

## Relayout and fitting

After initialization:

```ts
graph.setLayout({ type: 'dagre', rankdir: 'LR', ranksep: 100 });
await graph.layout();
if (!graph.destroyed) graph.fitView({ padding: 48 });
```

`setLayout()` does not run computation. Layout changes positions; fitting changes the camera. Preserve the camera for exploratory views unless the user requests fitting. For overlapping application operations, use a task generation in addition to `graph.destroyed` before updating status or fitting after an awaited call. `cancelLayout()` discards active results but does not roll back positions already committed.

## Workers and scale

- Built-in library layouts may attempt a Worker at 1,000 nodes when `worker` is omitted. `worker: true` requests a Worker; `worker: false` disables the attempt.
- Registered layouts, including the six optional layouts, execute on the main thread. `worker: true` does not move registered extension code.
- Worker configuration and transferred data must be structured-cloneable. Use `worker: false` when algorithm callbacks are required. Node/edge rendering style callbacks are separate from layout configuration.
- Creation, loading, transfer, or computation failures can fall back to the main thread. Confirm Worker requests and execution threads; neither `worker: true` nor successful layout proves off-thread computation.
- Keep emitted ESM Worker assets and relative paths. UMD does not guarantee standalone Worker assets; prefer bundled ESM when off-thread execution is required.

See [layout overview](https://g6lite.antv.vision/en/docs/guides/layout-overview), [layout options](https://g6lite.antv.vision/en/docs/guides/layout), and [Worker guide](https://g6lite.antv.vision/en/docs/guides/layout-worker).
