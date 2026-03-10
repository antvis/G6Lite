# Changelog 0.2.0 — 2026-03-10

## Added

- Layout: clarified and exercised the thin wrapper over `@antv/layout` in OpenSpec, ensuring all core layouts (circular, force, grid, dagre, etc.) are accessible via `layout` config.
- Canvas tools: defined OpenSpec for zoom-in, zoom-out, fullscreen (fit to content), and reset view tools, to be implemented in the playground and/or helper APIs.
- Labels: defined OpenSpec for node and edge labels, including config via `name`/`data` fields and formatter functions, with camera-synchronized rendering.
- Large demo: defined OpenSpec for a 5000-node playground demo with both node and edge labels, as a performance and usability benchmark.

