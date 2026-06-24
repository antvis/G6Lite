/**
 * WebGL renderer with multi-program dispatch, process/render separation,
 * and framebuffer picking for O(1) hit detection.
 */

import type { NodeRect, Waypoint } from '../routing/orthogonal.js';
import {
  applyRoundedCorners,
  computeFishboneRoute,
  computeIndentedRoutes,
  computeOrthogonalRoute,
  computeTreeRoutes,
} from '../routing/orthogonal.js';
import type { EdgeConfig, GraphEdge, LayoutNode, NodeConfig, ThemeTokens } from '../types.js';
import type { Camera } from './camera.js';
import { createCamera } from './camera.js';
import { parseColor } from './color.js';
import { getGL } from './gl.js';
import { PickingManager } from './picking.js';
import { EdgeArcProgram } from './programs/edgeArc.js';
import { EdgeArrowProgram } from './programs/edgeArrow.js';
import { EdgeCubicProgram } from './programs/edgeCubic.js';
import { EdgeLineProgram } from './programs/edgeLine.js';
import { EdgeLoopProgram } from './programs/edgeLoop.js';
import { EdgeRectProgram } from './programs/edgeRect.js';
import { NodeCircleProgram } from './programs/nodeCircle.js';
import { NodeRectProgram } from './programs/nodeRect.js';
import type { Program, RenderParams } from './programs/program.js';
import type { ResolvedEdgeStyle } from './style.js';
import { edgeConfigCache, nodeConfigCache, resolveEdgeStyle, resolveNodeStyle } from './style.js';

export interface RendererData {
  nodes: LayoutNode[];
  edges: GraphEdge[];
  nodeConfig?: NodeConfig;
  edgeConfig?: EdgeConfig;
  theme: ThemeTokens;
  layoutDirection?: 'TB' | 'LR' | 'BT' | 'RL';
  /** The layout algorithm type (e.g. 'fishbone', 'indented', 'dagre'). Used for routing decisions. */
  layoutType?: string;
  /** Polyline router type: 'orth' (default, per-edge) or 'tree' (shared trunk). */
  polylineRouter?: 'orth' | 'tree' | 'indented' | 'fishbone';
}

type NodeProgramType = 'circle' | 'rect';
type EdgeProgramType = 'line' | 'rect' | 'arc' | 'polyline' | 'cubic';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;

  // Programs (created lazily on first use to avoid upfront shader compilation)
  private _programs: Partial<{
    nodeCircle: NodeCircleProgram;
    nodeRect: NodeRectProgram;
    edgeLine: EdgeLineProgram;
    edgeRect: EdgeRectProgram;
    edgeArc: EdgeArcProgram;
    edgeCubic: EdgeCubicProgram;
    edgeArrow: EdgeArrowProgram;
    edgeLoop: EdgeLoopProgram;
    edgePolyline: EdgeRectProgram;
  }> = {};

  // Active program type (resolved from config)
  private activeNodeType: NodeProgramType = 'circle';
  private activeEdgeType: EdgeProgramType = 'line';

  // Picking
  private picking: PickingManager;

  // Data
  private nodes: LayoutNode[] = [];
  private edges: GraphEdge[] = [];
  private nodeIdToIndex = new Map<string, number>();
  private edgeIdToIndex = new Map<string, number>();
  // Parallel index arrays for edges — avoid Map.get in hot loops
  private edgeSourceIdx: Int32Array = new Int32Array(0);
  private edgeTargetIdx: Int32Array = new Int32Array(0);
  private nodeConfig: NodeConfig | undefined;
  private edgeConfig: EdgeConfig | undefined;
  private theme: ThemeTokens = {
    nodeFill: '#5B8FF9',
    nodeSize: 8,
    edgeStroke: '#e2e2e2',
    edgeLineWidth: 1,
  };
  private layoutDirection: 'TB' | 'LR' | 'BT' | 'RL' = 'TB';
  private polylineRouter: 'orth' | 'tree' | 'indented' | 'fishbone' = 'orth';
  private indentTarget: 'left' | 'right' = 'left';
  private trunkGap: number = 0;

  // Camera
  private camera: Camera = createCamera();

  // Suppress draw during batch operations (e.g. resize + fitView on first render)
  private suppressDraw = false;
  private pendingDraw = false;

  // State
  private highlightNodeIds = new Set<string>();
  private highlightEdgeIndices = new Set<number>();
  private prevHighlightNodeIds = new Set<string>();
  private prevHighlightEdgeIndices = new Set<number>();

  // Edge visibility (hideEdgesOnMove)
  private hideEdges = false;
  private edgeRestoreTimer: ReturnType<typeof setTimeout> | null = null;

  // Polyline waypoints cache (for label positioning)
  // Disabled for large graphs to save memory
  private polylineRoutes = new Map<number, Waypoint[]>();
  private maxPolylineRoutesCache = 5000; // Don't cache routes for very large graphs

  // Render scheduling
  private renderFrame: number | null = null;
  private needToProcess = false;
  private needHighlightUpdate = false;
  private needPickingRender = false;
  private pickingInitialized = false;
  // Whether the last full process() emitted any arrows. Incremental paths
  // (highlight delta, position patch) don't update the arrow buffer, so when
  // arrows exist they must fall back to a full process() instead.
  private hasArrows = false;

  // Before-draw callback (used by ComboRenderer underlay)
  private beforeDrawCallback: (() => void) | null = null;
  // After-draw callback (used by LabelRenderer)
  private afterDrawCallback: (() => void) | null = null;

  // Reusable arrays for process() to avoid GC pressure
  private _nodeHalfWidths: Float64Array | null = null;
  private _nodeHeights: Float64Array | null = null;

  constructor(container: string | HTMLElement) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el || !(el instanceof HTMLCanvasElement))
      throw new Error('Container must be a canvas or canvas selector');
    this.canvas = el;
    this.gl = getGL(this.canvas);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.picking = new PickingManager(this.gl);
  }

  private getProgram<K extends keyof typeof this._programs>(
    key: K,
  ): NonNullable<(typeof this._programs)[K]> {
    if (!this._programs[key]) {
      switch (key) {
        case 'nodeCircle':
          this._programs.nodeCircle = new NodeCircleProgram(this.gl);
          break;
        case 'nodeRect':
          this._programs.nodeRect = new NodeRectProgram(this.gl);
          break;
        case 'edgeLine':
          this._programs.edgeLine = new EdgeLineProgram(this.gl);
          break;
        case 'edgeRect':
          this._programs.edgeRect = new EdgeRectProgram(this.gl);
          break;
        case 'edgeArc':
          this._programs.edgeArc = new EdgeArcProgram(this.gl);
          break;
        case 'edgeCubic':
          this._programs.edgeCubic = new EdgeCubicProgram(this.gl);
          break;
        case 'edgeArrow':
          this._programs.edgeArrow = new EdgeArrowProgram(this.gl);
          break;
        case 'edgeLoop':
          this._programs.edgeLoop = new EdgeLoopProgram(this.gl);
          break;
        case 'edgePolyline':
          this._programs.edgePolyline = new EdgeRectProgram(this.gl);
          break;
      }
    }
    return this._programs[key]! as NonNullable<(typeof this._programs)[K]>;
  }

  private get activeNodeProgram(): Program {
    return this.activeNodeType === 'rect'
      ? this.getProgram('nodeRect')
      : this.getProgram('nodeCircle');
  }

  private get activeEdgeProgram(): Program {
    if (this.activeEdgeType === 'polyline') return this.getProgram('edgePolyline');
    return this.activeEdgeType === 'arc'
      ? this.getProgram('edgeArc')
      : this.activeEdgeType === 'cubic'
      ? this.getProgram('edgeCubic')
      : this.activeEdgeType === 'rect'
      ? this.getProgram('edgeRect')
      : this.getProgram('edgeLine');
  }

  updateData(renderData: RendererData): void {
    this.nodeConfig = renderData.nodeConfig;
    this.edgeConfig = renderData.edgeConfig;
    this.theme = renderData.theme;
    this.layoutDirection = renderData.layoutDirection ?? 'TB';
    this.polylineRouter = renderData.polylineRouter ?? 'orth';
    this.indentTarget = renderData.edgeConfig?.style?.indentTarget ?? 'left';
    this.trunkGap = renderData.edgeConfig?.style?.trunkGap ?? 0;
    this.nodes = renderData.nodes as typeof this.nodes;
    this.edges = renderData.edges as typeof this.edges;
    this.nodeIdToIndex.clear();
    this.edgeIdToIndex.clear();
    renderData.nodes.forEach((n, i) => this.nodeIdToIndex.set(n.id, i));

    // Build parallel index arrays for fast edge source/target lookup
    const edgeCount = renderData.edges.length;
    if (this.edgeSourceIdx.length < edgeCount) {
      this.edgeSourceIdx = new Int32Array(edgeCount);
      this.edgeTargetIdx = new Int32Array(edgeCount);
    }
    for (let i = 0; i < edgeCount; i++) {
      const e = renderData.edges[i];
      this.edgeSourceIdx[i] = this.nodeIdToIndex.get(e.source) ?? -1;
      this.edgeTargetIdx[i] = this.nodeIdToIndex.get(e.target) ?? -1;
      const edgeId = (e as any).id;
      if (edgeId) this.edgeIdToIndex.set(edgeId, i);
    }

    // Resolve active program types
    this.activeNodeType = renderData.nodeConfig?.type === 'rect' ? 'rect' : 'circle';
    this.activeEdgeType = this.resolveEdgeType(renderData.edgeConfig);

    this.needToProcess = true;
    this.needPickingRender = true;
  }

  /** Alias for backward compat. */
  setData(renderData: RendererData): void {
    this.updateData(renderData);
  }

  /** Determine edge program: complex edge types first, rect when base or state styles require width/opacity/dash, else line. */
  private resolveEdgeType(config?: EdgeConfig): EdgeProgramType {
    if (config?.type === 'polyline') return 'polyline';
    if (config?.type === 'arc') return 'arc';
    if (config?.type === 'cubic') return 'cubic' as EdgeProgramType;
    const lw = config?.style?.lineWidth;
    if (typeof lw === 'number' && lw > 1) return 'rect';
    if (typeof lw === 'undefined' && (this.theme.edgeLineWidth ?? 1) > 1) return 'rect';
    if (typeof lw === 'function') return 'rect';
    const stateStyles = config?.stateStyles;
    if (stateStyles) {
      for (const style of Object.values(stateStyles)) {
        if (!style) continue;
        if ((style.lineWidth ?? 1) > 1) return 'rect';
        if (style.opacity !== undefined && style.opacity < 1) return 'rect';
        if (style.lineDash && style.lineDash.length > 0) return 'rect';
      }
    }
    return 'line';
  }

  /** Build GPU buffers from current state. */
  private process(): void {
    const { nodes, edges, nodeConfig, edgeConfig, theme } = this;
    const bg = parseColor(this.theme.canvasBackground ?? '#fff');
    const hasHighlight = this.highlightNodeIds.size > 0;

    // -- Process nodes --
    const nodeProgram =
      this.activeNodeType === 'rect' ? this.getProgram('nodeRect') : this.getProgram('nodeCircle');
    nodeProgram.reallocate(nodes.length);

    // Pre-allocate arrays for edge processing (reused across process calls)
    if (!this._nodeHalfWidths || this._nodeHalfWidths.length < nodes.length) {
      this._nodeHalfWidths = new Float64Array(nodes.length);
      this._nodeHeights = new Float64Array(nodes.length);
    }
    const nodeHalfWidths = this._nodeHalfWidths;
    const nodeHeights = this._nodeHeights!;

    // Fast path: static node config with no highlight and no per-node states
    const nCache = nodeConfig ? nodeConfigCache.get(nodeConfig) : undefined;
    let hasNodeStates = false;
    if (nCache?.styleType === 'static' && nCache.cachedStyle && !hasHighlight) {
      for (let i = 0; i < nodes.length; i++) {
        const s = (nodes[i] as any).states;
        if (s && (s.size > 0 || s.length > 0)) {
          hasNodeStates = true;
          break;
        }
      }
    }
    if (nCache?.styleType === 'static' && nCache.cachedStyle && !hasHighlight && !hasNodeStates) {
      const base = nCache.cachedStyle;
      const baseColor = base.fillRGB;
      const strokeColor = base.strokeRGB;
      const isFillTransparent = base.fill === 'transparent' || base.fill === 'none';
      const isStrokeTransparent = base.stroke === 'transparent' || base.stroke === 'none';
      const effectiveOpacity = isFillTransparent ? 0 : base.opacity;
      const effectiveStrokeWidth = isStrokeTransparent ? 0 : base.strokeWidth;
      const isRect = this.activeNodeType === 'rect';
      if (!isRect) {
        // Circle nodes: use template + processNodeStatic for maximum throughput
        const template = NodeCircleProgram.buildTemplate(
          base.size,
          baseColor,
          effectiveStrokeWidth,
          strokeColor,
          effectiveOpacity,
          base.haloWidth,
        );
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          (nodeProgram as NodeCircleProgram).processNodeStatic(i, node.x, node.y, i, template);
          nodeHalfWidths[i] = base.size / 2;
          nodeHeights[i] = base.size;
        }
      } else {
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          (nodeProgram as NodeRectProgram).processNode(
            i,
            node.x,
            node.y,
            base.width,
            base.height,
            baseColor,
            i,
            effectiveStrokeWidth,
            strokeColor,
            effectiveOpacity,
            base.haloWidth,
            base.borderRadius,
          );
          nodeHalfWidths[i] = base.width / 2;
          nodeHeights[i] = base.height;
        }
      }
    } else {
      // Slow path: dynamic config or highlight active
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const style = resolveNodeStyle(node, nodeConfig, theme);

        const active = !hasHighlight || this.highlightNodeIds.has(node.id);
        // Use pre-parsed colors if available (static optimization), otherwise parse on-the-fly
        const baseColor = style.fillRGB ?? parseColor(style.fill);
        const strokeColor = style.strokeRGB ?? parseColor(style.stroke);
        const isFillTransparent = style.fill === 'transparent' || style.fill === 'none';
        const isStrokeTransparent = style.stroke === 'transparent' || style.stroke === 'none';
        const color: [number, number, number] = active
          ? baseColor
          : [
              baseColor[0] * 0.25 + bg[0] * 0.75,
              baseColor[1] * 0.25 + bg[1] * 0.75,
              baseColor[2] * 0.25 + bg[2] * 0.75,
            ];
        const opacity = active ? style.opacity : Math.min(style.opacity, 0.25);
        const effectiveOpacity = isFillTransparent ? 0 : opacity;
        const effectiveStrokeWidth = isStrokeTransparent ? 0 : style.strokeWidth;

        if (this.activeNodeType === 'rect') {
          (nodeProgram as NodeRectProgram).processNode(
            i,
            node.x,
            node.y,
            style.width,
            style.height,
            color,
            i,
            effectiveStrokeWidth,
            strokeColor,
            effectiveOpacity,
            style.haloWidth,
            style.borderRadius,
          );
        } else {
          (nodeProgram as NodeCircleProgram).processNode(
            i,
            node.x,
            node.y,
            style.size,
            color,
            i,
            effectiveStrokeWidth,
            strokeColor,
            effectiveOpacity,
            style.haloWidth,
          );
        }

        // Pre-compute dimensions for edge processing
        nodeHalfWidths[i] = (this.activeNodeType === 'rect' ? style.width : style.size) / 2;
        nodeHeights[i] = this.activeNodeType === 'rect' ? style.height : style.size;
      }
    }
    nodeProgram.upload();

    // -- Classify edges in a single pass (no style resolution) --
    const regularIndices: number[] = [];
    const selfLoopIndices: number[] = [];
    const loopsPerNode = new Map<string, number>();

    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      if (e.source === e.target) {
        selfLoopIndices.push(i);
        loopsPerNode.set(e.source, (loopsPerNode.get(e.source) ?? 0) + 1);
      } else {
        regularIndices.push(i);
      }
    }

    // Compute arrow count from static config cache when possible
    let arrowCount = 0;
    const edgeCache = edgeConfig ? edgeConfigCache.get(edgeConfig) : undefined;
    // For dynamic configs, cache resolved styles to avoid double resolveEdgeStyle in processFullEdges
    let dynamicEdgeStyleCache: ResolvedEdgeStyle[] | null = null;
    if (edgeCache?.styleType === 'static' && edgeCache.cachedStyle) {
      // Static config: arrow count is deterministic without per-edge resolveEdgeStyle
      const endArrow = edgeCache.cachedStyle.endArrow;
      const startArrow = edgeCache.cachedStyle.startArrow;
      arrowCount =
        regularIndices.length * (Number(endArrow) + Number(startArrow)) +
        selfLoopIndices.length * Number(endArrow);
    } else {
      // Dynamic config: must resolve per-edge to count arrows; cache results for reuse
      dynamicEdgeStyleCache = new Array(edges.length);
      for (let i = 0; i < edges.length; i++) {
        const srcIdx = this.edgeSourceIdx[i];
        const tgtIdx = this.edgeTargetIdx[i];
        if (srcIdx < 0 || tgtIdx < 0) continue;
        const e = edges[i];
        const src = nodes[srcIdx];
        const tgt = nodes[tgtIdx];
        const style = resolveEdgeStyle(src, tgt, e, edgeConfig, theme);
        dynamicEdgeStyleCache[i] = style;
        if (style.endArrow) arrowCount++;
        if (e.source !== e.target && style.startArrow) arrowCount++;
      }
    }

    // -- Process regular edges --
    this.processFullEdges(
      regularIndices,
      selfLoopIndices,
      nodes,
      edges,
      edgeConfig,
      theme,
      nodeHalfWidths,
      nodeHeights,
      bg,
      hasHighlight,
      arrowCount,
      dynamicEdgeStyleCache,
    );

    this.picking.setNodeCount(nodes.length);
    this.hasArrows = arrowCount > 0;
    this.needToProcess = false;
    this.needPickingRender = true;

    // Reclaim CPU-side Float32Array slack after the full rebuild. Only the
    // programs touched by a full process() are shrunk; patch/incremental paths
    // keep their buffers and re-grow via reallocate() as needed.
    this.activeNodeProgram.shrinkToFit();
    this.activeEdgeProgram.shrinkToFit();
    this._programs.edgeArrow?.shrinkToFit();
    this._programs.edgeLoop?.shrinkToFit();
  }

  /**
   * Full edge processing with all features (complex types, arrows, routing).
   */
  private processFullEdges(
    regularIndices: number[],
    selfLoopIndices: number[],
    nodes: LayoutNode[],
    edges: GraphEdge[],
    edgeConfig: EdgeConfig | undefined,
    theme: ThemeTokens,
    nodeHalfWidths: Float64Array,
    nodeHeights: Float64Array,
    bg: [number, number, number],
    hasHighlight: boolean,
    arrowCount: number,
    dynamicEdgeStyleCache: ResolvedEdgeStyle[] | null,
  ): void {
    const edgeProg = this.activeEdgeProgram;
    const isPolyline = this.activeEdgeType === 'polyline';

    const arrowProg = this.getProgram('edgeArrow');
    arrowProg.reallocate(arrowCount);
    let arrowIdx = 0;

    // For polyline: compute all routes first to know total segment count
    // Reuse dynamicEdgeStyleCache from process() if available, otherwise build one for polyline
    const edgeStyleCache: ResolvedEdgeStyle[] | null =
      dynamicEdgeStyleCache ??
      (isPolyline && edges.length <= 2000 ? new Array(edges.length) : null);

    if (isPolyline) {
      // Only cache routes for reasonably sized graphs
      const shouldCacheRoutes = edges.length <= this.maxPolylineRoutesCache;
      if (shouldCacheRoutes) {
        this.polylineRoutes.clear();
      }
      let totalSegments = 0;

      if (this.polylineRouter === 'tree' || this.polylineRouter === 'indented') {
        // Tree/Indented routing: group edges by parent, create shared trunk
        const edgeRects: Array<{ index: number; src: NodeRect; tgt: NodeRect }> = [];
        const radiusByIndex = new Map<number, number>();
        for (const i of regularIndices) {
          const srcIdx = this.edgeSourceIdx[i];
          const tgtIdx = this.edgeTargetIdx[i];
          if (srcIdx < 0 || tgtIdx < 0) continue;
          const e = edges[i];
          const src = nodes[srcIdx];
          const tgt = nodes[tgtIdx];
          const edgeStyle = edgeStyleCache?.[i] ?? resolveEdgeStyle(src, tgt, e, edgeConfig, theme);
          if (edgeStyleCache && !edgeStyleCache[i]) edgeStyleCache[i] = edgeStyle;
          radiusByIndex.set(i, edgeStyle.radius);
          const srcW = nodeHalfWidths[srcIdx] * 2;
          const srcH = nodeHeights[srcIdx];
          const tgtW = nodeHalfWidths[tgtIdx] * 2;
          const tgtH = nodeHeights[tgtIdx];
          edgeRects.push({
            index: i,
            src: { x: src.x, y: src.y, width: srcW, height: srcH },
            tgt: { x: tgt.x, y: tgt.y, width: tgtW, height: tgtH },
          });
        }
        const routes =
          this.polylineRouter === 'indented'
            ? computeIndentedRoutes(
                edgeRects,
                this.layoutDirection,
                this.indentTarget,
                this.trunkGap,
              )
            : computeTreeRoutes(edgeRects, this.layoutDirection, 'cubic');
        for (const [i, rawRoute] of routes) {
          const r = radiusByIndex.get(i) ?? 0;
          const route =
            this.polylineRouter === 'indented' && r > 0
              ? applyRoundedCorners(rawRoute, r)
              : rawRoute;
          if (shouldCacheRoutes) {
            this.polylineRoutes.set(i, route);
          }
          totalSegments += Math.max(0, route.length - 1);
        }
      } else {
        // Per-edge orthogonal routing
        for (const i of regularIndices) {
          const srcIdx = this.edgeSourceIdx[i];
          const tgtIdx = this.edgeTargetIdx[i];
          if (srcIdx < 0 || tgtIdx < 0) continue;
          const e = edges[i];
          const src = nodes[srcIdx];
          const tgt = nodes[tgtIdx];
          const style = edgeStyleCache?.[i] ?? resolveEdgeStyle(src, tgt, e, edgeConfig, theme);
          if (edgeStyleCache && !edgeStyleCache[i]) edgeStyleCache[i] = style;
          const srcW = nodeHalfWidths[srcIdx] * 2;
          const srcH = nodeHeights[srcIdx];
          const tgtW = nodeHalfWidths[tgtIdx] * 2;
          const tgtH = nodeHeights[tgtIdx];
          const rawRoute =
            this.polylineRouter === 'fishbone'
              ? computeFishboneRoute(
                  { x: src.x, y: src.y, width: srcW, height: srcH },
                  { x: tgt.x, y: tgt.y, width: tgtW, height: tgtH },
                  this.layoutDirection,
                )
              : computeOrthogonalRoute(
                  { x: src.x, y: src.y, width: srcW, height: srcH },
                  { x: tgt.x, y: tgt.y, width: tgtW, height: tgtH },
                  this.layoutDirection,
                );
          const route = style.radius > 0 ? applyRoundedCorners(rawRoute, style.radius) : rawRoute;
          if (shouldCacheRoutes) {
            this.polylineRoutes.set(i, route);
          }
          totalSegments += Math.max(0, route.length - 1);
        }
      }
      (edgeProg as EdgeRectProgram).reallocate(totalSegments);
    } else {
      edgeProg.reallocate(regularIndices.length);
    }

    let polySegIdx = 0; // running segment index for polyline buffer

    // Fast path: static edge config with no highlight — use cached style directly
    const eCache = edgeConfig ? edgeConfigCache.get(edgeConfig) : undefined;
    const useStaticEdgeStyle =
      eCache?.styleType === 'static' && eCache.cachedStyle && !hasHighlight && !isPolyline;

    for (let ri = 0; ri < regularIndices.length; ri++) {
      const i = regularIndices[ri];
      const e = edges[i];
      const srcIdx = this.edgeSourceIdx[i];
      const tgtIdx = this.edgeTargetIdx[i];
      if (srcIdx < 0 || tgtIdx < 0) continue;
      const src = nodes[srcIdx];
      const tgt = nodes[tgtIdx];
      // Use cached style: static cache > dynamic arrow-count cache > polyline cache > on-demand resolve
      let style: ResolvedEdgeStyle;
      if (useStaticEdgeStyle) {
        style = eCache.cachedStyle!;
      } else {
        style = edgeStyleCache?.[i] ?? resolveEdgeStyle(src, tgt, e, edgeConfig, theme);
      }
      const active = !hasHighlight || this.highlightEdgeIndices.has(i);
      // Use pre-parsed colors if available (static optimization), otherwise parse on-the-fly
      const edgeBaseColor = style.strokeRGB ?? parseColor(style.stroke);

      let opacity = style.opacity;
      const color: [number, number, number] = active
        ? edgeBaseColor
        : [
            edgeBaseColor[0] * 0.08 + bg[0] * 0.92,
            edgeBaseColor[1] * 0.08 + bg[1] * 0.92,
            edgeBaseColor[2] * 0.08 + bg[2] * 0.92,
          ];
      if (!active) opacity = Math.min(opacity, 0.08);

      const pickIdx = nodes.length + i;
      const dashCycle = style.lineDash.length >= 2 ? style.lineDash[0] + style.lineDash[1] : 0;

      if (isPolyline) {
        // Polyline: write each segment as a separate EdgeRect item
        const route = this.polylineRoutes.get(i);
        if (route && route.length >= 2) {
          for (let s = 0; s < route.length - 1; s++) {
            (edgeProg as EdgeRectProgram).processEdge(
              polySegIdx++,
              route[s].x,
              route[s].y,
              route[s + 1].x,
              route[s + 1].y,
              color,
              pickIdx,
              style.lineWidth,
              dashCycle,
              opacity,
              0,
              0,
              0,
              0,
            );
          }
        }
      } else {
        // Endpoint insets passed to the shader in GRAPH coords (radius) + fixed
        // pixels (arrow). The shader applies u_scale, so clamping stays correct
        // on zoom (process() does not re-run on zoom).
        const srcRadius = nodeHalfWidths[srcIdx];
        const tgtRadius = nodeHalfWidths[tgtIdx];
        const srcArrowPx = style.startArrow ? style.arrowSize : 0;
        const tgtArrowPx = style.endArrow ? style.arrowSize : 0;

        if (this.activeEdgeType === 'arc') {
          (edgeProg as EdgeArcProgram).processEdge(
            ri,
            src.x,
            src.y,
            tgt.x,
            tgt.y,
            color,
            pickIdx,
            style.curvature,
          );
        } else if (this.activeEdgeType === 'cubic') {
          const curveOffset = style.curveOffset ?? 60;
          const direction = src.x < tgt.x ? 'LR' : 'RL';
          // Endpoints at node edges. Radius is in graph coords (the shader applies
          // u_scale), so use the unscaled half-width — NOT srcHalfW/tgtHalfW which
          // are pre-multiplied by zoom for the pixel-space rect clamp.
          const srcHW = nodeHalfWidths[srcIdx];
          const tgtHW = nodeHalfWidths[tgtIdx];
          const edgeSrcX = direction === 'LR' ? src.x + srcHW : src.x - srcHW;
          const edgeSrcY = src.y;
          const edgeTgtX = direction === 'LR' ? tgt.x - tgtHW : tgt.x + tgtHW;
          const edgeTgtY = tgt.y;
          (edgeProg as EdgeCubicProgram).processEdge(
            ri,
            edgeSrcX,
            edgeSrcY,
            edgeTgtX,
            edgeTgtY,
            color,
            pickIdx,
            curveOffset,
            direction,
          );
        } else if (this.activeEdgeType === 'rect') {
          (edgeProg as EdgeRectProgram).processEdge(
            ri,
            src.x,
            src.y,
            tgt.x,
            tgt.y,
            color,
            pickIdx,
            style.lineWidth,
            dashCycle,
            opacity,
            srcRadius,
            tgtRadius,
            srcArrowPx,
            tgtArrowPx,
          );
        } else {
          (edgeProg as EdgeLineProgram).processEdge(
            ri,
            src.x,
            src.y,
            tgt.x,
            tgt.y,
            color,
            pickIdx,
            srcRadius,
            tgtRadius,
            srcArrowPx,
            tgtArrowPx,
          );
        }
      }

      // Arrows
      let arrowSrcX = src.x,
        arrowSrcY = src.y;
      let arrowTgtSrcX = tgt.x,
        arrowTgtSrcY = tgt.y;
      // Arrow tip points. Default to node centers (line edges), overridden per
      // edge type. `*AtCenter` marks whether the tip needs a node-radius pullback
      // to reach the boundary, or already sits on it (polyline/cubic).
      let endTipX = tgt.x,
        endTipY = tgt.y;
      let startTipX = src.x,
        startTipY = src.y;
      let endTipAtCenter = true;
      let startTipAtCenter = true;
      if (isPolyline) {
        // Arrow direction & tips from polyline endpoints (already at boundary)
        const route = this.polylineRoutes.get(i);
        if (route && route.length >= 2) {
          arrowSrcX = route[route.length - 2].x;
          arrowSrcY = route[route.length - 2].y;
          arrowTgtSrcX = route[1].x;
          arrowTgtSrcY = route[1].y;
          endTipX = route[route.length - 1].x;
          endTipY = route[route.length - 1].y;
          startTipX = route[0].x;
          startTipY = route[0].y;
          endTipAtCenter = false;
          startTipAtCenter = false;
        }
      } else if (this.activeEdgeType === 'arc') {
        const mx = (src.x + tgt.x) * 0.5;
        const my = (src.y + tgt.y) * 0.5;
        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const cpx = mx - dy * style.curvature;
        const cpy = my + dx * style.curvature;
        arrowSrcX = cpx;
        arrowSrcY = cpy;
        arrowTgtSrcX = cpx;
        arrowTgtSrcY = cpy;
      } else if (this.activeEdgeType === 'cubic') {
        // S-curve: endpoints are on the node boundary with a horizontal tangent.
        const curveOffset = style.curveOffset ?? 60;
        const direction = src.x < tgt.x ? 'LR' : 'RL';
        const srcHW = nodeHalfWidths[srcIdx];
        const tgtHW = nodeHalfWidths[tgtIdx];
        const edgeSrcX = direction === 'LR' ? src.x + srcHW : src.x - srcHW;
        const edgeTgtX = direction === 'LR' ? tgt.x - tgtHW : tgt.x + tgtHW;
        endTipX = edgeTgtX;
        endTipY = tgt.y;
        endTipAtCenter = false;
        arrowSrcX = direction === 'LR' ? edgeTgtX - curveOffset : edgeTgtX + curveOffset;
        arrowSrcY = tgt.y;
        startTipX = edgeSrcX;
        startTipY = src.y;
        startTipAtCenter = false;
        arrowTgtSrcX = direction === 'LR' ? edgeSrcX + curveOffset : edgeSrcX - curveOffset;
        arrowTgtSrcY = src.y;
      }
      if (style.endArrow) {
        // Pull the tip back by the node radius only when it sits at the center.
        const tgtRadius = endTipAtCenter ? nodeHalfWidths[tgtIdx] : 0;
        arrowProg.processArrow(
          arrowIdx++,
          arrowSrcX,
          arrowSrcY,
          endTipX,
          endTipY,
          style.arrowSize,
          style.lineWidth,
          tgtRadius,
          color,
          pickIdx,
          opacity,
        );
      }
      if (style.startArrow) {
        const srcRadius = startTipAtCenter ? nodeHalfWidths[srcIdx] : 0;
        arrowProg.processArrow(
          arrowIdx++,
          arrowTgtSrcX,
          arrowTgtSrcY,
          startTipX,
          startTipY,
          style.arrowSize,
          style.lineWidth,
          srcRadius,
          color,
          pickIdx,
          opacity,
        );
      }
    }
    edgeProg.upload();

    // -- Process self-loop edges --
    const loopProg = this.getProgram('edgeLoop');
    loopProg.reallocate(selfLoopIndices.length);
    const loopNodeCounter = new Map<string, number>();
    for (let li = 0; li < selfLoopIndices.length; li++) {
      const i = selfLoopIndices[li];
      const e = edges[i];
      const nIdx = this.edgeSourceIdx[i];
      if (nIdx < 0) continue;
      const node = nodes[nIdx];
      const style = useStaticEdgeStyle
        ? eCache.cachedStyle!
        : dynamicEdgeStyleCache?.[i] ?? resolveEdgeStyle(node, node, e, edgeConfig, theme);
      const active = !hasHighlight || this.highlightEdgeIndices.has(i);
      // Use pre-parsed colors if available (static optimization), otherwise parse on-the-fly
      const edgeBaseColor = style.strokeRGB ?? parseColor(style.stroke);
      const color: [number, number, number] = active
        ? edgeBaseColor
        : [
            edgeBaseColor[0] * 0.08 + bg[0] * 0.92,
            edgeBaseColor[1] * 0.08 + bg[1] * 0.92,
            edgeBaseColor[2] * 0.08 + bg[2] * 0.92,
          ];
      const loopOpacity = active ? style.opacity : Math.min(style.opacity, 0.08);
      const pickIdx = nodes.length + i;

      // Nested mode: all loops point upward (top), increasing distance
      const loopIndex = loopNodeCounter.get(e.source) ?? 0;
      loopNodeCounter.set(e.source, loopIndex + 1);
      const angle = -Math.PI / 2; // always top

      const nodeRadius = nodeHalfWidths[nIdx];
      const baseLoopDist = 35;
      const loopSpacing = 15;
      const loopSize = baseLoopDist + loopIndex * loopSpacing;
      loopProg.processLoop(li, node.x, node.y, nodeRadius, angle, loopSize, color, pickIdx);

      // Arrow at end of self-loop (tangent direction: CP2 → P3)
      if (style.endArrow) {
        const spread = 0.5;
        const endAngle = angle + spread;
        const ext = nodeRadius + loopSize;
        // CP2 (control point near end)
        const cp2x = node.x + ext * Math.cos(endAngle);
        const cp2y = node.y + ext * Math.sin(endAngle);
        // P3 (end point on node edge)
        const p3x = node.x + nodeRadius * Math.cos(endAngle);
        const p3y = node.y + nodeRadius * Math.sin(endAngle);
        arrowProg.processArrow(
          arrowIdx++,
          cp2x,
          cp2y,
          p3x,
          p3y,
          style.arrowSize,
          style.lineWidth,
          0,
          color,
          pickIdx,
          loopOpacity,
        );
      }
    }
    loopProg.upload();
    arrowProg.upload();
  }

  /** Incremental highlight: only patch color floats for nodes/edges whose highlight state changed. */
  private processHighlightDelta(): void {
    // The incremental delta only patches node/edge colors, not the arrow buffer.
    // When arrows exist, dimming would leave them at full color — rebuild fully.
    if (this.hasArrows) {
      this.needHighlightUpdate = false;
      this.process();
      return;
    }
    this.needHighlightUpdate = false;
    const { nodes, edges, nodeConfig, edgeConfig, theme } = this;
    const bg = parseColor(theme.canvasBackground ?? '#fff');
    const hasHighlight = this.highlightNodeIds.size > 0;
    const hadHighlight = this.prevHighlightNodeIds.size > 0;

    const nodeProgram = this.activeNodeProgram;
    const edgeProgram = this.activeEdgeProgram;

    // Compute changed node indices
    const changedNodeIds = new Set<string>();
    for (const id of this.highlightNodeIds) {
      if (!this.prevHighlightNodeIds.has(id)) changedNodeIds.add(id);
    }
    for (const id of this.prevHighlightNodeIds) {
      if (!this.highlightNodeIds.has(id)) changedNodeIds.add(id);
    }
    // If highlight toggled on/off entirely, all nodes changed
    if (hasHighlight !== hadHighlight) {
      for (let i = 0; i < nodes.length; i++) changedNodeIds.add(nodes[i].id);
    }

    for (const id of changedNodeIds) {
      const idx = this.nodeIdToIndex.get(id);
      if (idx === undefined) continue;
      const node = nodes[idx];
      const style = resolveNodeStyle(node, nodeConfig, theme);
      const active = !hasHighlight || this.highlightNodeIds.has(node.id);
      const baseColor = parseColor(style.fill);
      const color: [number, number, number] = active
        ? baseColor
        : [
            baseColor[0] * 0.25 + bg[0] * 0.75,
            baseColor[1] * 0.25 + bg[1] * 0.75,
            baseColor[2] * 0.25 + bg[2] * 0.75,
          ];
      nodeProgram.patchItemColor(idx, color);
    }

    // Compute changed edge indices
    const changedEdgeIndices = new Set<number>();
    for (const i of this.highlightEdgeIndices) {
      if (!this.prevHighlightEdgeIndices.has(i)) changedEdgeIndices.add(i);
    }
    for (const i of this.prevHighlightEdgeIndices) {
      if (!this.highlightEdgeIndices.has(i)) changedEdgeIndices.add(i);
    }
    if (hasHighlight !== hadHighlight) {
      for (let i = 0; i < edges.length; i++) changedEdgeIndices.add(i);
    }

    for (const i of changedEdgeIndices) {
      if (i < 0 || i >= edges.length) continue;
      const e = edges[i];
      const srcIdx = this.nodeIdToIndex.get(e.source);
      const tgtIdx = this.nodeIdToIndex.get(e.target);
      if (srcIdx === undefined || tgtIdx === undefined) continue;
      const src = nodes[srcIdx];
      const tgt = nodes[tgtIdx];
      const style = resolveEdgeStyle(src, tgt, e, edgeConfig, theme);
      const active = !hasHighlight || this.highlightEdgeIndices.has(i);
      // Use pre-parsed colors if available (static optimization), otherwise parse on-the-fly
      const edgeBaseColor = style.strokeRGB ?? parseColor(style.stroke);
      const color: [number, number, number] = active
        ? edgeBaseColor
        : [
            edgeBaseColor[0] * 0.08 + bg[0] * 0.92,
            edgeBaseColor[1] * 0.08 + bg[1] * 0.92,
            edgeBaseColor[2] * 0.08 + bg[2] * 0.92,
          ];
      edgeProgram.patchItemColor(i, color);
    }

    // Re-upload only if something changed
    if (changedNodeIds.size > 0) nodeProgram.reupload();
    if (changedEdgeIndices.size > 0) edgeProgram.reupload();

    // Save current state as previous
    this.prevHighlightNodeIds = new Set(this.highlightNodeIds);
    this.prevHighlightEdgeIndices = new Set(this.highlightEdgeIndices);
  }

  /**
   * Incremental position update: patch position floats for moved nodes
   * and re-compute affected edges. Much cheaper than full process().
   */
  patchPositions(dataModel: import('../dataModel.js').DataModel, movedNodeIds: Set<string>): void {
    if (movedNodeIds.size === 0) return;

    const nodeProgram = this.activeNodeProgram;

    // Patch node positions using Program.patchItemPosition
    for (const id of movedNodeIds) {
      const node = dataModel.getNode(id);
      if (!node) continue;
      const idx = this.nodeIdToIndex.get(id);
      if (idx === undefined) continue;

      // Update internal nodes array in place (avoid per-frame object allocation)
      if (idx < this.nodes.length) {
        const n = this.nodes[idx];
        n.x = node.x;
        n.y = node.y;
      }

      // Patch position in GPU buffer via Program method (handles all vertices)
      nodeProgram.patchItemPosition(idx, node.x, node.y);
    }
    nodeProgram.upload();

    // Re-compute affected edges
    const edgeProgram = this.activeEdgeProgram;
    // The fast endpoint patch below doesn't move arrows, so when arrows exist
    // fall back to a full process to keep arrow tips on the node boundary.
    const isSimpleEdge =
      !this.hasArrows && (this.activeEdgeType === 'line' || this.activeEdgeType === 'rect');
    const affectedEdgeIndices: number[] = [];

    for (let i = 0; i < this.edges.length; i++) {
      const e = this.edges[i];
      if (movedNodeIds.has(e.source) || movedNodeIds.has(e.target)) {
        affectedEdgeIndices.push(i);
      }
    }

    if (affectedEdgeIndices.length > 0 && isSimpleEdge) {
      // For line/rect edges, use patchEdgeEndpoints + patchEdgeStyle
      for (const i of affectedEdgeIndices) {
        const e = this.edges[i];
        const srcNode = dataModel.getNode(e.source);
        const tgtNode = dataModel.getNode(e.target);
        if (!srcNode || !tgtNode) continue;

        const srcIdx = this.edgeSourceIdx[i];
        const tgtIdx = this.edgeTargetIdx[i];
        if (srcIdx < 0 || tgtIdx < 0) continue;

        const src = this.nodes[srcIdx];
        const tgt = this.nodes[tgtIdx];

        if (this.activeEdgeType === 'rect') {
          const style = resolveEdgeStyle(src, tgt, e, this.edgeConfig, this.theme);
          const srcStyle = resolveNodeStyle(src, this.nodeConfig, this.theme);
          const tgtStyle = resolveNodeStyle(tgt, this.nodeConfig, this.theme);
          // Graph-coord radii + fixed arrow pixels; the shader applies u_scale,
          // so do NOT pre-multiply by camera.zoom (that would go stale on zoom).
          const srcRadius = (this.activeNodeType === 'rect' ? srcStyle.width : srcStyle.size) / 2;
          const tgtRadius = (this.activeNodeType === 'rect' ? tgtStyle.width : tgtStyle.size) / 2;
          const srcArrowPx = style.startArrow ? style.arrowSize : 0;
          const tgtArrowPx = style.endArrow ? style.arrowSize : 0;
          (edgeProgram as import('./programs/edgeRect.js').EdgeRectProgram).patchEdgeEndpoints(
            i,
            src.x,
            src.y,
            tgt.x,
            tgt.y,
          );
          (edgeProgram as import('./programs/edgeRect.js').EdgeRectProgram).patchEdgeStyle(i, {
            srcRadius,
            tgtRadius,
            srcArrowPx,
            tgtArrowPx,
          });
        } else {
          (edgeProgram as import('./programs/edgeLine.js').EdgeLineProgram).patchEdgeEndpoints(
            i,
            src.x,
            src.y,
            tgt.x,
            tgt.y,
          );
        }
      }
      edgeProgram.upload();
    } else if (affectedEdgeIndices.length > 0) {
      // For arc/cubic/polyline edges, fall back to full process
      this.needToProcess = true;
      this.needPickingRender = true;
      return;
    }

    this.needPickingRender = true;
  }

  /**
   * Incremental style update: patch style attributes for items whose state or data changed.
   * Avoids full buffer rebuild by only patching the affected attribute floats.
   */
  patchStyles(
    dataModel: import('../dataModel.js').DataModel,
    changedNodeIds: Set<string>,
    changedEdgeIds: Set<string>,
  ): void {
    const bg = parseColor(this.theme.canvasBackground ?? '#fff');
    const hasHighlight = this.highlightNodeIds.size > 0;
    const nodeProgram = this.activeNodeProgram;
    const edgeProgram = this.activeEdgeProgram;

    // Patch node styles
    if (changedNodeIds.size > 0) {
      for (const id of changedNodeIds) {
        const node = dataModel.getNode(id);
        if (!node) continue;
        const idx = this.nodeIdToIndex.get(id);
        if (idx === undefined) continue;

        // this.nodes aliases the DataModel node objects; resolve style directly
        // from the DataModel node (its states Set is read natively). Do NOT
        // rewrite this.nodes[idx] — that would replace the shared object.
        const style = resolveNodeStyle(node as any, this.nodeConfig, this.theme);
        const active = !hasHighlight || this.highlightNodeIds.has(id);
        // Use pre-parsed colors if available (static optimization), otherwise parse on-the-fly
        const baseColor = style.fillRGB ?? parseColor(style.fill);
        const color: [number, number, number] = active
          ? baseColor
          : [
              baseColor[0] * 0.25 + bg[0] * 0.75,
              baseColor[1] * 0.25 + bg[1] * 0.75,
              baseColor[2] * 0.25 + bg[2] * 0.75,
            ];
        const opacity = active ? style.opacity : Math.min(style.opacity, 0.25);
        const strokeColor = style.strokeRGB ?? parseColor(style.stroke);
        const isFillTransparent = style.fill === 'transparent' || style.fill === 'none';
        const isStrokeTransparent = style.stroke === 'transparent' || style.stroke === 'none';
        const effectiveOpacity = isFillTransparent ? 0 : opacity;
        const effectiveStrokeWidth = isStrokeTransparent ? 0 : style.strokeWidth;

        if (this.activeNodeType === 'rect') {
          (nodeProgram as import('./programs/nodeRect.js').NodeRectProgram).patchNodeStyle(idx, {
            color,
            width: style.width,
            height: style.height,
            strokeWidth: effectiveStrokeWidth,
            strokeColor,
            opacity: effectiveOpacity,
            haloWidth: style.haloWidth,
            borderRadius: style.borderRadius,
          });
        } else {
          (nodeProgram as import('./programs/nodeCircle.js').NodeCircleProgram).patchNodeStyle(
            idx,
            {
              color,
              size: style.size,
              strokeWidth: effectiveStrokeWidth,
              strokeColor,
              opacity: effectiveOpacity,
              haloWidth: style.haloWidth,
            },
          );
        }
      }
      nodeProgram.reupload();
    }

    // Patch edge styles
    if (changedEdgeIds.size > 0) {
      const isSimpleEdge = this.activeEdgeType === 'line' || this.activeEdgeType === 'rect';
      for (const edgeId of changedEdgeIds) {
        const idx = this.edgeIdToIndex.get(edgeId);
        if (idx === undefined || idx >= this.edges.length) continue;

        const e = this.edges[idx];
        const srcIdx = this.edgeSourceIdx[idx];
        const tgtIdx = this.edgeTargetIdx[idx];
        if (srcIdx < 0 || tgtIdx < 0) continue;

        // this.edges aliases the DataModel edge objects; resolve style directly
        // from the DataModel edge (its states Set is read natively). Do NOT
        // rewrite this.edges[idx] — that would replace the shared object.
        const dmEdge = dataModel.getEdge(edgeId);
        const edgeForStyle = (dmEdge ?? e) as any;

        const src = this.nodes[srcIdx];
        const tgt = this.nodes[tgtIdx];
        const style = resolveEdgeStyle(src, tgt, edgeForStyle, this.edgeConfig, this.theme);
        const active = !hasHighlight || this.highlightEdgeIndices.has(idx);
        // Use pre-parsed colors if available (static optimization), otherwise parse on-the-fly
        const edgeBaseColor = style.strokeRGB ?? parseColor(style.stroke);
        const color: [number, number, number] = active
          ? edgeBaseColor
          : [
              edgeBaseColor[0] * 0.08 + bg[0] * 0.92,
              edgeBaseColor[1] * 0.08 + bg[1] * 0.92,
              edgeBaseColor[2] * 0.08 + bg[2] * 0.92,
            ];
        const opacity = active ? style.opacity : Math.min(style.opacity, 0.08);

        if (isSimpleEdge) {
          if (this.activeEdgeType === 'rect') {
            const dashCycle =
              style.lineDash.length >= 2 ? style.lineDash[0] + style.lineDash[1] : 0;
            (edgeProgram as import('./programs/edgeRect.js').EdgeRectProgram).patchEdgeStyle(idx, {
              color,
              lineWidth: style.lineWidth,
              dashCycle,
              opacity,
            });
          } else {
            (edgeProgram as import('./programs/edgeLine.js').EdgeLineProgram).patchEdgeStyle(idx, {
              color,
            });
          }
        }
        // For arc/cubic/polyline, style patching requires full re-tessellation — skip, will trigger PARTIAL_PROCESS
      }
      if (isSimpleEdge) {
        edgeProgram.reupload();
      }
    }

    this.needPickingRender = true;
  }

  /**
   * Partial process: incrementally update GPU buffers for added/removed elements.
   * Optimized path: append new nodes/edges instead of full rebuild when possible.
   */
  partialProcess(
    dataModel: import('../dataModel.js').DataModel,
    addedNodeIds?: string[],
    addedEdgeIds?: string[],
  ): void {
    const prevNodeCount = this.nodes.length;
    const prevEdgeCount = this.edges.length;

    this.nodes = dataModel.getNodes() as unknown as LayoutNode[];
    this.edges = dataModel.getEdges() as unknown as GraphEdge[];

    // Rebuild ID index incrementally
    if (
      addedNodeIds &&
      addedNodeIds.length > 0 &&
      this.nodes.length === prevNodeCount + addedNodeIds.length
    ) {
      // Optimized: only add new indices
      for (let i = prevNodeCount; i < this.nodes.length; i++) {
        this.nodeIdToIndex.set(this.nodes[i].id, i);
      }
    } else {
      // Full rebuild needed
      this.nodeIdToIndex.clear();
      for (let i = 0; i < this.nodes.length; i++) {
        this.nodeIdToIndex.set(this.nodes[i].id, i);
      }
    }

    if (
      addedEdgeIds &&
      addedEdgeIds.length > 0 &&
      this.edges.length === prevEdgeCount + addedEdgeIds.length
    ) {
      for (let i = prevEdgeCount; i < this.edges.length; i++) {
        const edgeId = (this.edges[i] as any).id;
        if (edgeId) this.edgeIdToIndex.set(edgeId, i);
      }
    } else {
      this.edgeIdToIndex.clear();
      for (let i = 0; i < this.edges.length; i++) {
        const edgeId = (this.edges[i] as any).id;
        if (edgeId) this.edgeIdToIndex.set(edgeId, i);
      }
    }

    // Rebuild edge source/target index arrays
    const edgeCount = this.edges.length;
    if (this.edgeSourceIdx.length < edgeCount) {
      this.edgeSourceIdx = new Int32Array(edgeCount);
      this.edgeTargetIdx = new Int32Array(edgeCount);
    }
    for (let i = 0; i < edgeCount; i++) {
      const e = this.edges[i];
      this.edgeSourceIdx[i] = this.nodeIdToIndex.get(e.source) ?? -1;
      this.edgeTargetIdx[i] = this.nodeIdToIndex.get(e.target) ?? -1;
    }

    // Update config if changed
    if (dataModel.nodeConfig !== this.nodeConfig) this.nodeConfig = dataModel.nodeConfig;
    if (dataModel.edgeConfig !== this.edgeConfig) this.edgeConfig = dataModel.edgeConfig;

    // Resolve active program types
    this.activeNodeType = this.nodeConfig?.type === 'rect' ? 'rect' : 'circle';
    this.activeEdgeType = this.resolveEdgeType(this.edgeConfig);

    // Use incremental processing if only adding nodes/edges
    if (addedNodeIds?.length || addedEdgeIds?.length) {
      this.incrementalProcessAdded(
        dataModel,
        addedNodeIds ?? [],
        addedEdgeIds ?? [],
        prevNodeCount,
        prevEdgeCount,
      );
    } else {
      // Full rebuild needed for removals or mixed changes
      this.needToProcess = true;
    }
    this.needPickingRender = true;
  }

  /**
   * Incrementally process only newly added nodes and edges.
   * Appends to existing GPU buffers instead of rebuilding.
   */
  private incrementalProcessAdded(
    dataModel: import('../dataModel.js').DataModel,
    addedNodeIds: string[],
    addedEdgeIds: string[],
    prevNodeCount: number,
    prevEdgeCount: number,
  ): void {
    const { theme, nodeConfig, edgeConfig } = this;
    const bg = parseColor(this.theme.canvasBackground ?? '#fff');
    const hasHighlight = this.highlightNodeIds.size > 0;

    const nodeProgram =
      this.activeNodeType === 'rect' ? this.getProgram('nodeRect') : this.getProgram('nodeCircle');

    // Ensure buffer capacity
    nodeProgram.reallocate(this.nodes.length);

    // Process only new nodes
    for (let i = prevNodeCount; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      const style = resolveNodeStyle(node, nodeConfig, theme);
      const active = !hasHighlight || this.highlightNodeIds.has(node.id);
      // Use pre-parsed colors if available (static optimization), otherwise parse on-the-fly
      const baseColor = style.fillRGB ?? parseColor(style.fill);
      const strokeColor = style.strokeRGB ?? parseColor(style.stroke);
      const isFillTransparent = style.fill === 'transparent' || style.fill === 'none';
      const isStrokeTransparent = style.stroke === 'transparent' || style.stroke === 'none';
      const color: [number, number, number] = active
        ? baseColor
        : [
            baseColor[0] * 0.25 + bg[0] * 0.75,
            baseColor[1] * 0.25 + bg[1] * 0.75,
            baseColor[2] * 0.25 + bg[2] * 0.75,
          ];
      const opacity = active ? style.opacity : Math.min(style.opacity, 0.25);
      const effectiveOpacity = isFillTransparent ? 0 : opacity;
      const effectiveStrokeWidth = isStrokeTransparent ? 0 : style.strokeWidth;

      if (this.activeNodeType === 'rect') {
        (nodeProgram as NodeRectProgram).processNode(
          i,
          node.x,
          node.y,
          style.width,
          style.height,
          color,
          i,
          effectiveStrokeWidth,
          strokeColor,
          effectiveOpacity,
          style.haloWidth,
          style.borderRadius,
        );
      } else {
        (nodeProgram as NodeCircleProgram).processNode(
          i,
          node.x,
          node.y,
          style.size,
          color,
          i,
          effectiveStrokeWidth,
          strokeColor,
          effectiveOpacity,
          style.haloWidth,
        );
      }
    }
    nodeProgram.upload();

    // For edges, fall back to full process for now (edge processing is more complex)
    if (addedEdgeIds.length > 0) {
      this.needToProcess = true;
    }
  }

  /** Schedule a render on the next animation frame. */
  scheduleRender(): void {
    if (this.renderFrame !== null) return;
    this.renderFrame = requestAnimationFrame(() => {
      this.renderFrame = null;
      this.draw();
    });
  }

  /** Batch multiple draw-triggering operations (resize + fitView) into a single render pass. */
  batchDraw<T>(fn: () => T): T {
    this.suppressDraw = true;
    this.pendingDraw = false;
    try {
      return fn();
    } finally {
      this.suppressDraw = false;
      if (this.pendingDraw) {
        this.pendingDraw = false;
        this.draw();
      }
    }
  }

  /** Immediate draw: process if needed, then picking pass + normal pass. */
  draw(): void {
    if (this.suppressDraw) {
      this.pendingDraw = true;
      return;
    }
    // Cancel any already-scheduled rAF so we don't double-draw on the next frame.
    if (this.renderFrame !== null) {
      cancelAnimationFrame(this.renderFrame);
      this.renderFrame = null;
    }
    if (this.needHighlightUpdate) this.processHighlightDelta();
    if (this.needToProcess) this.process();

    const gl = this.gl;
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (w <= 0 || h <= 0) return;

    const params: RenderParams = { width: w, height: h, camera: this.camera };
    const nodeProgram = this.activeNodeProgram;
    const edgeProgram = this.activeEdgeProgram;

    // Picking pass (deferred until first interaction, and not during continuous movement)
    if (this.needPickingRender && this.pickingInitialized && !this.hideEdges) {
      this.renderPickingPass(w, h, nodeProgram, edgeProgram);
    }

    // Normal pass
    gl.viewport(0, 0, w, h);
    const bg = parseColor(this.theme.canvasBackground ?? '#fff');
    gl.clearColor(bg[0], bg[1], bg[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw combo underlay before WebGL content
    this.beforeDrawCallback?.();

    if (!this.hideEdges) {
      edgeProgram.render(params);
      this.getProgram('edgeLoop').render(params);
      this.getProgram('edgeArrow').render(params);
    }

    nodeProgram.render(params);

    this.afterDrawCallback?.();
  }

  onBeforeDraw(cb: () => void): void {
    this.beforeDrawCallback = cb;
  }

  onAfterDraw(cb: () => void): void {
    this.afterDrawCallback = cb;
  }

  private renderPickingPass(
    w: number,
    h: number,
    nodeProgram: Program,
    edgeProgram: Program,
  ): void {
    const gl = this.gl;
    this.picking.resize(w, h);
    this.picking.bind();
    gl.disable(gl.BLEND);
    const pickParams: RenderParams = {
      width: w,
      height: h,
      camera: this.camera,
      picking: true,
    };
    edgeProgram.render(pickParams);
    this.getProgram('edgeLoop').render(pickParams);
    this.getProgram('edgeArrow').render(pickParams);
    nodeProgram.render(pickParams);
    this.picking.unbind(w, h);
    gl.enable(gl.BLEND);
    this.needPickingRender = false;
  }

  resize(width: number, height: number): void {
    const dpr = Math.min(2, window.devicePixelRatio ?? 1);
    const newW = width * dpr;
    const newH = height * dpr;
    if (this.canvas.width === newW && this.canvas.height === newH) return;
    this.canvas.width = newW;
    this.canvas.height = newH;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.needPickingRender = true;
    // Skip the sync draw when there's no data yet (initial resize before setData).
    // The caller (Graph.render) will clearWithTheme + draw once data is ready.
    if (this.nodes.length === 0) return;
    // Draw synchronously to avoid black flash (setting canvas.width clears content)
    this.draw();
  }

  /** Clear the canvas with the theme background color immediately.
   *  Called before layout so the user sees a white canvas instead of a black void. */
  clearWithTheme(theme: { canvasBackground?: string }): void {
    const gl = this.gl;
    const w = this.canvas.width || this.canvas.clientWidth || 800;
    const h = this.canvas.height || this.canvas.clientHeight || 600;
    if (w > 0 && h > 0) {
      gl.viewport(0, 0, w, h);
    }
    const bg = parseColor(theme.canvasBackground ?? '#fff');
    gl.clearColor(bg[0], bg[1], bg[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  getCamera(): Camera {
    return this.camera;
  }

  setCamera(cam: Partial<Camera>): void {
    if (cam.x !== undefined) this.camera.x = cam.x;
    if (cam.y !== undefined) this.camera.y = cam.y;
    if (cam.zoom !== undefined) this.camera.zoom = Math.max(0.1, Math.min(20, cam.zoom));
    // Defer picking pass update - not needed during continuous interaction
    this.needPickingRender = true;
    this.scheduleRender();
  }

  screenToGraph(screenX: number, screenY: number): [number, number] {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const px = (screenX - rect.left) * scaleX;
    const py = (screenY - rect.top) * scaleY;
    const { camera } = this;
    // Inverse of shader: pixel = (graphPos + camera) * zoom
    const gx = px / camera.zoom - camera.x;
    const gy = py / camera.zoom - camera.y;
    return [gx, gy];
  }

  /** O(1) hit detection using framebuffer picking. Lazy-inits picking on first call. */
  pickAt(
    screenX: number,
    screenY: number,
  ): { type: 'node'; id: string } | { type: 'edge'; index: number } | null {
    // Lazy init: first interaction triggers picking framebuffer render
    if (!this.pickingInitialized) {
      this.pickingInitialized = true;
      this.needPickingRender = true;
      const w = this.canvas.width;
      const h = this.canvas.height;
      if (w > 0 && h > 0) {
        this.renderPickingPass(w, h, this.activeNodeProgram, this.activeEdgeProgram);
      }
    }

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const px = (screenX - rect.left) * scaleX;
    const py = (screenY - rect.top) * scaleY;

    const result = this.picking.pickAt(px, py, this.canvas.width, this.canvas.height);
    if (!result) return null;

    if (result.type === 'node') {
      const node = this.nodes[result.index];
      return node ? { type: 'node', id: node.id } : null;
    }
    if (result.index >= 0 && result.index < this.edges.length) {
      return { type: 'edge', index: result.index };
    }
    return null;
  }

  /** @deprecated Use pickAt() for O(1) hit detection. */
  hitTestNode(graphX: number, graphY: number): string | null {
    let found: string | null = null;
    let minDist = Infinity;
    for (const node of this.nodes) {
      const dx = node.x - graphX;
      const dy = node.y - graphY;
      const style = resolveNodeStyle(node, this.nodeConfig, this.theme);
      const r = style.size;
      const d = dx * dx + dy * dy;
      if (d <= r * r && r * r < minDist) {
        minDist = r * r;
        found = node.id;
      }
    }
    return found;
  }

  /** @deprecated Use pickAt() for O(1) hit detection. */
  hitTestEdge(graphX: number, graphY: number): number {
    const threshold = 8;
    let found = -1;
    for (let i = 0; i < this.edges.length; i++) {
      const e = this.edges[i];
      const sIdx = this.nodeIdToIndex.get(e.source);
      const tIdx = this.nodeIdToIndex.get(e.target);
      if (sIdx === undefined || tIdx === undefined) continue;
      const s = this.nodes[sIdx];
      const t = this.nodes[tIdx];
      const d = pointToSegmentDist(graphX, graphY, s.x, s.y, t.x, t.y);
      if (d <= threshold) found = i;
    }
    return found;
  }

  /** Hide edges during camera movement, restore after delay. */
  setMoving(_moving: boolean): void {
    // No-op: edge hiding during move was causing black-flash artifacts.
    // WebGL renders edges at 60fps without issue for typical graph sizes.
  }

  getNodes(): LayoutNode[] {
    return this.nodes;
  }
  getEdges(): GraphEdge[] {
    return this.edges;
  }
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
  getNodeIdToIndex(): Map<string, number> {
    return this.nodeIdToIndex;
  }

  setHighlight(option: { nodeIds?: Set<string>; edgeIndices?: Set<number> }): void {
    this.highlightNodeIds = option.nodeIds ?? new Set();
    this.highlightEdgeIndices = option.edgeIndices ?? new Set();
    this.needHighlightUpdate = true;
    this.scheduleRender();
  }

  /** Get cached polyline routes for label positioning. */
  getPolylineRoutes(): Map<number, Waypoint[]> {
    return this.polylineRoutes;
  }

  destroy(): void {
    if (this.renderFrame !== null) cancelAnimationFrame(this.renderFrame);
    if (this.edgeRestoreTimer !== null) clearTimeout(this.edgeRestoreTimer);
    this._programs.nodeCircle?.destroy();
    this._programs.nodeRect?.destroy();
    this._programs.edgeLine?.destroy();
    this._programs.edgeRect?.destroy();
    this._programs.edgeArc?.destroy();
    this._programs.edgeCubic?.destroy();
    this._programs.edgeArrow?.destroy();
    this._programs.edgeLoop?.destroy();
    this._programs.edgePolyline?.destroy();
    this.picking.destroy();
    // Release WebGL context to free GPU memory and avoid context limit
    const ext = this.gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
    // Release large arrays
    this.nodes = [];
    this.edges = [];
    this.nodeIdToIndex.clear();
    this.edgeSourceIdx = new Int32Array(0);
    this.edgeTargetIdx = new Int32Array(0);
    this.highlightNodeIds.clear();
    this.highlightEdgeIndices.clear();
    this.prevHighlightNodeIds.clear();
    this.prevHighlightEdgeIndices.clear();
  }
}

function pointToSegmentDist(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1e-6;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (len * len)));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}
