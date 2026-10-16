/** Graph lifecycle, public API, layout orchestration, and render runtime ownership. */

import { registerBehaviors, resolveBehaviorOptions } from './behaviors/index';
import { DataModel } from './dataModel';
import { EventEmitter } from './events';
import type { Handler } from './events';
import type { PluginExtension, TransformExtension } from './extensions/contracts';
import {
  createExtension,
  createExtensionContext,
  destroyExtension,
  initializeExtension,
  safeExtensionCall,
  updateExtension,
} from './extensions/registry';
import { attachInteraction } from './interaction/dispatcher';
import { runLayout } from './layout/index';
import type { Camera } from './renderer/camera';
import { ComboRenderer } from './renderer/comboRenderer';
import { LabelLayerRenderer } from './renderer/labelRenderer';
import { createRendererData, getRendererNodes } from './renderer/renderData';
import type { RendererData } from './renderer/renderer';
import { Renderer } from './renderer/renderer';
import { analyzeEdgeConfig, analyzeNodeConfig } from './renderer/style';
import { RefreshLevel, RenderScheduler } from './scheduler';
import { resolveTheme } from './theme';
import {
  processParallelEdges,
  resolveParallelEdgesConfig,
} from './transforms/processParallelEdges';
import type {
  ComboData,
  ComboModel,
  EdgeDataUpdate,
  EdgeModel,
  ElementModel,
  ElementState,
  FitViewOptions,
  GraphData,
  GraphEventMap,
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
} from './types';

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

interface GraphRuntime {
  dataModel: DataModel;
  scheduler: RenderScheduler;
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

  // ──── Lifecycle ────

  constructor(options: GraphOptions) {
    this.options = options;
    this.containerEl = resolveContainer(options.container);
    this.canvas = ensureCanvas(this.containerEl);
    this.renderer = new Renderer(this.canvas);
    if (options.zoomRange) this.renderer.setZoomRange(options.zoomRange.min, options.zoomRange.max);
  }

  get destroyed(): boolean {
    return this._destroyed;
  }

  /** @deprecated Use the `destroyed` property. */
  isDestroyed(): boolean {
    return this._destroyed;
  }

  async render(): Promise<void> {
    if (this._destroyed) return;
    const generation = ++this.layoutGeneration;
    const data = this.applyRegisteredTransforms(this.options.data, generation);
    if (!this.isGenerationCurrent(generation)) return;
    const theme = resolveTheme((this.options.theme as ThemeOption) ?? 'light');
    this.prepareCanvas(theme);
    const nodes = await this.runConfiguredLayout(data, generation);
    if (!nodes || !this.isGenerationCurrent(generation)) return;

    this.teardownRenderRuntime();
    analyzeNodeConfig(this.options.node, theme);
    analyzeEdgeConfig(this.options.edge, theme);
    const dataModel = this.createDataModel(theme);
    this.dataModel = dataModel;
    this.replaceRuntimeData(dataModel, data, nodes, true);
    this.renderer.setData(createRendererData(dataModel));
    this.scheduler = new RenderScheduler(this.renderer, dataModel);
    if (!this.mountInteractionRuntime(generation)) return;
    this.mountOverlayRuntime(dataModel);

    this.eventEmitter.emit('beforerender', {
      nodeCount: nodes.length,
      edgeCount: data.edges.length,
    });
    if (!this.isGenerationCurrent(generation)) return;

    this.fitView();
    this.renderer.draw();
    if (!this.isGenerationCurrent(generation)) return;

    this.eventEmitter.emit('afterrender', {
      nodeCount: nodes.length,
      edgeCount: data.edges.length,
    });
    if (!this.isGenerationCurrent(generation)) return;

    if (!this.initialCamera) {
      const cam = this.renderer.getCamera();
      this.initialCamera = { x: cam.x, y: cam.y, zoom: cam.zoom };
    }

    this.observeContainerResize();
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

  // ──── Data replacement and configuration ────

  getData(): GraphData {
    return this.dataModel?.toData() ?? snapshotGraphData(this.options.data);
  }

  /** @deprecated Use getData(). */
  toData(): GraphData {
    return this.getData();
  }

  /**
   * Replace all graph data at runtime. Runs layout if configured, then triggers full re-render.
   */
  async setData(data: GraphData, options: SetDataOptions = {}): Promise<void> {
    const runtime = this.getRuntime();
    if (!runtime) return;
    const generation = ++this.layoutGeneration;
    data = this.applyRegisteredTransforms(data, generation);
    if (!this.isGenerationCurrent(generation)) return;
    const nodes = await this.runConfiguredLayout(data, generation);
    if (!nodes || !this.isGenerationCurrent(generation)) return;
    this.replaceRuntimeData(runtime.dataModel, data, nodes);
    if (runtime.dataModel.hasCombos()) this.ensureComboRenderer();
    this.options.data = data;
    if (options.fitView !== false) {
      this.fitView(
        options.fitView === true || options.fitView === undefined ? 0.9 : options.fitView,
      );
    }
    runtime.scheduler.schedule();
    this.eventEmitter.emit('datachange', {
      nodeCount: nodes.length,
      edgeCount: data.edges.length,
    });
  }

  /** Update node, edge, label, and theme visual options, then fully re-process styles. */
  updateOptions(opts: Partial<Pick<GraphOptions, 'node' | 'edge' | 'label' | 'theme'>>): void {
    const runtime = this.getRuntime();
    if (!runtime) return;
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
    if (opts.label) {
      this.options.label = { ...this.options.label, ...opts.label };
    }
    if (opts.theme) this.options.theme = opts.theme;
    const themeTokens = resolveTheme((this.options.theme as ThemeOption) ?? 'light');
    runtime.dataModel.nodeConfig = this.options.node;
    runtime.dataModel.edgeConfig = this.options.edge;
    runtime.dataModel.theme = themeTokens;
    analyzeNodeConfig(this.options.node, themeTokens);
    analyzeEdgeConfig(this.options.edge, themeTokens);
    this.applyTransforms();
    runtime.scheduler.forceFlush(RefreshLevel.FULL_PROCESS);
  }

  /**
   * Force a full re-render. Use sparingly — the scheduler handles this automatically.
   */
  refresh(): void {
    if (this._destroyed) return;
    if (!this.scheduler) return;
    this.scheduler.forceFlush(RefreshLevel.FULL_PROCESS);
  }

  // ──── Element queries ────

  /** Get all read-only normalized node views. */
  getNodes(): readonly NodeModel[] {
    return this.dataModel?.getNodes() ?? [];
  }

  /** Get a read-only normalized node model by ID. O(1) lookup. */
  getNodeData(id: string): NodeModel | undefined {
    return this.dataModel?.getNode(id);
  }

  /** Get all read-only normalized edge views. */
  getEdges(): readonly EdgeModel[] {
    return this.dataModel?.getEdges() ?? [];
  }

  /** Get a read-only normalized edge model by ID. O(1) lookup. */
  getEdgeData(id: string): EdgeModel | undefined {
    return this.dataModel?.getEdge(id);
  }

  /** Get a read-only normalized combo model by ID. */
  getComboData(id: string): ComboModel | undefined {
    return this.dataModel?.getCombo(id);
  }

  /** Get a read-only normalized element model by ID. */
  getElementData(id: string): ElementModel | undefined {
    return (
      this.dataModel?.getNode(id) ?? this.dataModel?.getEdge(id) ?? this.dataModel?.getCombo(id)
    );
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

  /** Get the position of a node or Combo. Edges do not have a single position. */
  getElementPosition(id: string): { x: number; y: number } | null {
    const node = this.dataModel?.getNode(id);
    if (node) return { x: node.x, y: node.y };
    const combo = this.dataModel?.getCombo(id);
    return combo ? { x: combo.x, y: combo.y } : null;
  }

  /** @deprecated Use getElementPosition(). */
  getNodePosition(id: string): { x: number; y: number } | null {
    const node = this.dataModel?.getNode(id);
    if (!node) return null;
    return { x: node.x, y: node.y };
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

  // ──── Node and edge mutations ────

  /**
   * Add a single node. Triggers partial process on next frame.
   * The node must have a unique id and x,y coordinates.
   */
  addNode(node: { id: string; x: number; y: number; data?: Record<string, unknown> }): void {
    const runtime = this.getRuntime();
    if (!runtime) return;
    runtime.dataModel.addNode(node);
    runtime.scheduler.schedule();
    this.eventEmitter.emit('afteradditem', { type: 'node', id: node.id });
  }

  /**
   * Add multiple nodes in one batch. More efficient than calling addNode repeatedly
   * because it triggers a single render.
   */
  addNodes(
    nodes: Array<{ id: string; x: number; y: number; data?: Record<string, unknown> }>,
  ): void {
    const runtime = this.getRuntime();
    if (!runtime) return;
    runtime.dataModel.addNodes(nodes);
    runtime.scheduler.schedule();
    for (const n of nodes) {
      this.eventEmitter.emit('afteradditem', { type: 'node', id: n.id });
    }
  }

  /**
   * Update a node's position. Triggers position patch on next frame —
   * much cheaper than full process since it only patches the position floats
   * in the GPU buffer.
   */
  updateNodePosition(id: string, x: number, y: number): void {
    const runtime = this.getRuntime();
    if (!runtime) return;
    runtime.dataModel.updateNodePosition(id, x, y);
    runtime.scheduler.schedule();
    this.eventEmitter.emit('afterupdateitem', { type: 'node', id, action: 'position' });
  }

  updateNodePositions(updates: NodePositionUpdate[]): void {
    const runtime = this.getRuntime();
    if (!runtime) return;
    const ids = runtime.dataModel.updateNodePositions(updates);
    runtime.scheduler.schedule();
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
    const runtime = this.getRuntime();
    if (!runtime) return;
    const updates =
      typeof idOrUpdates === 'string' ? [{ id: idOrUpdates, data: data ?? {} }] : idOrUpdates;
    const ids = runtime.dataModel.updateNodeDataBatch(updates);
    runtime.scheduler.schedule();
    for (const id of ids) {
      this.eventEmitter.emit('afterupdateitem', { type: 'node', id, action: 'data' });
    }
  }

  /**
   * Remove a node and all its connected edges. Triggers partial process on next frame.
   */
  removeNode(id: string): void {
    const runtime = this.getRuntime();
    if (!runtime) return;
    runtime.dataModel.removeNode(id);
    this.applyTransforms();
    runtime.scheduler.schedule();
    this.eventEmitter.emit('afterremoveitem', { type: 'node', id });
  }

  /**
   * Remove multiple nodes and their connected edges in one batch.
   */
  removeNodes(ids: string[]): void {
    const runtime = this.getRuntime();
    if (!runtime) return;
    runtime.dataModel.removeNodes(ids);
    this.applyTransforms();
    runtime.scheduler.schedule();
    for (const id of ids) {
      this.eventEmitter.emit('afterremoveitem', { type: 'node', id });
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
    const runtime = this.getRuntime();
    if (!runtime) return '';
    const id = runtime.dataModel.addEdge(edge);
    this.applyTransforms();
    runtime.scheduler.schedule();
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
    const runtime = this.getRuntime();
    if (!runtime) return [];
    const ids = runtime.dataModel.addEdges(edges);
    this.applyTransforms();
    runtime.scheduler.schedule();
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

  updateEdgeData(id: string, data: Record<string, unknown>): void;

  updateEdgeData(updates: EdgeDataUpdate[]): void;

  updateEdgeData(idOrUpdates: string | EdgeDataUpdate[], data?: Record<string, unknown>): void {
    const runtime = this.getRuntime();
    if (!runtime) return;
    const updates =
      typeof idOrUpdates === 'string' ? [{ id: idOrUpdates, data: data ?? {} }] : idOrUpdates;
    const ids = runtime.dataModel.updateEdgeDataBatch(updates);
    this.applyTransforms();
    runtime.scheduler.schedule();
    for (const id of ids) {
      this.eventEmitter.emit('afterupdateitem', { type: 'edge', id, action: 'data' });
    }
  }

  /**
   * Remove an edge by its auto-generated ID.
   */
  removeEdge(id: string): void {
    const runtime = this.getRuntime();
    if (!runtime) return;
    runtime.dataModel.removeEdge(id);
    this.applyTransforms();
    runtime.scheduler.schedule();
    this.eventEmitter.emit('afterremoveitem', { type: 'edge', id });
  }

  /**
   * Remove multiple edges by their IDs.
   */
  removeEdges(ids: string[]): void {
    const runtime = this.getRuntime();
    if (!runtime) return;
    runtime.dataModel.removeEdges(ids);
    this.applyTransforms();
    runtime.scheduler.schedule();
    for (const id of ids) {
      this.eventEmitter.emit('afterremoveitem', { type: 'edge', id });
    }
  }

  // ──── Element state, visibility, and focus ────

  /** Set or clear one state on a node, edge, or Combo. */
  setItemState(id: string, state: ElementState, value: boolean): void {
    const runtime = this.getRuntime();
    if (!runtime) return;
    if (runtime.dataModel.hasNode(id)) {
      runtime.dataModel.setNodeState(id, state, value);
      runtime.scheduler.schedule();
      return;
    }
    if (runtime.dataModel.hasEdge(id)) {
      runtime.dataModel.setEdgeState(id, state, value);
      runtime.scheduler.schedule();
      return;
    }
    if (runtime.dataModel.hasCombo(id)) {
      runtime.dataModel.setComboState(id, state, value);
      this.renderer.scheduleRender();
    }
  }

  /** Clear all states on a node, edge, or Combo. */
  clearItemStates(id: string): void {
    const runtime = this.getRuntime();
    if (!runtime) return;
    if (runtime.dataModel.hasNode(id)) {
      runtime.dataModel.clearNodeStates(id);
      runtime.scheduler.schedule();
      return;
    }
    if (runtime.dataModel.hasEdge(id)) {
      runtime.dataModel.clearEdgeStates(id);
      runtime.scheduler.schedule();
      return;
    }
    if (runtime.dataModel.hasCombo(id)) {
      runtime.dataModel.clearComboStates(id);
      this.renderer.scheduleRender();
    }
  }

  /**
   * Set states on multiple items in a single batch, triggering only one render.
   */
  batchSetState(items: Array<{ id: string; state: ElementState; value: boolean }>): void {
    const runtime = this.getRuntime();
    if (!runtime) return;
    let comboChanged = false;
    for (const { id, state, value } of items) {
      if (runtime.dataModel.hasNode(id)) {
        runtime.dataModel.setNodeState(id, state, value);
      } else if (runtime.dataModel.hasEdge(id)) {
        runtime.dataModel.setEdgeState(id, state, value);
      } else if (runtime.dataModel.hasCombo(id)) {
        const had = runtime.dataModel.getCombo(id)?.states.has(state) ?? false;
        runtime.dataModel.setComboState(id, state, value);
        if (had !== value) comboChanged = true;
      }
    }
    const dataChanged = runtime.dataModel.hasChanges();
    if (dataChanged) {
      runtime.scheduler.schedule();
    } else if (comboChanged) {
      this.renderer.scheduleRender();
    }
  }

  /** Replace the complete state set of one or more nodes, edges, or Combos. */
  setElementStates(id: string, states: ElementState[]): void;

  setElementStates(stateMap: Record<string, ElementState[]>): void;

  setElementStates(
    idOrMap: string | Record<string, ElementState[]>,
    states?: ElementState[],
  ): void {
    const runtime = this.getRuntime();
    if (!runtime) return;
    const entries =
      typeof idOrMap === 'string' ? [[idOrMap, states ?? []] as const] : Object.entries(idOrMap);
    let comboChanged = false;
    for (const [id, nextStates] of entries) {
      if (runtime.dataModel.replaceNodeStates(id, nextStates)) continue;
      if (runtime.dataModel.replaceEdgeStates(id, nextStates)) continue;
      if (runtime.dataModel.hasCombo(id)) {
        runtime.dataModel.clearComboStates(id);
        for (const state of nextStates) {
          if (state !== 'default') runtime.dataModel.setComboState(id, state, true);
        }
        comboChanged = true;
      }
    }
    const dataChanged = runtime.dataModel.hasChanges();
    if (dataChanged) {
      runtime.scheduler.schedule();
    } else if (comboChanged) {
      this.renderer.scheduleRender();
    }
  }

  /** Get all active states on a node, edge, or Combo. */
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

  /** Hide a node, edge, or Combo through the `hidden` state. */
  hideItem(id: string): void {
    this.setItemState(id, 'hidden', true);
  }

  /** Show a previously hidden node, edge, or Combo. */
  showItem(id: string): void {
    this.setItemState(id, 'hidden', false);
  }

  /**
   * Center the viewport on one or more nodes. The current zoom is preserved when
   * the targets fit; otherwise the viewport zooms out just enough to honor padding.
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
    const dpr = Math.min(2, window.devicePixelRatio ?? 1);
    const viewW = this.canvas.width || (this.containerEl.clientWidth || 800) * dpr;
    const viewH = this.canvas.height || (this.containerEl.clientHeight || 600) * dpr;
    const paddingPx = Math.max(0, padding) * dpr;
    const availableW = Math.max(1, viewW - paddingPx * 2);
    const availableH = Math.max(1, viewH - paddingPx * 2);
    const graphW = maxX - minX;
    const graphH = maxY - minY;
    const cam = this.renderer.getCamera();
    const fitZoom = Math.min(
      graphW > 0 ? availableW / graphW : Infinity,
      graphH > 0 ? availableH / graphH : Infinity,
    );
    const zoom = Math.min(cam.zoom, fitZoom);
    const camera: Partial<Camera> = {
      x: viewW / (2 * zoom) - centerX,
      y: viewH / (2 * zoom) - centerY,
    };
    if (zoom < cam.zoom) camera.zoom = zoom;
    this.renderer.setCamera(camera);
  }

  // ──── Combo hierarchy and collapse ────

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

  /** @deprecated Use setItemState(), which supports Combos. */
  setComboState(comboId: string, state: ElementState, value: boolean): void {
    if (this._destroyed || !this.dataModel) return;
    this.dataModel.setComboState(comboId, state, value);
    this.renderer.scheduleRender();
  }

  /** @deprecated Use clearItemStates(), which supports Combos. */
  clearComboStates(comboId: string): void {
    if (this._destroyed || !this.dataModel) return;
    this.dataModel.clearComboStates(comboId);
    this.renderer.scheduleRender();
  }

  /** @deprecated Use getItemStates(), which supports Combos. */
  getComboStates(comboId: string): ElementState[] {
    const combo = this.dataModel?.getCombo(comboId);
    return combo ? Array.from(combo.states) : [];
  }

  // ──── Layout ────

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
    const runtime = this.getRuntime();
    if (!runtime) return;
    const generation = ++this.layoutGeneration;
    if (!this.options.layout) return;
    const data = this.getData();
    if (data.nodes.length === 0) return;
    const nodes = await this.runConfiguredLayout(data, generation);
    if (!nodes || !this.isGenerationCurrent(generation)) return;
    this.replaceRuntimeData(runtime.dataModel, data, nodes);
    if (runtime.dataModel.hasCombos()) this.ensureComboRenderer();
    runtime.scheduler.schedule();
  }

  cancelLayout(): void {
    if (this._destroyed) return;
    this.layoutGeneration++;
    this.layoutAbortController?.abort();
    this.layoutAbortController = null;
  }

  // ──── Viewport and coordinates ────

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

  setSize(width: number, height: number): void {
    if (this._destroyed) return;
    this.resizeViewport(width, height);
  }

  getZoom(): number {
    return this.renderer.getCamera().zoom;
  }

  zoomTo(zoom: number, options: ZoomOptions = {}): void {
    if (this._destroyed) return;
    const range = this.renderer.getZoomRange();
    const minZoom = options.minZoom ?? range.min;
    const maxZoom = options.maxZoom ?? range.max;
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

  fitView(options: number | FitViewOptions = 0.9): void {
    if (this._destroyed) return;
    const nodes = this.getCurrentLayoutNodes();
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
    const range = this.renderer.getZoomRange();
    const minZoom = typeof options === 'number' ? range.min : (options.minZoom ?? range.min);
    const maxZoom = typeof options === 'number' ? range.max : (options.maxZoom ?? range.max);
    const zoom = Math.max(minZoom, Math.min(maxZoom, rawZoom));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const targetX = (pl * dpr + availableW / 2) / zoom;
    const targetY = (pt * dpr + availableH / 2) / zoom;
    const camX = targetX - centerX;
    const camY = targetY - centerY;
    this.renderer.setCamera({ zoom, x: camX, y: camY });
  }

  fitCenter(): void {
    if (this._destroyed) return;
    const nodes = this.getCurrentLayoutNodes();
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

  // ──── Events ────

  /** Subscribe to an event. */
  on<K extends keyof GraphEventMap>(event: K, handler: Handler<GraphEventMap[K]>): void;
  on<Args extends unknown[]>(event: string, handler: Handler<Args>): void;
  on(event: string, handler: Handler<never[]>): void {
    if (this._destroyed) return;
    this.eventEmitter.on(event, handler);
  }

  /** Unsubscribe from an event. */
  off<K extends keyof GraphEventMap>(event: K, handler: Handler<GraphEventMap[K]>): void;
  off<Args extends unknown[]>(event: string, handler: Handler<Args>): void;
  off(event: string, handler: Handler<never[]>): void {
    this.eventEmitter.off(event, handler);
  }

  /** Subscribe to an event once. */
  once<K extends keyof GraphEventMap>(event: K, handler: Handler<GraphEventMap[K]>): void;
  once<Args extends unknown[]>(event: string, handler: Handler<Args>): void;
  once(event: string, handler: Handler<never[]>): void {
    if (this._destroyed) return;
    this.eventEmitter.once(event, handler);
  }

  // ──── Internal integration bridge ────

  /** @internal Layout runtime snapshot used by engine integrations. */
  getLayoutNodes(): LayoutNode[] {
    return this.getCurrentLayoutNodes().slice();
  }

  /** @internal DOM canvas access is not part of the stable Graph contract. */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /** @internal Renderer index lookup. */
  getNodeIndex(id: string): number {
    const nodes = this.renderer.getNodes();
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id) return i;
    }
    return -1;
  }

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

  /** @internal Render scheduling is exposed to extensions through ExtensionContext. */
  scheduleRender(): void {
    if (this._destroyed) return;
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

  // ──── Private runtime helpers ────

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
    processParallelEdges(this.dataModel.getEdges(), config);
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
      const extension = record.extension;
      const beforeRender = extension.beforeRender;
      if (!beforeRender) continue;
      transformed = safeExtensionCall(
        'transform',
        name,
        'beforeRender',
        () => beforeRender.call(extension, transformed),
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

  private prepareCanvas(theme: ReturnType<typeof resolveTheme>): void {
    const { width, height } = this.getViewport();
    this.renderer.resize(width, height);
    this.renderer.clearWithTheme(theme);
  }

  private resolveEffectiveLayout(nodeCount: number): LayoutConfig | undefined {
    const layout = this.options.layout;
    if (!layout) return undefined;
    return layout.worker === undefined && nodeCount >= 1000
      ? { ...layout, worker: true }
      : { ...layout };
  }

  private getCurrentLayoutNodes(): LayoutNode[] {
    return this.dataModel ? getRendererNodes(this.dataModel.getNodes()) : this.layoutNodes;
  }

  private async runConfiguredLayout(
    data: GraphData,
    generation: number,
  ): Promise<LayoutNode[] | null> {
    const fallbackNodes = data.nodes.map((node) => ({
      ...node,
      x: node.x ?? 0,
      y: node.y ?? 0,
    })) as LayoutNode[];
    const layout = this.resolveEffectiveLayout(data.nodes.length);
    if (!layout || data.nodes.length === 0) return fallbackNodes;

    this.eventEmitter.emit('beforelayout', { nodeCount: data.nodes.length });
    this.eventEmitter.emit('layout:start', { nodeCount: data.nodes.length });
    if (!this.isGenerationCurrent(generation)) return null;
    const startedAt = performance.now();
    const result = await this.executeLayout(data, layout);
    if (!this.isGenerationCurrent(generation)) return null;
    const duration = performance.now() - startedAt;
    this.eventEmitter.emit('layout:end', { duration, nodeCount: data.nodes.length });
    this.eventEmitter.emit('afterlayout', { duration, nodeCount: data.nodes.length });
    if (!this.isGenerationCurrent(generation)) return null;
    return applyFixedPositions(result.nodes, data.nodes);
  }

  private replaceRuntimeData(
    dataModel: DataModel,
    data: GraphData,
    nodes: LayoutNode[],
    consumeInitialChange = false,
  ): void {
    dataModel.replaceData(nodes, data.edges);
    if (data.combos?.length) dataModel.initCombos(data.combos, data.nodes);
    this.applyTransforms();
    if (consumeInitialChange) dataModel.getChanges();
    this.layoutNodes = getRendererNodes(dataModel.getNodes());
  }

  private createDataModel(theme: ReturnType<typeof resolveTheme>): DataModel {
    const { node, edge, layout } = this.options;
    const layoutDirection =
      ((layout?.rankdir ?? layout?.direction) as ('TB' | 'LR' | 'BT' | 'RL') | undefined) ?? 'TB';
    return new DataModel({
      nodeConfig: node,
      edgeConfig: edge,
      theme,
      layoutDirection,
      layoutType: layout?.type,
      polylineRouter: edge?.style?.router ?? 'orth',
    });
  }

  private mountInteractionRuntime(generation: number): boolean {
    this.interactionTeardown = attachInteraction(this.renderer, this);
    const behaviors = resolveBehaviorOptions(this.options.behaviors);
    const teardown = behaviors.length ? registerBehaviors(this.renderer, behaviors, this) : null;
    if (!this.isGenerationCurrent(generation)) {
      teardown?.();
      return false;
    }
    this.behaviorTeardown = teardown;
    return true;
  }

  private mountOverlayRuntime(dataModel: DataModel): void {
    if (dataModel.hasCombos()) {
      this.ensureComboRenderer();
      dataModel.updateComboBounds((combo) => this.getComboStylePadding(combo));
    }

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
        this.options.label,
      );
    });
  }

  private observeContainerResize(): void {
    let { width: lastWidth, height: lastHeight } = this.getViewport();
    this.resizeObserver = new ResizeObserver(() => {
      const { width, height } = this.getViewport();
      if (width === lastWidth && height === lastHeight) return;
      lastWidth = width;
      lastHeight = height;
      this.resizeViewport(width, height);
    });
    this.resizeObserver.observe(this.containerEl);
  }

  private resizeViewport(width: number, height: number): void {
    this.renderer.resize(width, height);
    const autoFit = this.options.autoFitOnResize;
    if (autoFit !== undefined && autoFit !== false) {
      this.fitView(autoFit === true ? 0.9 : autoFit);
    }
    this.eventEmitter.emit('resize', { width, height });
  }

  private getRuntime(): GraphRuntime | null {
    if (this._destroyed) return null;
    if (!this.initialized || !this.dataModel || !this.scheduler) {
      throw new Error(
        'Graph must be rendered before calling data operations. Call render() first.',
      );
    }
    return { dataModel: this.dataModel, scheduler: this.scheduler };
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
