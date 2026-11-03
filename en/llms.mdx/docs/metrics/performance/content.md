# Performance metrics (/en/docs/metrics/performance)



Results are comparable only when version, commit, hardware, runtime, data, and configuration match.

This page documents measurement and selection boundaries. It does not claim that G6Lite is faster for every graph, layout, and device. Layout, rendering without layout, and post-render interaction updates must be evaluated separately.

Public comparisons must record the G6Lite version and Git state, Node version, operating system, CPU, data scale, and layout configuration. Use realistic data and target devices before making a product decision. See [performance tuning](/en/docs/metrics/performance-tuning).

## Selecting a graph library [#selecting-a-graph-library]

In short, G6Lite focuses on a compact WebGL runtime and post-render incremental interaction; G6 v5 provides a broader element, animation, plugin, and multi-environment surface; sigma.js focuses on WebGL network rendering over Graphology; and Cytoscape.js combines a graph-theory model, algorithms, and interactive visualization.

The detailed rendering, layout, element, combo, interaction, extension, animation, algorithm, SSR, and TypeScript matrix now lives in [graph library comparison](/en/docs/compatibility/library-comparison). This page keeps measurement guidance only, avoiding two capability matrices that drift across releases.

For example, a first-render comparison is invalid when sigma.js reuses existing coordinates while G6Lite recomputes a force layout. Record layout time and rendering without layout independently.

## Rules for numerical comparisons [#rules-for-numerical-comparisons]

* Keep data, coordinates, styles, label policy, viewport, DPR, browser, and hardware fixed.
* Report preset-coordinate and relayout scenarios separately.
* Record median, P95, samples, and error instead of drawing conclusions from one run.
* Measure drag, zoom, picking, highlighting, batch updates, and post-destroy memory trends in addition to first render.
* Archive candidate versions, adapters, full configuration, and reports together.
