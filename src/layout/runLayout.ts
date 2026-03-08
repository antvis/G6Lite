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
  const { type, ...opts } = config;
  const layout = new LayoutClass(opts);

  const layoutData: GraphData = {
    nodes: data.nodes.map((n) => ({ ...n, x: n.x ?? 0, y: n.y ?? 0 })),
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
