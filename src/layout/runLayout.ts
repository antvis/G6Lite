/**
 * Run AntV Layout on graph data and return nodes with x,y.
 * OpenSpec: layout spec — thin wrapper over @antv/layout.
 */

import {
  CircularLayout,
  ConcentricLayout,
  DagreLayout,
  D3ForceLayout,
  ForceLayout,
  ForceAtlas2Layout,
  FruchtermanLayout,
  GridLayout,
  MDSLayout,
  RandomLayout,
  RadialLayout,
} from '@antv/layout';
import type { GraphData, GraphNode, LayoutConfig } from '../types.js';

export type LayoutResult = { nodes: Array<GraphNode & { x: number; y: number }> };

type LayoutInstance = {
  execute: (data: GraphData) => Promise<void>;
  forEachNode: (fn: (n: { id: string; x: number; y: number }) => void) => void;
};

const LAYOUT_MAP = {
  circular: CircularLayout,
  concentric: ConcentricLayout,
  dagre: DagreLayout,
  'd3-force': D3ForceLayout,
  force: ForceLayout,
  'force-atlas2': ForceAtlas2Layout,
  fruchterman: FruchtermanLayout,
  grid: GridLayout,
  mds: MDSLayout,
  random: RandomLayout,
  radial: RadialLayout,
} as Record<string, new (opts?: Record<string, unknown>) => LayoutInstance>;

/**
 * Run the configured layout on graph data; returns nodes with positions.
 * Layout options are passed through to the underlying @antv/layout algorithm.
 */
export async function runLayout(data: GraphData, config: LayoutConfig): Promise<LayoutResult> {
  const LayoutClass = LAYOUT_MAP[config.type] ?? RandomLayout;
  const { type, ...opts } = config as Record<string, unknown>;
  const nodeCount = data.nodes.length;

  // R-LAYOUT-01: Map user-friendly 'iterations' to @antv/layout's 'maxIteration'
  if ('iterations' in opts && !('maxIteration' in opts)) {
    opts.maxIteration = opts.iterations;
  }
  delete opts.iterations;

  // R-LAYOUT-02: Disable animate mode for large graphs (avoids setInterval overhead)
  if (nodeCount > 500 && opts.animate === undefined) {
    opts.animate = false;
  }

  // R-LAYOUT-03: Auto-tune defaults for large force layouts
  if ((type === 'force' || type === 'fruchterman') && nodeCount > 1000) {
    if (opts.maxIteration === undefined) opts.maxIteration = 200;
    if (opts.minMovement === undefined) opts.minMovement = 1.0;
  }

  const layout = new LayoutClass(opts);

  // R-LAYOUT-04: Random initial positions for nodes without coordinates.
  // Force layouts degrade catastrophically (20x slower) when all nodes start at (0,0)
  // because repulsive forces hit a singularity. Spreading nodes randomly first lets
  // the algorithm converge efficiently.
  const spread = Math.sqrt(nodeCount) * 10;
  const layoutData: GraphData = {
    nodes: data.nodes.map((n) => ({
      ...n,
      x: n.x ?? Math.random() * spread,
      y: n.y ?? Math.random() * spread,
    })),
    edges: data.edges.map((e) => ({ ...e, id: `${e.source}-${e.target}` })),
  };

  await layout.execute(layoutData);

  const posMap = new Map<string, [number, number]>();
  layout.forEachNode((node: { id: string; x: number; y: number }) => {
    posMap.set(node.id, [node.x, node.y]);
  });

  const nodes: Array<GraphNode & { x: number; y: number }> = data.nodes.map((n) => {
    const pos = posMap.get(n.id) ?? [0, 0];
    return { ...n, x: pos[0], y: pos[1] };
  });

  return { nodes };
}
