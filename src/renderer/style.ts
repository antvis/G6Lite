/**
 * Resolve style value or function for nodes and edges.
 */

import type { GraphNode, GraphEdge, NodeConfig, EdgeConfig } from '../types.js';
import type { ThemeTokens } from '../types.js';

export interface ResolvedNodeStyle {
  fill: string;
  size: number;
}

export interface ResolvedEdgeStyle {
  stroke: string;
  lineWidth: number;
}

export function resolveNodeStyle(
  node: GraphNode & { x: number; y: number },
  config: NodeConfig | undefined,
  theme: ThemeTokens
): ResolvedNodeStyle {
  const fill = resolveStyleValue(config?.style?.fill, node, theme.nodeFill ?? '#5B8FF9');
  const size = resolveStyleValue(config?.style?.size ?? config?.style?.width, node, theme.nodeSize ?? 8);
  return { fill, size: typeof size === 'number' ? size : 8 };
}

export function resolveEdgeStyle(
  source: GraphNode & { x: number; y: number },
  target: GraphNode & { x: number; y: number },
  edge: GraphEdge,
  config: EdgeConfig | undefined,
  theme: ThemeTokens
): ResolvedEdgeStyle {
  const stroke = resolveEdgeStyleValue(config?.style?.stroke, source, target, edge, theme.edgeStroke ?? '#e2e2e2');
  const lineWidth = resolveEdgeStyleValue(config?.style?.lineWidth, source, target, edge, theme.edgeLineWidth ?? 1);
  return { stroke, lineWidth: typeof lineWidth === 'number' ? lineWidth : 1 };
}

function resolveStyleValue<T>(
  value: T | ((node: GraphNode) => T) | undefined,
  node: GraphNode,
  fallback: T
): T {
  if (value === undefined) return fallback;
  return typeof value === 'function' ? (value as (n: GraphNode) => T)(node) : value;
}

function resolveEdgeStyleValue<T>(
  value: T | ((s: GraphNode, t: GraphNode, e: GraphEdge) => T) | undefined,
  source: GraphNode,
  target: GraphNode,
  edge: GraphEdge,
  fallback: T
): T {
  if (value === undefined) return fallback;
  return typeof value === 'function' ? (value as (s: GraphNode, t: GraphNode, e: GraphEdge) => T)(source, target, edge) : value;
}
