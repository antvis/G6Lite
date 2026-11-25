# Visual clarity and interaction

Keep the existing application's design language. For a standalone graph, choose appearance from its purpose and density rather than applying every visual feature.

## Encode meaning

- Use color for a meaningful category or status, with a small stable palette. Repeat that mapping in a legend when categories are not obvious. Do not assign a new color to every node by default.
- Use circle nodes for compact networks and rectangles for entities whose names need internal space. Vary size only for an explained metric or hierarchy.
- Use arrows for directional relationships. Keep undirected links plain. Give edge labels to relationships whose text changes the interpretation; avoid repeating the same label on every edge.
- Keep edge color/weight quieter than nodes so topology remains readable. Emphasize a selected or hovered path with state styles.

## Match labels and spacing

| Graph | Starting treatment |
| --- | --- |
| Small flow/dependency graph | Dagre left-to-right; labels on each node; directional edges; generous rank spacing |
| Relationship network | Force layout; short external labels; hover emphasis and click details |
| Mind map/tree | Register the tree layout; use hierarchy and branch colors; keep full labels readable inside rectangles |
| Dense or large network | Reduce default labels; reveal relevant labels/details through supported configuration or application UI; provide search and focus |

Start around 12–14 CSS pixels for ordinary labels and validate at the target viewport. Long names need sufficient node width, spacing, or supported `labelMaxWidth` settings; do not shrink every label until it becomes unreadable. Use `node.style.label` / `edge.style.label` instead of copying repository-only demo canvas helpers.

Adjust layout spacing against actual node dimensions and labels, then fit with padding. Check both a narrow container and the intended desktop size. Avoid using an unnecessarily low `maxZoom` that leaves a small graph tiny.

## Make interactions visible

- Use zoom and canvas drag for navigation; add node drag when free repositioning is useful. Tree/flow structure may be easier to read with node drag omitted.
- Hover can highlight neighbors and dim unrelated elements. Selection should remain distinguishable after hover ends; pair a border/weight change with color.
- Add a Fit action for recovering the overview. For search, show matching text in a result list or status and focus the chosen node. Do not communicate results through color alone.
- For business applications, synchronize a DOM details panel with selection/click events. Provide readable loading, empty, and failure messages outside the canvas. HTML controls need accessible names and visible focus styles.
- Keep menus/toolbars outside the Graph-owned container where practical. Graph owns its canvases; the application owns controls and their cleanup.

## Review the actual rendering

Check label clipping, overlap at normal zoom, edge direction, fit padding, light/dark contrast, and distinct hover/selection appearance. Exercise node drag after enabling arrows and state styles. For resize behavior, Graph observes container dimensions; choose `autoFit` intentionally rather than recreating Graph.

Large-graph visual changes should preserve the analytical question: reduce incidental labels, bound expensive callbacks, or aggregate/filter when the user permits it. Do not silently discard relationships or change the represented dataset to make a screenshot cleaner.
