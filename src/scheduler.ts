/**
 * RenderScheduler: collects data changes and determines the optimal
 * rendering strategy, then executes it in a rAF callback.
 *
 * Refresh levels (low → high cost):
 *   DRAW_ONLY         — camera change, just re-draw existing GPU buffers
 *   HIGHLIGHT_DELTA   — highlight state changed, patch colors only
 *   PATCH_STYLE       — node/edge state or data changed, patch style attributes only
 *   PATCH_POSITION    — node positions changed, patch position floats + affected edges
 *   PARTIAL_PROCESS   — nodes/edges added or removed, rebuild GPU buffers (reuse style cache)
 *   FULL_PROCESS      — full data replacement or config change, rebuild everything
 */

import { DataModel, ChangeType, ChangeRecord } from './data-model.js';
import type { Renderer } from './renderer/renderer.js';

export enum RefreshLevel {
  NONE = 0,
  DRAW_ONLY = 1,
  HIGHLIGHT_DELTA = 2,
  PATCH_STYLE = 3,
  PATCH_POSITION = 4,
  PARTIAL_PROCESS = 5,
  FULL_PROCESS = 6,
}

export class RenderScheduler {
  private renderer: Renderer;
  private dataModel: DataModel;
  private pendingLevel: RefreshLevel = RefreshLevel.NONE;
  private pendingChanges: ChangeRecord[] = [];
  private rafHandle: number | null = null;
  private destroyed = false;

  constructor(renderer: Renderer, dataModel: DataModel) {
    this.renderer = renderer;
    this.dataModel = dataModel;
  }

  /**
   * Derive the optimal refresh level from a set of changes.
   * Higher-cost changes override lower-cost ones.
   */
  private resolveRefreshLevel(changes: ChangeRecord[]): RefreshLevel {
    let level = RefreshLevel.NONE;
    for (const change of changes) {
      switch (change.type) {
        case 'nodePositionChanged':
          level = Math.max(level, RefreshLevel.PATCH_POSITION);
          break;
        case 'nodeDataChanged':
        case 'nodeStateChanged':
        case 'edgeDataChanged':
        case 'edgeStateChanged':
          // State/data changes affect style → patch style attributes only
          level = Math.max(level, RefreshLevel.PATCH_STYLE);
          break;
        case 'nodeAdded':
        case 'nodeRemoved':
        case 'edgeAdded':
        case 'edgeRemoved':
          // Buffer length changes → must rebuild
          level = Math.max(level, RefreshLevel.PARTIAL_PROCESS);
          break;
        case 'dataReplaced':
          level = RefreshLevel.FULL_PROCESS;
          break;
      }
    }
    return level;
  }

  /**
   * Collect changes from DataModel and schedule a render.
   * Multiple calls within the same frame are merged.
   */
  schedule(): void {
    if (this.destroyed) return;
    const changes = this.dataModel.getChanges();
    if (changes.length === 0) return;

    const newLevel = this.resolveRefreshLevel(changes);
    this.pendingLevel = Math.max(this.pendingLevel, newLevel);
    this.pendingChanges.push(...changes);

    if (this.rafHandle === null) {
      this.rafHandle = requestAnimationFrame(() => this.flush());
    }
  }

  /**
   * Schedule with a pre-determined level (e.g. from highlight or camera changes).
   */
  scheduleLevel(level: RefreshLevel): void {
    if (this.destroyed) return;
    this.pendingLevel = Math.max(this.pendingLevel, level);

    if (this.rafHandle === null) {
      this.rafHandle = requestAnimationFrame(() => this.flush());
    }
  }

  /**
   * Execute the highest-pending refresh level in the rAF callback.
   */
  private flush(): void {
    this.rafHandle = null;
    const level = this.pendingLevel;
    const changes = this.pendingChanges;
    this.pendingLevel = RefreshLevel.NONE;
    this.pendingChanges = [];

    if (level === RefreshLevel.NONE) return;

    switch (level) {
      case RefreshLevel.DRAW_ONLY:
        this.renderer.draw();
        break;

      case RefreshLevel.HIGHLIGHT_DELTA:
        // processHighlightDelta is called internally by draw() when needHighlightUpdate is set
        this.renderer.draw();
        break;

      case RefreshLevel.PATCH_STYLE: {
        // Collect changed node and edge IDs for style patching
        const changedNodeIds = new Set<string>();
        const changedEdgeIds = new Set<string>();
        for (const c of changes) {
          if (c.type === 'nodeDataChanged' || c.type === 'nodeStateChanged') {
            for (const id of c.ids) changedNodeIds.add(id);
          }
          if (c.type === 'edgeDataChanged' || c.type === 'edgeStateChanged') {
            for (const id of c.ids) changedEdgeIds.add(id);
          }
        }
        this.renderer.patchStyles(this.dataModel, changedNodeIds, changedEdgeIds);
        this.renderer.draw();
        break;
      }

      case RefreshLevel.PATCH_POSITION: {
        // Collect moved node IDs
        const movedNodeIds = new Set<string>();
        for (const c of changes) {
          if (c.type === 'nodePositionChanged') {
            for (const id of c.ids) movedNodeIds.add(id);
          }
        }
        this.renderer.patchPositions(this.dataModel, movedNodeIds);
        this.renderer.draw();
        break;
      }

      case RefreshLevel.PARTIAL_PROCESS: {
        // Collect added node/edge IDs for incremental processing
        const addedNodeIds: string[] = [];
        const addedEdgeIds: string[] = [];
        for (const c of changes) {
          if (c.type === 'nodeAdded') addedNodeIds.push(...c.ids);
          if (c.type === 'edgeAdded') addedEdgeIds.push(...c.ids);
        }
        this.renderer.partialProcess(this.dataModel, addedNodeIds, addedEdgeIds);
        this.renderer.draw();
        break;
      }

      case RefreshLevel.FULL_PROCESS:
        this.renderer.updateData({
          nodes: this.dataModel.getNodes() as any[],
          edges: this.dataModel.getEdges() as any[],
          nodeConfig: this.dataModel.nodeConfig,
          edgeConfig: this.dataModel.edgeConfig,
          theme: this.dataModel.theme,
          layoutDirection: this.dataModel.layoutDirection,
          layoutType: this.dataModel.layoutType,
          polylineRouter: this.dataModel.polylineRouter,
        });
        this.renderer.draw();
        break;
    }
  }

  /**
   * Force an immediate synchronous render at the given level.
   * Useful for operations that must complete before the next read (e.g. pickAt).
   */
  forceFlush(level: RefreshLevel = RefreshLevel.FULL_PROCESS): void {
    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
    this.pendingLevel = RefreshLevel.NONE;
    this.pendingChanges = [];

    if (level === RefreshLevel.NONE) return;

    switch (level) {
      case RefreshLevel.DRAW_ONLY:
        this.renderer.draw();
        break;
      case RefreshLevel.HIGHLIGHT_DELTA:
        this.renderer.draw();
        break;
      case RefreshLevel.PATCH_STYLE:
        this.renderer.patchStyles(this.dataModel, new Set(), new Set());
        this.renderer.draw();
        break;
      case RefreshLevel.PATCH_POSITION:
        this.renderer.patchPositions(this.dataModel, new Set());
        this.renderer.draw();
        break;
      case RefreshLevel.PARTIAL_PROCESS:
        // In forceFlush, we don't have change details, so do full partial process
        this.renderer.partialProcess(this.dataModel);
        this.renderer.draw();
        break;
      case RefreshLevel.FULL_PROCESS:
        this.renderer.updateData({
          nodes: this.dataModel.getNodes() as any[],
          edges: this.dataModel.getEdges() as any[],
          nodeConfig: this.dataModel.nodeConfig,
          edgeConfig: this.dataModel.edgeConfig,
          theme: this.dataModel.theme,
          layoutDirection: this.dataModel.layoutDirection,
          layoutType: this.dataModel.layoutType,
          polylineRouter: this.dataModel.polylineRouter,
        });
        this.renderer.draw();
        break;
    }
  }

  destroy(): void {
    this.destroyed = true;
    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
  }
}