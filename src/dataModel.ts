/**
 * DataModel: manages graph data with change tracking.
 * Optimized: uses Array for storage with lightweight ID-to-index mapping.
 * All mutations record changes that the RenderScheduler consumes
 * to determine the optimal refresh strategy.
 */

import type {
  ComboData,
  EdgeConfig,
  ElementState,
  GraphData,
  GraphEdge,
  GraphNode,
  InternalCombo,
  NodeConfig,
  ParallelEdgeMeta,
  ThemeTokens,
} from './types.js';

/** Internal node model with resolved style cache. */
export interface InternalNode {
  id: string;
  name?: string;
  x: number;
  y: number;
  data?: Record<string, unknown>;
  states: Set<ElementState>;
}

/** Internal edge model with auto-generated ID. */
export interface InternalEdge {
  id: string;
  source: string;
  target: string;
  data?: Record<string, unknown>;
  states: Set<ElementState>;
  parallel?: ParallelEdgeMeta;
}

/** Shared empty Set to avoid per-element allocation when no states are present. */
const EMPTY_SET: Set<ElementState> = new Set<ElementState>();

/** Categories of data changes, used by RenderScheduler to pick refresh strategy. */
export type ChangeType =
  | 'nodeAdded'
  | 'nodeRemoved'
  | 'nodePositionChanged'
  | 'nodeDataChanged'
  | 'nodeStateChanged'
  | 'edgeAdded'
  | 'edgeRemoved'
  | 'edgeDataChanged'
  | 'edgeStateChanged'
  | 'dataReplaced';

export interface ChangeRecord {
  type: ChangeType;
  ids: string[];
}

export interface DataModelOptions {
  nodeConfig?: NodeConfig;
  edgeConfig?: EdgeConfig;
  theme: ThemeTokens;
  layoutDirection?: 'TB' | 'LR' | 'BT' | 'RL';
  layoutType?: string;
  polylineRouter?: 'orth' | 'tree' | 'indented' | 'fishbone';
}

export class DataModel {
  // Use Array for primary storage (more memory efficient than Map)
  private _nodes: InternalNode[] = [];
  private _edges: InternalEdge[] = [];

  // Lightweight ID-to-index mapping (only stores indices, not full objects)
  private _nodeIdToIndex = new Map<string, number>();
  private _edgeIdToIndex = new Map<string, number>();

  private _edgeIdCounter = 0;
  private _changes: ChangeRecord[] = [];

  // Combo storage
  private _combos = new Map<string, InternalCombo>();
  private _nodeToCombo = new Map<string, string>();
  private _comboHiddenDepth = new Map<string, number>();
  private _comboHiddenApplied = new Set<string>();
  private _comboHiddenEdgeDepth = new Map<string, number>();
  private _comboHiddenEdgeApplied = new Set<string>();

  // Config (may be updated via updateData)
  nodeConfig?: NodeConfig;
  edgeConfig?: EdgeConfig;
  theme: ThemeTokens;
  layoutDirection: 'TB' | 'LR' | 'BT' | 'RL';
  layoutType?: string;
  polylineRouter: 'orth' | 'tree' | 'indented' | 'fishbone';

  constructor(options: DataModelOptions) {
    this.nodeConfig = options.nodeConfig;
    this.edgeConfig = options.edgeConfig;
    this.theme = options.theme;
    this.layoutDirection = options.layoutDirection ?? 'TB';
    this.layoutType = options.layoutType;
    this.polylineRouter = options.polylineRouter ?? 'orth';
  }

  // ──── Node operations ────

  addNode(node: {
    id: string;
    name?: string;
    x: number;
    y: number;
    data?: Record<string, unknown>;
  }): void {
    if (this._nodeIdToIndex.has(node.id)) return;
    const index = this._nodes.length;
    this._nodes.push({
      id: node.id,
      name: node.name,
      x: node.x,
      y: node.y,
      data: node.data, // Direct reference, no copy
      states: EMPTY_SET,
    });
    this._nodeIdToIndex.set(node.id, index);
    this._changes.push({ type: 'nodeAdded', ids: [node.id] });
  }

  addNodes(
    nodes: Array<{
      id: string;
      name?: string;
      x: number;
      y: number;
      data?: Record<string, unknown>;
    }>,
  ): void {
    const ids: string[] = [];
    for (const node of nodes) {
      if (this._nodeIdToIndex.has(node.id)) continue;
      const index = this._nodes.length;
      this._nodes.push({
        id: node.id,
        name: node.name,
        x: node.x,
        y: node.y,
        data: node.data, // Direct reference, no copy
        states: EMPTY_SET,
      });
      this._nodeIdToIndex.set(node.id, index);
      ids.push(node.id);
    }
    if (ids.length > 0) this._changes.push({ type: 'nodeAdded', ids });
  }

  removeNode(id: string): void {
    const index = this._nodeIdToIndex.get(id);
    if (index === undefined) return;

    // Find and remove connected edges
    const removedEdgeIds: string[] = [];
    for (let i = this._edges.length - 1; i >= 0; i--) {
      const edge = this._edges[i];
      if (edge.source === id || edge.target === id) {
        removedEdgeIds.push(edge.id);
        this._removeEdgeAt(i);
      }
    }

    // Remove node (swap with last for O(1) removal)
    this._removeNodeAt(index);
    this._changes.push({ type: 'nodeRemoved', ids: [id] });
    if (removedEdgeIds.length > 0) {
      this._changes.push({ type: 'edgeRemoved', ids: removedEdgeIds });
    }
  }

  removeNodes(ids: string[]): void {
    const nodeSet = new Set(ids);
    const removedNodes: string[] = [];
    const removedEdges: string[] = [];

    // Remove connected edges first (iterate backwards for safe removal)
    for (let i = this._edges.length - 1; i >= 0; i--) {
      const edge = this._edges[i];
      if (nodeSet.has(edge.source) || nodeSet.has(edge.target)) {
        removedEdges.push(edge.id);
        this._removeEdgeAt(i);
      }
    }

    // Remove nodes (iterate backwards for safe removal)
    for (let i = this._nodes.length - 1; i >= 0; i--) {
      const node = this._nodes[i];
      if (nodeSet.has(node.id)) {
        removedNodes.push(node.id);
        this._removeNodeAt(i);
      }
    }

    if (removedNodes.length > 0) this._changes.push({ type: 'nodeRemoved', ids: removedNodes });
    if (removedEdges.length > 0) this._changes.push({ type: 'edgeRemoved', ids: removedEdges });
  }

  /** Remove node at index by swapping with last element (O(1)) */
  private _removeNodeAt(index: number): void {
    const lastIndex = this._nodes.length - 1;
    const removedNode = this._nodes[index];

    if (index !== lastIndex) {
      // Swap with last
      const lastNode = this._nodes[lastIndex];
      this._nodes[index] = lastNode;
      this._nodeIdToIndex.set(lastNode.id, index);
    }

    this._nodes.pop();
    this._nodeIdToIndex.delete(removedNode.id);
  }

  updateNodePosition(id: string, x: number, y: number): void {
    const index = this._nodeIdToIndex.get(id);
    if (index === undefined) return;
    const node = this._nodes[index];
    if (node.x === x && node.y === y) return;
    node.x = x;
    node.y = y;
    this._changes.push({ type: 'nodePositionChanged', ids: [id] });
  }

  updateNodeData(id: string, data: Record<string, unknown>): void {
    const index = this._nodeIdToIndex.get(id);
    if (index === undefined) return;
    const node = this._nodes[index];
    // Merge data instead of replacing
    if (node.data) {
      Object.assign(node.data, data);
    } else {
      node.data = data;
    }
    this._changes.push({ type: 'nodeDataChanged', ids: [id] });
  }

  // ──── Edge operations ────

  private allocateEdgeId(explicitId?: string): string {
    if (explicitId !== undefined) {
      if (this._edgeIdToIndex.has(explicitId)) {
        throw new Error(`Duplicate edge id: ${explicitId}`);
      }
      return explicitId;
    }
    let id = `e${this._edgeIdCounter++}`;
    while (this._edgeIdToIndex.has(id)) {
      id = `e${this._edgeIdCounter++}`;
    }
    return id;
  }

  addEdge(edge: {
    id?: string;
    source: string;
    target: string;
    data?: Record<string, unknown>;
    states?: ElementState[];
  }): string {
    const id = this.allocateEdgeId(edge.id);
    const index = this._edges.length;
    this._edges.push({
      id,
      source: edge.source,
      target: edge.target,
      data: edge.data, // Direct reference, no copy
      states: edge.states && edge.states.length > 0 ? new Set(edge.states) : EMPTY_SET,
    });
    this._edgeIdToIndex.set(id, index);
    this._changes.push({ type: 'edgeAdded', ids: [id] });
    return id;
  }

  addEdges(
    edges: Array<{
      id?: string;
      source: string;
      target: string;
      data?: Record<string, unknown>;
      states?: ElementState[];
    }>,
  ): string[] {
    const ids: string[] = [];
    for (const edge of edges) {
      const id = this.allocateEdgeId(edge.id);
      const index = this._edges.length;
      this._edges.push({
        id,
        source: edge.source,
        target: edge.target,
        data: edge.data, // Direct reference, no copy
        states: edge.states && edge.states.length > 0 ? new Set(edge.states) : EMPTY_SET,
      });
      this._edgeIdToIndex.set(id, index);
      ids.push(id);
    }
    if (ids.length > 0) this._changes.push({ type: 'edgeAdded', ids });
    return ids;
  }

  removeEdge(id: string): void {
    const index = this._edgeIdToIndex.get(id);
    if (index === undefined) return;
    this._removeEdgeAt(index);
    this._changes.push({ type: 'edgeRemoved', ids: [id] });
  }

  removeEdges(ids: string[]): void {
    const removed: string[] = [];
    for (const id of ids) {
      const index = this._edgeIdToIndex.get(id);
      if (index !== undefined) {
        this._removeEdgeAt(index);
        removed.push(id);
      }
    }
    if (removed.length > 0) this._changes.push({ type: 'edgeRemoved', ids: removed });
  }

  /** Remove edge at index by swapping with last element (O(1)) */
  private _removeEdgeAt(index: number): void {
    const lastIndex = this._edges.length - 1;
    const removedEdge = this._edges[index];

    if (index !== lastIndex) {
      // Swap with last
      const lastEdge = this._edges[lastIndex];
      this._edges[index] = lastEdge;
      this._edgeIdToIndex.set(lastEdge.id, index);
    }

    this._edges.pop();
    this._edgeIdToIndex.delete(removedEdge.id);
  }

  updateEdgeData(id: string, data: Record<string, unknown>): void {
    const index = this._edgeIdToIndex.get(id);
    if (index === undefined) return;
    const edge = this._edges[index];
    // Merge data instead of replacing
    if (edge.data) {
      Object.assign(edge.data, data);
    } else {
      edge.data = data;
    }
    this._changes.push({ type: 'edgeDataChanged', ids: [id] });
  }

  // ──── State management ────

  setNodeState(id: string, state: ElementState, value: boolean): void {
    const index = this._nodeIdToIndex.get(id);
    if (index === undefined) return;
    if (state === 'hidden' && value && this._comboHiddenDepth.has(id)) {
      this._comboHiddenApplied.delete(id);
    }
    const node = this._nodes[index];
    // Lazily replace shared EMPTY_SET with a mutable Set on first state mutation
    if (value && node.states === EMPTY_SET) {
      node.states = new Set([state]);
      this._changes.push({ type: 'nodeStateChanged', ids: [id] });
      return;
    }
    const had = node.states.has(state);
    if (value) node.states.add(state);
    else node.states.delete(state);
    if (had !== value) {
      this._changes.push({ type: 'nodeStateChanged', ids: [id] });
    }
  }

  clearNodeStates(id: string): void {
    const index = this._nodeIdToIndex.get(id);
    if (index === undefined) return;
    const node = this._nodes[index];
    if (node.states === EMPTY_SET || node.states.size === 0) return;
    node.states.clear();
    this._changes.push({ type: 'nodeStateChanged', ids: [id] });
  }

  setEdgeState(id: string, state: ElementState, value: boolean): void {
    const index = this._edgeIdToIndex.get(id);
    if (index === undefined) return;
    if (state === 'hidden' && value && this._comboHiddenEdgeDepth.has(id)) {
      this._comboHiddenEdgeApplied.delete(id);
    }
    const edge = this._edges[index];
    // Lazily replace shared EMPTY_SET with a mutable Set on first state mutation
    if (value && edge.states === EMPTY_SET) {
      edge.states = new Set([state]);
      this._changes.push({ type: 'edgeStateChanged', ids: [id] });
      return;
    }
    const had = edge.states.has(state);
    if (value) edge.states.add(state);
    else edge.states.delete(state);
    if (had !== value) {
      this._changes.push({ type: 'edgeStateChanged', ids: [id] });
    }
  }

  clearEdgeStates(id: string): void {
    const index = this._edgeIdToIndex.get(id);
    if (index === undefined) return;
    const edge = this._edges[index];
    if (edge.states === EMPTY_SET || edge.states.size === 0) return;
    edge.states.clear();
    this._changes.push({ type: 'edgeStateChanged', ids: [id] });
  }

  // ──── Bulk replace ────

  replaceData(
    nodes: Array<{
      id: string;
      name?: string;
      x: number;
      y: number;
      data?: Record<string, unknown>;
      states?: ElementState[];
    }>,
    edges: Array<{
      id?: string;
      source: string;
      target: string;
      data?: Record<string, unknown>;
      states?: ElementState[];
    }>,
  ): void {
    // Clear all
    this._nodes.length = 0;
    this._edges.length = 0;
    this._nodeIdToIndex.clear();
    this._edgeIdToIndex.clear();
    this._edgeIdCounter = 0;
    this._combos.clear();
    this._nodeToCombo.clear();
    this._comboHiddenDepth.clear();
    this._comboHiddenApplied.clear();
    this._comboHiddenEdgeDepth.clear();
    this._comboHiddenEdgeApplied.clear();

    // Add nodes directly (no conversion)
    for (const n of nodes) {
      const index = this._nodes.length;
      this._nodes.push({
        id: n.id,
        name: n.name,
        x: n.x,
        y: n.y,
        data: n.data, // Direct reference
        states: n.states && n.states.length > 0 ? new Set(n.states) : EMPTY_SET,
      });
      this._nodeIdToIndex.set(n.id, index);
    }

    // Add edges directly (auto-generate IDs)
    for (const e of edges) {
      const id = this.allocateEdgeId(e.id);
      const index = this._edges.length;
      this._edges.push({
        id,
        source: e.source,
        target: e.target,
        data: e.data, // Direct reference
        states: e.states && e.states.length > 0 ? new Set(e.states) : EMPTY_SET,
      });
      this._edgeIdToIndex.set(id, index);
    }

    this._changes.push({ type: 'dataReplaced', ids: [] });
  }

  // ──── Change collection ────

  getChanges(): ChangeRecord[] {
    const result = this._changes;
    this._changes = [];
    return result;
  }

  hasChanges(): boolean {
    return this._changes.length > 0;
  }

  // ──── Direct access (no conversion) ────

  /** Get node array directly (no copy) */
  getNodes(): readonly InternalNode[] {
    return this._nodes;
  }

  /** Get edge array directly (no copy) */
  getEdges(): readonly InternalEdge[] {
    return this._edges;
  }

  /** Get node by ID (O(1)) */
  getNode(id: string): InternalNode | undefined {
    const index = this._nodeIdToIndex.get(id);
    return index !== undefined ? this._nodes[index] : undefined;
  }

  /** Get edge by ID (O(1)) */
  getEdge(id: string): InternalEdge | undefined {
    const index = this._edgeIdToIndex.get(id);
    return index !== undefined ? this._edges[index] : undefined;
  }

  hasNode(id: string): boolean {
    return this._nodeIdToIndex.has(id);
  }

  hasEdge(id: string): boolean {
    return this._edgeIdToIndex.has(id);
  }

  getNodeCount(): number {
    return this._nodes.length;
  }

  getEdgeCount(): number {
    return this._edges.length;
  }

  getAllNodeIds(): string[] {
    return Array.from(this._nodeIdToIndex.keys());
  }

  getAllEdgeIds(): string[] {
    return Array.from(this._edgeIdToIndex.keys());
  }

  getAdjacentEdges(nodeId: string): InternalEdge[] {
    const result: InternalEdge[] = [];
    for (const edge of this._edges) {
      if (edge.source === nodeId || edge.target === nodeId) {
        result.push(edge);
      }
    }
    return result;
  }

  getNeighborNodes(nodeId: string): string[] {
    const neighbors = new Set<string>();
    for (const edge of this._edges) {
      if (edge.source === nodeId) neighbors.add(edge.target);
      if (edge.target === nodeId) neighbors.add(edge.source);
    }
    return Array.from(neighbors);
  }

  // ──── Batch state queries ────

  /** Find all nodes that have the given state. O(N) iteration. */
  findNodesByState(state: ElementState): string[] {
    const result: string[] = [];
    for (const node of this._nodes) {
      if (node.states.has(state)) result.push(node.id);
    }
    return result;
  }

  /** Find all edges that have the given state. O(N) iteration. */
  findEdgesByState(state: ElementState): string[] {
    const result: string[] = [];
    for (const edge of this._edges) {
      if (edge.states.has(state)) result.push(edge.id);
    }
    return result;
  }

  /** Find all nodes matching a predicate. */
  findNodes(predicate: (node: InternalNode) => boolean): InternalNode[] {
    const result: InternalNode[] = [];
    for (const node of this._nodes) {
      if (predicate(node)) result.push(node);
    }
    return result;
  }

  /** Find all edges matching a predicate. */
  findEdges(predicate: (edge: InternalEdge) => boolean): InternalEdge[] {
    const result: InternalEdge[] = [];
    for (const edge of this._edges) {
      if (predicate(edge)) result.push(edge);
    }
    return result;
  }

  // ───️ Deprecated: conversion methods (kept for compatibility) ────

  /** @deprecated Use getNodes() directly for better performance */
  toLayoutNodes(): Array<{
    id: string;
    name?: string;
    x: number;
    y: number;
    data?: Record<string, unknown>;
    states?: ElementState[];
  }> {
    return this._nodes.map((n) => ({
      id: n.id,
      name: n.name,
      x: n.x,
      y: n.y,
      data: n.data,
      states: n.states.size > 0 ? Array.from(n.states) : undefined,
    }));
  }

  /** @deprecated Use getEdges() directly for better performance */
  toGraphEdges(): Array<{
    id: string;
    source: string;
    target: string;
    data?: Record<string, unknown>;
    states?: ElementState[];
  }> {
    return this._edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      data: e.data,
      states: e.states.size > 0 ? Array.from(e.states) : undefined,
    }));
  }

  toData(): GraphData {
    const nodes: GraphNode[] = this._nodes.map((n) => {
      const node: GraphNode = {
        id: n.id,
        x: n.x,
        y: n.y,
      };
      const states = this.toExportNodeStates(n.id, n.states);
      const comboId = this._nodeToCombo.get(n.id);
      if (n.name !== undefined) node.name = n.name;
      if (n.data !== undefined) node.data = { ...n.data };
      if (states.length > 0) node.states = states;
      if (comboId !== undefined) node.comboId = comboId;
      return node;
    });

    const edges: GraphEdge[] = this._edges.map((e) => {
      const edge: GraphEdge = {
        id: e.id,
        source: e.source,
        target: e.target,
      };
      if (e.data !== undefined) edge.data = { ...e.data };
      const states = this.toExportEdgeStates(e.id, e.states);
      if (states.length > 0) edge.states = states;
      return edge;
    });

    const data: GraphData = { nodes, edges };
    if (this._combos.size > 0) {
      data.combos = Array.from(this._combos.values()).map((c) => {
        const combo: ComboData = { id: c.id };
        if (c.parentId !== undefined) combo.parentId = c.parentId;
        if (c.collapsed) combo.collapsed = true;
        if (c.style !== undefined) combo.style = { ...c.style };
        if (c.data !== undefined) combo.data = { ...c.data };
        if (c.states.size > 0) combo.states = Array.from(c.states);
        return combo;
      });
    }
    return data;
  }

  private toExportNodeStates(nodeId: string, states: Set<ElementState>): ElementState[] {
    if (states.size === 0) return [];
    const result: ElementState[] = [];
    for (const state of states) {
      if (state === 'hidden' && this._comboHiddenApplied.has(nodeId)) continue;
      result.push(state);
    }
    return result;
  }

  private toExportEdgeStates(edgeId: string, states: Set<ElementState>): ElementState[] {
    if (states.size === 0) return [];
    const result: ElementState[] = [];
    for (const state of states) {
      if (state === 'hidden' && this._comboHiddenEdgeApplied.has(edgeId)) continue;
      result.push(state);
    }
    return result;
  }

  // ──── Combo operations ────

  initCombos(combos: ComboData[], nodes: Array<{ id: string; comboId?: string }>): void {
    this.clearComboHidden();
    this._combos.clear();
    this._nodeToCombo.clear();
    this._comboHiddenDepth.clear();
    this._comboHiddenApplied.clear();
    this._comboHiddenEdgeDepth.clear();
    this._comboHiddenEdgeApplied.clear();
    for (const c of combos) {
      this._combos.set(c.id, {
        id: c.id,
        parentId: c.parentId,
        childNodeIds: new Set(),
        childComboIds: new Set(),
        collapsed: c.collapsed ?? false,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        style: c.style,
        data: c.data,
        states: c.states && c.states.length > 0 ? new Set(c.states) : new Set(),
      });
    }
    // Build parent-child combo relationships
    for (const c of combos) {
      if (c.parentId && this._combos.has(c.parentId)) {
        this._combos.get(c.parentId)!.childComboIds.add(c.id);
      }
    }
    // Assign nodes to combos
    for (const n of nodes) {
      if (n.comboId && this._combos.has(n.comboId)) {
        this._combos.get(n.comboId)!.childNodeIds.add(n.id);
        this._nodeToCombo.set(n.id, n.comboId);
      }
    }
    for (const combo of this._combos.values()) {
      if (combo.collapsed) {
        this.applyComboHidden(this.getComboAllNodeIds(combo.id));
      }
    }
  }

  addCombo(combo: ComboData): void {
    if (this._combos.has(combo.id)) return;
    this._combos.set(combo.id, {
      id: combo.id,
      parentId: combo.parentId,
      childNodeIds: new Set(),
      childComboIds: new Set(),
      collapsed: combo.collapsed ?? false,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      style: combo.style,
      data: combo.data,
      states: combo.states && combo.states.length > 0 ? new Set(combo.states) : new Set(),
    });
    if (combo.parentId && this._combos.has(combo.parentId)) {
      this._combos.get(combo.parentId)!.childComboIds.add(combo.id);
    }
  }

  removeCombo(id: string): void {
    const combo = this._combos.get(id);
    if (!combo) return;
    // Unparent from parent combo
    if (combo.parentId) {
      this._combos.get(combo.parentId)?.childComboIds.delete(id);
    }
    // Remove node associations
    for (const nodeId of combo.childNodeIds) {
      this._nodeToCombo.delete(nodeId);
    }
    for (const childId of combo.childComboIds) {
      const child = this._combos.get(childId);
      if (child) child.parentId = undefined;
    }
    this._combos.delete(id);
  }

  setNodeCombo(nodeId: string, comboId: string | undefined): void {
    const oldComboId = this._nodeToCombo.get(nodeId);
    if (oldComboId) {
      this._combos.get(oldComboId)?.childNodeIds.delete(nodeId);
    }
    if (comboId && this._combos.has(comboId)) {
      this._combos.get(comboId)!.childNodeIds.add(nodeId);
      this._nodeToCombo.set(nodeId, comboId);
    } else {
      this._nodeToCombo.delete(nodeId);
    }
  }

  getNodeCombo(nodeId: string): string | undefined {
    return this._nodeToCombo.get(nodeId);
  }

  getCombo(id: string): InternalCombo | undefined {
    return this._combos.get(id);
  }

  hasCombo(id: string): boolean {
    return this._combos.has(id);
  }

  getCombos(): InternalCombo[] {
    return Array.from(this._combos.values());
  }

  hasCombos(): boolean {
    return this._combos.size > 0;
  }

  setComboCollapsed(id: string, collapsed: boolean): void {
    const combo = this._combos.get(id);
    if (combo) combo.collapsed = collapsed;
  }

  applyComboHidden(nodeIds: string[], depth = 1): void {
    if (depth <= 0) return;
    const edgeIds = this.getAdjacentEdgeIds(nodeIds);
    for (const nodeId of nodeIds) {
      const index = this._nodeIdToIndex.get(nodeId);
      if (index === undefined) continue;
      const node = this._nodes[index];
      const previousDepth = this._comboHiddenDepth.get(nodeId) ?? 0;
      this._comboHiddenDepth.set(nodeId, previousDepth + depth);
      if (node.states.has('hidden')) continue;
      if (node.states === EMPTY_SET) node.states = new Set();
      node.states.add('hidden');
      this._comboHiddenApplied.add(nodeId);
      this._changes.push({ type: 'nodeStateChanged', ids: [nodeId] });
    }
    for (const edgeId of edgeIds) {
      const index = this._edgeIdToIndex.get(edgeId);
      if (index === undefined) continue;
      const edge = this._edges[index];
      const previousDepth = this._comboHiddenEdgeDepth.get(edgeId) ?? 0;
      this._comboHiddenEdgeDepth.set(edgeId, previousDepth + depth);
      if (edge.states.has('hidden')) continue;
      if (edge.states === EMPTY_SET) edge.states = new Set();
      edge.states.add('hidden');
      this._comboHiddenEdgeApplied.add(edgeId);
      this._changes.push({ type: 'edgeStateChanged', ids: [edgeId] });
    }
  }

  releaseComboHidden(nodeIds: string[], depth = 1): void {
    if (depth <= 0) return;
    const edgeIds = this.getAdjacentEdgeIds(nodeIds);
    for (const nodeId of nodeIds) {
      const previousDepth = this._comboHiddenDepth.get(nodeId) ?? 0;
      if (previousDepth <= 0) continue;
      const nextDepth = previousDepth - depth;
      if (nextDepth > 0) {
        this._comboHiddenDepth.set(nodeId, nextDepth);
        continue;
      }
      this._comboHiddenDepth.delete(nodeId);
      if (!this._comboHiddenApplied.delete(nodeId)) continue;
      const index = this._nodeIdToIndex.get(nodeId);
      if (index === undefined) continue;
      const node = this._nodes[index];
      if (!node.states.has('hidden')) continue;
      node.states.delete('hidden');
      this._changes.push({ type: 'nodeStateChanged', ids: [nodeId] });
    }
    for (const edgeId of edgeIds) {
      const previousDepth = this._comboHiddenEdgeDepth.get(edgeId) ?? 0;
      if (previousDepth <= 0) continue;
      const nextDepth = previousDepth - depth;
      if (nextDepth > 0) {
        this._comboHiddenEdgeDepth.set(edgeId, nextDepth);
        continue;
      }
      this._comboHiddenEdgeDepth.delete(edgeId);
      if (!this._comboHiddenEdgeApplied.delete(edgeId)) continue;
      const index = this._edgeIdToIndex.get(edgeId);
      if (index === undefined) continue;
      const edge = this._edges[index];
      if (!edge.states.has('hidden')) continue;
      edge.states.delete('hidden');
      this._changes.push({ type: 'edgeStateChanged', ids: [edgeId] });
    }
  }

  private clearComboHidden(): void {
    for (const nodeId of this._comboHiddenApplied) {
      const index = this._nodeIdToIndex.get(nodeId);
      if (index === undefined) continue;
      const node = this._nodes[index];
      if (!node.states.has('hidden')) continue;
      node.states.delete('hidden');
      this._changes.push({ type: 'nodeStateChanged', ids: [nodeId] });
    }
    this._comboHiddenDepth.clear();
    this._comboHiddenApplied.clear();
    for (const edgeId of this._comboHiddenEdgeApplied) {
      const index = this._edgeIdToIndex.get(edgeId);
      if (index === undefined) continue;
      const edge = this._edges[index];
      if (!edge.states.has('hidden')) continue;
      edge.states.delete('hidden');
      this._changes.push({ type: 'edgeStateChanged', ids: [edgeId] });
    }
    this._comboHiddenEdgeDepth.clear();
    this._comboHiddenEdgeApplied.clear();
  }

  private getAdjacentEdgeIds(nodeIds: string[]): string[] {
    const nodeSet = new Set(nodeIds);
    const edgeIds = new Set<string>();
    for (const edge of this._edges) {
      if (nodeSet.has(edge.source) || nodeSet.has(edge.target)) {
        edgeIds.add(edge.id);
      }
    }
    return Array.from(edgeIds);
  }

  setComboState(id: string, state: ElementState, value: boolean): void {
    const combo = this._combos.get(id);
    if (!combo) return;
    const had = combo.states.has(state);
    if (value) combo.states.add(state);
    else combo.states.delete(state);
    if (had !== value) {
      // Combo rendering is a Canvas2D underlay, so Graph schedules draw-only.
    }
  }

  clearComboStates(id: string): void {
    const combo = this._combos.get(id);
    if (!combo || combo.states.size === 0) return;
    combo.states.clear();
  }

  findCombosByState(state: ElementState): string[] {
    const result: string[] = [];
    for (const combo of this._combos.values()) {
      if (combo.states.has(state)) result.push(combo.id);
    }
    return result;
  }

  /** Recompute combo bounding boxes based on child node positions. */
  updateComboBounds(padding: number | ((combo: InternalCombo) => number) = 20): void {
    // Process from leaf combos up to root combos
    const processed = new Set<string>();
    const visiting = new Set<string>();
    const update = (comboId: string): void => {
      if (processed.has(comboId)) return;
      // Guard against circular parent-child relationships to avoid stack overflow.
      if (visiting.has(comboId)) return;
      const combo = this._combos.get(comboId);
      if (!combo) return;
      visiting.add(comboId);

      // First process child combos
      for (const childId of combo.childComboIds) {
        update(childId);
      }

      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;

      // Include child nodes
      for (const nodeId of combo.childNodeIds) {
        const node = this.getNode(nodeId);
        if (node) {
          if (node.x < minX) minX = node.x;
          if (node.x > maxX) maxX = node.x;
          if (node.y < minY) minY = node.y;
          if (node.y > maxY) maxY = node.y;
        }
      }

      // Include child combo bounds
      for (const childId of combo.childComboIds) {
        const child = this._combos.get(childId);
        if (child && child.width > 0) {
          const cx0 = child.x - child.width / 2;
          const cx1 = child.x + child.width / 2;
          const cy0 = child.y - child.height / 2;
          const cy1 = child.y + child.height / 2;
          if (cx0 < minX) minX = cx0;
          if (cx1 > maxX) maxX = cx1;
          if (cy0 < minY) minY = cy0;
          if (cy1 > maxY) maxY = cy1;
        }
      }

      if (minX === Infinity) {
        combo.x = 0;
        combo.y = 0;
        combo.width = 0;
        combo.height = 0;
      } else {
        const pad = typeof padding === 'function' ? padding(combo) : padding;
        combo.x = (minX + maxX) / 2;
        combo.y = (minY + maxY) / 2;
        combo.width = maxX - minX + pad * 2;
        combo.height = maxY - minY + pad * 2;
      }

      processed.add(comboId);
      visiting.delete(comboId);
    };

    for (const [id] of this._combos) {
      update(id);
    }
  }

  /** Get all node IDs belonging to a combo (including nested combos). */
  getComboAllNodeIds(comboId: string, visited = new Set<string>()): string[] {
    // Guard against circular parent-child relationships to avoid stack overflow.
    if (visited.has(comboId)) return [];
    visited.add(comboId);
    const combo = this._combos.get(comboId);
    if (!combo) return [];
    const result: string[] = [...combo.childNodeIds];
    for (const childComboId of combo.childComboIds) {
      result.push(...this.getComboAllNodeIds(childComboId, visited));
    }
    return result;
  }
}
