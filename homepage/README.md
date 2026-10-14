# Homepage relationship graph

These are deterministic connected samples of `playground/datasets/wikipedia.json`.
The graph describes Wikipedia topics around data visualization; coordinates retain the upstream precomputed ForceAtlas2 layout, translated and uniformly scaled.
No force layout runs in the browser.

- Source: https://github.com/jacomyal/sigma.js/blob/main/packages/demo/public/dataset.json
- Attribution: sigma.js / Sciences-Po médialab; see the accompanying upstream MIT license.
- Desktop: 500 nodes, at most 1,500 edges.
- Mobile: 250 nodes, at most 750 edges.
- Sampling: breadth-first traversal from `data visualization`; spanning-tree edges are retained before adding induced edges, so each sample remains connected.
- Fields: precomputed coordinates, label, cluster and display size only; article URLs and unused metadata are omitted.
- Regeneration follows the sampling and normalization rules above, using the existing repository dataset. The offline generation tool is maintained locally and is not part of the website build.

These are presentation samples, not benchmark workloads or claims about engine limits.
