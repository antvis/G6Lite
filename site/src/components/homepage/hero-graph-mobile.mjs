/**
 * Compact sample of the sigma.js v4 AI-papers layout for narrow viewports and
 * low-memory devices. A 32×32 grid keeps the cloud outline: labeled hubs stay,
 * then each cell contributes its highest-degree nodes in round-robin order
 * until 1,200 nodes. Shortest citation paths from the original graph join those
 * pieces into one weakly connected component. Edges are the induced citation
 * links, so every rendered edge exists in the source network. Node ids are the
 * original dataset indexes.
 * 1323 nodes, 6954 edges.
 */
import packed from './hero-graph-mobile.json' with { type: 'json' };
import { buildHeroGraph } from './hero-graph-model.mjs';

export function createHeroGraph() {
  return buildHeroGraph(packed.nodes, packed.edges, packed.ids);
}
