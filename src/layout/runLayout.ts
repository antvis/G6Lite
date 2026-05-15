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
import { IndentedLayout } from './indentedLayout.js';
import { MindmapLayout } from './mindmapLayout.js';
import { FishboneLayout } from './fishboneLayout.js';
import type { GraphData, GraphNode, LayoutConfig } from '../types.js';
import { runLayoutInWorker } from './workerLayout.js';

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
  indented: IndentedLayout,
  mindmap: MindmapLayout,
  fishbone: FishboneLayout,
} as Record<string, new (opts?: Record<string, unknown>) => LayoutInstance>;

/**
 * Run the configured layout on graph data; returns nodes with positions.
 * Layout options are passed through to the underlying @antv/layout algorithm.
 * When config.worker is true (or auto-detected for large graphs), layout runs
 * in a Web Worker to avoid blocking the main thread. Falls back to main-thread
 * layout if the Worker fails.
 */
export async function runLayout(data: GraphData, config: LayoutConfig): Promise<LayoutResult> {
  const useWorker = config.worker ?? false;

  if (useWorker) {
    try {
      const workerResult = await runLayoutInWorker(data, config);
      const posMap = new Map(workerResult.positions.map(p => [p.id, p] as [string, { x: number; y: number }]));
      const nodes: Array<GraphNode & { x: number; y: number }> = data.nodes.map((n) => {
        const pos = posMap.get(n.id);
        return { ...n, x: pos ? pos.x : 0, y: pos ? pos.y : 0 };
      });
      return { nodes };
    } catch {
      // Worker failed — fall through to main-thread layout
    }
  }

  const LayoutClass = LAYOUT_MAP[config.type] ?? RandomLayout;
  // Strip internal fields before passing to layout constructor
  const { type, worker, ...opts } = config as Record<string, unknown>;
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
  if ((type === 'force' || type === 'fruchterman' || type === 'd3-force') && nodeCount > 1000) {
    if (nodeCount > 5000) {
      // Very large graphs: fewer iterations + higher convergence threshold
      if (opts.maxIteration === undefined) opts.maxIteration = 50;
      if (opts.minMovement === undefined) opts.minMovement = 2.0;
    } else {
      if (opts.maxIteration === undefined) opts.maxIteration = 200;
      if (opts.minMovement === undefined) opts.minMovement = 1.5;
    }
  }

  const layout = new LayoutClass(opts);

  // R-LAYOUT-04: Random initial positions for nodes without coordinates.
  // Force layouts degrade catastrophically (20x slower) when all nodes start at (0,0)
  // because repulsive forces hit a singularity. Spreading nodes randomly first lets
  // the algorithm converge efficiently.
  const spread = Math.max(200, Math.sqrt(nodeCount) * 30);
  const layoutData: GraphData = {
    nodes: data.nodes.map((n) => {
      if (n.x !== undefined && n.y !== undefined) return n as any;
      return { ...n, x: n.x ?? Math.random() * spread, y: n.y ?? Math.random() * spread } as any;
    }),
    edges: data.edges as any[],
  };

  await layout.execute(layoutData);

  const posMap = new Map<string, [number, number]>();
  layout.forEachNode((node: { id: string; x: number; y: number }) => {
    posMap.set(node.id, [node.x, node.y]);
  });

  // Build a map of enriched node data from layoutData (layouts may write metadata like depth, _nodeColor)
  const layoutNodeMap = new Map(layoutData.nodes.map(n => [n.id, n]));

  const nodes: Array<GraphNode & { x: number; y: number }> = data.nodes.map((n) => {
    const pos = posMap.get(n.id);
    const layoutNode = layoutNodeMap.get(n.id);
    const mergedData = layoutNode?.data ? { ...n.data, ...layoutNode.data } : n.data;
    if (pos && n.x === pos[0] && n.y === pos[1] && !layoutNode?.data) return n as GraphNode & { x: number; y: number };
    return { ...n, data: mergedData, x: pos ? pos[0] : 0, y: pos ? pos[1] : 0 };
  });

  return { nodes };
}
