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
import type { GraphData, GraphEdge, GraphNode } from '../types';
import { normalizeLibraryLayoutOptions } from './layoutOptions';

type LayoutInstance = {
  execute: (data: GraphData) => Promise<void>;
  forEachNode: (fn: (node: GraphNode & { x: number; y: number }) => void) => void;
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
  nodes: GraphNode[];
  edges: GraphEdge[];
  config: { type: string; [key: string]: unknown };
}

interface WorkerResponse {
  id: number;
  positions: Array<{ id: string; x: number; y: number }>;
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { id, nodes, edges, config } = e.data;
  const { type } = config;

  const LayoutClass = LAYOUT_MAP[type] ?? RandomLayout;
  const nodeCount = nodes.length;
  const opts = normalizeLibraryLayoutOptions(type, config, nodeCount);

  // Spread initial positions for force layouts
  const spread = Math.max(200, Math.sqrt(nodeCount) * 30);
  const layoutNodes = nodes.map((n) => ({
    ...n,
    x: n.x ?? Math.random() * spread,
    y: n.y ?? Math.random() * spread,
  }));
  const layoutEdges = edges.map((e) => ({ ...e, id: `${e.source}-${e.target}` }));

  const layout = new LayoutClass(opts);
  const layoutData: GraphData = { nodes: layoutNodes, edges: layoutEdges };

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
