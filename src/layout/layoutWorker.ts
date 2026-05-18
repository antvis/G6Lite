/**
 * Web Worker entry point for layout computation.
 * Receives graph data + layout config, executes layout, posts back positions.
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

type LayoutInstance = {
  execute: (data: any) => Promise<void>;
  forEachNode: (fn: (n: any) => void) => void;
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

interface WorkerMessage {
  id: number;
  nodes: Array<{ id: string; x?: number; y?: number; data?: any }>;
  edges: Array<{ source: string; target: string; data?: any }>;
  config: { type: string; [key: string]: unknown };
}

interface WorkerResponse {
  id: number;
  positions: Array<{ id: string; x: number; y: number }>;
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { id, nodes, edges, config } = e.data;
  const { type, worker, ...opts } = config;

  const LayoutClass = LAYOUT_MAP[type] ?? RandomLayout;
  const nodeCount = nodes.length;

  // Apply same auto-tuning as main-thread runLayout
  if ('iterations' in opts && !('maxIteration' in opts)) {
    opts.maxIteration = opts.iterations;
  }
  delete opts.iterations;

  if (nodeCount > 500 && opts.animate === undefined) {
    opts.animate = false;
  }

  if ((type === 'force' || type === 'fruchterman' || type === 'd3-force') && nodeCount > 1000) {
    if (nodeCount > 5000) {
      if (opts.maxIteration === undefined) opts.maxIteration = 50;
      if (opts.minMovement === undefined) opts.minMovement = 2.0;
    } else {
      if (opts.maxIteration === undefined) opts.maxIteration = 200;
      if (opts.minMovement === undefined) opts.minMovement = 1.5;
    }
  }

  // Spread initial positions for force layouts
  const spread = Math.max(200, Math.sqrt(nodeCount) * 30);
  const layoutNodes = nodes.map((n) => ({
    ...n,
    x: n.x ?? Math.random() * spread,
    y: n.y ?? Math.random() * spread,
  }));
  const layoutEdges = edges.map((e) => ({ ...e, id: `${e.source}-${e.target}` }));

  const layout = new LayoutClass(opts);
  const layoutData = { nodes: layoutNodes, edges: layoutEdges };

  try {
    await layout.execute(layoutData);

    const positions: Array<{ id: string; x: number; y: number }> = [];
    layout.forEachNode((node: { id: string; x: number; y: number }) => {
      positions.push({ id: node.id, x: node.x, y: node.y });
    });

    const response: WorkerResponse = { id, positions };
    self.postMessage(response);
  } catch (err) {
    self.postMessage({ id, error: String(err) });
  }
};
