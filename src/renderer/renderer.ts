/**
 * WebGL renderer: nodes as points, edges as lines.
 */

import * as glUtil from './gl.js';
import { nodeVertex, nodeFragment, lineVertex, lineFragment } from './shaders.js';
import { parseColor } from './color.js';
import { resolveNodeStyle, resolveEdgeStyle } from './style.js';
import type { Camera } from './camera.js';
import { createCamera } from './camera.js';
import type { GraphNode, GraphEdge, NodeConfig, EdgeConfig } from '../types.js';
import type { ThemeTokens } from '../types.js';

export interface LayoutNode extends GraphNode {
  x: number;
  y: number;
}

export interface RendererData {
  nodes: LayoutNode[];
  edges: GraphEdge[];
  nodeConfig?: NodeConfig;
  edgeConfig?: EdgeConfig;
  theme: ThemeTokens;
}

export class Renderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private nodeProgram: WebGLProgram;
  private lineProgram: WebGLProgram;
  private nodeBuffer: WebGLBuffer | null = null;
  private lineBuffer: WebGLBuffer | null = null;
  private nodeCount = 0;
  private lineVertexCount = 0;
  private nodeConfig: NodeConfig | undefined;
  private edgeConfig: EdgeConfig | undefined;
  private theme: ThemeTokens = { nodeFill: '#5B8FF9', nodeSize: 8, edgeStroke: '#e2e2e2', edgeLineWidth: 1 };
  private nodes: LayoutNode[] = [];
  private edges: GraphEdge[] = [];
  private nodeIdToIndex = new Map<string, number>();
  private camera: Camera = createCamera();
  private highlightNodeIds = new Set<string>();
  private highlightEdgeIndices = new Set<number>();

  constructor(container: string | HTMLElement) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el || !(el instanceof HTMLCanvasElement)) throw new Error('Container must be a canvas or canvas selector');
    this.canvas = el;
    this.gl = glUtil.getGL(this.canvas);
    this.nodeProgram = glUtil.createProgram(this.gl, nodeVertex, nodeFragment);
    this.lineProgram = glUtil.createProgram(this.gl, lineVertex, lineFragment);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }

  setData(data: RendererData): void {
    this.nodeConfig = data.nodeConfig;
    this.edgeConfig = data.edgeConfig;
    this.theme = data.theme;
    this.nodes = data.nodes;
    this.edges = data.edges;
    this.nodeIdToIndex.clear();
    data.nodes.forEach((n, i) => this.nodeIdToIndex.set(n.id, i));

    const nodeFloats = this.buildNodeBuffer(data.nodes, data.edges);
    const lineFloats = this.buildLineBuffer(data.nodes, data.edges);

    this.uploadNodeBuffer(nodeFloats);
    this.uploadLineBuffer(lineFloats);
  }

  private buildNodeBuffer(nodes: LayoutNode[], _edges: GraphEdge[]): Float32Array {
    const stride = 6; // x, y, size, r, g, b
    const arr = new Float32Array(nodes.length * stride);
    const dim = [0.4, 0.4, 0.45];
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const style = resolveNodeStyle(node, this.nodeConfig, this.theme);
      const isHighlight = this.highlightNodeIds.size === 0 || this.highlightNodeIds.has(node.id);
      const color = isHighlight ? parseColor(style.fill) : dim;
      arr[i * stride + 0] = node.x;
      arr[i * stride + 1] = node.y;
      arr[i * stride + 2] = style.size;
      arr[i * stride + 3] = color[0];
      arr[i * stride + 4] = color[1];
      arr[i * stride + 5] = color[2];
    }
    return arr;
  }

  private buildLineBuffer(nodes: LayoutNode[], edges: GraphEdge[]): Float32Array {
    const nodeMap = new Map<string, LayoutNode>();
    nodes.forEach((n) => nodeMap.set(n.id, n));
    const arr = new Float32Array(edges.length * 4); // x1,y1, x2,y2 per edge
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      const s = nodeMap.get(e.source);
      const t = nodeMap.get(e.target);
      if (!s || !t) continue;
      arr[i * 4 + 0] = s.x;
      arr[i * 4 + 1] = s.y;
      arr[i * 4 + 2] = t.x;
      arr[i * 4 + 3] = t.y;
    }
    return arr;
  }

  private uploadNodeBuffer(data: Float32Array): void {
    const gl = this.gl;
    this.nodeCount = data.length / 6;
    if (!this.nodeBuffer) this.nodeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nodeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  }

  private uploadLineBuffer(data: Float32Array): void {
    const gl = this.gl;
    this.lineVertexCount = data.length / 2; // 2 floats per vertex, 2 vertices per edge
    if (!this.lineBuffer) this.lineBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  }

  draw(): void {
    const gl = this.gl;
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (w <= 0 || h <= 0) return;

    gl.viewport(0, 0, w, h);
    const bg = parseColor(this.theme.canvasBackground ?? '#fff');
    gl.clearColor(bg[0], bg[1], bg[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const stroke = this.theme.edgeStroke ?? '#e2e2e2';
    const [r, g, b] = parseColor(stroke);

    gl.useProgram(this.lineProgram);
    const lTranslate = gl.getUniformLocation(this.lineProgram, 'u_translate');
    const lScale = gl.getUniformLocation(this.lineProgram, 'u_scale');
    const lRes = gl.getUniformLocation(this.lineProgram, 'u_resolution');
    const lColor = gl.getUniformLocation(this.lineProgram, 'u_color');
    gl.uniform2f(lTranslate, this.camera.x, this.camera.y);
    gl.uniform1f(lScale, this.camera.zoom);
    gl.uniform2f(lRes, w, h);
    gl.uniform3f(lColor, r, g, b);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffer);
    const lPos = gl.getAttribLocation(this.lineProgram, 'a_pos');
    gl.enableVertexAttribArray(lPos);
    gl.vertexAttribPointer(lPos, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, this.lineVertexCount);

    gl.useProgram(this.nodeProgram);
    const nTranslate = gl.getUniformLocation(this.nodeProgram, 'u_translate');
    const nScale = gl.getUniformLocation(this.nodeProgram, 'u_scale');
    const nRes = gl.getUniformLocation(this.nodeProgram, 'u_resolution');
    gl.uniform2f(nTranslate, this.camera.x, this.camera.y);
    gl.uniform1f(nScale, this.camera.zoom);
    gl.uniform2f(nRes, w, h);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nodeBuffer);
    const nPos = gl.getAttribLocation(this.nodeProgram, 'a_pos');
    const nSize = gl.getAttribLocation(this.nodeProgram, 'a_size');
    const nColor = gl.getAttribLocation(this.nodeProgram, 'a_color');
    gl.enableVertexAttribArray(nPos);
    gl.vertexAttribPointer(nPos, 2, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(nSize);
    gl.vertexAttribPointer(nSize, 1, gl.FLOAT, false, 24, 8);
    gl.enableVertexAttribArray(nColor);
    gl.vertexAttribPointer(nColor, 3, gl.FLOAT, false, 24, 12);
    gl.drawArrays(gl.POINTS, 0, this.nodeCount);
  }

  resize(width: number, height: number): void {
    const dpr = Math.min(2, window.devicePixelRatio ?? 1);
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.draw();
  }

  getCamera(): Camera {
    return this.camera;
  }

  setCamera(cam: Partial<Camera>): void {
    if (cam.x !== undefined) this.camera.x = cam.x;
    if (cam.y !== undefined) this.camera.y = cam.y;
    if (cam.zoom !== undefined) this.camera.zoom = Math.max(0.1, Math.min(20, cam.zoom));
  }

  screenToGraph(screenX: number, screenY: number): [number, number] {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const px = (screenX - rect.left) * scaleX;
    const py = (screenY - rect.top) * scaleY;
    const { camera } = this;
    const ndcX = (px / w) * 2 - 1;
    const ndcY = 1 - (py / h) * 2;
    const gx = (ndcX + 1) / (2 * camera.zoom) - camera.x;
    const gy = (1 - ndcY) / (2 * camera.zoom) - camera.y;
    return [gx, gy];
  }

  /** Hit test: return node id under (graphX, graphY) or null. */
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

  /** Hit test: return edge index under (graphX, graphY) or -1. */
  hitTestEdge(graphX: number, graphY: number): number {
    const nodeMap = new Map<string, LayoutNode>();
    this.nodes.forEach((n) => nodeMap.set(n.id, n));
    const threshold = 8;
    let found = -1;
    for (let i = 0; i < this.edges.length; i++) {
      const e = this.edges[i];
      const s = nodeMap.get(e.source)!;
      const t = nodeMap.get(e.target)!;
      if (!s || !t) continue;
      const d = pointToSegmentDist(graphX, graphY, s.x, s.y, t.x, t.y);
      if (d <= threshold) found = i;
    }
    return found;
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

  setHighlight(option: { nodeIds?: Set<string>; edgeIndices?: Set<number> }): void {
    this.highlightNodeIds = option.nodeIds ?? new Set();
    this.highlightEdgeIndices = option.edgeIndices ?? new Set();
    this.uploadNodeBuffer(this.buildNodeBuffer(this.nodes, this.edges));
    this.draw();
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
