# Homepage relationship graph

The hero graph is the sigma.js v4 homepage dataset: highly cited AI papers.
Coordinates are the upstream precomputed ForceAtlas2 layout, translated to the origin.
The desktop hero doubles the horizontal span of node positions; narrow screens keep the original proportions. All nodes and citations are retained.
The page does not run a force layout. Packed coordinates and edges live in hashed
JSON assets. An inline HTML hint selects the full or compact asset using the same
viewport, memory, and CPU policy as the renderer, then preloads it as a fetch before
hydration, at low priority to protect the initial page scripts. A small client
entry starts the asynchronous engine download
before the renderer's idle callback, without making navigation hydration wait
for the engine. Its boundary is isolated with `Suspense`.
The renderer reuses the preload response; graph construction and WebGL creation
still wait for visibility and an idle callback. Failed fetches are evicted from the
shared request cache so the existing retry button can issue a fresh request.
The resource loader in `hero-graph-loader.ts` has no React dependency; only the
preload component imports React, so root unit tests run without site dependencies.

The `.mjs` dataset adapters retain `createHeroGraph()` for offline validation.

Desktop loads the full network. A viewport at most 767px wide, or a device that reports 4 GB of memory or two CPU cores, loads a spatially sampled subset instead. Citation paths from the original graph join that subset into one weakly connected component.

- Desktop: 8,798 nodes and 71,077 edges.
- Compact: 1,323 nodes and 6,954 edges.
- Source: https://github.com/jacomyal/sigma.js/tree/v4/packages/website/public/data
- Copyright (C) 2012-2026 Alexis Jacomy, Guillaume Plique, Benoît Simard. MIT License.

This is a presentation graph, not a benchmark workload or a claim about engine limits.

Homepage CTAs, content links, and footer links disable Next.js prefetch. The shared
Fumadocs link adapter also disables navigation prefetch on `/` and `/en`, while
keeping the default document-to-document behavior. Route data loads on navigation
instead of competing with the initial graph downloads. Heading fonts use disjoint
Unicode subsets without preload; see `fonts/README.md` for regeneration details.

The showcase serializes only the default relationship example and its light-theme
source/highlighted markup. Other tabs and the dark variant load from statically
exported `/showcase/{locale}/{id}/{theme}/data.json` files when needed. Offscreen
examples do not fetch code, completed requests are cached, failed requests can be
retried, and stale responses cannot replace the active tab. Source generation and
Shiki remain server-only; live preview options load with the visible example.

Shared navigation and page primitives stay in `app/global.css`. Documentation,
example directory, and editor overrides live in `app/docs.css`, imported by the
Chinese and English docs layouts. Unused legacy landing/terminal rules are removed.
