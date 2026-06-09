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
      const posMap = new Map(
        workerResult.positions.map((p) => [p.id, p] as [string, { x: number; y: number }]),
      );
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

  // R-LAYOUT-02: Always disable animate mode — we await the result synchronously,
  // so timer-based stepping adds overhead without benefit. Without this, d3-force
  // resolves immediately before the simulation converges.
  if (opts.animate === undefined) {
    opts.animate = false;
  }

  // R-LAYOUT-03: Auto-tune defaults for force layouts
  if (type === 'force' || type === 'fruchterman') {
    if (nodeCount > 5000) {
      if (opts.maxIteration === undefined) opts.maxIteration = 50;
      if (opts.minMovement === undefined) opts.minMovement = 2.0;
    } else if (nodeCount >= 1000) {
      if (opts.maxIteration === undefined) opts.maxIteration = 200;
      if (opts.minMovement === undefined) opts.minMovement = 1.5;
    } else {
      if (opts.maxIteration === undefined) opts.maxIteration = 100;
      if (opts.minMovement === undefined) opts.minMovement = 1.0;
    }
  }

  // R-LAYOUT-03b: Auto-tune ForceAtlas2. Two failure modes to guard against:
  //  1. Default maxIteration is 0, which @antv/layout auto-expands to 950 — never
  //     leave it at 0 for large graphs.
  //  2. When `prune` is on (auto-enabled at >100 nodes), FA2's finishing pass runs
  //     `simulation.tick(100)` with barnesHut FORCED OFF — a pure O(n²) step that
  //     takes ~37s for 5000 nodes and freezes the page. Setting prune=false keeps
  //     barnesHut active throughout (5000 nodes: 37s → ~1s, measured).
  // (Note: the real @antv/layout option is `barnesHut`/`prune`; `barnesHutOptimize`
  //  was an invalid no-op field and has been removed.)
  if (type === 'force-atlas2') {
    if (opts.barnesHut === undefined) opts.barnesHut = true;
    if (opts.prune === undefined && nodeCount > 200) opts.prune = false;
    if (nodeCount > 5000) {
      if (opts.maxIteration === undefined) opts.maxIteration = 50;
    } else if (nodeCount >= 1000) {
      if (opts.maxIteration === undefined) opts.maxIteration = 100;
    } else {
      if (opts.maxIteration === undefined) opts.maxIteration = 100;
    }
  }

  // R-LAYOUT-04b: D3ForceLayout uses simulation timer (rAF-based) — increase alphaDecay
  // so it converges faster. Default alphaDecay=0.0228 → ~300 frames (~5s).
  // With alphaDecay=0.1 → ~45 frames (~0.7s); alphaDecay=0.05 → ~90 frames (~1.5s).
  if (type === 'd3-force') {
    if (opts.alphaDecay === undefined) opts.alphaDecay = 0.1;
    // Default linkDistance=30 produces very compact layouts. Scale it so the graph
    // fills the viewport at zoom=1 after fitView.
    if (opts.linkDistance === undefined) {
      opts.linkDistance = Math.max(200, Math.sqrt(nodeCount) * 80);
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

  // R-LAYOUT-05: D3ForceLayout uses rAF-based simulation timer — each tick takes 16ms
  // wall-clock time regardless of CPU cost. Manually ticking synchronously avoids this
  // and completes in <10ms for small graphs instead of ~700ms.
  if (type === 'd3-force' && 'tick' in layout && 'stop' in layout) {
    const sim = layout as unknown as {
      execute: (data: GraphData) => Promise<void>;
      tick: (iterations?: number) => void;
      stop: () => void;
      getAlpha: () => number;
      forEachNode: (fn: (n: { id: string; x: number; y: number }) => void) => void;
    };
    // execute() sets up simulation and starts the rAF timer
    const execPromise = sim.execute(layoutData);
    // Stop the rAF timer immediately — we'll tick manually
    sim.stop();
    // Manually tick synchronously until converged
    const alphaMin = (opts.alphaMin as number) ?? 0.001;
    const maxTicks = 300;
    for (let i = 0; i < maxTicks; i++) {
      if (sim.getAlpha() < alphaMin) break;
      sim.tick(1);
    }
    // The execute() promise resolves on 'end' event which won't fire since we stopped
    // the timer. We don't need it — positions are already synced by tick().
    void execPromise;
  } else {
    await layout.execute(layoutData);
  }

  const posMap = new Map<string, [number, number]>();
  layout.forEachNode((node: { id: string; x: number; y: number }) => {
    posMap.set(node.id, [node.x, node.y]);
  });

  // Build a map of enriched node data from layoutData (layouts may write metadata like depth, _nodeColor)
  const layoutNodeMap = new Map(layoutData.nodes.map((n) => [n.id, n]));

  const nodes: Array<GraphNode & { x: number; y: number }> = data.nodes.map((n) => {
    const pos = posMap.get(n.id);
    const layoutNode = layoutNodeMap.get(n.id);
    const mergedData = layoutNode?.data ? { ...n.data, ...layoutNode.data } : n.data;
    if (pos && n.x === pos[0] && n.y === pos[1] && !layoutNode?.data)
      return n as GraphNode & { x: number; y: number };
    return { ...n, data: mergedData, x: pos ? pos[0] : 0, y: pos ? pos[1] : 0 };
  });

  return { nodes };
}
