/**
 * Graph: main entry. Creates container canvas, runs layout, renders with WebGL, registers behaviors.
 * P1: Now backed by DataModel for incremental data operations and RenderScheduler for optimal refresh.
 * P4: EventEmitter for interaction events, GPU-picking behaviors, drag-node support.
 */

import { registerBehaviors, resolveBehaviorOptions } from './behaviors/index.js';
import type { InternalEdge } from './dataModel.js';
import { DataModel } from './dataModel.js';
import { EventEmitter } from './events.js';
import type { PluginExtension, TransformExtension } from './extensions/contracts.js';
import {
  createExtension,
  createExtensionContext,
  destroyExtension,
  initializeExtension,
  safeExtensionCall,
  updateExtension,
} from './extensions/registry.js';
import { attachInteraction } from './interaction/dispatcher.js';
import { runLayout } from './layout/index.js';
import type { Camera } from './renderer/camera.js';
import { ComboRenderer } from './renderer/comboRenderer.js';
import { LabelLayerRenderer } from './renderer/labelRenderer.js';
import type { RendererData } from './renderer/renderer.js';
import { Renderer } from './renderer/renderer.js';
import { analyzeEdgeConfig, analyzeNodeConfig } from './renderer/style.js';
import { RefreshLevel, RenderScheduler } from './scheduler.js';
import { resolveTheme } from './theme.js';
import {
  processParallelEdges,
  resolveParallelEdgesConfig,
} from './transforms/processParallelEdges.js';
import type {
  ComboData,
  ComboModel,
  EdgeDataUpdate,
  EdgeModel,
  ElementModel,
  ElementState,
  FitViewOptions,
  GraphData,
  GraphEdge,
  GraphOptions,
  InternalCombo,
  LayoutConfig,
  LayoutNode,
  NodeDataUpdate,
  NodeModel,
  NodePositionUpdate,
  SetDataOptions,
  ThemeOption,
  ZoomOptions,
} from './types.js';

/** Internal result of a renderer pick operation. */
interface PickResult {
  type: 'node' | 'edge';
  /** Node ID (when type is 'node') or edge ID (when type is 'edge'). */
  id: string;
  /** For edge results, the current edge array index. */
  edgeIndex?: number;
  /** For edge results, the source and target node IDs. */
  source?: string;
  target?: string;
}

interface TransformInstanceRecord {
  name: string;
  extension: TransformExtension;
}

export class Graph {
  private options: GraphOptions;
  private containerEl: HTMLElement;
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private dataModel: DataModel | null = null;
  private scheduler: RenderScheduler | null = null;
  private behaviorTeardown: (() => void) | null = null;
  private interactionTeardown: (() => void) | null = null;
  private pluginTeardowns: Array<() => void> = [];
  private transformInstances = new Map<string, TransformInstanceRecord>();
  private resizeObserver: ResizeObserver | null = null;
  private layoutNodes: LayoutNode[] = [];
  private initialCamera: Camera | null = null;
  private labelRenderer: LabelLayerRenderer | null = null;
  private comboRenderer: ComboRenderer | null = null;
  private comboBeforeDrawRegistered = false;
  /** Whether render() has been called at least once. */
  private initialized = false;
  private _destroyed = false;
  private layoutGeneration = 0;
  private layoutAbortController: AbortController | null = null;

  /** @internal Event transport used by the dispatcher and behavior runtime. */
  readonly eventEmitter = new EventEmitter();

  get destroyed(): boolean {
    return this._destroyed;
  }

  isDestroyed(): boolean {
    return this._destroyed;
  }

  constructor(options: GraphOptions) {
    this.options = options;
    this.containerEl = resolveContainer(options.container);
    this.canvas = ensureCanvas(this.containerEl);
    this.renderer = new Renderer(this.canvas);
  }

  /** Canvas viewport passed to layout so it sizes to the canvas, not the window. */
  private getViewport(): { width: number; height: number } {
    return {
      width: this.containerEl.clientWidth || 800,
      height: this.containerEl.clientHeight || 600,
    };
  }

  private isGenerationCurrent(generation: number): boolean {
    return !this._destroyed && generation === this.layoutGeneration;
  }

  private applyTransforms(): void {
    if (!this.dataModel) return;
    const config = resolveParallelEdgesConfig(this.options.transforms, this.options.edge);
    processParallelEdges(this.dataModel.getEdges() as InternalEdge[], config);
  }

  private applyRegisteredTransforms(data: GraphData, generation: number): GraphData {
    let transformed = data;
    const activeKeys = new Set<string>();
    for (const [index, option] of (this.options.transforms ?? []).entries()) {
      if (!this.isGenerationCurrent(generation)) return transformed;
      const name = typeof option === 'string' ? option : option.type;
      if (name === 'process-parallel-edges') continue;
      const key = `${index}:${name}`;
      activeKeys.add(key);
      let record = this.transformInstances.get(key);
      const config = typeof option === 'string' ? {} : (option.options ?? {});
      if (!record) {
        const extension = createExtension<TransformExtension>('transform', name);
        if (!extension?.beforeRender) {
          if (extension) destroyExtension('transform', name, extension);
          continue;
        }
        if (
          !initializeExtension(
            'transform',
            name,
            extension,
            createExtensionContext(this),
            config as Record<string, unknown>,
          )
        ) {
          destroyExtension('transform', name, extension);
          continue;
        }
        if (!this.isGenerationCurrent(generation)) {
          destroyExtension('transform', name, extension);
          return transformed;
        }
        record = { name, extension };
        this.transformInstances.set(key, record);
      } else {
        if (
          !updateExtension('transform', name, record.extension, config as Record<string, unknown>)
        ) {
          destroyExtension('transform', name, record.extension);
          this.transformInstances.delete(key);
          continue;
        }
        if (!this.isGenerationCurrent(generation)) return transformed;
      }
      transformed = safeExtensionCall(
        'transform',
        name,
        'beforeRender',
        () => record!.extension.beforeRender!(transformed),
        transformed,
      );
      if (!this.isGenerationCurrent(generation)) return transformed;
    }
    for (const [key, record] of this.transformInstances) {
      if (activeKeys.has(key)) continue;
      destroyExtension('transform', record.name, record.extension);
      this.transformInstances.delete(key);
    }
    return transformed;
  }

  private mountPlugins(generation: number): void {
    this.pluginTeardowns.forEach((teardown) => teardown());
    this.pluginTeardowns = [];
    for (const option of this.options.plugins ?? []) {
      if (!this.isGenerationCurrent(generation)) return;
      const extension = createExtension<PluginExtension>('plugin', option.type);
      if (!extension) continue;
      if (
        !initializeExtension('plugin', option.type, extension, createExtensionContext(this), option)
      ) {
        destroyExtension('plugin', option.type, extension);
        continue;
      }
      if (!this.isGenerationCurrent(generation)) {
        destroyExtension('plugin', option.type, extension);
        return;
      }
      safeExtensionCall(
        'plugin',
        option.type,
        'mount',
        () => extension.mount?.(this.containerEl),
        undefined,
      );
      if (!this.isGenerationCurrent(generation)) {
        destroyExtension('plugin', option.type, extension);
        return;
      }
      this.pluginTeardowns.push(() => destroyExtension('plugin', option.type, extension));
    }
  }

  /** Release resources that are recreated by render(). */
  private teardownRenderRuntime(): void {
    this.behaviorTeardown?.();
    this.behaviorTeardown = null;
    this.interactionTeardown?.();
    this.interactionTeardown = null;
    this.pluginTeardowns.forEach((teardown) => teardown());
    this.pluginTeardowns = [];
    this.scheduler?.destroy();
    this.scheduler = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.labelRenderer?.destroy();
    this.labelRenderer = null;
    this.comboRenderer?.destroy();
    this.comboRenderer = null;
  }

  private async executeLayout(data: GraphData, layout: LayoutConfig) {
    this.layoutAbortController?.abort();
    const controller = new AbortController();
    this.layoutAbortController = controller;
    try {
      return await runLayout(data, layout, this.getViewport(), {
        signal: controller.signal,
        extensionContext: createExtensionContext(this),
      });
    } finally {
      if (this.layoutAbortController === controller) this.layoutAbortController = null;
    }
  }

  async render(): Promise<void> {
    if (this._destroyed) return;
    const generation = ++this.layoutGeneration;
    const { node, edge, layout, behaviors, theme } = this.options;
    const data = this.applyRegisteredTransforms(this.options.data, generation);
    if (!this.isGenerationCurrent(generation)) return;
    const themeTokens = resolveTheme((theme as ThemeOption) ?? 'light');

    // First, set up canvas with correct dimensions before any drawing.
    const width = this.containerEl.clientWidth || 800;
    const height = this.containerEl.clientHeight || 600;
    this.renderer.resize(width, height);

    // Clear canvas with theme background immediately so the user sees a white
    // canvas instead of a black void while layout is computing.
    this.renderer.clearWithTheme(themeTokens);

    let nodes = data.nodes.map((n) => ({
      ...n,
      x: n.x ?? 0,
      y: n.y ?? 0,
    }));

    if (layout && data.nodes.length > 0) {
      // Yield to the browser so the background clear takes effect before
      // the potentially blocking layout computation.
      await new Promise((resolve) => requestAnimationFrame(resolve));
      if (!this.isGenerationCurrent(generation)) return;
      // Auto-enable worker for large graphs unless explicitly disabled
      if (layout.worker === undefined && data.nodes.length >= 1000) {
        layout.worker = true;
      }

      this.eventEmitter.emit('beforelayout', { nodeCount: data.nodes.length });
      this.eventEmitter.emit('layout:start', { nodeCount: data.nodes.length });
      if (!this.isGenerationCurrent(generation)) return;
      const t0 = performance.now();
      const result = await this.executeLayout(data, layout);
      if (!this.isGenerationCurrent(generation)) return;
      const duration = performance.now() - t0;
      this.eventEmitter.emit('layout:end', { duration, nodeCount: data.nodes.length });
      this.eventEmitter.emit('afterlayout', { duration, nodeCount: data.nodes.length });
      if (!this.isGenerationCurrent(generation)) return;
      nodes = applyFixedPositions(result.nodes, data.nodes);
    }

    // A repeated render replaces all per-render resources. Keep the previous
    // graph visible while layout runs, then tear it down immediately before
    // rebuilding the runtime around the new data.
    this.teardownRenderRuntime();
    this.layoutNodes = nodes as LayoutNode[];

    const layoutDirection =
      ((layout?.rankdir ?? layout?.direction) as ('TB' | 'LR' | 'BT' | 'RL') | undefined) ?? 'TB';
    const polylineRouter = edge?.style?.router ?? 'orth';

    // Analyze configs for static style optimization (enables fast path)
    analyzeNodeConfig(node, themeTokens);
    analyzeEdgeConfig(edge, themeTokens);

    // Initialize DataModel
    this.dataModel = new DataModel({
      nodeConfig: node,
      edgeConfig: edge,
      theme: themeTokens,
      layoutDirection,
      layoutType: layout?.type,
      polylineRouter,
    });

    // Populate DataModel with initial data (pass arrays directly, no map/copy)
    this.dataModel.replaceData(
      nodes as Array<{
        id: string;
        name?: string;
        x: number;
        y: number;
        data?: Record<string, unknown>;
        states?: ElementState[];
      }>,
      data.edges as Array<{
        id?: string;
        source: string;
        target: string;
        data?: Record<string, unknown>;
        states?: ElementState[];
      }>,
    );
    if (data.combos?.length) {
      this.dataModel.initCombos(data.combos, data.nodes);
    }
    this.applyTransforms();
    // Clear the dataReplaced change since we'll do a full process immediately
    this.dataModel.getChanges();

    // Repoint layoutNodes at the DataModel's node objects so the original
    // post-layout array can be GC'd — one shared set of objects, not three.
    this.layoutNodes = this.dataModel.getNodes() as unknown as LayoutNode[];

    // Feed the Renderer the DataModel's own node/edge objects so there is a
    // single shared set of element objects instead of two parallel copies.
    // The renderer references (does not clone) these arrays; in-place mutation
    // in patchPositions keeps both views consistent.
    this.renderer.setData({
      nodes: this.dataModel.getNodes() as unknown as LayoutNode[],
      edges: this.dataModel.getEdges() as unknown as GraphEdge[],
      nodeConfig: node,
      edgeConfig: edge,
      theme: themeTokens,
      layoutType: layout?.type,
      layoutDirection,
      polylineRouter,
    });

    // Initialize RenderScheduler
    this.scheduler = new RenderScheduler(this.renderer, this.dataModel);

    // Mount the interaction dispatcher (single source of pointer hit-testing
    // and element event dispatch) before behaviors, so behaviors consume its
    // events rather than doing their own picking.
    this.interactionTeardown = attachInteraction(this.renderer, this);

    const resolvedBehaviors = resolveBehaviorOptions(behaviors);
    const behaviorTeardown = resolvedBehaviors.length
      ? registerBehaviors(this.renderer, resolvedBehaviors, this)
      : null;
    if (!this.isGenerationCurrent(generation)) {
      behaviorTeardown?.();
      return;
    }
    this.behaviorTeardown = behaviorTeardown;

    // Initialize combo renderer (Canvas2D underlay for combo backgrounds)
    if (this.dataModel.hasCombos()) {
      this.ensureComboRenderer();
      this.dataModel.updateComboBounds((combo) => this.getComboStylePadding(combo));
    }

    // Initialize label renderer (Canvas2D overlay for labels and icons)
    this.labelRenderer = new LabelLayerRenderer(this.containerEl, this.canvas);
    this.labelRenderer.setScheduleRedraw(() => this.renderer.scheduleRender());
    this.renderer.onAfterDraw(() => {
      this.labelRenderer?.draw(
        this.renderer.getNodes(),
        this.renderer.getEdges(),
        this.renderer.getCamera(),
        this.options.node,
        this.options.edge,
        this.renderer.getNodeIdToIndex(),
        this.renderer.getEdgePathCache(),
        this.dataModel?.theme,
        (id) => this.renderer.getNodeDimensions(id),
      );
    });

    this.eventEmitter.emit('beforerender', {
      nodeCount: nodes.length,
      edgeCount: data.edges.length,
    });
    if (!this.isGenerationCurrent(generation)) return;

    // Auto fit view
    this.fitView();

    // Ensure first render completes synchronously so the canvas is painted
    // after render() returns. Subsequent resizes use scheduleRender (deferred).
    this.renderer.draw();
    if (!this.isGenerationCurrent(generation)) return;

    // Emit afterrender event on first render completion
    this.eventEmitter.emit('afterrender', {
      nodeCount: nodes.length,
      edgeCount: data.edges.length,
    });
    if (!this.isGenerationCurrent(generation)) return;

    // Capture initial camera after first fit
    if (!this.initialCamera) {
      const cam = this.renderer.getCamera();
      this.initialCamera = { x: cam.x, y: cam.y, zoom: cam.zoom };
    }

    // Seed last-observed size so the immediate ResizeObserver callback on .observe()
    // is filtered out when the container hasn't actually resized.
    let lastObservedW = this.containerEl.clientWidth || 800;
    let lastObservedH = this.containerEl.clientHeight || 600;
    this.resizeObserver = new ResizeObserver(() => {
      const w = this.containerEl.clientWidth || 800;
      const h = this.containerEl.clientHeight || 600;
      if (w === lastObservedW && h === lastObservedH) return;
      lastObservedW = w;
      lastObservedH = h;
      this.renderer.resize(w, h);
      this.eventEmitter.emit('resize', { width: w, height: h });
    });
    this.resizeObserver.observe(this.containerEl);

    this.initialized = true;
    this.mountPlugins(generation);
    return undefined;
  }

  destroy(): void {
    if (this._destroyed) return;
    this._destroyed = true;
    this.layoutGeneration++;
    this.layoutAbortController?.abort();
    this.layoutAbortController = null;
    this.eventEmitter.emit('destroy');
    this.teardownRenderRuntime();
    for (const { name, extension } of this.transformInstances.values()) {
      destroyExtension('transform', name, extension);
    }
    this.transformInstances.clear();
    this.renderer.destroy();
    this.canvas.remove();
    this.eventEmitter.removeAllListeners();
  }

  // ──── Camera ────

  /** Get a snapshot of the current camera. Use setCamera() to update it. */
  getCamera(): Camera {
    return { ...this.renderer.getCamera() };
  }

  setCamera(partial: Partial<Camera>): void {
    if (this._destroyed) return;
    this.renderer.setCamera(partial);
    const rect = this.containerEl.getBoundingClientRect();
    this.renderer.resize(rect.width || 800, rect.height || 600);
  }

  resetCamera(): void {
    if (this._destroyed) return;
    if (!this.initialCamera) return;
    this.setCamera(this.initialCamera);
  }

  fitView(options: number | FitViewOptions = 0.9): void {
    if (this._destroyed) return;
    const nodes =
      (this.dataModel?.getNodes() as unknown as LayoutNode[] | undefined) ?? this.layoutNodes;
    if (!nodes.length) return;
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (const n of nodes) {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    }
    const graphW = maxX - minX || 1;
    const graphH = maxY - minY || 1;
    // Use canvas physical pixels (same coordinate space as the shader's u_resolution)
    const viewW =
      this.canvas.width || (this.containerEl.clientWidth || 800) * (window.devicePixelRatio ?? 1);
    const viewH =
      this.canvas.height || (this.containerEl.clientHeight || 600) * (window.devicePixelRatio ?? 1);
    const dpr = Math.min(2, window.devicePixelRatio ?? 1);
    const legacyScale = typeof options === 'number' ? options : 1;
    const padding = typeof options === 'number' ? 0 : (options.padding ?? 0);
    const [pt, pr, pb, pl] = Array.isArray(padding)
      ? padding
      : [padding, padding, padding, padding];
    const availableW = Math.max(1, viewW - (pl + pr) * dpr);
    const availableH = Math.max(1, viewH - (pt + pb) * dpr);
    const scaleX = availableW / graphW;
    const scaleY = availableH / graphH;
    const rawZoom = Math.min(scaleX, scaleY) * legacyScale;
    const minZoom = typeof options === 'number' ? 0.1 : (options.minZoom ?? 0.1);
    const maxZoom = typeof options === 'number' ? 20 : (options.maxZoom ?? 20);
    const zoom = Math.max(minZoom, Math.min(maxZoom, rawZoom));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const targetX = (pl * dpr + availableW / 2) / zoom;
    const targetY = (pt * dpr + availableH / 2) / zoom;
    const camX = targetX - centerX;
    const camY = targetY - centerY;
    this.renderer.setCamera({ zoom, x: camX, y: camY });
  }

  setSize(width: number, height: number): void {
    if (this._destroyed) return;
    this.renderer.resize(width, height);
    this.eventEmitter.emit('resize', { width, height });
  }

  getZoom(): number {
    return this.renderer.getCamera().zoom;
  }

  zoomTo(zoom: number, options: ZoomOptions = {}): void {
    if (this._destroyed) return;
    const minZoom = options.minZoom ?? 0.1;
    const maxZoom = options.maxZoom ?? 20;
    const nextZoom = Math.max(minZoom, Math.min(maxZoom, zoom));
    const rect = this.canvas.getBoundingClientRect();
    const center = options.center ?? {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    const graphPoint = this.screenToGraph(center.x, center.y);
    const scaleX = rect.width > 0 ? this.canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? this.canvas.height / rect.height : 1;
    const px = (center.x - rect.left) * scaleX;
    const py = (center.y - rect.top) * scaleY;
    this.renderer.setCamera({
      zoom: nextZoom,
      x: px / nextZoom - graphPoint.x,
      y: py / nextZoom - graphPoint.y,
    });
  }

  zoomBy(ratio: number, options?: ZoomOptions): void {
    if (this._destroyed) return;
    this.zoomTo(this.getZoom() * ratio, options);
  }

  fitCenter(): void {
    if (this._destroyed) return;
    const nodes =
      (this.dataModel?.getNodes() as unknown as LayoutNode[] | undefined) ?? this.layoutNodes;
    if (nodes.length === 0) return;
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (const node of nodes) {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
    }
    const zoom = this.getZoom();
    const viewW = this.canvas.width || 800;
    const viewH = this.canvas.height || 600;
    this.renderer.setCamera({
      x: viewW / (2 * zoom) - (minX + maxX) / 2,
      y: viewH / (2 * zoom) - (minY + maxY) / 2,
    });
  }

  // ──── Data queries ────

  /** @internal Layout runtime snapshot used by engine integrations. */
  getLayoutNodes(): LayoutNode[] {
    return (
      (this.dataModel?.getNodes() as unknown as LayoutNode[] | undefined) ?? this.layoutNodes
    ).slice();
  }

  getData(): GraphData {
    return this.dataModel?.toData() ?? snapshotGraphData(this.options.data);
  }

  /** @deprecated Use getData(). */
  toData(): GraphData {
    return this.getData();
  }

  /** @internal DOM canvas access is not part of the stable Graph contract. */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /** Get all read-only normalized node views. */
  getNodes(): readonly NodeModel[] {
    return this.dataModel?.getNodes() ?? [];
  }

  /** Get all read-only normalized edge views. */
  getEdges(): readonly EdgeModel[] {
    return this.dataModel?.getEdges() ?? [];
  }

  /** @internal Renderer index lookup. */
  getNodeIndex(id: string): number {
    const nodes = this.renderer.getNodes();
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id) return i;
    }
    return -1;
  }

  // ──── P0: Expose existing Renderer capabilities ────

  /** @internal Low-level picking used by the interaction dispatcher. */
  pickAt(screenX: number, screenY: number): PickResult | null {
    if (this._destroyed) return null;
    const result = this.renderer.pickAt(screenX, screenY);
    if (!result) return null;
    if (result.type === 'node') {
      return { type: 'node', id: result.id };
    }
    const edges = this.renderer.getEdges();
    const edge = edges[result.index];
    if (!edge) return null;
    const edgeId = (edge as { id?: string }).id ?? String(result.index);
    return {
      type: 'edge',
      id: edgeId,
      edgeIndex: result.index,
      source: edge.source,
      target: edge.target,
    };
  }

  /** @internal Renderer highlight transport used by built-in behaviors. */
  setHighlight(option: { nodeIds?: Set<string>; edgeIndices?: Set<number> }): void {
    if (this._destroyed) return;
    this.renderer.setHighlight({
      nodeIds: option.nodeIds ?? new Set(),
      edgeIndices: option.edgeIndices ?? new Set(),
    });
  }

  /** @internal Renderer highlight transport used by built-in behaviors. */
  clearHighlight(): void {
    if (this._destroyed) return;
    this.renderer.setHighlight({ nodeIds: new Set(), edgeIndices: new Set() });
  }

  /** @internal Direct RendererData replacement; use Graph data APIs instead. */
  updateData(renderData: RendererData): void {
    if (this._destroyed) return;
    this.renderer.updateData(renderData);
    const rect = this.containerEl.getBoundingClientRect();
    this.renderer.resize(rect.width || 800, rect.height || 600);
  }

  /** Convert client viewport CSS coordinates to graph coordinates. */
  screenToGraph(screenX: number, screenY: number): { x: number; y: number } {
    if (this._destroyed) return { x: 0, y: 0 };
    const [gx, gy] = this.renderer.screenToGraph(screenX, screenY);
    return { x: gx, y: gy };
  }

  /** Convert graph coordinates to client viewport CSS coordinates. */
  graphToScreen(graphX: number, graphY: number): { x: number; y: number } {
    if (this._destroyed) return { x: 0, y: 0 };
    const rect = this.canvas.getBoundingClientRect();
    const cam = this.renderer.getCamera();
    const scaleX = rect.width > 0 ? this.canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? this.canvas.height / rect.height : 1;
    const px = (graphX + cam.x) * cam.zoom;
    const py = (graphY + cam.y) * cam.zoom;
    return { x: px / scaleX + rect.left, y: py / scaleY + rect.top };
  }

  /** @internal Render scheduling is exposed to extensions through ExtensionContext. */
  scheduleRender(): void {
    if (this._destroyed) return;
    this.renderer.scheduleRender();
  }

  // ──── P1: Incremental data operations ────

  private ensureInitialized(): boolean {
    if (this._destroyed) return false;
    if (!this.initialized || !this.dataModel || !this.scheduler) {
      throw new Error(
        'Graph must be rendered before calling data operations. Call render() first.',
      );
    }
    return true;
  }

  /**
   * Add a single node. Triggers partial process on next frame.
   * The node must have a unique id and x,y coordinates.
   */
  addNode(node: { id: string; x: number; y: number; data?: Record<string, unknown> }): void {
    if (!this.ensureInitialized()) return;
    this.dataModel!.addNode(node);
    this.scheduler!.schedule();
    this.eventEmitter.emit('afteradditem', { type: 'node', id: node.id });
  }

  /**
   * Add multiple nodes in one batch. More efficient than calling addNode repeatedly
   * because it triggers a single render.
   */
  addNodes(
    nodes: Array<{ id: string; x: number; y: number; data?: Record<string, unknown> }>,
  ): void {
    if (!this.ensureInitialized()) return;
    this.dataModel!.addNodes(nodes);
    this.scheduler!.schedule();
    for (const n of nodes) {
      this.eventEmitter.emit('afteradditem', { type: 'node', id: n.id });
    }
  }

  /**
   * Remove a node and all its connected edges. Triggers partial process on next frame.
   */
  removeNode(id: string): void {
    if (!this.ensureInitialized()) return;
    this.dataModel!.removeNode(id);
    this.applyTransforms();
    this.scheduler!.schedule();
    this.eventEmitter.emit('afterremoveitem', { type: 'node', id });
  }

  /**
   * Remove multiple nodes and their connected edges in one batch.
   */
  removeNodes(ids: string[]): void {
    if (!this.ensureInitialized()) return;
    this.dataModel!.removeNodes(ids);
    this.applyTransforms();
    this.scheduler!.schedule();
    for (const id of ids) {
      this.eventEmitter.emit('afterremoveitem', { type: 'node', id });
    }
  }

  /**
   * Update a node's position. Triggers position patch on next frame —
   * much cheaper than full process since it only patches the position floats
   * in the GPU buffer.
   */
  updateNodePosition(id: string, x: number, y: number): void {
    if (!this.ensureInitialized()) return;
    this.dataModel!.updateNodePosition(id, x, y);
    this.scheduler!.schedule();
    this.eventEmitter.emit('afterupdateitem', { type: 'node', id, action: 'position' });
  }

  updateNodePositions(updates: NodePositionUpdate[]): void {
    if (!this.ensureInitialized()) return;
    const ids = this.dataModel!.updateNodePositions(updates);
    this.scheduler!.schedule();
    for (const id of ids) {
      this.eventEmitter.emit('afterupdateitem', { type: 'node', id, action: 'position' });
    }
  }

  /**
   * Update a node's custom data. May affect style if the style function depends on data.
   * Triggers partial process on next frame.
   */
  updateNodeData(id: string, data: Record<string, unknown>): void;
  updateNodeData(updates: NodeDataUpdate[]): void;
  updateNodeData(idOrUpdates: string | NodeDataUpdate[], data?: Record<string, unknown>): void {
    if (!this.ensureInitialized()) return;
    const updates =
      typeof idOrUpdates === 'string' ? [{ id: idOrUpdates, data: data ?? {} }] : idOrUpdates;
    const ids = this.dataModel!.updateNodeDataBatch(updates);
    this.scheduler!.schedule();
    for (const id of ids) {
      this.eventEmitter.emit('afterupdateitem', { type: 'node', id, action: 'data' });
    }
  }

  updateEdgeData(id: string, data: Record<string, unknown>): void;
  updateEdgeData(updates: EdgeDataUpdate[]): void;
  updateEdgeData(idOrUpdates: string | EdgeDataUpdate[], data?: Record<string, unknown>): void {
    if (!this.ensureInitialized()) return;
    const updates =
      typeof idOrUpdates === 'string' ? [{ id: idOrUpdates, data: data ?? {} }] : idOrUpdates;
    const ids = this.dataModel!.updateEdgeDataBatch(updates);
    this.applyTransforms();
    this.scheduler!.schedule();
    for (const id of ids) {
      this.eventEmitter.emit('afterupdateitem', { type: 'edge', id, action: 'data' });
    }
  }

  /**
   * Add an edge between two existing nodes. Returns the auto-generated edge ID.
   */
  addEdge(edge: {
    id?: string;
    source: string;
    target: string;
    data?: Record<string, unknown>;
    states?: ElementState[];
  }): string {
    if (!this.ensureInitialized()) return '';
    const id = this.dataModel!.addEdge(edge);
    this.applyTransforms();
    this.scheduler!.schedule();
    this.eventEmitter.emit('afteradditem', {
      type: 'edge',
      id,
      source: edge.source,
      target: edge.target,
    });
    return id;
  }

  /**
   * Add multiple edges in one batch. Returns the auto-generated edge IDs.
   */
  addEdges(
    edges: Array<{
      id?: string;
      source: string;
      target: string;
      data?: Record<string, unknown>;
      states?: ElementState[];
    }>,
  ): string[] {
    if (!this.ensureInitialized()) return [];
    const ids = this.dataModel!.addEdges(edges);
    this.applyTransforms();
    this.scheduler!.schedule();
    for (let i = 0; i < ids.length; i++) {
      this.eventEmitter.emit('afteradditem', {
        type: 'edge',
        id: ids[i],
        source: edges[i].source,
        target: edges[i].target,
      });
    }
    return ids;
  }

  /**
   * Remove an edge by its auto-generated ID.
   */
  removeEdge(id: string): void {
    if (!this.ensureInitialized()) return;
    this.dataModel!.removeEdge(id);
    this.applyTransforms();
    this.scheduler!.schedule();
    this.eventEmitter.emit('afterremoveitem', { type: 'edge', id });
  }

  /**
   * Remove multiple edges by their IDs.
   */
  removeEdges(ids: string[]): void {
    if (!this.ensureInitialized()) return;
    this.dataModel!.removeEdges(ids);
    this.applyTransforms();
    this.scheduler!.schedule();
    for (const id of ids) {
      this.eventEmitter.emit('afterremoveitem', { type: 'edge', id });
    }
  }

  // ──── P1: State management ────

  /**
   * Set a state (e.g. 'active', 'selected', 'highlight') on a node or edge.
   * The state affects the visual style if stateStyles are configured in node/edge config.
   * Triggers partial process on next frame to re-resolve styles.
   */
  setItemState(id: string, state: ElementState, value: boolean): void {
    if (!this.ensureInitialized()) return;
    // Try node first, then edge
    if (this.dataModel!.hasNode(id)) {
      this.dataModel!.setNodeState(id, state, value);
      this.scheduler!.schedule();
      return;
    }
    if (this.dataModel!.hasEdge(id)) {
      this.dataModel!.setEdgeState(id, state, value);
      this.scheduler!.schedule();
      return;
    }
    if (this.dataModel!.hasCombo(id)) {
      this.dataModel!.setComboState(id, state, value);
      this.renderer.scheduleRender();
    }
  }

  /**
   * Clear all states on a node or edge.
   */
  clearItemStates(id: string): void {
    if (!this.ensureInitialized()) return;
    if (this.dataModel!.hasNode(id)) {
      this.dataModel!.clearNodeStates(id);
      this.scheduler!.schedule();
      return;
    }
    if (this.dataModel!.hasEdge(id)) {
      this.dataModel!.clearEdgeStates(id);
      this.scheduler!.schedule();
      return;
    }
    if (this.dataModel!.hasCombo(id)) {
      this.dataModel!.clearComboStates(id);
      this.renderer.scheduleRender();
    }
  }

  /**
   * Get all neighbor node IDs of a given node.
   */
  getNeighborNodes(nodeId: string): string[] {
    if (!this.dataModel) return [];
    return this.dataModel.getNeighborNodes(nodeId);
  }

  /**
   * Get all edges connected to a given node.
   */
  getAdjacentEdges(nodeId: string): Array<{ id: string; source: string; target: string }> {
    if (!this.dataModel) return [];
    return this.dataModel
      .getAdjacentEdges(nodeId)
      .map((e) => ({ id: e.id, source: e.source, target: e.target }));
  }

  /**
   * Check if a node exists in the graph.
   */
  hasNode(id: string): boolean {
    return this.dataModel?.hasNode(id) ?? false;
  }

  hasEdge(id: string): boolean {
    return this.dataModel?.hasEdge(id) ?? false;
  }

  hasElement(id: string): boolean {
    return Boolean(
      this.dataModel?.hasNode(id) || this.dataModel?.hasEdge(id) || this.dataModel?.hasCombo(id),
    );
  }

  /** Get a read-only normalized element model by ID. */
  getElementData(id: string): ElementModel | undefined {
    return (
      this.dataModel?.getNode(id) ?? this.dataModel?.getEdge(id) ?? this.dataModel?.getCombo(id)
    );
  }

  getElementPosition(id: string): { x: number; y: number } | null {
    const node = this.dataModel?.getNode(id);
    if (node) return { x: node.x, y: node.y };
    const combo = this.dataModel?.getCombo(id);
    return combo ? { x: combo.x, y: combo.y } : null;
  }

  /**
   * Get the total number of nodes.
   */
  getNodeCount(): number {
    return this.dataModel?.getNodeCount() ?? 0;
  }

  /**
   * Get the total number of edges.
   */
  getEdgeCount(): number {
    return this.dataModel?.getEdgeCount() ?? 0;
  }

  // ──── Batch state queries (P3) ────

  /**
   * Find all node IDs that have the given state.
   * Example: graph.findNodesByState('selected') → ['node1', 'node3']
   */
  findNodesByState(state: ElementState): string[] {
    if (!this.dataModel) return [];
    return this.dataModel.findNodesByState(state);
  }

  /**
   * Find all edge IDs that have the given state.
   * Example: graph.findEdgesByState('active') → ['e0', 'e5']
   */
  findEdgesByState(state: ElementState): string[] {
    if (!this.dataModel) return [];
    return this.dataModel.findEdgesByState(state);
  }

  /**
   * Find all combo IDs that have the given state.
   */
  findCombosByState(state: ElementState): string[] {
    if (!this.dataModel) return [];
    return this.dataModel.findCombosByState(state);
  }

  /**
   * Get a node's current position. Returns null if node not found.
   */
  getNodePosition(id: string): { x: number; y: number } | null {
    const node = this.dataModel?.getNode(id);
    if (!node) return null;
    return { x: node.x, y: node.y };
  }

  /**
   * Force a full re-render. Use sparingly — the scheduler handles this automatically.
   */
  refresh(): void {
    if (this._destroyed) return;
    if (!this.scheduler) return;
    this.scheduler.forceFlush(RefreshLevel.FULL_PROCESS);
  }

  // ──── Event system ────

  /** Subscribe to an event. */
  on(event: string, handler: (...args: any[]) => void): void {
    if (this._destroyed) return;
    this.eventEmitter.on(event, handler);
  }

  /** Unsubscribe from an event. */
  off(event: string, handler: (...args: any[]) => void): void {
    this.eventEmitter.off(event, handler);
  }

  /** Subscribe to an event once. */
  once(event: string, handler: (...args: any[]) => void): void {
    if (this._destroyed) return;
    this.eventEmitter.once(event, handler);
  }

  // ──── P0: Runtime data/layout/options ────

  /**
   * Replace all graph data at runtime. Runs layout if configured, then triggers full re-render.
   */
  async setData(data: GraphData, options: SetDataOptions = {}): Promise<void> {
    if (this._destroyed) return;
    if (!this.ensureInitialized()) return;
    const generation = ++this.layoutGeneration;
    data = this.applyRegisteredTransforms(data, generation);
    if (!this.isGenerationCurrent(generation)) return;
    let nodes = data.nodes.map((n) => ({ ...n, x: n.x ?? 0, y: n.y ?? 0 }));
    const layout = this.options.layout;
    if (layout && data.nodes.length > 0) {
      this.eventEmitter.emit('beforelayout', { nodeCount: data.nodes.length });
      this.eventEmitter.emit('layout:start', { nodeCount: data.nodes.length });
      if (!this.isGenerationCurrent(generation)) return;
      const t0 = performance.now();
      const result = await this.executeLayout(data, layout);
      if (!this.isGenerationCurrent(generation)) return;
      const duration = performance.now() - t0;
      this.eventEmitter.emit('layout:end', { duration, nodeCount: data.nodes.length });
      this.eventEmitter.emit('afterlayout', { duration, nodeCount: data.nodes.length });
      if (!this.isGenerationCurrent(generation)) return;
      nodes = applyFixedPositions(result.nodes, data.nodes);
    }
    this.layoutNodes = nodes as LayoutNode[];
    this.dataModel!.replaceData(nodes as any[], data.edges as any[]);
    this.layoutNodes = this.dataModel!.getNodes() as unknown as LayoutNode[];
    if (data.combos?.length) {
      this.dataModel!.initCombos(data.combos, data.nodes);
      this.ensureComboRenderer();
    }
    this.applyTransforms();
    this.options.data = data;
    if (options.fitView !== false) {
      this.fitView(
        options.fitView === true || options.fitView === undefined ? 0.9 : options.fitView,
      );
    }
    this.scheduler!.schedule();
    this.eventEmitter.emit('datachange', {
      nodeCount: nodes.length,
      edgeCount: data.edges.length,
    });
  }

  /**
   * Update visual configuration (node/edge styles, theme) at runtime.
   * Triggers a full re-process to apply new styles.
   */
  updateOptions(opts: Partial<Pick<GraphOptions, 'node' | 'edge' | 'theme'>>): void {
    if (!this.ensureInitialized()) return;
    if (opts.node) {
      const previousStyle = this.options.node?.style;
      const nextStyle = opts.node.style;
      const mergedStyle =
        nextStyle === undefined
          ? previousStyle
          : typeof nextStyle === 'function' || typeof previousStyle === 'function'
            ? nextStyle
            : { ...previousStyle, ...nextStyle };
      this.options.node = {
        ...this.options.node,
        ...opts.node,
        style: mergedStyle,
      };
    }
    if (opts.edge) {
      this.options.edge = {
        ...this.options.edge,
        ...opts.edge,
        style: { ...this.options.edge?.style, ...opts.edge.style },
      };
    }
    if (opts.theme) this.options.theme = opts.theme;
    const themeTokens = resolveTheme((this.options.theme as ThemeOption) ?? 'light');
    this.dataModel!.nodeConfig = this.options.node;
    this.dataModel!.edgeConfig = this.options.edge;
    this.dataModel!.theme = themeTokens;
    analyzeNodeConfig(this.options.node, themeTokens);
    analyzeEdgeConfig(this.options.edge, themeTokens);
    this.applyTransforms();
    this.scheduler!.forceFlush(RefreshLevel.FULL_PROCESS);
  }

  /**
   * Set the layout configuration. Does not execute layout — call layout() after.
   */
  setLayout(config: LayoutConfig): void {
    if (this._destroyed) return;
    this.options.layout = config;
  }

  /**
   * Execute the current layout algorithm and update node positions.
   */
  async layout(): Promise<void> {
    if (this._destroyed) return;
    if (!this.ensureInitialized()) return;
    const generation = ++this.layoutGeneration;
    const layout = this.options.layout;
    if (!layout) return;
    const data = this.getData();
    if (data.nodes.length === 0) return;
    this.eventEmitter.emit('beforelayout', { nodeCount: data.nodes.length });
    this.eventEmitter.emit('layout:start', { nodeCount: data.nodes.length });
    if (!this.isGenerationCurrent(generation)) return;
    const t0 = performance.now();
    const result = await this.executeLayout(data, layout);
    if (!this.isGenerationCurrent(generation)) return;
    const duration = performance.now() - t0;
    this.eventEmitter.emit('layout:end', { duration, nodeCount: data.nodes.length });
    this.eventEmitter.emit('afterlayout', { duration, nodeCount: data.nodes.length });
    if (!this.isGenerationCurrent(generation)) return;
    const nodes = applyFixedPositions(result.nodes, data.nodes);
    this.layoutNodes = nodes as LayoutNode[];
    this.dataModel!.replaceData(nodes as any[], data.edges as any[]);
    this.layoutNodes = this.dataModel!.getNodes() as unknown as LayoutNode[];
    if (data.combos?.length) {
      this.dataModel!.initCombos(data.combos, data.nodes);
      this.ensureComboRenderer();
    }
    this.applyTransforms();
    this.scheduler!.schedule();
  }

  cancelLayout(): void {
    if (this._destroyed) return;
    this.layoutGeneration++;
    this.layoutAbortController?.abort();
    this.layoutAbortController = null;
  }

  /** Get a read-only normalized node model by ID. O(1) lookup. */
  getNodeData(id: string): NodeModel | undefined {
    return this.dataModel?.getNode(id);
  }

  /** Get a read-only normalized edge model by ID. O(1) lookup. */
  getEdgeData(id: string): EdgeModel | undefined {
    return this.dataModel?.getEdge(id);
  }

  // ──── P1: Batch state, visibility, focus ────

  /**
   * Set states on multiple items in a single batch, triggering only one render.
   */
  batchSetState(items: Array<{ id: string; state: ElementState; value: boolean }>): void {
    if (!this.ensureInitialized()) return;
    let comboChanged = false;
    for (const { id, state, value } of items) {
      if (this.dataModel!.hasNode(id)) {
        this.dataModel!.setNodeState(id, state, value);
      } else if (this.dataModel!.hasEdge(id)) {
        this.dataModel!.setEdgeState(id, state, value);
      } else if (this.dataModel!.hasCombo(id)) {
        const had = this.dataModel!.getCombo(id)!.states.has(state);
        this.dataModel!.setComboState(id, state, value);
        if (had !== value) comboChanged = true;
      }
    }
    const dataChanged = this.dataModel!.hasChanges();
    if (dataChanged) {
      this.scheduler!.schedule();
    } else if (comboChanged) {
      this.renderer.scheduleRender();
    }
  }

  setElementStates(id: string, states: ElementState[]): void;
  setElementStates(stateMap: Record<string, ElementState[]>): void;
  setElementStates(
    idOrMap: string | Record<string, ElementState[]>,
    states?: ElementState[],
  ): void {
    if (!this.ensureInitialized()) return;
    const entries =
      typeof idOrMap === 'string' ? [[idOrMap, states ?? []] as const] : Object.entries(idOrMap);
    let comboChanged = false;
    for (const [id, nextStates] of entries) {
      if (this.dataModel!.replaceNodeStates(id, nextStates)) continue;
      if (this.dataModel!.replaceEdgeStates(id, nextStates)) continue;
      if (this.dataModel!.hasCombo(id)) {
        this.dataModel!.clearComboStates(id);
        for (const state of nextStates) {
          if (state !== 'default') this.dataModel!.setComboState(id, state, true);
        }
        comboChanged = true;
      }
    }
    const dataChanged = this.dataModel!.hasChanges();
    if (dataChanged) {
      this.scheduler!.schedule();
    } else if (comboChanged) {
      this.renderer.scheduleRender();
    }
  }

  /**
   * Get all active states on a node or edge.
   */
  getItemStates(id: string): ElementState[] {
    if (!this.dataModel) return [];
    const node = this.dataModel.getNode(id);
    if (node) return Array.from(node.states);
    const edge = this.dataModel.getEdge(id);
    if (edge) return Array.from(edge.states);
    const combo = this.dataModel.getCombo(id);
    if (combo) return Array.from(combo.states);
    return [];
  }

  /**
   * Hide a node or edge (sets opacity to 0 via 'hidden' state).
   */
  hideItem(id: string): void {
    this.setItemState(id, 'hidden', true);
  }

  /**
   * Show a previously hidden node or edge.
   */
  showItem(id: string): void {
    this.setItemState(id, 'hidden', false);
  }

  /**
   * Move the viewport to center on the specified node(s) without changing zoom.
   * The padding parameter remains in the beta-compatible signature but does
   * not alter the current center-only behavior.
   */
  focusItem(id: string | string[], padding = 20): void {
    if (this._destroyed || !this.dataModel) return;
    const ids = Array.isArray(id) ? id : [id];
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (const nodeId of ids) {
      const node = this.dataModel.getNode(nodeId);
      if (!node) continue;
      if (node.x < minX) minX = node.x;
      if (node.x > maxX) maxX = node.x;
      if (node.y < minY) minY = node.y;
      if (node.y > maxY) maxY = node.y;
    }
    if (minX === Infinity) return;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const viewW = this.canvas.width || this.containerEl.clientWidth || 800;
    const viewH = this.canvas.height || this.containerEl.clientHeight || 600;
    const cam = this.renderer.getCamera();
    void padding;
    this.renderer.setCamera({
      x: viewW / (2 * cam.zoom) - centerX,
      y: viewH / (2 * cam.zoom) - centerY,
    });
  }

  // ──── Combo operations ────

  collapseCombo(comboId: string): void {
    if (this._destroyed || !this.dataModel) return;
    const combo = this.dataModel.getCombo(comboId);
    if (!combo || combo.collapsed) return;
    this.dataModel.setComboCollapsed(comboId, true);
    this.dataModel.applyComboHidden(this.dataModel.getComboAllNodeIds(comboId));
    if (this.dataModel.hasChanges() && this.scheduler) {
      this.scheduler.schedule();
    } else {
      this.renderer.scheduleRender();
    }
    this.eventEmitter.emit('combo:collapse', { comboId });
  }

  expandCombo(comboId: string): void {
    if (this._destroyed || !this.dataModel) return;
    const combo = this.dataModel.getCombo(comboId);
    if (!combo || !combo.collapsed) return;
    this.dataModel.setComboCollapsed(comboId, false);
    this.dataModel.releaseComboHidden(this.dataModel.getComboAllNodeIds(comboId));
    if (this.dataModel.hasChanges() && this.scheduler) {
      this.scheduler.schedule();
    } else {
      this.renderer.scheduleRender();
    }
    this.eventEmitter.emit('combo:expand', { comboId });
  }

  toggleCombo(comboId: string): void {
    if (this._destroyed || !this.dataModel) return;
    const combo = this.dataModel.getCombo(comboId);
    if (!combo) return;
    if (combo.collapsed) {
      this.expandCombo(comboId);
    } else {
      this.collapseCombo(comboId);
    }
  }

  /** Get a read-only normalized combo model by ID. */
  getComboData(id: string): ComboModel | undefined {
    return this.dataModel?.getCombo(id);
  }

  setComboState(comboId: string, state: ElementState, value: boolean): void {
    if (this._destroyed || !this.dataModel) return;
    this.dataModel.setComboState(comboId, state, value);
    this.renderer.scheduleRender();
  }

  clearComboStates(comboId: string): void {
    if (this._destroyed || !this.dataModel) return;
    this.dataModel.clearComboStates(comboId);
    this.renderer.scheduleRender();
  }

  getComboStates(comboId: string): ElementState[] {
    const combo = this.dataModel?.getCombo(comboId);
    return combo ? Array.from(combo.states) : [];
  }

  getComboChildren(id: string): { nodes: string[]; combos: string[] } {
    const combo = this.dataModel?.getCombo(id);
    if (!combo) return { nodes: [], combos: [] };
    return {
      nodes: Array.from(combo.childNodeIds),
      combos: Array.from(combo.childComboIds),
    };
  }

  getNodeCombo(nodeId: string): string | undefined {
    return this.dataModel?.getNodeCombo(nodeId);
  }

  addToCombo(nodeId: string, comboId: string): void {
    if (this._destroyed || !this.dataModel) return;
    const oldComboId = this.dataModel.getNodeCombo(nodeId);
    if (oldComboId) {
      this.dataModel.releaseComboHidden([nodeId], this.getCollapsedAncestorCount(oldComboId));
    }
    this.dataModel.setNodeCombo(nodeId, comboId);
    this.dataModel.applyComboHidden([nodeId], this.getCollapsedAncestorCount(comboId));
    this.scheduler?.schedule();
    this.renderer.scheduleRender();
  }

  removeFromCombo(nodeId: string): void {
    if (this._destroyed || !this.dataModel) return;
    const oldComboId = this.dataModel.getNodeCombo(nodeId);
    if (oldComboId) {
      this.dataModel.releaseComboHidden([nodeId], this.getCollapsedAncestorCount(oldComboId));
    }
    this.dataModel.setNodeCombo(nodeId, undefined);
    this.scheduler?.schedule();
    this.renderer.scheduleRender();
  }

  createCombo(combo: ComboData, childNodeIds?: string[]): void {
    if (this._destroyed || !this.dataModel) return;
    this.dataModel.addCombo(combo);
    if (childNodeIds) {
      for (const nodeId of childNodeIds) {
        this.dataModel.setNodeCombo(nodeId, combo.id);
      }
    }
    const collapsedAncestorCount = this.getCollapsedAncestorCount(combo.id);
    if (collapsedAncestorCount > 0 && childNodeIds?.length) {
      this.dataModel.applyComboHidden(childNodeIds, collapsedAncestorCount);
    }
    // Initialize combo renderer if first combo
    this.ensureComboRenderer();
    this.scheduler?.schedule();
    this.renderer.scheduleRender();
  }

  removeCombo(comboId: string): void {
    if (this._destroyed || !this.dataModel) return;
    const hiddenDepth = this.getCollapsedAncestorCount(comboId);
    if (hiddenDepth > 0) {
      this.dataModel.releaseComboHidden(this.dataModel.getComboAllNodeIds(comboId), hiddenDepth);
    }
    this.dataModel.removeCombo(comboId);
    this.scheduler?.schedule();
    this.renderer.scheduleRender();
  }

  /** @internal Low-level combo picking used by the interaction dispatcher. */
  pickComboAt(screenX: number, screenY: number): string | null {
    if (this._destroyed || !this.comboRenderer || !this.dataModel?.hasCombos()) return null;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const x = (screenX - rect.left) * dpr;
    const y = (screenY - rect.top) * dpr;
    const w = this.canvas.width;
    const h = this.canvas.height;
    return this.comboRenderer.pickAt(
      x,
      y,
      this.dataModel.getCombos(),
      this.renderer.getCamera(),
      w,
      h,
      this.options.combo,
    );
  }

  private ensureComboRenderer(): void {
    if (!this.comboRenderer) {
      this.comboRenderer = new ComboRenderer(this.containerEl, this.canvas);
    }
    if (this.comboBeforeDrawRegistered) return;
    this.comboBeforeDrawRegistered = true;
    this.renderer.onBeforeDraw(() => {
      if (!this.comboRenderer || !this.dataModel) return;
      this.dataModel.updateComboBounds((combo) => this.getComboStylePadding(combo));
      this.comboRenderer.draw(
        this.dataModel.getCombos(),
        this.renderer.getCamera(),
        this.options.combo,
      );
    });
  }

  private getCollapsedAncestorCount(comboId: string): number {
    if (!this.dataModel) return 0;
    let count = 0;
    let current = this.dataModel.getCombo(comboId);
    const visited = new Set<string>();
    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      if (current.collapsed) count++;
      current = current.parentId ? this.dataModel.getCombo(current.parentId) : undefined;
    }
    return count;
  }

  private getComboStylePadding(combo?: InternalCombo): number {
    const p = combo?.style?.padding ?? this.options.combo?.style?.padding;
    if (typeof p === 'number') return p;
    if (Array.isArray(p)) return Math.max(...p);
    return 20;
  }
}

function resolveContainer(container: string | HTMLElement): HTMLElement {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el || !(el instanceof HTMLElement)) throw new Error('Invalid container');
  return el;
}

function ensureCanvas(container: HTMLElement): HTMLCanvasElement {
  let canvas = container.querySelector('canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);
  }
  return canvas;
}

function applyFixedPositions(
  layoutNodes: Array<{ id: string; x: number; y: number }>,
  sourceNodes: GraphData['nodes'],
): LayoutNode[] {
  const sourceById = new Map(sourceNodes.map((node) => [node.id, node]));
  return layoutNodes.map((node) => {
    const source = sourceById.get(node.id);
    return {
      ...source,
      ...node,
      x: source?.fx ?? node.x,
      y: source?.fy ?? node.y,
    } as LayoutNode;
  });
}

function snapshotGraphData(data: GraphData): GraphData {
  const snapshot: GraphData = {
    nodes: data.nodes.map((node) => ({
      ...node,
      data: node.data ? { ...node.data } : undefined,
      states: node.states ? [...node.states] : undefined,
    })),
    edges: data.edges.map((edge) => ({
      ...edge,
      data: edge.data ? { ...edge.data } : undefined,
      states: edge.states ? [...edge.states] : undefined,
    })),
  };
  if (data.combos) {
    snapshot.combos = data.combos.map((combo) => ({
      ...combo,
      style: combo.style ? { ...combo.style } : undefined,
      data: combo.data ? { ...combo.data } : undefined,
      states: combo.states ? [...combo.states] : undefined,
    }));
  }
  return snapshot;
}
