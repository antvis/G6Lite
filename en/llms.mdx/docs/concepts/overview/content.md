# What is G6Lite? (/en/docs/concepts/overview)



**G6Lite · Lightweight graph visualization, built for large-scale relationship data**

Flexible layouts and interactions, paired with lightweight, efficient WebGL rendering, bring large-scale relationships into focus and make data exploration feel fluid.

It keeps the familiar data, node, edge, layout, behavior, and theme configuration model while focusing on GPU rendering, incremental refresh, and frequent analytical interactions.

## Good fits [#good-fits]

* Relationship exploration, topology, knowledge graphs, and dependency analysis.
* Frequent highlighting, selection, neighbor focus, and state switching.
* Products that need AntV layouts with a controlled package and extension boundary.

## Evaluate carefully [#evaluate-carefully]

* Extremely large graphs where first-paint speed is the only requirement.
* Products that need the full G6 plugin, animation, and element ecosystem.
* SVG/DOM-level customization or server-side image rendering.

G6 v5 is the broader general-purpose framework. G6Lite is the smaller performance-oriented engine. Validate your real data and required capabilities before migrating.

## Usage model [#usage-model]

A `Graph` instance manages one graph. `data` describes relationships, `node` and `edge` define appearance, `layout` computes positions, `behaviors` adds interactions, and `theme` controls the visual style.

Start with the [Data model](/en/docs/concepts/data-model), then use [Graph lifecycle](/en/docs/concepts/graph-lifecycle) to organize creation, updates, and cleanup. See [Technical architecture](/en/docs/concepts/architecture) for drawing layers, scheduling, and extension internals.

## Next steps [#next-steps]

* [Data model](/en/docs/concepts/data-model)
* [Graph lifecycle](/en/docs/concepts/graph-lifecycle)
* [Technical architecture](/en/docs/concepts/architecture)
* [Install and render your first graph](/en/docs/getting-started/quick-start)
