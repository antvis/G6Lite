/**
 * Graph: main entry. Creates container canvas, runs layout, renders with WebGL, registers behaviors.
 * P1: Now backed by DataModel for incremental data operations and RenderScheduler for optimal refresh.
 * P4: EventEmitter for interaction events, GPU-picking behaviors, drag-node support.
 */

import { registerBehaviors } from './behaviors/index.js';
import type { InternalEdge, InternalNode } from './dataModel.js';
import { DataModel } from './dataModel.js';
import { EventEmitter } from './events.js';
import { attachInteraction } from './interaction/dispatcher.js';
import { runLayout } from './layout/index.js';
import { terminateLayoutWorker } from './layout/workerLayout.js';
import type { Camera } from './renderer/camera.js';
import { ComboRenderer } from './renderer/comboRenderer.js';
import { LabelRenderer } from './renderer/labelRenderer.js';
import type { RendererData } from './renderer/renderer.js';
import { Renderer } from './renderer/renderer.js';
import { analyzeEdgeConfig, analyzeNodeConfig } from './renderer/style.js';
import { RefreshLevel, RenderScheduler } from './scheduler.js';
import { resolveTheme } from './theme.js';
import type {
  ComboData,
  ElementState,
  GraphData,
  GraphEdge,
  GraphOptions,
  InternalCombo,
  LayoutConfig,
  LayoutNode,
  ThemeOption,
} from './types.js';

/** Result of a pick operation at screen coordinates. */
export interface PickResult {
  type: 'node' | 'edge';
  /** Node ID (when type is 'node') or edge index (when type is 'edge'). */
  id: string;
  /** For edge results, the source and target node IDs. */
  source?: string;
  target?: string;
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
  private resizeObserver: ResizeObserver | null = null;
  private layoutNodes: LayoutNode[] = [];
  private initialCamera: Camera | null = null;
  private labelRenderer: LabelRenderer | null = null;
  private comboRenderer: ComboRenderer | null = null;
  /** Whether render() has been called at least once. */
  private initialized = false;

  /** Event emitter for interaction events (node:click, node:hover, node:drag, etc.) */
  readonly eventEmitter = new EventEmitter();

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

  async render(): Promise<void> {
    const { data, node, edge, layout, behaviors, theme } = this.options;
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
      // Auto-enable worker for large graphs unless explicitly disabled
      if (layout.worker === undefined && data.nodes.length >= 1000) {
        layout.worker = true;
      }

      this.eventEmitter.emit('layout:start', { nodeCount: data.nodes.length });
      const t0 = performance.now();
      const result = await runLayout(data, layout, this.getViewport());
      const duration = performance.now() - t0;
      this.eventEmitter.emit('layout:end', { duration, nodeCount: data.nodes.length });
      nodes = result.nodes;
    }
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
        x: number;
        y: number;
        data?: Record<string, unknown>;
        states?: ElementState[];
      }>,
      data.edges as Array<{
        source: string;
        target: string;
        data?: Record<string, unknown>;
        states?: ElementState[];
      }>,
    );
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

    // Initialize combos if present
    if (data.combos?.length) {
      this.dataModel.initCombos(data.combos, data.nodes);
    }

    // Initialize RenderScheduler
    this.scheduler = new RenderScheduler(this.renderer, this.dataModel);

    // Mount the interaction dispatcher (single source of pointer hit-testing
    // and element event dispatch) before behaviors, so behaviors consume its
    // events rather than doing their own picking.
    this.interactionTeardown?.();
    this.interactionTeardown = attachInteraction(this.renderer, this);

    if (behaviors?.length) {
      this.behaviorTeardown?.();
      this.behaviorTeardown = registerBehaviors(this.renderer, behaviors, this);
    }

    // Initialize combo renderer (Canvas2D underlay for combo backgrounds)
    if (this.dataModel.hasCombos()) {
      this.comboRenderer = new ComboRenderer(this.containerEl, this.canvas);
      this.dataModel.updateComboBounds(this.getComboStylePadding());
      this.renderer.onBeforeDraw(() => {
        if (this.comboRenderer && this.dataModel?.hasCombos()) {
          this.dataModel.updateComboBounds(this.getComboStylePadding());
          this.comboRenderer.draw(
            this.dataModel.getCombos(),
            this.renderer.getCamera(),
            this.options.combo,
          );
        }
      });
    }

    // Initialize label renderer (Canvas2D overlay for labels and icons)
    this.labelRenderer = new LabelRenderer(this.containerEl, this.canvas);
    this.labelRenderer.setScheduleRedraw(() => this.renderer.scheduleRender());
    this.renderer.onAfterDraw(() => {
      this.labelRenderer?.draw(
        this.renderer.getNodes(),
        this.renderer.getEdges(),
        this.renderer.getCamera(),
        this.options.node,
        this.options.edge,
        this.renderer.getNodeIdToIndex(),
      );
    });

    // Auto fit view
    this.fitView();

    // Ensure first render completes synchronously so the canvas is painted
    // after render() returns. Subsequent resizes use scheduleRender (deferred).
    this.renderer.draw();

    // Emit afterrender event on first render completion
    this.eventEmitter.emit('afterrender', {
      nodeCount: nodes.length,
      edgeCount: data.edges.length,
    });

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
    return undefined;
  }

  destroy(): void {
    this.eventEmitter.emit('destroy');
    this.behaviorTeardown?.();
    this.interactionTeardown?.();
    this.resizeObserver?.disconnect();
    this.scheduler?.destroy();
    this.labelRenderer?.destroy();
    this.comboRenderer?.destroy();
    this.renderer.destroy();
    terminateLayoutWorker();
    this.canvas.remove();
  }

  // ──── Camera ────

  getCamera(): Camera {
    return this.renderer.getCamera();
  }

  setCamera(partial: Partial<Camera>): void {
    this.renderer.setCamera(partial);
    const rect = this.containerEl.getBoundingClientRect();
    this.renderer.resize(rect.width || 800, rect.height || 600);
  }

  resetCamera(): void {
    if (!this.initialCamera) return;
    this.setCamera(this.initialCamera);
  }

  fitView(padding = 0.9): void {
    const nodes = this.layoutNodes;
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
    const scaleX = viewW / graphW;
    const scaleY = viewH / graphH;
    const zoom = Math.min(scaleX, scaleY) * padding;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const camX = viewW / (2 * zoom) - centerX;
    const camY = viewH / (2 * zoom) - centerY;
    this.renderer.setCamera({ zoom, x: camX, y: camY });
  }

  // ──── Data queries ────

  getLayoutNodes(): LayoutNode[] {
    return this.layoutNodes.slice();
  }

  getData(): GraphData {
    return this.options.data;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getNodes(): LayoutNode[] {
    return this.renderer.getNodes();
  }

  getEdges(): GraphEdge[] {
    return this.renderer.getEdges();
  }

  getNodeIndex(id: string): number {
    const nodes = this.renderer.getNodes();
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id) return i;
    }
    return -1;
  }

  // ──── P0: Expose existing Renderer capabilities ────

  pickAt(screenX: number, screenY: number): PickResult | null {
    const result = this.renderer.pickAt(screenX, screenY);
    if (!result) return null;
    if (result.type === 'node') {
      return { type: 'node', id: result.id };
    }
    const edges = this.renderer.getEdges();
    const edge = edges[result.index];
    if (!edge) return null;
    return { type: 'edge', id: String(result.index), source: edge.source, target: edge.target };
  }

  setHighlight(option: { nodeIds?: Set<string>; edgeIndices?: Set<number> }): void {
    this.renderer.setHighlight({
      nodeIds: option.nodeIds ?? new Set(),
      edgeIndices: option.edgeIndices ?? new Set(),
    });
  }

  clearHighlight(): void {
    this.renderer.setHighlight({ nodeIds: new Set(), edgeIndices: new Set() });
  }

  updateData(renderData: RendererData): void {
    this.renderer.updateData(renderData);
    const rect = this.containerEl.getBoundingClientRect();
    this.renderer.resize(rect.width || 800, rect.height || 600);
  }

  screenToGraph(screenX: number, screenY: number): { x: number; y: number } {
    const [gx, gy] = this.renderer.screenToGraph(screenX, screenY);
    return { x: gx, y: gy };
  }

  graphToScreen(graphX: number, graphY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const cam = this.renderer.getCamera();
    const dpr = Math.min(2, window.devicePixelRatio ?? 1);
    const px = (graphX + cam.x) * cam.zoom;
    const py = (graphY + cam.y) * cam.zoom;
    return { x: px / dpr + rect.left, y: py / dpr + rect.top };
  }

  scheduleRender(): void {
    this.renderer.scheduleRender();
  }

  // ──── P1: Incremental data operations ────

  private ensureInitialized(): void {
    if (!this.initialized || !this.dataModel || !this.scheduler) {
      throw new Error(
        'Graph must be rendered before calling data operations. Call render() first.',
      );
    }
  }

  /**
   * Add a single node. Triggers partial process on next frame.
   * The node must have a unique id and x,y coordinates.
   */
  addNode(node: { id: string; x: number; y: number; data?: Record<string, unknown> }): void {
    this.ensureInitialized();
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
    this.ensureInitialized();
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
    this.ensureInitialized();
    this.dataModel!.removeNode(id);
    this.scheduler!.schedule();
    this.eventEmitter.emit('afterremoveitem', { type: 'node', id });
  }

  /**
   * Remove multiple nodes and their connected edges in one batch.
   */
  removeNodes(ids: string[]): void {
    this.ensureInitialized();
    this.dataModel!.removeNodes(ids);
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
    this.ensureInitialized();
    this.dataModel!.updateNodePosition(id, x, y);
    this.scheduler!.schedule();
    this.eventEmitter.emit('afterupdateitem', { type: 'node', id, action: 'position' });
  }

  /**
   * Update a node's custom data. May affect style if the style function depends on data.
   * Triggers partial process on next frame.
   */
  updateNodeData(id: string, data: Record<string, unknown>): void {
    this.ensureInitialized();
    this.dataModel!.updateNodeData(id, data);
    this.scheduler!.schedule();
    this.eventEmitter.emit('afterupdateitem', { type: 'node', id, action: 'data' });
  }

  /**
   * Add an edge between two existing nodes. Returns the auto-generated edge ID.
   */
  addEdge(edge: { source: string; target: string; data?: Record<string, unknown> }): string {
    this.ensureInitialized();
    const id = this.dataModel!.addEdge(edge);
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
    edges: Array<{ source: string; target: string; data?: Record<string, unknown> }>,
  ): string[] {
    this.ensureInitialized();
    const ids = this.dataModel!.addEdges(edges);
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
    this.ensureInitialized();
    this.dataModel!.removeEdge(id);
    this.scheduler!.schedule();
    this.eventEmitter.emit('afterremoveitem', { type: 'edge', id });
  }

  /**
   * Remove multiple edges by their IDs.
   */
  removeEdges(ids: string[]): void {
    this.ensureInitialized();
    this.dataModel!.removeEdges(ids);
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
    this.ensureInitialized();
    // Try node first, then edge
    if (this.dataModel!.hasNode(id)) {
      this.dataModel!.setNodeState(id, state, value);
      this.scheduler!.schedule();
      return;
    }
    if (this.dataModel!.hasEdge(id)) {
      this.dataModel!.setEdgeState(id, state, value);
      this.scheduler!.schedule();
    }
  }

  /**
   * Clear all states on a node or edge.
   */
  clearItemStates(id: string): void {
    this.ensureInitialized();
    if (this.dataModel!.hasNode(id)) {
      this.dataModel!.clearNodeStates(id);
      this.scheduler!.schedule();
      return;
    }
    if (this.dataModel!.hasEdge(id)) {
      this.dataModel!.clearEdgeStates(id);
      this.scheduler!.schedule();
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
    if (!this.scheduler) return;
    this.scheduler.forceFlush(RefreshLevel.FULL_PROCESS);
  }

  // ──── Event system ────

  /** Subscribe to an event. */
  on(event: string, handler: (...args: any[]) => void): void {
    this.eventEmitter.on(event, handler);
  }

  /** Unsubscribe from an event. */
  off(event: string, handler: (...args: any[]) => void): void {
    this.eventEmitter.off(event, handler);
  }

  /** Subscribe to an event once. */
  once(event: string, handler: (...args: any[]) => void): void {
    this.eventEmitter.once(event, handler);
  }

  // ──── P0: Runtime data/layout/options ────

  /**
   * Replace all graph data at runtime. Runs layout if configured, then triggers full re-render.
   */
  async setData(data: GraphData): Promise<void> {
    this.ensureInitialized();
    let nodes = data.nodes.map((n) => ({ ...n, x: n.x ?? 0, y: n.y ?? 0 }));
    const layout = this.options.layout;
    if (layout && data.nodes.length > 0) {
      this.eventEmitter.emit('layout:start', { nodeCount: data.nodes.length });
      const t0 = performance.now();
      const result = await runLayout(data, layout, this.getViewport());
      const duration = performance.now() - t0;
      this.eventEmitter.emit('layout:end', { duration, nodeCount: data.nodes.length });
      nodes = result.nodes;
    }
    this.layoutNodes = nodes as LayoutNode[];
    this.dataModel!.replaceData(nodes as any[], data.edges as any[]);
    this.options.data = data;
    this.fitView();
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
    this.ensureInitialized();
    if (opts.node) {
      this.options.node = {
        ...this.options.node,
        ...opts.node,
        style: { ...this.options.node?.style, ...opts.node.style },
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
    this.scheduler!.forceFlush(RefreshLevel.FULL_PROCESS);
  }

  /**
   * Set the layout configuration. Does not execute layout — call layout() after.
   */
  setLayout(config: LayoutConfig): void {
    this.options.layout = config;
  }

  /**
   * Execute the current layout algorithm and update node positions.
   */
  async layout(): Promise<void> {
    this.ensureInitialized();
    const layout = this.options.layout;
    if (!layout) return;
    const data = this.options.data;
    if (data.nodes.length === 0) return;
    this.eventEmitter.emit('layout:start', { nodeCount: data.nodes.length });
    const t0 = performance.now();
    const result = await runLayout(data, layout, this.getViewport());
    const duration = performance.now() - t0;
    this.eventEmitter.emit('layout:end', { duration, nodeCount: data.nodes.length });
    this.layoutNodes = result.nodes as LayoutNode[];
    this.dataModel!.replaceData(result.nodes as any[], data.edges as any[]);
    this.scheduler!.schedule();
  }

  /**
   * Get a single node's internal data by ID. O(1) lookup.
   */
  getNodeData(id: string): InternalNode | undefined {
    return this.dataModel?.getNode(id);
  }

  /**
   * Get a single edge's internal data by ID. O(1) lookup.
   */
  getEdgeData(id: string): InternalEdge | undefined {
    return this.dataModel?.getEdge(id);
  }

  // ──── P1: Batch state, visibility, focus ────

  /**
   * Set states on multiple items in a single batch, triggering only one render.
   */
  batchSetState(items: Array<{ id: string; state: ElementState; value: boolean }>): void {
    this.ensureInitialized();
    for (const { id, state, value } of items) {
      if (this.dataModel!.hasNode(id)) {
        this.dataModel!.setNodeState(id, state, value);
      } else if (this.dataModel!.hasEdge(id)) {
        this.dataModel!.setEdgeState(id, state, value);
      }
    }
    this.scheduler!.schedule();
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
   * Move the viewport to center on the specified node(s).
   */
  focusItem(id: string | string[], padding = 20): void {
    if (!this.dataModel) return;
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
    const viewW = this.containerEl.clientWidth || 800;
    const viewH = this.containerEl.clientHeight || 600;
    const cam = this.renderer.getCamera();
    const camX = viewW / (2 * cam.zoom) - centerX;
    const camY = viewH / (2 * cam.zoom) - centerY;
    this.renderer.setCamera({ x: camX, y: camY });
    this.renderer.scheduleRender();
  }

  // ──── Combo operations ────

  collapseCombo(comboId: string): void {
    if (!this.dataModel) return;
    this.dataModel.setComboCollapsed(comboId, true);
    const nodeIds = this.dataModel.getComboAllNodeIds(comboId);
    for (const id of nodeIds) {
      this.dataModel.setNodeState(id, 'hidden', true);
    }
    this.scheduler?.schedule();
    this.eventEmitter.emit('combo:collapse', { comboId });
  }

  expandCombo(comboId: string): void {
    if (!this.dataModel) return;
    this.dataModel.setComboCollapsed(comboId, false);
    const nodeIds = this.dataModel.getComboAllNodeIds(comboId);
    for (const id of nodeIds) {
      this.dataModel.setNodeState(id, 'hidden', false);
    }
    this.scheduler?.schedule();
    this.eventEmitter.emit('combo:expand', { comboId });
  }

  toggleCombo(comboId: string): void {
    if (!this.dataModel) return;
    const combo = this.dataModel.getCombo(comboId);
    if (!combo) return;
    if (combo.collapsed) {
      this.expandCombo(comboId);
    } else {
      this.collapseCombo(comboId);
    }
  }

  getComboData(id: string): InternalCombo | undefined {
    return this.dataModel?.getCombo(id);
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
    if (!this.dataModel) return;
    this.dataModel.setNodeCombo(nodeId, comboId);
    this.scheduler?.schedule();
  }

  removeFromCombo(nodeId: string): void {
    if (!this.dataModel) return;
    this.dataModel.setNodeCombo(nodeId, undefined);
    this.scheduler?.schedule();
  }

  createCombo(combo: ComboData, childNodeIds?: string[]): void {
    if (!this.dataModel) return;
    this.dataModel.addCombo(combo);
    if (childNodeIds) {
      for (const nodeId of childNodeIds) {
        this.dataModel.setNodeCombo(nodeId, combo.id);
      }
    }
    // Initialize combo renderer if first combo
    if (!this.comboRenderer) {
      this.comboRenderer = new ComboRenderer(this.containerEl, this.canvas);
      this.renderer.onBeforeDraw(() => {
        if (this.comboRenderer && this.dataModel?.hasCombos()) {
          this.dataModel.updateComboBounds(this.getComboStylePadding());
          this.comboRenderer.draw(
            this.dataModel.getCombos(),
            this.renderer.getCamera(),
            this.options.combo,
          );
        }
      });
    }
    this.scheduler?.schedule();
  }

  removeCombo(comboId: string): void {
    if (!this.dataModel) return;
    this.dataModel.removeCombo(comboId);
    this.scheduler?.schedule();
  }

  /** Pick a combo at screen coordinates. Returns combo ID or null. */
  pickComboAt(screenX: number, screenY: number): string | null {
    if (!this.comboRenderer || !this.dataModel?.hasCombos()) return null;
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
    );
  }

  private getComboStylePadding(): number {
    const p = this.options.combo?.style?.padding;
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
