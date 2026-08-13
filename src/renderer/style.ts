/**
 * Resolve style value or function for nodes and edges.
 *
 * Optimization: Static Style Priority
 * - Configs with no function values are marked as 'static' and cached
 * - Runtime skips typeof checks for static configs (5-10x faster)
 * - Dynamic configs fall back to per-node resolution
 */

import { getEdgeExtension } from '../extensions/edge';
import { getNodeExtension } from '../extensions/node';
import { safeExtensionCall } from '../extensions/registry';
import { ANTV_PRIMARY_COLOR } from '../palette';
import type { EdgeConfig, GraphEdge, GraphNode, NodeConfig, ThemeTokens } from '../types';
import { parseColor } from './color';

/**
 * State containers come in two shapes depending on the source: a plain array
 * (from GraphNode/GraphEdge configs) or a Set (from DataModel's InternalNode/
 * InternalEdge, which the renderer references directly to avoid copies).
 * These helpers read either without allocating.
 */
type StateLike = readonly string[] | ReadonlySet<string> | undefined;
type StateContainer = Exclude<StateLike, undefined>;

function hasAnyState(states: StateLike): states is StateContainer {
  if (!states) return false;
  return Array.isArray(states) ? states.length > 0 : (states as ReadonlySet<string>).size > 0;
}

function hasState(states: StateLike, state: string): boolean {
  if (!states) return false;
  return Array.isArray(states)
    ? states.includes(state)
    : (states as ReadonlySet<string>).has(state);
}

export interface ResolvedNodeStyle {
  fill: string;
  fillRGB?: [number, number, number]; // Pre-parsed color (optional, for static optimization)
  size: number;
  width: number;
  height: number;
  stroke: string;
  strokeRGB?: [number, number, number]; // Pre-parsed color (optional)
  strokeWidth: number;
  opacity: number;
  borderRadius: number;
  haloWidth: number;
}

export interface ResolvedEdgeStyle {
  stroke: string;
  strokeRGB?: [number, number, number]; // Pre-parsed color (optional, for static optimization)
  lineWidth: number;
  hitAreaWidth: number;
  curvature: number;
  curveOffset: number;
  endArrow: boolean;
  startArrow: boolean;
  arrowSize: number;
  lineDash: number[];
  opacity: number;
  radius: number;
}

function applyNodeStateOverrides(
  style: ResolvedNodeStyle,
  states: StateLike,
  configStyles: NodeConfig['stateStyles'],
  extensionStyles: NodeConfig['stateStyles'],
  themeStyles: ThemeTokens['nodeStateStyles'],
): void {
  if (!hasAnyState(states)) return;
  if (hasState(states, 'hidden')) {
    style.opacity = 0;
    return;
  }
  for (const state of states) {
    if (state === 'default') continue;
    const override = configStyles?.[state] ?? extensionStyles?.[state] ?? themeStyles?.[state];
    if (!override) continue;
    if (override.fill !== undefined) {
      style.fill = override.fill;
      style.fillRGB = undefined;
    }
    if (override.stroke !== undefined) {
      style.stroke = override.stroke;
      style.strokeRGB = undefined;
    }
    if (override.strokeWidth !== undefined) style.strokeWidth = override.strokeWidth;
    if (override.opacity !== undefined) style.opacity = override.opacity;
    if (override.haloWidth !== undefined) style.haloWidth = override.haloWidth;
  }
  if (hasState(states, 'active') && style.haloWidth === 0) style.haloWidth = 8;
  if (hasState(states, 'selected') && style.haloWidth < 12) style.haloWidth = 12;
}

function applyEdgeStateOverrides(
  style: ResolvedEdgeStyle,
  states: StateLike,
  configStyles: EdgeConfig['stateStyles'],
  extensionStyles: EdgeConfig['stateStyles'],
  themeStyles: ThemeTokens['edgeStateStyles'],
): void {
  if (!hasAnyState(states)) return;
  if (hasState(states, 'hidden')) {
    style.opacity = 0;
    return;
  }
  for (const state of states) {
    if (state === 'default') continue;
    const override = configStyles?.[state] ?? extensionStyles?.[state] ?? themeStyles?.[state];
    if (!override) continue;
    if (override.stroke !== undefined) {
      style.stroke = override.stroke;
      style.strokeRGB = undefined;
    }
    if (override.lineWidth !== undefined) style.lineWidth = override.lineWidth;
    if (override.hitAreaWidth !== undefined) style.hitAreaWidth = override.hitAreaWidth;
    if (override.opacity !== undefined) style.opacity = override.opacity;
    if (override.lineDash !== undefined) style.lineDash = override.lineDash;
  }
}

/** Config analysis result type */
type StyleType = 'static' | 'dynamic';

/** Cached static style for fast path */
interface CachedNodeStyle {
  type: 'static';
  fill: string;
  fillRGB: [number, number, number]; // Pre-parsed color for zero runtime cost
  size: number;
  width: number;
  height: number;
  stroke: string;
  strokeRGB: [number, number, number]; // Pre-parsed color
  strokeWidth: number;
  opacity: number;
  borderRadius: number;
  haloWidth: number;
}

interface CachedEdgeStyle {
  type: 'static';
  stroke: string;
  strokeRGB: [number, number, number]; // Pre-parsed color for zero runtime cost
  lineWidth: number;
  hitAreaWidth: number;
  curvature: number;
  curveOffset: number;
  endArrow: boolean;
  startArrow: boolean;
  arrowSize: number;
  lineDash: number[];
  opacity: number;
  radius: number;
}

// WeakMap to cache analyzed configs (automatic cleanup when config is GC'd)
export const nodeConfigCache = new WeakMap<
  NodeConfig,
  { styleType: StyleType; cachedStyle?: CachedNodeStyle }
>();
export const edgeConfigCache = new WeakMap<
  EdgeConfig,
  { styleType: StyleType; cachedStyle?: CachedEdgeStyle }
>();

/** Compute arrow size from lineWidth, aligned with design spec 2.2. */
function getArrowSize(lineWidth: number): number {
  if (lineWidth <= 2) return 10;
  if (lineWidth <= 4) return 12;
  return Math.round(lineWidth * 2.5);
}

const _emptyDash: number[] = [];

/**
 * Analyze node config to determine if it's fully static (no functions).
 * Called once per config during initialization.
 */
export function analyzeNodeConfig(config: NodeConfig | undefined, theme: ThemeTokens): void {
  if (!config) return;

  if (getNodeExtension(config.type)) {
    nodeConfigCache.set(config, { styleType: 'dynamic' });
    return;
  }

  // If style is a function, it's definitely dynamic
  if (typeof config.style === 'function') {
    nodeConfigCache.set(config, { styleType: 'dynamic' });
    return;
  }

  // Check if any style property is a function
  const style = config.style;
  if (style) {
    const isStatic =
      !isFunction(style.fill) &&
      !isFunction(style.size) &&
      !isFunction(style.width) &&
      !isFunction(style.height) &&
      !isFunction(style.stroke) &&
      !isFunction(style.strokeWidth) &&
      !isFunction(style.opacity) &&
      !isFunction(style.borderRadius);

    if (!isStatic) {
      nodeConfigCache.set(config, { styleType: 'dynamic' });
      return;
    }
  }

  // Static config: pre-compute and cache the base style (including pre-parsed colors)
  const size = style?.size ?? theme.nodeSize ?? 8;
  const sizeNum = typeof size === 'number' ? size : 8;
  const fillValue = (style?.fill as string) ?? theme.nodeFill ?? ANTV_PRIMARY_COLOR;
  const strokeValue = (style?.stroke as string) ?? theme.nodeStroke ?? '#fff';

  const cachedStyle: CachedNodeStyle = {
    type: 'static',
    fill: fillValue,
    fillRGB: parseColor(fillValue), // Pre-parse color!
    size: sizeNum,
    width: (style?.width as number) ?? sizeNum,
    height: (style?.height as number) ?? sizeNum,
    stroke: strokeValue,
    strokeRGB: parseColor(strokeValue), // Pre-parse color!
    strokeWidth: (style?.strokeWidth as number) ?? theme.nodeStrokeWidth ?? 0,
    opacity: (style?.opacity as number) ?? 1,
    borderRadius: (style?.borderRadius as number) ?? 0,
    haloWidth: 0, // Static nodes have no state, so halo is always 0
  };

  nodeConfigCache.set(config, { styleType: 'static', cachedStyle });
}

/**
 * Analyze edge config to determine if it's fully static (no functions).
 * Called once per config during initialization.
 */
export function analyzeEdgeConfig(config: EdgeConfig | undefined, theme: ThemeTokens): void {
  if (!config) return;

  if (getEdgeExtension(config.type)) {
    edgeConfigCache.set(config, { styleType: 'dynamic' });
    return;
  }

  // If style is a function, it's definitely dynamic
  if (typeof config.style === 'function') {
    edgeConfigCache.set(config, { styleType: 'dynamic' });
    return;
  }

  // Check if any style property is a function
  const style = config.style;
  if (style) {
    const isStatic =
      !isFunction(style.stroke) &&
      !isFunction(style.lineWidth) &&
      !isFunction(style.hitAreaWidth) &&
      !isFunction(style.curvature) &&
      !isFunction(style.curveOffset) &&
      !isFunction(style.endArrow) &&
      !isFunction(style.startArrow) &&
      !isFunction(style.arrowSize) &&
      !isFunction(style.lineDash) &&
      !isFunction(style.opacity) &&
      !isFunction(style.radius);

    if (!isStatic) {
      edgeConfigCache.set(config, { styleType: 'dynamic' });
      return;
    }
  }

  // Static config: pre-compute and cache the base style (including pre-parsed colors)
  const lineWidth = (style?.lineWidth as number) ?? theme.edgeLineWidth ?? 1;
  const normalizedLineWidth = typeof lineWidth === 'number' ? lineWidth : 1;
  const hitAreaWidth = style?.hitAreaWidth as number | undefined;
  const strokeValue =
    (style?.stroke as string) ?? theme.edgeStroke ?? theme.edgeDefaultColor ?? '#e2e2e2';
  const userArrowSize = (style?.arrowSize as number) ?? 0;
  const cachedStyle: CachedEdgeStyle = {
    type: 'static',
    stroke: strokeValue,
    strokeRGB: parseColor(strokeValue), // Pre-parse color!
    lineWidth: normalizedLineWidth,
    hitAreaWidth:
      typeof hitAreaWidth === 'number' && Number.isFinite(hitAreaWidth)
        ? Math.max(normalizedLineWidth, hitAreaWidth)
        : normalizedLineWidth,
    curvature: (style?.curvature as number) ?? 0.3,
    curveOffset: (style?.curveOffset as number) ?? 60,
    endArrow: (style?.endArrow as boolean) ?? theme.edgeArrow ?? false,
    startArrow: (style?.startArrow as boolean) ?? false,
    arrowSize:
      userArrowSize > 0
        ? userArrowSize
        : getArrowSize(typeof lineWidth === 'number' ? lineWidth : 1),
    lineDash: (style?.lineDash as number[]) ?? [],
    opacity: (style?.opacity as number) ?? 1,
    radius: (style?.radius as number) ?? 0,
  };

  edgeConfigCache.set(config, { styleType: 'static', cachedStyle });
}

/** Helper to check if value is a function */
function isFunction(value: unknown): boolean {
  return typeof value === 'function';
}

export function resolveNodeStyle(
  node: GraphNode & { x: number; y: number },
  config: NodeConfig | undefined,
  theme: ThemeTokens,
): ResolvedNodeStyle {
  // Fast path: static config with cached base style
  const cache = config ? nodeConfigCache.get(config) : undefined;

  if (cache?.styleType === 'static' && cache.cachedStyle) {
    const base = cache.cachedStyle;
    const resolved: ResolvedNodeStyle = {
      fill: base.fill,
      fillRGB: base.fillRGB,
      size: base.size,
      width: base.width,
      height: base.height,
      stroke: base.stroke,
      strokeRGB: base.strokeRGB,
      strokeWidth: base.strokeWidth,
      opacity: base.opacity,
      borderRadius: base.borderRadius,
      haloWidth: 0,
    };
    applyNodeStateOverrides(
      resolved,
      node.states as StateLike,
      config?.stateStyles,
      undefined,
      theme.nodeStateStyles,
    );
    return resolved;
  }

  // Slow path: dynamic config or not yet analyzed
  return resolveNodeStyleDynamic(node, config, theme);
}

/** Slow path for dynamic configs - original implementation */
function resolveNodeStyleDynamic(
  node: GraphNode & { x: number; y: number },
  config: NodeConfig | undefined,
  theme: ThemeTokens,
): ResolvedNodeStyle {
  const extension = getNodeExtension(config?.type);
  const getExtensionStyle = extension?.getStyle;
  const dynamicExtensionStyle = getExtensionStyle
    ? safeExtensionCall(
        'node',
        config?.type ?? 'unknown',
        'getStyle',
        () => getExtensionStyle(node),
        undefined,
      )
    : undefined;
  const extensionStyle = {
    ...extension?.style,
    ...dynamicExtensionStyle,
  };
  const userStyle = typeof config?.style === 'object' ? config.style : undefined;
  const style = { ...extensionStyle, ...userStyle };

  // Handle case where config.style is a function that returns the entire style object
  if (typeof config?.style === 'function') {
    const styleFn = config.style as (n: GraphNode) => Partial<ResolvedNodeStyle>;
    const styleObj = styleFn(node);
    return {
      fill: styleObj.fill ?? theme.nodeFill ?? ANTV_PRIMARY_COLOR,
      size: styleObj.size ?? 40,
      width: styleObj.width ?? 100,
      height: styleObj.height ?? 40,
      stroke: styleObj.stroke ?? '#fff',
      strokeWidth: styleObj.strokeWidth ?? 0,
      opacity: styleObj.opacity ?? 1,
      borderRadius: styleObj.borderRadius ?? 0,
      haloWidth: 0,
    };
  }

  const fill = resolveStyleValue(style.fill, node, theme.nodeFill ?? ANTV_PRIMARY_COLOR);
  const size = resolveStyleValue(style.size, node, theme.nodeSize ?? 8);
  const sizeNum = typeof size === 'number' ? size : 8;
  const width = resolveStyleValue(style.width, node, sizeNum);
  const height = resolveStyleValue(style.height, node, sizeNum);
  const stroke = resolveStyleValue(style.stroke, node, theme.nodeStroke ?? '#fff');
  let strokeWidth = resolveStyleValue(style.strokeWidth, node, theme.nodeStrokeWidth ?? 0);
  let opacity = resolveStyleValue(style.opacity, node, 1 as number);
  const borderRadius = resolveStyleValue(style.borderRadius, node, 0 as number);

  strokeWidth = typeof strokeWidth === 'number' ? strokeWidth : 0;
  opacity = typeof opacity === 'number' ? opacity : 1;

  const resolved: ResolvedNodeStyle = {
    fill,
    size: sizeNum,
    width: typeof width === 'number' ? width : sizeNum,
    height: typeof height === 'number' ? height : sizeNum,
    stroke,
    strokeWidth,
    opacity,
    borderRadius: typeof borderRadius === 'number' ? borderRadius : 0,
    haloWidth: 0,
  };
  applyNodeStateOverrides(
    resolved,
    node.states as StateLike,
    config?.stateStyles,
    extension?.stateStyles,
    theme.nodeStateStyles,
  );
  return resolved;
}

export function resolveEdgeStyle(
  source: GraphNode & { x: number; y: number },
  target: GraphNode & { x: number; y: number },
  edge: GraphEdge,
  config: EdgeConfig | undefined,
  theme: ThemeTokens,
): ResolvedEdgeStyle {
  // Fast path: static config with cached base style
  const cache = config ? edgeConfigCache.get(config) : undefined;

  if (cache?.styleType === 'static' && cache.cachedStyle) {
    const base = cache.cachedStyle;
    const resolved: ResolvedEdgeStyle = {
      stroke: base.stroke,
      strokeRGB: base.strokeRGB,
      lineWidth: base.lineWidth,
      hitAreaWidth: (config?.style as { hitAreaWidth?: number } | undefined)?.hitAreaWidth ?? NaN,
      curvature: base.curvature,
      curveOffset: base.curveOffset,
      endArrow: base.endArrow,
      startArrow: base.startArrow,
      arrowSize: base.arrowSize > 0 ? base.arrowSize : getArrowSize(base.lineWidth),
      lineDash: base.lineDash,
      opacity: base.opacity,
      radius: base.radius,
    };
    applyEdgeStateOverrides(
      resolved,
      edge.states as StateLike,
      config?.stateStyles,
      undefined,
      theme.edgeStateStyles,
    );
    resolved.hitAreaWidth = validHitAreaWidth(resolved.hitAreaWidth, resolved.lineWidth);
    if (base.arrowSize <= 0) resolved.arrowSize = getArrowSize(resolved.lineWidth);
    return resolved;
  }

  // Slow path: dynamic config or not yet analyzed
  return resolveEdgeStyleDynamic(source, target, edge, config, theme);
}

/** Slow path for dynamic configs - original implementation */
function resolveEdgeStyleDynamic(
  source: GraphNode & { x: number; y: number },
  target: GraphNode & { x: number; y: number },
  edge: GraphEdge,
  config: EdgeConfig | undefined,
  theme: ThemeTokens,
): ResolvedEdgeStyle {
  const extension = getEdgeExtension(config?.type);
  const getExtensionStyle = extension?.getStyle;
  const dynamicExtensionStyle = getExtensionStyle
    ? safeExtensionCall(
        'edge',
        config?.type ?? 'unknown',
        'getStyle',
        () => getExtensionStyle(source, target, edge),
        undefined,
      )
    : undefined;
  const extensionStyle = {
    ...extension?.style,
    ...dynamicExtensionStyle,
  };
  let stroke: string;
  let lineWidth: number;
  let hitAreaWidth: number | undefined;
  let curvature: number;
  let curveOffset: number;
  let endArrow: boolean;
  let startArrow: boolean;
  let userArrowSize: number;
  let lineDash: number[];
  let opacity: number;
  let radius: number;

  // Handle case where config.style is a function that returns the entire style object
  if (typeof config?.style === 'function') {
    const styleFn = config.style as (e: GraphEdge) => Partial<ResolvedEdgeStyle>;
    const styleObj = styleFn(edge);
    stroke = styleObj.stroke ?? theme.edgeStroke ?? theme.edgeDefaultColor ?? '#e2e2e2';
    lineWidth = styleObj.lineWidth ?? 1;
    hitAreaWidth = styleObj.hitAreaWidth;
    curvature = styleObj.curvature ?? 0.3;
    curveOffset = styleObj.curveOffset ?? 60;
    endArrow = styleObj.endArrow ?? false;
    startArrow = styleObj.startArrow ?? false;
    userArrowSize = styleObj.arrowSize ?? 10;
    lineDash = styleObj.lineDash ?? [];
    opacity = styleObj.opacity ?? 1;
    radius = styleObj.radius ?? 0;
  } else {
    // Base style resolution
    stroke = resolveEdgeStyleValue(
      config?.style?.stroke ?? extensionStyle.stroke,
      source,
      target,
      edge,
      theme.edgeStroke ?? theme.edgeDefaultColor ?? '#e2e2e2',
    );
    lineWidth = resolveEdgeStyleValue(
      config?.style?.lineWidth ?? extensionStyle.lineWidth,
      source,
      target,
      edge,
      theme.edgeLineWidth ?? 1,
    );
    hitAreaWidth = resolveEdgeStyleValue(
      config?.style?.hitAreaWidth ?? extensionStyle.hitAreaWidth,
      source,
      target,
      edge,
      undefined,
    );
    curvature = resolveEdgeStyleValue(
      config?.style?.curvature ?? extensionStyle.curvature,
      source,
      target,
      edge,
      0.3,
    );
    curveOffset = resolveEdgeStyleValue(
      config?.style?.curveOffset ?? extensionStyle.curveOffset,
      source,
      target,
      edge,
      60,
    );
    endArrow = resolveEdgeStyleValue(
      config?.style?.endArrow ?? extensionStyle.endArrow,
      source,
      target,
      edge,
      theme.edgeArrow ?? false,
    );
    startArrow = resolveEdgeStyleValue(
      config?.style?.startArrow ?? extensionStyle.startArrow,
      source,
      target,
      edge,
      false,
    );
    userArrowSize = resolveEdgeStyleValue(
      config?.style?.arrowSize ?? extensionStyle.arrowSize,
      source,
      target,
      edge,
      0 as number,
    );
    lineDash = resolveEdgeStyleValue(
      config?.style?.lineDash ?? extensionStyle.lineDash,
      source,
      target,
      edge,
      _emptyDash,
    );
    opacity = resolveEdgeStyleValue(
      config?.style?.opacity ?? extensionStyle.opacity,
      source,
      target,
      edge,
      1 as number,
    );
    radius = resolveEdgeStyleValue(
      config?.style?.radius ?? extensionStyle.radius,
      source,
      target,
      edge,
      0 as number,
    );
  }

  lineWidth = typeof lineWidth === 'number' ? lineWidth : 1;
  opacity = typeof opacity === 'number' ? opacity : 1;

  const resolved: ResolvedEdgeStyle = {
    stroke,
    lineWidth,
    hitAreaWidth: hitAreaWidth ?? NaN,
    curvature: typeof curvature === 'number' ? curvature : 0.3,
    curveOffset: typeof curveOffset === 'number' ? curveOffset : 60,
    endArrow: !!endArrow,
    startArrow: !!startArrow,
    arrowSize: userArrowSize > 0 ? userArrowSize : getArrowSize(lineWidth),
    lineDash,
    opacity,
    radius: typeof radius === 'number' ? radius : 0,
  };
  applyEdgeStateOverrides(
    resolved,
    edge.states as StateLike,
    config?.stateStyles,
    extension?.stateStyles,
    theme.edgeStateStyles,
  );
  resolved.hitAreaWidth = validHitAreaWidth(resolved.hitAreaWidth, resolved.lineWidth);
  if (userArrowSize <= 0) resolved.arrowSize = getArrowSize(resolved.lineWidth);
  return resolved;
}

function validHitAreaWidth(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(fallback, value) : fallback;
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
  return typeof value === 'function'
    ? (value as (s: GraphNode, t: GraphNode, e: GraphEdge) => T)(source, target, edge)
    : value;
}
