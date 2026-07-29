import type { DataModel, InternalEdge, InternalNode } from '../dataModel.js';
import type { EdgeConfig, GraphEdge, LayoutNode, NodeConfig, ThemeTokens } from '../types.js';

/**
 * Immutable array views shared by DataModel and Renderer.
 *
 * DataModel owns the records and mutates them in place. Renderer only retains
 * references to those records, so the conversion is deliberately centralized
 * here instead of repeating double assertions across Graph and Scheduler.
 */
export interface RendererData {
  nodes: readonly LayoutNode[];
  edges: readonly GraphEdge[];
  nodeConfig?: NodeConfig;
  edgeConfig?: EdgeConfig;
  theme: ThemeTokens;
  layoutDirection?: 'TB' | 'LR' | 'BT' | 'RL';
  /** The layout algorithm type (e.g. 'fishbone', 'indented', 'dagre'). */
  layoutType?: string;
  /** Polyline router type: 'orth' (default, per-edge) or a shared tree router. */
  polylineRouter?: 'orth' | 'tree' | 'indented' | 'fishbone';
}

export function getRendererNodes(nodes: readonly InternalNode[]): LayoutNode[] {
  return nodes as unknown as LayoutNode[];
}

export function getRendererNode(node: InternalNode): LayoutNode {
  return node as unknown as LayoutNode;
}

export function getRendererEdges(edges: readonly InternalEdge[]): GraphEdge[] {
  return edges as unknown as GraphEdge[];
}

export function getRendererEdge(edge: InternalEdge): GraphEdge {
  return edge as unknown as GraphEdge;
}

export function createRendererData(dataModel: DataModel): RendererData {
  return {
    nodes: getRendererNodes(dataModel.getNodes()),
    edges: getRendererEdges(dataModel.getEdges()),
    nodeConfig: dataModel.nodeConfig,
    edgeConfig: dataModel.edgeConfig,
    theme: dataModel.theme,
    layoutDirection: dataModel.layoutDirection,
    layoutType: dataModel.layoutType,
    polylineRouter: dataModel.polylineRouter,
  };
}
