# What is G6Lite? (/en/docs/concepts/overview)



G6Lite is a lightweight WebGL graph visualization engine. It keeps the familiar data, node, edge, layout, behavior, and theme configuration model while focusing on GPU rendering, incremental refresh, and frequent analytical interactions.

## Good fits [#good-fits]

* Relationship exploration, topology, knowledge graphs, and dependency analysis.
* Frequent highlighting, selection, neighbor focus, and state switching.
* Products that need AntV layouts with a controlled package and extension boundary.

## Evaluate carefully [#evaluate-carefully]

* Extremely large graphs where first-paint speed is the only requirement.
* Products that need the full G6 plugin, animation, and element ecosystem.
* SVG/DOM-level customization or server-side image rendering.

G6 v5 is the broader general-purpose framework. G6Lite is the smaller performance-oriented engine. Validate your real data and required capabilities before migrating.

## Core components [#core-components]

* `Graph` coordinates the container, layout, rendering, interactions, and lifecycle.
* `DataModel` owns nodes, edges, Combo, states, and incremental changes.
* `Renderer` draws nodes, edges, and the picking buffer through WebGL.
* `LabelLayerRenderer` and `ComboRenderer` draw the Canvas 2D label overlay and Combo underlay.
* `RenderScheduler` selects complete redraws or smaller patches based on the change level.
* `InteractionDispatcher` centralizes picking and element-event delivery.

See [Technical architecture](/en/docs/concepts/architecture) for the complete layers, first-render flow, and frequent-update paths.

## Next steps [#next-steps]

* [Technical architecture](/en/docs/concepts/architecture)
* [Graph lifecycle](/en/docs/concepts/graph-lifecycle)
* [Data model](/en/docs/concepts/data-model)
* [Install and render your first graph](/en/docs/getting-started/quick-start)
