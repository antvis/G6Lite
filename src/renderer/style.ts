/**
 * Resolve style value or function for nodes and edges.
 *
 * Optimization: Static Style Priority
 * - Configs with no function values are marked as 'static' and cached
 * - Runtime skips typeof checks for static configs (5-10x faster)
 * - Dynamic configs fall back to per-node resolution
 */

import { getEdgeExtension } from '../extensions/edge.js';
import { getNodeExtension } from '../extensions/node.js';
import { safeExtensionCall } from '../extensions/registry.js';
import type { EdgeConfig, GraphEdge, GraphNode, NodeConfig, ThemeTokens } from '../types.js';
import { parseColor } from './color.js';

/**
 * State containers come in two shapes depending on the source: a plain array
 * (from GraphNode/GraphEdge configs) or a Set (from DataModel's InternalNode/
 * InternalEdge, which the renderer references directly to avoid copies).
 * These helpers read either without allocating.
 */
type StateLike = readonly string[] | ReadonlySet<string> | undefined;

function hasAnyState(states: StateLike): boolean {
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
  curvature: number;
  curveOffset: number;
  endArrow: boolean;
  startArrow: boolean;
  arrowSize: number;
  lineDash: number[];
  opacity: number;
  radius: number;
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
  const fillValue = (style?.fill as string) ?? theme.nodeFill ?? '#5B8FF9';
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
  const strokeValue =
    (style?.stroke as string) ?? theme.edgeStroke ?? theme.edgeDefaultColor ?? '#e2e2e2';
  const userArrowSize = (style?.arrowSize as number) ?? 0;
  const cachedStyle: CachedEdgeStyle = {
    type: 'static',
    stroke: strokeValue,
    strokeRGB: parseColor(strokeValue), // Pre-parse color!
    lineWidth: typeof lineWidth === 'number' ? lineWidth : 1,
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

    // Apply state overrides (only dynamic part for static configs)
    let fill = base.fill;
    let stroke = base.stroke;
    let strokeWidth = base.strokeWidth;
    let opacity = base.opacity;
    let haloWidth = 0;

    const states = (node as GraphNode).states;
    if (hasAnyState(states)) {
      if (hasState(states, 'hidden')) {
        opacity = 0;
      } else {
        for (const state of states!) {
          if (state === 'default') continue;
          const override = config?.stateStyles?.[state] ?? theme.nodeStateStyles?.[state];
          if (!override) continue;
          if (override.fill !== undefined) fill = override.fill;
          if (override.stroke !== undefined) stroke = override.stroke;
          if (override.strokeWidth !== undefined) strokeWidth = override.strokeWidth;
          if (override.opacity !== undefined) opacity = override.opacity;
          if (override.haloWidth !== undefined) haloWidth = override.haloWidth;
        }
        if (hasState(states, 'active') && haloWidth === 0) haloWidth = 8;
        if (hasState(states, 'selected') && haloWidth < 12) haloWidth = 12;
      }
    }

    return {
      fill,
      fillRGB: fill === base.fill ? base.fillRGB : undefined,
      size: base.size,
      width: base.width,
      height: base.height,
      stroke,
      strokeRGB: stroke === base.stroke ? base.strokeRGB : undefined,
      strokeWidth,
      opacity,
      borderRadius: base.borderRadius,
      haloWidth,
    };
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
      fill: styleObj.fill ?? theme.nodeFill ?? '#5B8FF9',
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

  let fill = resolveStyleValue(style.fill, node, theme.nodeFill ?? '#5B8FF9');
  const size = resolveStyleValue(style.size, node, theme.nodeSize ?? 8);
  const sizeNum = typeof size === 'number' ? size : 8;
  const width = resolveStyleValue(style.width, node, sizeNum);
  const height = resolveStyleValue(style.height, node, sizeNum);
  let stroke = resolveStyleValue(style.stroke, node, theme.nodeStroke ?? '#fff');
  let strokeWidth = resolveStyleValue(style.strokeWidth, node, theme.nodeStrokeWidth ?? 0);
  let opacity = resolveStyleValue(style.opacity, node, 1 as number);
  const borderRadius = resolveStyleValue(style.borderRadius, node, 0 as number);

  strokeWidth = typeof strokeWidth === 'number' ? strokeWidth : 0;
  opacity = typeof opacity === 'number' ? opacity : 1;

  // Determine halo from state
  let haloWidth = 0;

  // Apply state style overrides (last state wins)
  const states = (node as GraphNode).states;
  if (hasAnyState(states)) {
    if (hasState(states, 'hidden')) {
      opacity = 0;
    } else {
      for (const state of states!) {
        if (state === 'default') continue;
        const override =
          config?.stateStyles?.[state] ??
          extension?.stateStyles?.[state] ??
          theme.nodeStateStyles?.[state];
        if (!override) continue;
        if (override.fill !== undefined) fill = override.fill;
        if (override.stroke !== undefined) stroke = override.stroke;
        if (override.strokeWidth !== undefined) strokeWidth = override.strokeWidth;
        if (override.opacity !== undefined) opacity = override.opacity;
        if (override.haloWidth !== undefined) haloWidth = override.haloWidth;
      }
      // Halo for active/selected states
      if (hasState(states, 'active') && haloWidth === 0) haloWidth = 8;
      if (hasState(states, 'selected') && haloWidth < 12) haloWidth = 12;
    }
  }

  return {
    fill,
    size: sizeNum,
    width: typeof width === 'number' ? width : sizeNum,
    height: typeof height === 'number' ? height : sizeNum,
    stroke,
    strokeWidth,
    opacity,
    borderRadius: typeof borderRadius === 'number' ? borderRadius : 0,
    haloWidth,
  };
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

    // Apply state overrides (only dynamic part for static configs)
    let stroke = base.stroke;
    let lineWidth = base.lineWidth;
    let opacity = base.opacity;
    let lineDash = base.lineDash;

    const states = edge.states;
    if (hasAnyState(states)) {
      if (hasState(states, 'hidden')) {
        opacity = 0;
      } else {
        for (const state of states!) {
          if (state === 'default') continue;
          const override = config?.stateStyles?.[state] ?? theme.edgeStateStyles?.[state];
          if (!override) continue;
          if (override.stroke !== undefined) stroke = override.stroke;
          if (override.lineWidth !== undefined) lineWidth = override.lineWidth;
          if (override.opacity !== undefined) opacity = override.opacity;
          if (override.lineDash !== undefined) lineDash = override.lineDash;
        }
      }
    }

    return {
      stroke,
      strokeRGB: stroke === base.stroke ? base.strokeRGB : undefined,
      lineWidth,
      curvature: base.curvature,
      curveOffset: base.curveOffset,
      endArrow: base.endArrow,
      startArrow: base.startArrow,
      arrowSize: base.arrowSize > 0 ? base.arrowSize : getArrowSize(lineWidth),
      lineDash,
      opacity,
      radius: base.radius,
    };
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

  // Apply state style overrides (last state wins)
  const states = edge.states;
  if (hasAnyState(states)) {
    if (hasState(states, 'hidden')) {
      opacity = 0;
    } else {
      for (const state of states!) {
        if (state === 'default') continue;
        const override =
          config?.stateStyles?.[state] ??
          extension?.stateStyles?.[state] ??
          theme.edgeStateStyles?.[state];
        if (!override) continue;
        if (override.stroke !== undefined) stroke = override.stroke;
        if (override.lineWidth !== undefined) lineWidth = override.lineWidth;
        if (override.opacity !== undefined) opacity = override.opacity;
        if (override.lineDash !== undefined) lineDash = override.lineDash;
      }
    }
  }

  return {
    stroke,
    lineWidth,
    curvature: typeof curvature === 'number' ? curvature : 0.3,
    curveOffset: typeof curveOffset === 'number' ? curveOffset : 60,
    endArrow: !!endArrow,
    startArrow: !!startArrow,
    arrowSize: userArrowSize > 0 ? userArrowSize : getArrowSize(lineWidth),
    lineDash,
    opacity,
    radius: typeof radius === 'number' ? radius : 0,
  };
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
