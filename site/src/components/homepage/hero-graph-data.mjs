/**
 * Sigma.js v4 homepage graph: highly cited AI papers.
 * Coordinates are the upstream ForceAtlas2 layout, translated to the origin.
 * Source: https://github.com/jacomyal/sigma.js/tree/v4/packages/website/public/data
 * Copyright (C) 2012-2026 Alexis Jacomy, Guillaume Plique, Benoît Simard. MIT License.
 */
import packed from './hero-graph-data.json' with { type: 'json' };
import { buildHeroGraph } from './hero-graph-model.mjs';

export function createHeroGraph() {
  return buildHeroGraph(packed.nodes, packed.edges);
}
