/**
 * DataModel: manages graph data with change tracking.
 * Optimized: uses Array for storage with lightweight ID-to-index mapping.
 * All mutations record changes that the RenderScheduler consumes
 * to determine the optimal refresh strategy.
 */

import type { ElementState, NodeConfig, EdgeConfig, ThemeTokens } from './types.js';

/** Internal node model with resolved style cache. */
export interface InternalNode {
  id: string;
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

  addNode(node: { id: string; x: number; y: number; data?: Record<string, unknown> }): void {
    if (this._nodeIdToIndex.has(node.id)) return;
    const index = this._nodes.length;
    this._nodes.push({
      id: node.id,
      x: node.x,
      y: node.y,
      data: node.data, // Direct reference, no copy
      states: EMPTY_SET,
    });
    this._nodeIdToIndex.set(node.id, index);
    this._changes.push({ type: 'nodeAdded', ids: [node.id] });
  }

  addNodes(
    nodes: Array<{ id: string; x: number; y: number; data?: Record<string, unknown> }>,
  ): void {
    const ids: string[] = [];
    for (const node of nodes) {
      if (this._nodeIdToIndex.has(node.id)) continue;
      const index = this._nodes.length;
      this._nodes.push({
        id: node.id,
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

  addEdge(edge: { source: string; target: string; data?: Record<string, unknown> }): string {
    const id = `e${this._edgeIdCounter++}`;
    const index = this._edges.length;
    this._edges.push({
      id,
      source: edge.source,
      target: edge.target,
      data: edge.data, // Direct reference, no copy
      states: EMPTY_SET,
    });
    this._edgeIdToIndex.set(id, index);
    this._changes.push({ type: 'edgeAdded', ids: [id] });
    return id;
  }

  addEdges(
    edges: Array<{ source: string; target: string; data?: Record<string, unknown> }>,
  ): string[] {
    const ids: string[] = [];
    for (const edge of edges) {
      const id = `e${this._edgeIdCounter++}`;
      const index = this._edges.length;
      this._edges.push({
        id,
        source: edge.source,
        target: edge.target,
        data: edge.data, // Direct reference, no copy
        states: EMPTY_SET,
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
      x: number;
      y: number;
      data?: Record<string, unknown>;
      states?: ElementState[];
    }>,
    edges: Array<{
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

    // Add nodes directly (no conversion)
    for (const n of nodes) {
      const index = this._nodes.length;
      this._nodes.push({
        id: n.id,
        x: n.x,
        y: n.y,
        data: n.data, // Direct reference
        states: n.states && n.states.length > 0 ? new Set(n.states) : EMPTY_SET,
      });
      this._nodeIdToIndex.set(n.id, index);
    }

    // Add edges directly (auto-generate IDs)
    for (const e of edges) {
      const id = `e${this._edgeIdCounter++}`;
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
    x: number;
    y: number;
    data?: Record<string, unknown>;
    states?: ElementState[];
  }> {
    return this._nodes.map((n) => ({
      id: n.id,
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
}
