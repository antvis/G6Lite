/**
 * Canvas2D overlay renderer for node labels, edge labels, and node icons.
 * Layered on top of the WebGL canvas with pointer-events: none.
 */

import { graphToNDC } from './camera.js';
import { LabelGrid } from './labelGrid.js';
import type { Camera } from './camera.js';
import type {
  LayoutNode,
  GraphNode,
  GraphEdge,
  NodeConfig,
  EdgeConfig,
  LabelPlacement,
  EdgeLabelPlacement,
  NodeStyleValue,
  EdgeStyleValue,
} from '../types.js';

const DEFAULT_FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

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

export class LabelRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private imageCache = new Map<string, HTMLImageElement | null>();
  private grid = new LabelGrid();
  private redrawScheduled = false;
  private scheduleRedrawFn: (() => void) | null = null;

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
  ): void {
    this.redrawScheduled = false;
    const { w, h, dpr } = this.syncSize();
    const ctx = this.ctx;
    ctx.clearRect(0, 0, w, h);

    if (!nodes.length) return;

    const nodeStyle = nodeConfig?.style;
    const edgeStyle = edgeConfig?.style;
    const hasNodeLabels = nodeStyle?.label !== undefined;
    const hasNodeIcons = nodeStyle?.icon !== undefined;
    const hasEdgeLabels = edgeStyle?.label !== undefined;

    if (!hasNodeLabels && !hasNodeIcons && !hasEdgeLabels) return;

    this.grid.reset(w, h);
    const zoom = camera.zoom;

    // Draw node icons and labels
    if (hasNodeLabels || hasNodeIcons) {
      this.drawNodes(nodes, camera, nodeStyle!, w, h, dpr, zoom);
    }

    // Draw edge labels
    if (hasEdgeLabels && zoom >= 0.5) {
      this.drawEdges(edges, nodes, camera, edgeStyle!, w, h, dpr, zoom, nodeIdToIndex);
    }
  }

  private drawNodes(
    nodes: LayoutNode[],
    camera: Camera,
    style: NonNullable<NodeConfig['style']>,
    w: number,
    h: number,
    dpr: number,
    zoom: number,
  ): void {
    const ctx = this.ctx;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      // Skip hidden nodes
      const states = (node as any).states;
      if (states) {
        const isHidden =
          states instanceof Set
            ? states.has('hidden')
            : Array.isArray(states) && states.includes('hidden');
        if (isHidden) continue;
      }

      // Graph → screen coords
      const [ndcX, ndcY] = graphToNDC(node.x, node.y, w, h, camera);
      const px = ((ndcX + 1) / 2) * w;
      const py = ((1 - ndcY) / 2) * h;

      // Viewport culling
      if (px < -100 || px > w + 100 || py < -100 || py > h + 100) continue;

      // Draw icon
      if (style.icon !== undefined) {
        const iconUrl = resolveNodeValue(style.icon, node, false as string | false);
        if (iconUrl && typeof iconUrl === 'string') {
          this.drawIcon(iconUrl, px, py, node, style, dpr, zoom);
        }
      }

      // Draw label (skip at very low zoom)
      if (style.label !== undefined && zoom >= 0.3) {
        const text = resolveNodeValue(style.label, node, false as string | false);
        if (text && typeof text === 'string') {
          this.drawNodeLabel(ctx, text, px, py, node, style, dpr, zoom, w, h);
        }
      }
    }
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
    viewW: number,
    viewH: number,
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

    const fontSizePx = fontSize * dpr;
    ctx.font = `${fontWeight} ${fontSizePx}px ${fontFamily}`;

    // Measure text
    const metrics = ctx.measureText(text);
    let displayText = text;
    const textW = maxWidth > 0 ? Math.min(metrics.width, maxWidth * dpr) : metrics.width;
    if (maxWidth > 0 && metrics.width > maxWidth * dpr) {
      displayText = this.truncate(ctx, text, maxWidth * dpr);
    }
    const textH = fontSizePx;

    // Compute node size in screen space
    const nodeSize = resolveNodeValue(style.size, node, 8);
    const nodeSizeScreen = nodeSize * zoom * dpr;

    // Position based on placement
    let labelX = px + offsetX * dpr;
    let labelY = py + offsetY * dpr;
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
        labelX -= nodeSizeScreen / 2 + 4 * dpr;
        textAlign = 'right';
        break;
      case 'right':
        labelX += nodeSizeScreen / 2 + 4 * dpr;
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
      ctx.fillStyle = background;
      ctx.fillRect(
        bboxX - bgPadding * dpr,
        bboxY - bgPadding * dpr,
        textW + bgPadding * 2 * dpr,
        textH + bgPadding * 2 * dpr,
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

    this.ctx.drawImage(img, px - iconW / 2, py - iconH / 2, iconW, iconH);
  }

  private drawEdges(
    edges: GraphEdge[],
    nodes: LayoutNode[],
    camera: Camera,
    style: NonNullable<EdgeConfig['style']>,
    w: number,
    h: number,
    dpr: number,
    zoom: number,
    nodeIdToIndex?: Map<string, number>,
  ): void {
    const ctx = this.ctx;

    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const text = resolveEdgeValue(
        style.label,
        {} as GraphNode,
        {} as GraphNode,
        edge,
        false as string | false,
      );
      if (!text || typeof text !== 'string') continue;

      // Find source/target nodes
      const srcIdx = nodeIdToIndex?.get(edge.source);
      const tgtIdx = nodeIdToIndex?.get(edge.target);
      if (srcIdx === undefined || tgtIdx === undefined) continue;
      const srcNode = nodes[srcIdx];
      const tgtNode = nodes[tgtIdx];
      if (!srcNode || !tgtNode) continue;

      // Skip if either endpoint is hidden
      const srcStates = (srcNode as any).states;
      const tgtStates = (tgtNode as any).states;
      if (
        srcStates &&
        (srcStates instanceof Set
          ? srcStates.has('hidden')
          : Array.isArray(srcStates) && srcStates.includes('hidden'))
      )
        continue;
      if (
        tgtStates &&
        (tgtStates instanceof Set
          ? tgtStates.has('hidden')
          : Array.isArray(tgtStates) && tgtStates.includes('hidden'))
      )
        continue;

      // Compute label position
      const placement = resolveEdgeValue(
        style.labelPlacement,
        srcNode,
        tgtNode,
        edge,
        'center' as EdgeLabelPlacement,
      );
      let t = 0.5;
      if (placement === 'start') t = 0.2;
      else if (placement === 'end') t = 0.8;

      const midX = srcNode.x + (tgtNode.x - srcNode.x) * t;
      const midY = srcNode.y + (tgtNode.y - srcNode.y) * t;

      const [ndcX, ndcY] = graphToNDC(midX, midY, w, h, camera);
      const px = ((ndcX + 1) / 2) * w;
      const py = ((1 - ndcY) / 2) * h;

      // Viewport culling
      if (px < -50 || px > w + 50 || py < -50 || py > h + 50) continue;

      const fontSize = resolveEdgeValue(style.labelFontSize, srcNode, tgtNode, edge, 10);
      const fontFamily = resolveEdgeValue(
        style.labelFontFamily,
        srcNode,
        tgtNode,
        edge,
        DEFAULT_FONT_FAMILY,
      );
      const color = resolveEdgeValue(style.labelColor, srcNode, tgtNode, edge, '#666');
      const background = resolveEdgeValue(
        style.labelBackground,
        srcNode,
        tgtNode,
        edge,
        'rgba(255,255,255,0.8)' as string | false,
      );
      const bgPadding = resolveEdgeValue(style.labelBackgroundPadding, srcNode, tgtNode, edge, 2);
      const autoRotate = resolveEdgeValue(style.labelAutoRotate, srcNode, tgtNode, edge, true);

      const fontSizePx = fontSize * dpr;
      ctx.font = `${fontSizePx}px ${fontFamily}`;
      const textW = ctx.measureText(text).width;
      const textH = fontSizePx;

      // Collision detection
      const bboxX = px - textW / 2;
      const bboxY = py - textH / 2;
      if (this.grid.hasOverlap(bboxX, bboxY, textW, textH)) continue;
      this.grid.register(bboxX, bboxY, textW, textH);

      // Compute angle for autoRotate
      let angle = 0;
      if (autoRotate) {
        const [sNdcX, sNdcY] = graphToNDC(srcNode.x, srcNode.y, w, h, camera);
        const [tNdcX, tNdcY] = graphToNDC(tgtNode.x, tgtNode.y, w, h, camera);
        const sx = ((sNdcX + 1) / 2) * w;
        const sy = ((1 - sNdcY) / 2) * h;
        const tx = ((tNdcX + 1) / 2) * w;
        const ty = ((1 - tNdcY) / 2) * h;
        angle = Math.atan2(ty - sy, tx - sx);
        // Keep text readable (not upside-down)
        if (angle > Math.PI / 2) angle -= Math.PI;
        if (angle < -Math.PI / 2) angle += Math.PI;
      }

      ctx.save();
      ctx.translate(px, py);
      if (angle !== 0) ctx.rotate(angle);

      // Draw background
      if (background && typeof background === 'string') {
        ctx.fillStyle = background;
        ctx.fillRect(
          -textW / 2 - bgPadding * dpr,
          -textH / 2 - bgPadding * dpr,
          textW + bgPadding * 2 * dpr,
          textH + bgPadding * 2 * dpr,
        );
      }

      // Draw text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = color;
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }
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
