# What is G6-GL? (/en/docs/concepts/overview)



G6-GL is a lightweight WebGL graph visualization engine. It keeps the familiar data, node, edge, layout, behavior, and theme configuration model while focusing on GPU rendering, incremental refresh, and frequent analytical interactions.

## Good fits [#good-fits]

* Relationship exploration, topology, knowledge graphs, and dependency analysis.
* Frequent highlighting, selection, neighbor focus, and state switching.
* Products that need AntV layouts with a controlled package and extension boundary.

## Evaluate carefully [#evaluate-carefully]

* Extremely large graphs where first-paint speed is the only requirement.
* Products that need the full G6 plugin, animation, and element ecosystem.
* SVG/DOM-level customization or server-side image rendering.

G6 v5 is the broader general-purpose framework. G6-GL is the smaller performance-oriented engine. Validate your real data and required capabilities before migrating.
