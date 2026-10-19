/**
 * Web Worker entry point for layout computation.
 * Receives graph data + layout config, executes layout, posts back positions.
 */

import type { GraphData, GraphEdge, GraphNode } from '../types';
import { loadLayout, type LayoutConstructor } from './layoutLoader';
import { normalizeLibraryLayoutOptions } from './layoutOptions';

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

  const LayoutClass: LayoutConstructor = await loadLayout(type);
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
