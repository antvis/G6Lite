/**
 * WebGL renderer with multi-program dispatch, process/render separation,
 * and framebuffer picking for O(1) hit detection.
 */

import { getGL } from './gl.js';
import { parseColor } from './color.js';
import { resolveNodeStyle, resolveEdgeStyle } from './style.js';
import type { Camera } from './camera.js';
import { createCamera } from './camera.js';
import { NodeCircleProgram } from './programs/nodeCircle.js';
import { NodeRectProgram } from './programs/nodeRect.js';
import { EdgeLineProgram } from './programs/edgeLine.js';
import { EdgeRectProgram } from './programs/edgeRect.js';
import { EdgeArcProgram } from './programs/edgeArc.js';
import { PickingManager } from './picking.js';
import type { RenderParams } from './programs/program.js';
import type { Program } from './programs/program.js';
import type { GraphEdge, NodeConfig, EdgeConfig, ThemeTokens, LayoutNode } from '../types.js';

export interface RendererData {
  nodes: LayoutNode[];
  edges: GraphEdge[];
  nodeConfig?: NodeConfig;
  edgeConfig?: EdgeConfig;
  theme: ThemeTokens;
}

type NodeProgramType = 'circle' | 'rect';
type EdgeProgramType = 'line' | 'rect' | 'arc';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;

  // All programs (created once)
  private programs: {
    nodeCircle: NodeCircleProgram;
    nodeRect: NodeRectProgram;
    edgeLine: EdgeLineProgram;
    edgeRect: EdgeRectProgram;
    edgeArc: EdgeArcProgram;
  };

  // Active program type (resolved from config)
  private activeNodeType: NodeProgramType = 'circle';
  private activeEdgeType: EdgeProgramType = 'line';

  // Picking
  private picking: PickingManager;

  // Data
  private nodes: LayoutNode[] = [];
  private edges: GraphEdge[] = [];
  private nodeIdToIndex = new Map<string, number>();
  private nodeConfig: NodeConfig | undefined;
  private edgeConfig: EdgeConfig | undefined;
  private theme: ThemeTokens = { nodeFill: '#5B8FF9', nodeSize: 8, edgeStroke: '#e2e2e2', edgeLineWidth: 1 };

  // Camera
  private camera: Camera = createCamera();

  // State
  private highlightNodeIds = new Set<string>();
  private highlightEdgeIndices = new Set<number>();
  private prevHighlightNodeIds = new Set<string>();
  private prevHighlightEdgeIndices = new Set<number>();

  // Edge visibility (hideEdgesOnMove)
  private hideEdges = false;
  private edgeRestoreTimer: ReturnType<typeof setTimeout> | null = null;

  // Render scheduling
  private renderFrame: number | null = null;
  private needToProcess = false;
  private needHighlightUpdate = false;
  private needPickingRender = false;
  private pickingInitialized = false;

  constructor(container: string | HTMLElement) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el || !(el instanceof HTMLCanvasElement)) throw new Error('Container must be a canvas or canvas selector');
    this.canvas = el;
    this.gl = getGL(this.canvas);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.programs = {
      nodeCircle: new NodeCircleProgram(this.gl),
      nodeRect: new NodeRectProgram(this.gl),
      edgeLine: new EdgeLineProgram(this.gl),
      edgeRect: new EdgeRectProgram(this.gl),
      edgeArc: new EdgeArcProgram(this.gl),
    };
    this.picking = new PickingManager(this.gl);
  }

  private get activeNodeProgram(): Program {
    return this.activeNodeType === 'rect' ? this.programs.nodeRect : this.programs.nodeCircle;
  }

  private get activeEdgeProgram(): Program {
    return this.activeEdgeType === 'arc'
      ? this.programs.edgeArc
      : this.activeEdgeType === 'rect'
        ? this.programs.edgeRect
        : this.programs.edgeLine;
  }

  updateData(renderData: RendererData): void {
    this.nodeConfig = renderData.nodeConfig;
    this.edgeConfig = renderData.edgeConfig;
    this.theme = renderData.theme;
    this.nodes = renderData.nodes;
    this.edges = renderData.edges;
    this.nodeIdToIndex.clear();
    renderData.nodes.forEach((n, i) => this.nodeIdToIndex.set(n.id, i));

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

  /** Determine edge program: arc if type='arc', rect if lineWidth>1, else line. */
  private resolveEdgeType(config?: EdgeConfig): EdgeProgramType {
    if (config?.type === 'arc') return 'arc';
    const lw = config?.style?.lineWidth;
    if (typeof lw === 'number' && lw > 1) return 'rect';
    if (typeof lw === 'undefined' && (this.theme.edgeLineWidth ?? 1) > 1) return 'rect';
    if (typeof lw === 'function') return 'rect';
    return 'line';
  }

  /** Build GPU buffers from current state. */
  private process(): void {
    const { nodes, edges, nodeConfig, edgeConfig, theme } = this;
    const bg = parseColor(this.theme.canvasBackground ?? '#fff');
    const hasHighlight = this.highlightNodeIds.size > 0;

    // -- Process nodes --
    const nodeProgram = this.activeNodeType === 'rect' ? this.programs.nodeRect : this.programs.nodeCircle;
    nodeProgram.reallocate(nodes.length);
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const style = resolveNodeStyle(node, nodeConfig, theme);
      const active = !hasHighlight || this.highlightNodeIds.has(node.id);
      const baseColor = parseColor(style.fill);
      // G6-style: inactive nodes at 0.25 opacity, blended with background
      const color: [number, number, number] = active
        ? baseColor
        : [baseColor[0] * 0.25 + bg[0] * 0.75, baseColor[1] * 0.25 + bg[1] * 0.75, baseColor[2] * 0.25 + bg[2] * 0.75];
      if (this.activeNodeType === 'rect') {
        (nodeProgram as NodeRectProgram).processNode(i, node.x, node.y, style.width, style.height, color, i);
      } else {
        (nodeProgram as NodeCircleProgram).processNode(i, node.x, node.y, style.size, color, i);
      }
    }
    nodeProgram.upload();

    // -- Process edges (use existing nodeIdToIndex instead of creating new Map) --
    const edgeProg = this.activeEdgeProgram;
    edgeProg.reallocate(edges.length);
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      const srcIdx = this.nodeIdToIndex.get(e.source);
      const tgtIdx = this.nodeIdToIndex.get(e.target);
      if (srcIdx === undefined || tgtIdx === undefined) continue;
      const src = nodes[srcIdx];
      const tgt = nodes[tgtIdx];
      const style = resolveEdgeStyle(src, tgt, e, edgeConfig, theme);
      const active = !hasHighlight || this.highlightEdgeIndices.has(i);
      const edgeBaseColor = parseColor(style.stroke);
      // G6-style: inactive edges at 0.08 opacity, blended with background
      const color: [number, number, number] = active
        ? edgeBaseColor
        : [edgeBaseColor[0] * 0.08 + bg[0] * 0.92, edgeBaseColor[1] * 0.08 + bg[1] * 0.92, edgeBaseColor[2] * 0.08 + bg[2] * 0.92];
      const pickIdx = nodes.length + i;

      if (this.activeEdgeType === 'arc') {
        (edgeProg as EdgeArcProgram).processEdge(i, src.x, src.y, tgt.x, tgt.y, color, pickIdx, style.curvature);
      } else if (this.activeEdgeType === 'rect') {
        (edgeProg as EdgeRectProgram).processEdge(i, src.x, src.y, tgt.x, tgt.y, color, pickIdx, style.lineWidth);
      } else {
        (edgeProg as EdgeLineProgram).processEdge(i, src.x, src.y, tgt.x, tgt.y, color, pickIdx);
      }
    }
    edgeProg.upload();

    this.picking.setNodeCount(nodes.length);
    this.needToProcess = false;
    this.needPickingRender = true;
  }

  /** Incremental highlight: only patch color floats for nodes/edges whose highlight state changed. */
  private processHighlightDelta(): void {
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
        : [baseColor[0] * 0.25 + bg[0] * 0.75, baseColor[1] * 0.25 + bg[1] * 0.75, baseColor[2] * 0.25 + bg[2] * 0.75];
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
      const edgeBaseColor = parseColor(style.stroke);
      const color: [number, number, number] = active
        ? edgeBaseColor
        : [edgeBaseColor[0] * 0.08 + bg[0] * 0.92, edgeBaseColor[1] * 0.08 + bg[1] * 0.92, edgeBaseColor[2] * 0.08 + bg[2] * 0.92];
      edgeProgram.patchItemColor(i, color);
    }

    // Re-upload only if something changed
    if (changedNodeIds.size > 0) nodeProgram.reupload();
    if (changedEdgeIndices.size > 0) edgeProgram.reupload();

    // Save current state as previous
    this.prevHighlightNodeIds = new Set(this.highlightNodeIds);
    this.prevHighlightEdgeIndices = new Set(this.highlightEdgeIndices);
  }

  /** Schedule a render on the next animation frame. */
  scheduleRender(): void {
    if (this.renderFrame !== null) return;
    this.renderFrame = requestAnimationFrame(() => {
      this.renderFrame = null;
      this.draw();
    });
  }

  /** Immediate draw: process if needed, then picking pass + normal pass. */
  draw(): void {
    if (this.needHighlightUpdate) this.processHighlightDelta();
    if (this.needToProcess) this.process();

    const gl = this.gl;
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (w <= 0 || h <= 0) return;

    const params: RenderParams = { width: w, height: h, camera: this.camera };
    const nodeProgram = this.activeNodeProgram;
    const edgeProgram = this.activeEdgeProgram;

    // Picking pass (deferred until first interaction)
    if (this.needPickingRender && this.pickingInitialized) {
      this.renderPickingPass(w, h, nodeProgram, edgeProgram);
    }

    // Normal pass
    gl.viewport(0, 0, w, h);
    const bg = parseColor(this.theme.canvasBackground ?? '#fff');
    gl.clearColor(bg[0], bg[1], bg[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (!this.hideEdges) edgeProgram.render(params);
    nodeProgram.render(params);
  }

  private renderPickingPass(w: number, h: number, nodeProgram: Program, edgeProgram: Program): void {
    const gl = this.gl;
    this.picking.resize(w, h);
    this.picking.bind();
    gl.disable(gl.BLEND);
    const pickParams: RenderParams = {
      width: Math.max(1, (w / 2) | 0),
      height: Math.max(1, (h / 2) | 0),
      camera: this.camera,
      picking: true,
    };
    edgeProgram.render(pickParams);
    nodeProgram.render(pickParams);
    this.picking.unbind(w, h);
    gl.enable(gl.BLEND);
    this.needPickingRender = false;
  }

  resize(width: number, height: number): void {
    const dpr = Math.min(2, window.devicePixelRatio ?? 1);
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.needPickingRender = true;
    this.draw();
  }

  getCamera(): Camera { return this.camera; }

  setCamera(cam: Partial<Camera>): void {
    if (cam.x !== undefined) this.camera.x = cam.x;
    if (cam.y !== undefined) this.camera.y = cam.y;
    if (cam.zoom !== undefined) this.camera.zoom = Math.max(0.1, Math.min(20, cam.zoom));
    this.needPickingRender = true;
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
  pickAt(screenX: number, screenY: number): { type: 'node'; id: string } | { type: 'edge'; index: number } | null {
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
  setMoving(moving: boolean): void {
    if (this.edgeRestoreTimer !== null) {
      clearTimeout(this.edgeRestoreTimer);
      this.edgeRestoreTimer = null;
    }
    if (moving) {
      this.hideEdges = true;
    } else {
      this.edgeRestoreTimer = setTimeout(() => {
        this.hideEdges = false;
        this.edgeRestoreTimer = null;
        this.scheduleRender();
      }, 150);
    }
  }

  getNodes(): LayoutNode[] { return this.nodes; }
  getEdges(): GraphEdge[] { return this.edges; }
  getCanvas(): HTMLCanvasElement { return this.canvas; }

  setHighlight(option: { nodeIds?: Set<string>; edgeIndices?: Set<number> }): void {
    this.highlightNodeIds = option.nodeIds ?? new Set();
    this.highlightEdgeIndices = option.edgeIndices ?? new Set();
    this.needHighlightUpdate = true;
    this.scheduleRender();
  }

  destroy(): void {
    if (this.renderFrame !== null) cancelAnimationFrame(this.renderFrame);
    if (this.edgeRestoreTimer !== null) clearTimeout(this.edgeRestoreTimer);
    this.programs.nodeCircle.destroy();
    this.programs.nodeRect.destroy();
    this.programs.edgeLine.destroy();
    this.programs.edgeRect.destroy();
    this.programs.edgeArc.destroy();
    this.picking.destroy();
    // Release WebGL context to free GPU memory and avoid context limit
    const ext = this.gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
    // Release large arrays
    this.nodes = [];
    this.edges = [];
    this.nodeIdToIndex.clear();
    this.highlightNodeIds.clear();
    this.highlightEdgeIndices.clear();
    this.prevHighlightNodeIds.clear();
    this.prevHighlightEdgeIndices.clear();
  }
}

function pointToSegmentDist(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1e-6;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (len * len)));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}
