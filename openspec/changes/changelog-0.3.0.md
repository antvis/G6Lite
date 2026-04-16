# Changelog 0.3.0 — 2026-03-10

## Added

- Canvas tools implementation in playground: toolbar with zoom-in, zoom-out, fullscreen (fit view), and reset, operating on the graph camera via new `Graph` helpers.
- Graph API extensions: exposed `getCamera`, `setCamera`, `resetCamera`, `getLayoutNodes`, and `getCanvas` to support tools and overlays without breaking existing usage.
- Label overlay: initial HTML-based node label rendering synchronized with camera and resize, driven by layout positions and optional formatter.
- Playground demo: new `large-labeled` demo with ~5000 nodes and labeled nodes/edges to validate performance and label behavior.

