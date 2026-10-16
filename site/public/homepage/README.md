# Homepage relationship graph

The hero graph is the sigma.js v4 homepage dataset: highly cited AI papers.
Coordinates are the upstream precomputed ForceAtlas2 layout, translated to the origin.
The page does not run a force layout. Preset coordinates load with the renderer chunk, so the hero does not wait on a separate JSON request.

Desktop loads the full network. A viewport at most 767px wide, or a device that reports 4 GB of memory or two CPU cores, loads a spatially sampled subset instead. Citation paths from the original graph join that subset into one weakly connected component.

- Desktop: 8,798 nodes and 71,077 edges.
- Compact: 1,323 nodes and 6,954 edges.
- Source: https://github.com/jacomyal/sigma.js/tree/v4/packages/website/public/data
- Copyright (C) 2012-2026 Alexis Jacomy, Guillaume Plique, Benoît Simard. MIT License.

This is a presentation graph, not a benchmark workload or a claim about engine limits.
