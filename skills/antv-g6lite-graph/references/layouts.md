# Layout selection and loading

Choose by the question the graph should answer, then tune against actual node sizes and labels. Preserve known `x`/`y` by omitting layout.

## Decision table

| Need | Layout | Useful starting options | Loading |
| --- | --- | --- | --- |
| General relationship network | `force`, `d3-force` | `linkDistance: 100` | Built in |
| Network clusters | `force-atlas2`, `fruchterman` | Tune forces and iteration budget using the algorithm docs | Built in |
| Stable overview, compare groups | `CircularLayout`, `GridLayout` | `radius: 140`; `cols: 4` | Import from `@antv/layout` |
| Dependency/flow direction | `DagreLayout` | `rankdir: 'LR', ranksep: 100, nodesep: 48` | Import from `@antv/layout` |
| Rank nodes in rings | `ConcentricLayout` | `sortBy: 'degree'` | Import from `@antv/layout` |
| Focus-node distance rings | `RadialLayout` | `focusNode: 'root', unitRadius: 80` | Import from `@antv/layout` |
| Distance-based overview | `MDSLayout` | `linkDistance: 80` | Import from `@antv/layout` |
| Mind map | `MindmapLayout` | `direction: 'H', levelGap: 140, nodeGap: 32` | Import from `@antv/layout` |
| Directory tree | `IndentedLayout` | `indent: 100, rowHeight: 44` | Import from `@antv/layout` |
| Cause/category tree | `FishboneLayout` | `categoryGap: 180` | Import from `@antv/layout` |
| Random initial positions | `RandomLayout` | `width: 800, height: 600` | Import from `@antv/layout` |

These are starting points, not universal spacing rules. Force-layout options differ by algorithm; do not copy option names between them unchecked. Tree layouts expect a meaningful root-to-child edge structure. Validate multiple parents, cycles, and disconnected roots before presenting arbitrary network data as a tree.

## npm: import a layout class from @antv/layout

```ts
import { Graph } from '@antv/g6-lite';
import { MindmapLayout } from '@antv/layout';

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
  layout: { type: MindmapLayout, direction: 'H', levelGap: 140, nodeGap: 32 },
  node: {
    type: 'rect',
    style: { width: 100, height: 36, label: (node) => node.name ?? node.id },
  },
  edge: { type: 'cubic' },
  behaviors: ['zoom-canvas', 'drag-canvas'],
});
await graph.render();
```

The same pattern applies to `CircularLayout`, `GridLayout`, `DagreLayout`, `ConcentricLayout`, `RadialLayout`, `MDSLayout`, `IndentedLayout`, `FishboneLayout`, and `RandomLayout`. Built-in layouts (`force`, `force-atlas2`, `d3-force`, `fruchterman`) use string names without an import.

## CDN: use built-in layouts or load @antv/layout separately

The UMD main entry `https://unpkg.com/@antv/g6-lite` includes the four built-in force-directed layouts. For other layouts, load `@antv/layout` from a CDN and pass the layout class:

```html
<script src="https://unpkg.com/@antv/g6-lite"></script>
<script src="https://unpkg.com/@antv/layout"></script>
<script>
  const graph = new G6Lite.Graph({
    container: '#container',
    data,
    layout: { type: AntVLayout.MindmapLayout, direction: 'H' },
  });
</script>
```

Resolve one version for all scripts rather than independently resolving `latest` during a release.

## Relayout and fitting

After initialization:

```ts
import { DagreLayout } from '@antv/layout';

graph.setLayout({ type: DagreLayout, rankdir: 'LR', ranksep: 100 });
await graph.layout();
if (!graph.destroyed) graph.fitView({ padding: 48 });
```

`setLayout()` does not run computation. Layout changes positions; fitting changes the camera. Preserve the camera for exploratory views unless the user requests fitting. For overlapping application operations, use a task generation in addition to `graph.destroyed` before updating status or fitting after an awaited call. `cancelLayout()` discards active results but does not roll back positions already committed.

## Workers and scale

- Built-in library layouts may attempt a Worker at 1,000 nodes when `worker` is omitted. `worker: true` requests a Worker; `worker: false` disables the attempt.
- Custom layout classes, including tree layouts imported from `@antv/layout`, execute on the main thread. `worker: true` does not move custom layout code.
- Worker configuration and transferred data must be structured-cloneable. Use `worker: false` when algorithm callbacks are required. Node/edge rendering style callbacks are separate from layout configuration.
- Creation, loading, transfer, or computation failures can fall back to the main thread. Confirm Worker requests and execution threads; neither `worker: true` nor successful layout proves off-thread computation.
- Keep emitted ESM Worker assets and relative paths. UMD does not guarantee standalone Worker assets; prefer bundled ESM when off-thread execution is required.

See [layout overview](https://g6lite.antv.vision/en/docs/guides/layout-overview), [layout options](https://g6lite.antv.vision/en/docs/guides/layout), and [Worker guide](https://g6lite.antv.vision/en/docs/guides/layout-worker).
