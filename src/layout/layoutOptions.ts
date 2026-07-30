/**
 * Normalize options shared by main-thread and Worker-backed @antv/layout execution.
 * Keep this module side-effect free so both runtimes use identical thresholds.
 */
export function normalizeLibraryLayoutOptions(
  type: string,
  config: Record<string, unknown>,
  nodeCount: number,
): Record<string, unknown> {
  const options = { ...config };
  delete options.type;
  delete options.worker;

  if ('iterations' in options && !('maxIteration' in options)) {
    options.maxIteration = options.iterations;
  }
  delete options.iterations;

  if (options.animate === undefined) options.animate = false;

  if (type === 'force' || type === 'fruchterman') {
    if (nodeCount > 5000) {
      if (options.maxIteration === undefined) options.maxIteration = 50;
      if (options.minMovement === undefined) options.minMovement = 2;
    } else if (nodeCount >= 1000) {
      if (options.maxIteration === undefined) options.maxIteration = 200;
      if (options.minMovement === undefined) options.minMovement = 1.5;
    } else {
      if (options.maxIteration === undefined) options.maxIteration = 100;
      if (options.minMovement === undefined) options.minMovement = 1;
    }
  }

  // ForceAtlas2's pruning finishing pass disables Barnes-Hut and turns large
  // layouts into an O(n²) operation. Keep the optimized path by default.
  if (type === 'force-atlas2') {
    if (options.barnesHut === undefined) options.barnesHut = true;
    if (options.prune === undefined && nodeCount > 200) options.prune = false;
    if (options.maxIteration === undefined) {
      options.maxIteration = nodeCount > 5000 ? 50 : 100;
    }
  }

  if (type === 'd3-force') {
    if (options.alphaDecay === undefined) options.alphaDecay = 0.1;
    if (options.linkDistance === undefined) {
      options.linkDistance = Math.max(200, Math.sqrt(nodeCount) * 80);
    }
  }

  return options;
}
