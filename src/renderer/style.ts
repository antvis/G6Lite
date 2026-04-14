/**
 * Resolve style value or function for nodes and edges.
 */

import type { GraphNode, GraphEdge, NodeConfig, EdgeConfig } from '../types.js';
import type { ThemeTokens } from '../types.js';

export interface ResolvedNodeStyle {
  fill: string;
  size: number;
  width: number;
  height: number;
}

export interface ResolvedEdgeStyle {
  stroke: string;
  lineWidth: number;
  curvature: number;
}

// Scratch objects reused across calls — callers must NOT store references
const _nodeScratch: ResolvedNodeStyle = { fill: '', size: 0, width: 0, height: 0 };
const _edgeScratch: ResolvedEdgeStyle = { stroke: '', lineWidth: 0, curvature: 0 };

export function resolveNodeStyle(
  node: GraphNode & { x: number; y: number },
  config: NodeConfig | undefined,
  theme: ThemeTokens,
): ResolvedNodeStyle {
  const fill = resolveStyleValue(config?.style?.fill, node, theme.nodeFill ?? '#5B8FF9');
  const size = resolveStyleValue(config?.style?.size, node, theme.nodeSize ?? 8);
  const sizeNum = typeof size === 'number' ? size : 8;
  const width = resolveStyleValue(config?.style?.width, node, sizeNum);
  const height = resolveStyleValue(config?.style?.height, node, sizeNum);
  _nodeScratch.fill = fill;
  _nodeScratch.size = sizeNum;
  _nodeScratch.width = typeof width === 'number' ? width : sizeNum;
  _nodeScratch.height = typeof height === 'number' ? height : sizeNum;
  return _nodeScratch;
}

export function resolveEdgeStyle(
  source: GraphNode & { x: number; y: number },
  target: GraphNode & { x: number; y: number },
  edge: GraphEdge,
  config: EdgeConfig | undefined,
  theme: ThemeTokens,
): ResolvedEdgeStyle {
  const stroke = resolveEdgeStyleValue(config?.style?.stroke, source, target, edge, theme.edgeStroke ?? '#e2e2e2');
  const lineWidth = resolveEdgeStyleValue(config?.style?.lineWidth, source, target, edge, theme.edgeLineWidth ?? 1);
  const curvature = resolveEdgeStyleValue(config?.style?.curvature, source, target, edge, 0.3);
  _edgeScratch.stroke = stroke;
  _edgeScratch.lineWidth = typeof lineWidth === 'number' ? lineWidth : 1;
  _edgeScratch.curvature = typeof curvature === 'number' ? curvature : 0.3;
  return _edgeScratch;
}

function resolveStyleValue<T>(
  value: T | ((node: GraphNode) => T) | undefined,
  node: GraphNode,
  fallback: T,
): T {
  if (value === undefined) return fallback;
  return typeof value === 'function' ? (value as (n: GraphNode) => T)(node) : value;
}

function resolveEdgeStyleValue<T>(
  value: T | ((s: GraphNode, t: GraphNode, e: GraphEdge) => T) | undefined,
  source: GraphNode,
  target: GraphNode,
  edge: GraphEdge,
  fallback: T,
): T {
  if (value === undefined) return fallback;
  return typeof value === 'function' ? (value as (s: GraphNode, t: GraphNode, e: GraphEdge) => T)(source, target, edge) : value;
}
