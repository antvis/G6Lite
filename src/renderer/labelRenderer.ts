/**
 * Canvas2D overlay renderer for node labels, edge labels, and node icons.
 * Layered on top of the WebGL canvas with pointer-events: none.
 */

import { getLabelRenderer } from '../extensions/label.js';
import { getNodeExtension } from '../extensions/node.js';
import type {
  EdgeConfig,
  EdgeLabelParams,
  EdgeLabelPlacement,
  EdgeStyleValue,
  GraphEdge,
  GraphNode,
  LabelLayout,
  LabelPlacement,
  LabelRenderer,
  LayoutNode,
  NodeConfig,
  NodeLabelParams,
  NodeStyleValue,
  ResolvedLabelStyle,
} from '../types.js';
import type { Camera } from './camera.js';
import { graphToNDC } from './camera.js';
import { sampleEdgePath, type EdgePath } from './edgePath.js';
import { LabelGrid } from './labelGrid.js';

const DEFAULT_FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export function getLabelZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return 1;
  return Math.max(0.25, Math.min(zoom, 2));
}

export function toLabelScreenPx(value: number, dpr: number, zoom: number): number {
  return value * dpr * getLabelZoom(zoom);
}

function resolveNodeValue<T>(val: NodeStyleValue<T> | undefined, node: GraphNode, fallback: T): T {
  if (val === undefined) return fallback;
  return typeof val === 'function' ? (val as (n: GraphNode) => T)(node) : val;
}

function resolveEdgeValue<T>(
  val: EdgeStyleValue<T> | undefined,
  source: GraphNode,
  target: GraphNode,
  edge: GraphEdge,
  fallback: T,
): T {
  if (val === undefined) return fallback;
  return typeof val === 'function'
    ? (val as (s: GraphNode, t: GraphNode, e: GraphEdge) => T)(source, target, edge)
    : val;
}

function hasState(states: unknown, state: string): boolean {
  if (states instanceof Set) return states.has(state);
  return Array.isArray(states) && states.includes(state);
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
  style: NonNullable<NodeConfig['style']>,
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

export function getCustomNodeLabelAnchor(
  px: number,
  py: number,
  nodeWidth: number,
  nodeHeight: number,
  layout: LabelLayout,
  style: ResolvedLabelStyle,
  horizontalGap: number,
): { x: number; y: number } {
  let x = px + style.labelOffsetX;
  let y = py + style.labelOffsetY;
  switch (style.labelPlacement) {
    case 'bottom':
      y += nodeHeight / 2 + layout.height / 2 + style.labelFontSize * 0.1;
      break;
    case 'top':
      y -= nodeHeight / 2 + layout.height / 2 + style.labelFontSize * 0.1;
      break;
    case 'left':
      x -= nodeWidth / 2 + horizontalGap + layout.width / 2;
      break;
    case 'right':
      x += nodeWidth / 2 + horizontalGap + layout.width / 2;
      break;
    case 'center':
      break;
  }
  return { x, y };
}

export class LabelLayerRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private imageCache = new Map<string, HTMLImageElement | null>();
  private grid = new LabelGrid();
  private redrawScheduled = false;
  private scheduleRedrawFn: (() => void) | null = null;
  private warnedRendererIssues = new Set<string>();

  constructor(container: HTMLElement, mainCanvas: HTMLCanvasElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    // Insert after mainCanvas
    if (mainCanvas.nextSibling) {
      container.insertBefore(this.canvas, mainCanvas.nextSibling);
    } else {
      container.appendChild(this.canvas);
    }
    this.ctx = this.canvas.getContext('2d')!;
  }

  setScheduleRedraw(fn: () => void): void {
    this.scheduleRedrawFn = fn;
  }

  private requestRedraw(): void {
    if (this.redrawScheduled) return;
    this.redrawScheduled = true;
    if (this.scheduleRedrawFn) {
      this.scheduleRedrawFn();
    }
  }

  private syncSize(): { w: number; h: number; dpr: number } {
    const rect = this.canvas.parentElement?.getBoundingClientRect();
    const cssW = rect?.width || 800;
    const cssH = rect?.height || 600;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(cssW * dpr);
    const h = Math.round(cssH * dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    return { w, h, dpr };
  }

  draw(
    nodes: LayoutNode[],
    edges: GraphEdge[],
    camera: Camera,
    nodeConfig?: NodeConfig,
    edgeConfig?: EdgeConfig,
    nodeIdToIndex?: Map<string, number>,
    edgePathCache?: Map<number, EdgePath>,
  ): void {
    this.redrawScheduled = false;
    const { w, h, dpr } = this.syncSize();
    const ctx = this.ctx;
    ctx.clearRect(0, 0, w, h);

    if (!nodes.length) return;

    const nodeStyle = nodeConfig?.style;
    const edgeStyle = edgeConfig?.style;
    const nodeExtension = getNodeExtension(nodeConfig?.type);
    const extensionStyle = nodeExtension?.style;
    const hasNodeLabels =
      nodeStyle?.label !== undefined ||
      extensionStyle?.label !== undefined ||
      !!nodeExtension?.getStyle;
    const hasNodeIcons =
      nodeStyle?.icon !== undefined ||
      extensionStyle?.icon !== undefined ||
      !!nodeExtension?.getStyle;
    const hasNodeOverlay = !!nodeExtension?.drawOverlay;
    const hasEdgeLabels = edgeStyle?.label !== undefined;

    if (!hasNodeLabels && !hasNodeIcons && !hasNodeOverlay && !hasEdgeLabels) return;

    this.grid.reset(w, h);
    const zoom = camera.zoom;

    // Draw node icons and labels
    if (hasNodeLabels || hasNodeIcons || hasNodeOverlay) {
      this.drawNodes(nodes, camera, nodeConfig, w, h, dpr, zoom);
    }

    // Draw edge labels
    if (hasEdgeLabels && zoom >= 0.5) {
      this.drawEdges(
        edges,
        nodes,
        camera,
        edgeConfig,
        w,
        h,
        dpr,
        zoom,
        nodeIdToIndex,
        edgePathCache,
      );
    }
  }

  private drawNodes(
    nodes: LayoutNode[],
    camera: Camera,
    nodeConfig: NodeConfig | undefined,
    w: number,
    h: number,
    dpr: number,
    zoom: number,
  ): void {
    const ctx = this.ctx;
    const userStyle = nodeConfig?.style ?? {};
    const nodeExtension = getNodeExtension(nodeConfig?.type);
    const customRendererName = nodeConfig?.labelRenderer;
    const customRenderer = customRendererName
      ? this.resolveCustomRenderer('node', customRendererName)
      : undefined;
    const time = performance.now();

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      // Skip hidden nodes
      if (hasState(node.states, 'hidden')) continue;

      // Graph → screen coords
      const [ndcX, ndcY] = graphToNDC(node.x, node.y, w, h, camera);
      const px = ((ndcX + 1) / 2) * w;
      const py = ((1 - ndcY) / 2) * h;

      // Viewport culling
      if (px < -100 || px > w + 100 || py < -100 || py > h + 100) continue;

      const style = {
        ...nodeExtension?.style,
        ...(nodeExtension?.getStyle ? nodeExtension.getStyle(node) : undefined),
        ...userStyle,
      };

      if (nodeExtension?.drawOverlay) {
        const nodeSize = resolveNodeValue(style.size, node, 8);
        const needsRedraw = nodeExtension.drawOverlay(ctx, {
          node,
          x: px,
          y: py,
          nodeSize,
          dpr,
          zoom,
          camera,
          time,
        });
        if (needsRedraw) this.requestRedraw();
      }

      // Draw icon
      if (style.icon !== undefined) {
        const iconValue = resolveNodeValue(style.icon, node, false as string | false);
        if (iconValue && typeof iconValue === 'string') {
          const iconType = resolveNodeValue(style.iconType, node, 'image' as 'image' | 'text');
          if (iconType === 'text') {
            this.drawTextIcon(iconValue, px, py, node, style, dpr, zoom);
          } else {
            this.drawIcon(iconValue, px, py, node, style, dpr, zoom);
          }
        }
      }

      // Draw label (skip at very low zoom)
      if (style.label !== undefined && zoom >= 0.3) {
        const text = resolveNodeValue(style.label, node, false as string | false);
        if (text && typeof text === 'string') {
          if (
            customRendererName &&
            customRenderer &&
            this.drawCustomNodeLabel(
              customRendererName,
              customRenderer,
              ctx,
              text,
              px,
              py,
              node,
              style,
              dpr,
              zoom,
              w,
              h,
            )
          ) {
            continue;
          }
          this.drawNodeLabel(ctx, text, px, py, node, style, dpr, zoom);
        }
      }
    }
  }

  private resolveCustomRenderer(type: 'node' | 'edge', name: string): LabelRenderer | undefined {
    const renderer = getLabelRenderer(name);
    if (!renderer) {
      this.warnOnce(
        `${type}:${name}:missing`,
        `[G6Lite] Label renderer "${name}" is not registered for ${type} labels; falling back to the default renderer.`,
      );
    }
    return renderer;
  }

  private warnOnce(key: string, message: string, error?: unknown): void {
    if (this.warnedRendererIssues.has(key)) return;
    this.warnedRendererIssues.add(key);
    if (error === undefined) console.warn(message);
    else console.warn(message, error);
  }

  private drawCustomNodeLabel(
    rendererName: string,
    renderer: LabelRenderer,
    ctx: CanvasRenderingContext2D,
    text: string,
    px: number,
    py: number,
    node: GraphNode,
    style: NonNullable<NodeConfig['style']>,
    dpr: number,
    zoom: number,
    viewW: number,
    viewH: number,
  ): boolean {
    const resolvedStyle = resolveNodeLabelStyle(style, node, dpr, zoom);
    const params: NodeLabelParams = {
      ctx,
      text,
      style: resolvedStyle,
      dpr,
      zoom,
      type: 'node',
      item: node,
      node,
    };

    let layout: LabelLayout | undefined;
    ctx.save();
    try {
      layout = renderer.measure(params);
    } catch (error) {
      this.warnOnce(
        `node:${rendererName}:measure`,
        `[G6Lite] Label renderer "${rendererName}" threw during node label measure; falling back to the default renderer.`,
        error,
      );
      return false;
    } finally {
      ctx.restore();
    }

    if (!isValidLabelLayout(layout)) {
      this.warnOnce(
        `node:${rendererName}:layout`,
        `[G6Lite] Label renderer "${rendererName}" returned an invalid node label layout; falling back to the default renderer.`,
      );
      return false;
    }

    const nodeSize = resolveNodeValue(style.size, node, 8);
    const nodeWidth = resolveNodeValue(style.width, node, nodeSize) * zoom * dpr;
    const nodeHeight = resolveNodeValue(style.height, node, nodeSize) * zoom * dpr;
    const horizontalGap = 4 * dpr * getLabelZoom(zoom);
    const anchor = getCustomNodeLabelAnchor(
      px,
      py,
      nodeWidth,
      nodeHeight,
      layout,
      resolvedStyle,
      horizontalGap,
    );
    const bboxX = anchor.x - layout.width / 2;
    const bboxY = anchor.y - layout.height / 2;

    if (bboxX + layout.width < 0 || bboxX > viewW || bboxY + layout.height < 0 || bboxY > viewH) {
      return true;
    }
    if (this.grid.hasOverlap(bboxX, bboxY, layout.width, layout.height)) return true;

    let drawn = false;
    ctx.save();
    try {
      ctx.translate(anchor.x, anchor.y);
      renderer.draw({ ...params, layout });
      drawn = true;
    } catch (error) {
      this.warnOnce(
        `node:${rendererName}:draw`,
        `[G6Lite] Label renderer "${rendererName}" threw during node label draw; falling back to the default renderer.`,
        error,
      );
    } finally {
      ctx.restore();
    }

    if (!drawn) return false;
    this.grid.register(bboxX, bboxY, layout.width, layout.height);
    return true;
  }

  private drawNodeLabel(
    ctx: CanvasRenderingContext2D,
    text: string,
    px: number,
    py: number,
    node: GraphNode,
    style: NonNullable<NodeConfig['style']>,
    dpr: number,
    zoom: number,
  ): void {
    const fontSize = resolveNodeValue(style.labelFontSize, node, 12);
    const fontFamily = resolveNodeValue(style.labelFontFamily, node, DEFAULT_FONT_FAMILY);
    const fontWeight = resolveNodeValue(style.labelFontWeight, node, 'normal');
    const color = resolveNodeValue(style.labelColor, node, '#333');
    const placement = resolveNodeValue(style.labelPlacement, node, 'bottom' as LabelPlacement);
    const offsetX = resolveNodeValue(style.labelOffsetX, node, 0);
    const offsetY = resolveNodeValue(style.labelOffsetY, node, 0);
    const background = resolveNodeValue(style.labelBackground, node, false as string | false);
    const bgPadding = resolveNodeValue(style.labelBackgroundPadding, node, 2);
    const maxWidth = resolveNodeValue(style.labelMaxWidth, node, 0);

    const labelZoom = getLabelZoom(zoom);
    const fontSizePx = toLabelScreenPx(fontSize, dpr, zoom);
    ctx.font = `${fontWeight} ${fontSizePx}px ${fontFamily}`;

    // Measure text
    const metrics = ctx.measureText(text);
    let displayText = text;
    const maxWidthPx = maxWidth > 0 ? maxWidth * dpr * labelZoom : 0;
    const textW = maxWidthPx > 0 ? Math.min(metrics.width, maxWidthPx) : metrics.width;
    if (maxWidthPx > 0 && metrics.width > maxWidthPx) {
      displayText = this.truncate(ctx, text, maxWidthPx);
    }
    const textH = fontSizePx;

    // Compute node size in screen space
    const nodeSize = resolveNodeValue(style.size, node, 8);
    const nodeSizeScreen = nodeSize * zoom * dpr;

    // Position based on placement
    let labelX = px + offsetX * dpr * labelZoom;
    let labelY = py + offsetY * dpr * labelZoom;
    let textAlign: CanvasTextAlign = 'center';
    const textBaseline: CanvasTextBaseline = 'middle';

    switch (placement) {
      case 'bottom':
        labelY += nodeSizeScreen / 2 + fontSizePx * 0.6;
        break;
      case 'top':
        labelY -= nodeSizeScreen / 2 + fontSizePx * 0.6;
        break;
      case 'left':
        labelX -= nodeSizeScreen / 2 + 4 * dpr * labelZoom;
        textAlign = 'right';
        break;
      case 'right':
        labelX += nodeSizeScreen / 2 + 4 * dpr * labelZoom;
        textAlign = 'left';
        break;
      case 'center':
        break;
    }

    // Collision detection
    const bboxX =
      textAlign === 'center' ? labelX - textW / 2 : textAlign === 'right' ? labelX - textW : labelX;
    const bboxY = labelY - textH / 2;
    if (this.grid.hasOverlap(bboxX, bboxY, textW, textH)) return;
    this.grid.register(bboxX, bboxY, textW, textH);

    // Draw background
    if (background && typeof background === 'string') {
      const bgPaddingPx = bgPadding * dpr * labelZoom;
      ctx.fillStyle = background;
      ctx.fillRect(
        bboxX - bgPaddingPx,
        bboxY - bgPaddingPx,
        textW + bgPaddingPx * 2,
        textH + bgPaddingPx * 2,
      );
    }

    // Draw text with shadow for readability
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;
    ctx.shadowColor = 'rgba(255,255,255,0.8)';
    ctx.shadowBlur = Math.max(2, fontSizePx * 0.3);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = color;
    ctx.fillText(displayText, labelX, labelY);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  private drawIcon(
    url: string,
    px: number,
    py: number,
    node: GraphNode,
    style: NonNullable<NodeConfig['style']>,
    dpr: number,
    zoom: number,
  ): void {
    const img = this.loadImage(url);
    if (!img) return;

    const nodeSize = resolveNodeValue(style.size, node, 8);
    const defaultIconSize = nodeSize * 0.6;
    const iconW = resolveNodeValue(style.iconWidth, node, defaultIconSize) * zoom * dpr;
    const iconH = resolveNodeValue(style.iconHeight, node, defaultIconSize) * zoom * dpr;
    const offsetX = resolveNodeValue(style.iconOffsetX, node, 0) * dpr;
    const offsetY = resolveNodeValue(style.iconOffsetY, node, 0) * dpr;

    this.ctx.drawImage(img, px - iconW / 2 + offsetX, py - iconH / 2 + offsetY, iconW, iconH);
  }

  private drawTextIcon(
    text: string,
    px: number,
    py: number,
    node: GraphNode,
    style: NonNullable<NodeConfig['style']>,
    dpr: number,
    zoom: number,
  ): void {
    const nodeSize = resolveNodeValue(style.size, node, 8);
    const defaultFontSize = nodeSize * 0.6;
    const fontSize = resolveNodeValue(style.iconFontSize, node, defaultFontSize) * zoom * dpr;
    if (fontSize < 4) return;
    const fontFamily = resolveNodeValue(style.iconFontFamily, node, DEFAULT_FONT_FAMILY);
    const color = resolveNodeValue(style.iconColor, node, '#fff');
    const offsetX = resolveNodeValue(style.iconOffsetX, node, 0) * dpr;
    const offsetY = resolveNodeValue(style.iconOffsetY, node, 0) * dpr;

    const ctx = this.ctx;
    ctx.save();
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, px + offsetX, py + offsetY);
    ctx.restore();
  }

  private drawEdges(
    edges: GraphEdge[],
    nodes: LayoutNode[],
    camera: Camera,
    edgeConfig: EdgeConfig | undefined,
    w: number,
    h: number,
    dpr: number,
    zoom: number,
    nodeIdToIndex?: Map<string, number>,
    edgePathCache?: Map<number, EdgePath>,
  ): void {
    const ctx = this.ctx;
    const style = edgeConfig?.style;
    if (!style) return;
    const customRendererName = edgeConfig?.labelRenderer;
    const customRenderer = customRendererName
      ? this.resolveCustomRenderer('edge', customRendererName)
      : undefined;

    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      if (hasState(edge.states, 'hidden')) continue;

      // Find source/target nodes
      const srcIdx = nodeIdToIndex?.get(edge.source);
      const tgtIdx = nodeIdToIndex?.get(edge.target);
      if (srcIdx === undefined || tgtIdx === undefined) continue;
      const srcNode = nodes[srcIdx];
      const tgtNode = nodes[tgtIdx];
      if (!srcNode || !tgtNode) continue;

      // Skip if either endpoint is hidden
      if (hasState(srcNode.states, 'hidden') || hasState(tgtNode.states, 'hidden')) continue;

      const text = resolveEdgeValue(style.label, srcNode, tgtNode, edge, false as string | false);
      if (!text || typeof text !== 'string') continue;

      const resolvedStyle =
        customRendererName && customRenderer
          ? resolveEdgeLabelStyle(style, srcNode, tgtNode, edge, dpr)
          : undefined;

      // Compute label position
      const placement =
        resolvedStyle?.labelPlacement ??
        resolveEdgeValue(
          style.labelPlacement,
          srcNode,
          tgtNode,
          edge,
          'center' as EdgeLabelPlacement,
        );
      let t = 0.5;
      if (placement === 'start') t = 0.2;
      else if (placement === 'end') t = 0.8;

      const pathSample = edgePathCache?.get(i)
        ? sampleEdgePath(edgePathCache.get(i)!, t)
        : undefined;
      const midX = pathSample?.point.x ?? srcNode.x + (tgtNode.x - srcNode.x) * t;
      const midY = pathSample?.point.y ?? srcNode.y + (tgtNode.y - srcNode.y) * t;

      const [ndcX, ndcY] = graphToNDC(midX, midY, w, h, camera);
      const px = ((ndcX + 1) / 2) * w;
      const py = ((1 - ndcY) / 2) * h;

      // Viewport culling
      if (px < -50 || px > w + 50 || py < -50 || py > h + 50) continue;

      // Compute angle for autoRotate
      let angle = 0;
      const autoRotate =
        resolvedStyle?.labelAutoRotate ??
        resolveEdgeValue(style.labelAutoRotate, srcNode, tgtNode, edge, true);
      if (autoRotate) {
        const tangent = pathSample?.tangent;
        const [sNdcX, sNdcY] = graphToNDC(
          tangent ? midX : srcNode.x,
          tangent ? midY : srcNode.y,
          w,
          h,
          camera,
        );
        const [tNdcX, tNdcY] = graphToNDC(
          tangent ? midX + tangent.x : tgtNode.x,
          tangent ? midY + tangent.y : tgtNode.y,
          w,
          h,
          camera,
        );
        const sx = ((sNdcX + 1) / 2) * w;
        const sy = ((1 - sNdcY) / 2) * h;
        const tx = ((tNdcX + 1) / 2) * w;
        const ty = ((1 - tNdcY) / 2) * h;
        angle = Math.atan2(ty - sy, tx - sx);
        // Keep text readable (not upside-down)
        if (angle > Math.PI / 2) angle -= Math.PI;
        if (angle < -Math.PI / 2) angle += Math.PI;
      }

      if (
        customRendererName &&
        customRenderer &&
        resolvedStyle &&
        this.drawCustomEdgeLabel(
          customRendererName,
          customRenderer,
          ctx,
          text,
          px,
          py,
          angle,
          edge,
          srcNode,
          tgtNode,
          resolvedStyle,
          dpr,
          zoom,
          w,
          h,
        )
      ) {
        continue;
      }

      this.drawDefaultEdgeLabel(ctx, text, px, py, angle, srcNode, tgtNode, edge, style, dpr);
    }
  }

  private drawCustomEdgeLabel(
    rendererName: string,
    renderer: LabelRenderer,
    ctx: CanvasRenderingContext2D,
    text: string,
    px: number,
    py: number,
    angle: number,
    edge: GraphEdge,
    source: GraphNode,
    target: GraphNode,
    style: ResolvedLabelStyle,
    dpr: number,
    zoom: number,
    viewW: number,
    viewH: number,
  ): boolean {
    const params: EdgeLabelParams = {
      ctx,
      text,
      style,
      dpr,
      zoom,
      type: 'edge',
      item: edge,
      edge,
      source,
      target,
    };

    let layout: LabelLayout | undefined;
    ctx.save();
    try {
      layout = renderer.measure(params);
    } catch (error) {
      this.warnOnce(
        `edge:${rendererName}:measure`,
        `[G6Lite] Label renderer "${rendererName}" threw during edge label measure; falling back to the default renderer.`,
        error,
      );
      return false;
    } finally {
      ctx.restore();
    }

    if (!isValidLabelLayout(layout)) {
      this.warnOnce(
        `edge:${rendererName}:layout`,
        `[G6Lite] Label renderer "${rendererName}" returned an invalid edge label layout; falling back to the default renderer.`,
      );
      return false;
    }

    const anchorX = px + style.labelOffsetX;
    const anchorY = py + style.labelOffsetY;
    const bboxX = anchorX - layout.width / 2;
    const bboxY = anchorY - layout.height / 2;
    if (bboxX + layout.width < 0 || bboxX > viewW || bboxY + layout.height < 0 || bboxY > viewH) {
      return true;
    }
    if (this.grid.hasOverlap(bboxX, bboxY, layout.width, layout.height)) return true;

    let drawn = false;
    ctx.save();
    try {
      ctx.translate(anchorX, anchorY);
      if (angle !== 0) ctx.rotate(angle);
      renderer.draw({ ...params, layout });
      drawn = true;
    } catch (error) {
      this.warnOnce(
        `edge:${rendererName}:draw`,
        `[G6Lite] Label renderer "${rendererName}" threw during edge label draw; falling back to the default renderer.`,
        error,
      );
    } finally {
      ctx.restore();
    }

    if (!drawn) return false;
    this.grid.register(bboxX, bboxY, layout.width, layout.height);
    return true;
  }

  private drawDefaultEdgeLabel(
    ctx: CanvasRenderingContext2D,
    text: string,
    px: number,
    py: number,
    angle: number,
    source: GraphNode,
    target: GraphNode,
    edge: GraphEdge,
    style: NonNullable<EdgeConfig['style']>,
    dpr: number,
  ): void {
    const fontSize = resolveEdgeValue(style.labelFontSize, source, target, edge, 10);
    const fontFamily = resolveEdgeValue(
      style.labelFontFamily,
      source,
      target,
      edge,
      DEFAULT_FONT_FAMILY,
    );
    const color = resolveEdgeValue(style.labelColor, source, target, edge, '#666');
    const background = resolveEdgeValue(
      style.labelBackground,
      source,
      target,
      edge,
      'rgba(255,255,255,0.8)' as string | false,
    );
    const bgPadding = resolveEdgeValue(style.labelBackgroundPadding, source, target, edge, 2);
    const fontSizePx = fontSize * dpr;
    ctx.font = `${fontSizePx}px ${fontFamily}`;
    const textW = ctx.measureText(text).width;
    const textH = fontSizePx;
    const bboxX = px - textW / 2;
    const bboxY = py - textH / 2;
    if (this.grid.hasOverlap(bboxX, bboxY, textW, textH)) return;
    this.grid.register(bboxX, bboxY, textW, textH);

    ctx.save();
    ctx.translate(px, py);
    if (angle !== 0) ctx.rotate(angle);
    if (background && typeof background === 'string') {
      ctx.fillStyle = background;
      ctx.fillRect(
        -textW / 2 - bgPadding * dpr,
        -textH / 2 - bgPadding * dpr,
        textW + bgPadding * 2 * dpr,
        textH + bgPadding * 2 * dpr,
      );
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  private truncate(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
    const ellipsis = '...';
    const ellipsisW = ctx.measureText(ellipsis).width;
    let lo = 0,
      hi = text.length;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (ctx.measureText(text.slice(0, mid)).width + ellipsisW <= maxWidth) lo = mid;
      else hi = mid - 1;
    }
    return lo > 0 ? text.slice(0, lo) + ellipsis : ellipsis;
  }

  private loadImage(url: string): HTMLImageElement | null {
    const cached = this.imageCache.get(url);
    if (cached !== undefined) return cached;
    // Start loading
    const img = new Image();
    img.crossOrigin = 'anonymous';
    this.imageCache.set(url, null); // placeholder
    img.onload = () => {
      this.imageCache.set(url, img);
      this.requestRedraw();
    };
    img.onerror = () => {
      // Keep null to avoid retrying
    };
    img.src = url;
    return null;
  }

  destroy(): void {
    this.canvas.remove();
    this.imageCache.clear();
  }
}
