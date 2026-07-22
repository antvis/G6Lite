import { createSeededRandom } from '../core/seeded-random.mjs';

export const PERF_TIERS = {
  tiny: { nodes: 100, degree: 3 },
  small: { nodes: 1000, degree: 3 },
  medium: { nodes: 5000, degree: 3 },
  large: { nodes: 10000, degree: 3 },
};

export function generateGraphData(nodeCount, degree = 3, seed = 0x6a09e667) {
  const random = createSeededRandom(seed);
  const spread = Math.max(200, Math.sqrt(nodeCount) * 30);
  const nodes = Array.from({ length: nodeCount }, (_, index) => ({
    id: String(index),
    x: random() * spread,
    y: random() * spread,
    data: {
      cluster: String(index % 8),
      score: Math.round(random() * 1000) / 1000,
    },
  }));
  const edges = [];
  for (let source = 0; source < nodeCount; source++) {
    for (let offset = 0; offset < Math.min(degree, nodeCount - 1); offset++) {
      const target = (source + 1 + offset * 13) % nodeCount;
      if (target === source) continue;
      edges.push({
        id: `e-${source}-${target}-${offset}`,
        source: String(source),
        target: String(target),
        data: { weight: offset + 1 },
      });
    }
  }
  return { nodes, edges };
}

export function cloneGraphData(data) {
  return {
    nodes: data.nodes.map((node) => ({
      ...node,
      data: node.data ? { ...node.data } : undefined,
      states: node.states ? [...node.states] : undefined,
    })),
    edges: data.edges.map((edge) => ({
      ...edge,
      data: edge.data ? { ...edge.data } : undefined,
      states: edge.states ? [...edge.states] : undefined,
    })),
  };
}

export function createPositionUpdates(data, count, delta = 1) {
  return data.nodes.slice(0, count).map((node) => ({
    id: node.id,
    x: (node.x ?? 0) + delta,
    y: (node.y ?? 0) - delta,
  }));
}

export function createDataUpdates(data, count, revision = 1) {
  return data.nodes.slice(0, count).map((node, index) => ({
    id: node.id,
    data: { revision, rank: index % 10 },
  }));
}
