import type {
  EdgeConfig,
  EdgeLabelPlacement,
  EdgeStyleValue,
  GraphEdge,
  GraphNode,
  LabelLayout,
  LabelPlacement,
  NodeStyleConfig,
  NodeStyleValue,
  ResolvedLabelStyle,
} from '../types.js';

export const DEFAULT_FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export function getLabelZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return 1;
  return Math.max(0.25, Math.min(zoom, 2));
}

export function toLabelScreenPx(value: number, dpr: number, zoom: number): number {
  return value * dpr * getLabelZoom(zoom / Math.max(dpr, Number.EPSILON));
}

export function resolveNodeValue<T>(
  value: NodeStyleValue<T> | undefined,
  node: GraphNode,
  fallback: T,
): T {
  if (value === undefined) return fallback;
  return typeof value === 'function' ? (value as (item: GraphNode) => T)(node) : value;
}

export function resolveEdgeValue<T>(
  value: EdgeStyleValue<T> | undefined,
  source: GraphNode,
  target: GraphNode,
  edge: GraphEdge,
  fallback: T,
): T {
  if (value === undefined) return fallback;
  return typeof value === 'function'
    ? (value as (from: GraphNode, to: GraphNode, item: GraphEdge) => T)(source, target, edge)
    : value;
}

export function isValidLabelLayout(layout: unknown): layout is LabelLayout {
  if (!layout || typeof layout !== 'object') return false;
  const candidate = layout as Partial<LabelLayout>;
  return (
    typeof candidate.width === 'number' &&
    Number.isFinite(candidate.width) &&
    candidate.width > 0 &&
    typeof candidate.height === 'number' &&
    Number.isFinite(candidate.height) &&
    candidate.height > 0
  );
}

export function resolveNodeLabelStyle(
  style: NodeStyleConfig,
  node: GraphNode,
  dpr: number,
  zoom: number,
): ResolvedLabelStyle {
  const scale = dpr * getLabelZoom(zoom);
  const maxWidth = resolveNodeValue(style.labelMaxWidth, node, 0);
  return {
    labelFontSize: resolveNodeValue(style.labelFontSize, node, 12) * scale,
    labelFontFamily: resolveNodeValue(style.labelFontFamily, node, DEFAULT_FONT_FAMILY),
    labelFontWeight: resolveNodeValue(style.labelFontWeight, node, 'normal'),
    labelColor: resolveNodeValue(style.labelColor, node, '#333'),
    labelPlacement: resolveNodeValue(style.labelPlacement, node, 'bottom' as LabelPlacement),
    labelOffsetX: resolveNodeValue(style.labelOffsetX, node, 0) * scale,
    labelOffsetY: resolveNodeValue(style.labelOffsetY, node, 0) * scale,
    labelBackground: resolveNodeValue(style.labelBackground, node, false as string | false),
    labelBackgroundPadding: resolveNodeValue(style.labelBackgroundPadding, node, 2) * scale,
    labelMaxWidth: maxWidth > 0 ? maxWidth * scale : 0,
    labelAutoRotate: false,
  };
}

export function resolveEdgeLabelStyle(
  style: NonNullable<EdgeConfig['style']>,
  source: GraphNode,
  target: GraphNode,
  edge: GraphEdge,
  dpr: number,
): ResolvedLabelStyle {
  return {
    labelFontSize: resolveEdgeValue(style.labelFontSize, source, target, edge, 10) * dpr,
    labelFontFamily: resolveEdgeValue(
      style.labelFontFamily,
      source,
      target,
      edge,
      DEFAULT_FONT_FAMILY,
    ),
    labelFontWeight: 'normal',
    labelColor: resolveEdgeValue(style.labelColor, source, target, edge, '#666'),
    labelPlacement: resolveEdgeValue(
      style.labelPlacement,
      source,
      target,
      edge,
      'center' as EdgeLabelPlacement,
    ),
    labelOffsetX: 0,
    labelOffsetY: 0,
    labelBackground: resolveEdgeValue(
      style.labelBackground,
      source,
      target,
      edge,
      'rgba(255,255,255,0.8)' as string | false,
    ),
    labelBackgroundPadding:
      resolveEdgeValue(style.labelBackgroundPadding, source, target, edge, 2) * dpr,
    labelMaxWidth: 0,
    labelAutoRotate: resolveEdgeValue(style.labelAutoRotate, source, target, edge, true),
  };
}
