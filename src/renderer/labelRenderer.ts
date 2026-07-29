/**
 * Canvas2D overlay renderer for node labels, edge labels, and node icons.
 * Layered on top of the WebGL canvas with pointer-events: none.
 */

import type { DecorationRenderer } from '../extensions/contracts';
import { getDecorationRenderer } from '../extensions/decoration';
import { getLabelRenderer } from '../extensions/label';
import { getNodeBaseType, getNodeExtension } from '../extensions/node';
import { safeExtensionCall } from '../extensions/registry';
import type {
  EdgeConfig,
  EdgeLabelParams,
  EdgeLabelPlacement,
  GraphEdge,
  GraphNode,
  LabelLayout,
  LabelPlacement,
  LabelRenderer,
  LayoutNode,
  NodeConfig,
  NodeDecorationConfig,
  NodeDecorationPlacement,
  NodeLabelParams,
  NodeStyleConfig,
  ResolvedLabelStyle,
  ThemeTokens,
} from '../types';
import type { Camera } from './camera';
import { graphToNDC } from './camera';
import {
  createDecorationGroupLayout,
  getStackItemX,
  orderDecorationItems,
  resolveDecorationPlacement,
  selectVisibleDecorationItems,
  type MeasuredDecorationItem,
} from './decorationLayout';
import { sampleEdgePath, type EdgePath } from './edgePath';
import { LabelGrid } from './labelGrid';
import {
  getBuiltInNodeBoundaryAnchor,
  getCustomNodeLabelAnchor,
  getNodeDecorationAnchor,
} from './labelGeometry';
import {
  DEFAULT_FONT_FAMILY,
  getLabelZoom,
  isValidLabelLayout,
  resolveEdgeLabelStyle,
  resolveEdgeValue,
  resolveNodeLabelStyle,
  resolveNodeValue,
  toLabelScreenPx,
} from './labelStyle';
import { resolveNodeStyle } from './style';

export {
  getBuiltInNodeBoundaryAnchor,
  getCustomNodeLabelAnchor,
  getNodeDecorationAnchor,
} from './labelGeometry';
export {
  getLabelZoom,
  isValidLabelLayout,
  resolveEdgeLabelStyle,
  resolveNodeLabelStyle,
  toLabelScreenPx,
} from './labelStyle';

function hasState(states: unknown, state: string): boolean {
  if (states instanceof Set) return states.has(state);
  return Array.isArray(states) && states.includes(state);
}

export class LabelLayerRenderer {
  private canvas: HTMLCanvasElement;
  private mainCanvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private imageCache = new Map<string, HTMLImageElement | null>();
  private grid = new LabelGrid();
  private decorationGrid = new LabelGrid();
  private redrawScheduled = false;
  private scheduleRedrawFn: (() => void) | null = null;
  private destroyed = false;
  private warnedRendererIssues = new Set<string>();
  private hoveredNodeId: string | null = null;
  private decorationHoverRegions: Array<{
    nodeId: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }> = [];

  private onDecorationPointerMove = (event: MouseEvent): void => {
    const rect = this.mainCanvas.getBoundingClientRect();
    const scaleX = rect.width ? this.canvas.width / rect.width : 1;
    const scaleY = rect.height ? this.canvas.height / rect.height : 1;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const hit = this.decorationHoverRegions.find(
      (region) =>
        x >= region.x &&
        x <= region.x + region.width &&
        y >= region.y &&
        y <= region.y + region.height,
    );
    this.setHoveredNode(hit?.nodeId ?? null);
  };

  private onDecorationPointerLeave = (): void => this.setHoveredNode(null);

  setHoveredNode(id: string | null): void {
    if (this.hoveredNodeId === id) return;
    this.hoveredNodeId = id;
    this.requestRedraw();
  }

  constructor(container: HTMLElement, mainCanvas: HTMLCanvasElement) {
    this.mainCanvas = mainCanvas;
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    const context = this.canvas.getContext('2d');
    if (!context) throw new Error('Unable to create the label canvas 2D context');
    // Insert after mainCanvas
    if (mainCanvas.nextSibling) {
      container.insertBefore(this.canvas, mainCanvas.nextSibling);
    } else {
      container.appendChild(this.canvas);
    }
    this.ctx = context;
    mainCanvas.addEventListener('mousemove', this.onDecorationPointerMove);
    mainCanvas.addEventListener('mouseleave', this.onDecorationPointerLeave);
  }

  setScheduleRedraw(fn: () => void): void {
    if (this.destroyed) return;
    this.scheduleRedrawFn = fn;
  }

  private requestRedraw(): void {
    if (this.destroyed || this.redrawScheduled) return;
    this.redrawScheduled = true;
    if (this.scheduleRedrawFn) {
      this.scheduleRedrawFn();
    }
  }

  private syncSize(): { w: number; h: number; dpr: number } {
    const rect = this.canvas.parentElement?.getBoundingClientRect();
    const cssW = rect?.width || 800;
    const cssH = rect?.height || 600;
    const w = this.mainCanvas.width || Math.round(cssW * Math.min(2, window.devicePixelRatio || 1));
    const h =
      this.mainCanvas.height || Math.round(cssH * Math.min(2, window.devicePixelRatio || 1));
    const dpr = cssW > 0 ? w / cssW : 1;
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
    theme: ThemeTokens = {},
    getNodeDimensions?: (id: string) => { width: number; height: number } | undefined,
  ): void {
    this.redrawScheduled = false;
    this.decorationHoverRegions = [];
    const { w, h, dpr } = this.syncSize();
    const ctx = this.ctx;
    ctx.clearRect(0, 0, w, h);

    if (!nodes.length) return;

    const nodeStyle = nodeConfig?.style;
    const dynamicNodeStyle = typeof nodeStyle === 'function';
    const edgeStyle = edgeConfig?.style;
    const nodeExtension = getNodeExtension(nodeConfig?.type);
    const extensionStyle = nodeExtension?.style;
    const hasNodeLabels =
      dynamicNodeStyle ||
      (typeof nodeStyle === 'object' && nodeStyle.label !== undefined) ||
      extensionStyle?.label !== undefined ||
      !!nodeExtension?.getStyle;
    const hasNodeIcons =
      dynamicNodeStyle ||
      (typeof nodeStyle === 'object' && nodeStyle.icon !== undefined) ||
      extensionStyle?.icon !== undefined ||
      !!nodeExtension?.getStyle;
    const hasNodeOverlay = !!nodeExtension?.drawOverlay;
    const hasNodeDecorations = (nodeConfig?.decorations?.length ?? 0) > 0;
    const hasEdgeLabels = edgeStyle?.label !== undefined;

    if (!hasNodeLabels && !hasNodeIcons && !hasNodeOverlay && !hasNodeDecorations && !hasEdgeLabels)
      return;

    this.grid.reset(w, h);
    this.decorationGrid.reset(w, h);
    const zoom = camera.zoom;

    // Draw node icons and labels
    if (hasNodeLabels || hasNodeIcons || hasNodeOverlay || hasNodeDecorations) {
      this.drawNodes(nodes, camera, nodeConfig, w, h, dpr, zoom, theme, getNodeDimensions);
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
    theme: ThemeTokens,
    getNodeDimensions?: (id: string) => { width: number; height: number } | undefined,
  ): void {
    const ctx = this.ctx;
    const configuredStyle = nodeConfig?.style;
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

      const userStyle =
        typeof configuredStyle === 'function' ? configuredStyle(node) : (configuredStyle ?? {});
      const resolvedVisualStyle = resolveNodeStyle(
        node as GraphNode & { x: number; y: number },
        nodeConfig,
        theme,
      );
      const nodeBaseType = getNodeBaseType(nodeConfig);
      const renderedDimensions = getNodeDimensions?.(node.id);
      const getExtensionStyle = nodeExtension?.getStyle;
      const dynamicExtensionStyle = getExtensionStyle
        ? safeExtensionCall(
            'node',
            nodeConfig?.type ?? 'unknown',
            'getStyle',
            () => getExtensionStyle(node),
            undefined,
          )
        : undefined;
      const style = {
        ...nodeExtension?.style,
        ...dynamicExtensionStyle,
        ...userStyle,
        size: resolvedVisualStyle.size,
        width:
          renderedDimensions?.width ??
          (nodeBaseType === 'circle' ? resolvedVisualStyle.size : resolvedVisualStyle.width),
        height:
          renderedDimensions?.height ??
          (nodeBaseType === 'circle' ? resolvedVisualStyle.size : resolvedVisualStyle.height),
        borderRadius: resolvedVisualStyle.borderRadius,
      };

      const drawOverlay = nodeExtension?.drawOverlay;
      if (drawOverlay) {
        const nodeSize = resolveNodeValue(style.size, node, 8);
        const needsRedraw = safeExtensionCall(
          'node',
          nodeConfig?.type ?? 'unknown',
          'drawOverlay',
          () =>
            drawOverlay(ctx, {
              node,
              x: px,
              y: py,
              nodeSize,
              dpr,
              zoom,
              camera,
              time,
            }),
          false,
        );
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
          const renderedByCustomRenderer =
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
            );
          if (!renderedByCustomRenderer)
            this.drawNodeLabel(ctx, text, px, py, node, style, dpr, zoom);
        }
      }

      // Decorations use their own collision layer so a node's badge cannot suppress its label.
      if (nodeConfig?.decorations?.length) {
        this.drawNodeDecorations(ctx, node, px, py, style, nodeConfig, dpr, zoom, w, h);
      }
    }
  }

  private measureDecorationLayout(
    renderer: DecorationRenderer,
    params: Parameters<DecorationRenderer['measure']>[0],
    warningKey: string,
    warningMessage: string,
  ): LabelLayout | undefined {
    params.ctx.save();
    try {
      const layout = renderer.measure(params);
      return isValidLabelLayout(layout) ? layout : undefined;
    } catch (error) {
      this.warnOnce(warningKey, warningMessage, error);
      return undefined;
    } finally {
      params.ctx.restore();
    }
  }

  private measureDecorationItems(
    renderer: DecorationRenderer,
    rendererName: string,
    ctx: CanvasRenderingContext2D,
    node: GraphNode,
    rawItems: unknown[],
    dpr: number,
    zoom: number,
    nodeWidth: number,
    nodeHeight: number,
  ): MeasuredDecorationItem[] {
    const measuredItems: MeasuredDecorationItem[] = [];
    for (let index = 0; index < rawItems.length; index++) {
      const data = rawItems[index];
      const layout = this.measureDecorationLayout(
        renderer,
        { ctx, node, data, dpr, zoom, nodeWidth, nodeHeight },
        `decoration:${rendererName}:measure`,
        `[G6-GL] Decoration renderer "${rendererName}" threw during measure; skipping it.`,
      );
      if (layout) measuredItems.push({ data, layout, index });
    }
    return measuredItems;
  }

  private drawDecorationGroup(
    renderer: DecorationRenderer,
    rendererName: string,
    ctx: CanvasRenderingContext2D,
    node: GraphNode,
    isStack: boolean,
    visibleItems: MeasuredDecorationItem[],
    layout: LabelLayout,
    placement: LabelPlacement,
    x: number,
    y: number,
    itemGap: number,
    dpr: number,
    zoom: number,
    nodeWidth: number,
    nodeHeight: number,
  ): boolean {
    const params = {
      ctx,
      node,
      data: visibleItems[0].data,
      dpr,
      zoom,
      nodeWidth,
      nodeHeight,
    };
    ctx.save();
    try {
      ctx.translate(x, y);
      if (isStack) {
        let itemY = -layout.height / 2;
        for (const item of visibleItems) {
          ctx.save();
          try {
            ctx.translate(
              getStackItemX(placement, layout.width, item.layout.width),
              itemY + item.layout.height / 2,
            );
            renderer.draw({ ...params, data: item.data, layout: item.layout });
          } finally {
            ctx.restore();
          }
          itemY += item.layout.height + itemGap;
        }
      } else {
        renderer.draw({ ...params, layout });
      }
      return true;
    } catch (error) {
      this.warnOnce(
        `decoration:${rendererName}:draw`,
        `[G6-GL] Decoration renderer "${rendererName}" threw during draw; skipping it.`,
        error,
      );
      return false;
    } finally {
      ctx.restore();
    }
  }

  private registerDecorationHoverRegion(
    nodeId: string,
    visibleItems: MeasuredDecorationItem[],
    expanded: boolean,
    placement: LabelPlacement,
    bboxX: number,
    bboxY: number,
    layout: LabelLayout,
    itemGap: number,
  ): void {
    if (expanded) {
      this.decorationHoverRegions.push({
        nodeId,
        x: bboxX,
        y: bboxY,
        width: layout.width,
        height: layout.height,
      });
      return;
    }
    let itemY = bboxY;
    for (const item of visibleItems) {
      if (item.isOverflow) {
        this.decorationHoverRegions.push({
          nodeId,
          x: placement === 'left' ? bboxX + layout.width - item.layout.width : bboxX,
          y: itemY,
          width: item.layout.width,
          height: item.layout.height,
        });
        return;
      }
      itemY += item.layout.height + itemGap;
    }
  }

  private resolveDecorationAnchor(
    node: GraphNode,
    style: NodeStyleConfig,
    nodeConfig: NodeConfig,
    decoration: NodeDecorationConfig,
    visibleItems: MeasuredDecorationItem[],
    layout: LabelLayout,
    px: number,
    py: number,
    nodeWidth: number,
    nodeHeight: number,
    dpr: number,
    zoom: number,
  ): { x: number; y: number; placement: LabelPlacement } {
    const requestedPlacement = resolveNodeValue(
      decoration.placement,
      node,
      'top' as NodeDecorationPlacement,
    );
    const labelPlacement = resolveNodeValue(style.labelPlacement, node, 'bottom' as LabelPlacement);
    const placement = resolveDecorationPlacement(requestedPlacement, labelPlacement);
    const crossOffsetRatio = resolveNodeValue(decoration.crossOffsetRatio, node, 0);
    const borderRadius = resolveNodeValue(style.borderRadius, node, 0) * zoom;
    const boundaryPlacement =
      placement === 'left' || placement === 'right' || placement === 'top' || placement === 'bottom'
        ? placement
        : undefined;
    const nodeExtension = getNodeExtension(nodeConfig.type);
    const getBoundaryAnchor = nodeExtension?.getBoundaryAnchor;
    const extensionBoundaryAnchor =
      boundaryPlacement && getBoundaryAnchor
        ? safeExtensionCall(
            'node',
            nodeConfig.type ?? 'unknown',
            'getBoundaryAnchor',
            () =>
              getBoundaryAnchor({
                node,
                placement: boundaryPlacement,
                crossOffsetRatio,
                width: nodeWidth,
                height: nodeHeight,
                borderRadius,
              }),
            undefined,
          )
        : undefined;
    const boundaryAnchor = boundaryPlacement
      ? (extensionBoundaryAnchor ??
        getBuiltInNodeBoundaryAnchor(
          getNodeBaseType(nodeConfig),
          boundaryPlacement,
          nodeWidth,
          nodeHeight,
          crossOffsetRatio,
          borderRadius,
        ))
      : undefined;
    const boundaryAdjacentItem =
      placement === 'top' && decoration.layout === 'stack'
        ? visibleItems[visibleItems.length - 1]
        : visibleItems[0];
    const boundaryOverlapValue = resolveNodeValue(decoration.boundaryOverlap, node, 0);
    const boundaryOverlap =
      boundaryOverlapValue === 'half-badge'
        ? boundaryAdjacentItem.layout.height / 2
        : boundaryOverlapValue * dpr;
    const anchor = getNodeDecorationAnchor(
      px,
      py,
      nodeWidth,
      nodeHeight,
      layout,
      placement,
      decoration.attachment ?? 'boundary',
      decoration.anchor ?? 'center',
      4 * dpr * getLabelZoom(zoom / Math.max(dpr, Number.EPSILON)),
      crossOffsetRatio,
      boundaryOverlap,
      boundaryAnchor,
    );
    return {
      x: anchor.x + (decoration.offsetX ?? 0) * dpr,
      y: anchor.y + (decoration.offsetY ?? 0) * dpr,
      placement,
    };
  }

  private drawNodeDecorations(
    ctx: CanvasRenderingContext2D,
    node: GraphNode,
    px: number,
    py: number,
    style: NodeStyleConfig,
    nodeConfig: NodeConfig,
    dpr: number,
    zoom: number,
    viewW: number,
    viewH: number,
  ): void {
    const nodeSize = resolveNodeValue(style.size, node, 8);
    const nodeWidth = resolveNodeValue(style.width, node, nodeSize) * zoom;
    const nodeHeight = resolveNodeValue(style.height, node, nodeSize) * zoom;
    const drawnBounds: Array<{ x: number; y: number; width: number; height: number }> = [];

    for (const decoration of nodeConfig.decorations ?? []) {
      const renderer = getDecorationRenderer(decoration.renderer);
      if (!renderer) {
        this.warnOnce(
          `decoration:${decoration.renderer}:missing`,
          `[G6-GL] Decoration renderer "${decoration.renderer}" is not registered; skipping it.`,
        );
        continue;
      }
      const isStack = decoration.layout === 'stack';
      const rawItems = isStack
        ? typeof decoration.items === 'function'
          ? decoration.items(node)
          : (decoration.items ?? [])
        : [typeof decoration.data === 'function' ? decoration.data(node) : decoration.data];
      if (!rawItems.length) continue;
      const measuredItems = this.measureDecorationItems(
        renderer,
        decoration.renderer,
        ctx,
        node,
        rawItems,
        dpr,
        zoom,
        nodeWidth,
        nodeHeight,
      );
      if (!measuredItems.length) continue;
      orderDecorationItems(measuredItems, decoration.sort);

      const expanded = decoration.overflow === 'hover-expand' && this.hoveredNodeId === node.id;
      const selection = selectVisibleDecorationItems(
        measuredItems,
        decoration.maxVisible,
        expanded,
      );
      const visibleItems = selection.visibleItems;
      if (selection.hiddenCount > 0) {
        if (decoration.overflowData !== undefined) {
          const overflowData =
            typeof decoration.overflowData === 'function'
              ? decoration.overflowData(selection.hiddenCount, node)
              : decoration.overflowData;
          const overflowLayout = this.measureDecorationLayout(
            renderer,
            { ctx, node, data: overflowData, dpr, zoom, nodeWidth, nodeHeight },
            `decoration:${decoration.renderer}:overflow-measure`,
            `[G6-GL] Decoration renderer "${decoration.renderer}" threw while measuring overflow; clipping it.`,
          );
          if (overflowLayout) {
            visibleItems.push({
              data: overflowData,
              layout: overflowLayout,
              index: Number.MAX_VALUE,
              isOverflow: true,
            });
          }
        }
      }

      const itemGap = (decoration.itemGap ?? 2) * dpr;
      const layout = createDecorationGroupLayout(visibleItems, isStack, itemGap);
      const { x, y, placement } = this.resolveDecorationAnchor(
        node,
        style,
        nodeConfig,
        decoration,
        visibleItems,
        layout,
        px,
        py,
        nodeWidth,
        nodeHeight,
        dpr,
        zoom,
      );

      const bboxX = x - layout.width / 2;
      const bboxY = y - layout.height / 2;
      if (bboxX + layout.width < 0 || bboxX > viewW || bboxY + layout.height < 0 || bboxY > viewH)
        continue;
      if (this.decorationGrid.hasOverlap(bboxX, bboxY, layout.width, layout.height)) continue;

      const drawn = this.drawDecorationGroup(
        renderer,
        decoration.renderer,
        ctx,
        node,
        isStack,
        visibleItems,
        layout,
        placement,
        x,
        y,
        itemGap,
        dpr,
        zoom,
        nodeWidth,
        nodeHeight,
      );
      if (drawn) {
        drawnBounds.push({ x: bboxX, y: bboxY, width: layout.width, height: layout.height });
        if (isStack && decoration.overflow === 'hover-expand') {
          this.registerDecorationHoverRegion(
            node.id,
            visibleItems,
            expanded,
            placement,
            bboxX,
            bboxY,
            layout,
            itemGap,
          );
        }
      }
    }

    for (const bounds of drawnBounds) {
      this.decorationGrid.register(bounds.x, bounds.y, bounds.width, bounds.height);
    }
  }

  private resolveCustomRenderer(type: 'node' | 'edge', name: string): LabelRenderer | undefined {
    const renderer = getLabelRenderer(name);
    if (!renderer) {
      this.warnOnce(
        `${type}:${name}:missing`,
        `[G6-GL] Label renderer "${name}" is not registered for ${type} labels; falling back to the default renderer.`,
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
    style: NodeStyleConfig,
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
        `[G6-GL] Label renderer "${rendererName}" threw during node label measure; falling back to the default renderer.`,
        error,
      );
      return false;
    } finally {
      ctx.restore();
    }

    if (!isValidLabelLayout(layout)) {
      this.warnOnce(
        `node:${rendererName}:layout`,
        `[G6-GL] Label renderer "${rendererName}" returned an invalid node label layout; falling back to the default renderer.`,
      );
      return false;
    }

    const nodeSize = resolveNodeValue(style.size, node, 8);
    const nodeWidth = resolveNodeValue(style.width, node, nodeSize) * zoom;
    const nodeHeight = resolveNodeValue(style.height, node, nodeSize) * zoom;
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
        `[G6-GL] Label renderer "${rendererName}" threw during node label draw; falling back to the default renderer.`,
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
    style: NodeStyleConfig,
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
    const nodeSizeScreen = nodeSize * zoom;

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

    // Draw text
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;
    ctx.fillStyle = color;
    ctx.fillText(displayText, labelX, labelY);
  }

  private drawIcon(
    url: string,
    px: number,
    py: number,
    node: GraphNode,
    style: NodeStyleConfig,
    dpr: number,
    zoom: number,
  ): void {
    const img = this.loadImage(url);
    if (!img) return;

    const nodeSize = resolveNodeValue(style.size, node, 8);
    const defaultIconSize = nodeSize * 0.6;
    const iconW = resolveNodeValue(style.iconWidth, node, defaultIconSize) * zoom;
    const iconH = resolveNodeValue(style.iconHeight, node, defaultIconSize) * zoom;
    const offsetX = resolveNodeValue(style.iconOffsetX, node, 0) * dpr;
    const offsetY = resolveNodeValue(style.iconOffsetY, node, 0) * dpr;

    this.ctx.drawImage(img, px - iconW / 2 + offsetX, py - iconH / 2 + offsetY, iconW, iconH);
  }

  private drawTextIcon(
    text: string,
    px: number,
    py: number,
    node: GraphNode,
    style: NodeStyleConfig,
    dpr: number,
    zoom: number,
  ): void {
    const nodeSize = resolveNodeValue(style.size, node, 8);
    const defaultFontSize = nodeSize * 0.6;
    const fontSize = resolveNodeValue(style.iconFontSize, node, defaultFontSize) * zoom;
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

      const edgePath = edgePathCache?.get(i);
      const pathSample = edgePath ? sampleEdgePath(edgePath, t) : undefined;
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
        `[G6-GL] Label renderer "${rendererName}" threw during edge label measure; falling back to the default renderer.`,
        error,
      );
      return false;
    } finally {
      ctx.restore();
    }

    if (!isValidLabelLayout(layout)) {
      this.warnOnce(
        `edge:${rendererName}:layout`,
        `[G6-GL] Label renderer "${rendererName}" returned an invalid edge label layout; falling back to the default renderer.`,
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
        `[G6-GL] Label renderer "${rendererName}" threw during edge label draw; falling back to the default renderer.`,
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
    if (this.destroyed) return null;
    const cached = this.imageCache.get(url);
    if (cached !== undefined) return cached;
    // Start loading
    const img = new Image();
    img.crossOrigin = 'anonymous';
    this.imageCache.set(url, null); // placeholder
    img.onload = () => {
      if (this.destroyed) return;
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
    if (this.destroyed) return;
    this.destroyed = true;
    this.mainCanvas.removeEventListener('mousemove', this.onDecorationPointerMove);
    this.mainCanvas.removeEventListener('mouseleave', this.onDecorationPointerLeave);
    this.canvas.remove();
    this.scheduleRedrawFn = null;
    this.redrawScheduled = false;
    this.hoveredNodeId = null;
    this.decorationHoverRegions = [];
    this.imageCache.clear();
    this.warnedRendererIssues.clear();
  }
}
