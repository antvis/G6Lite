/**
 * @antv/g6-lite
 * A high-performance graph analysis engine based on WebGL, designed for large-scale graph data analysis.
 *
 * Public API surface (frozen for 0.1.0 — see openspec/specs/api-freeze/spec.md).
 * Symbols tagged `@internal` below are exported for advanced/escape-hatch use
 * but are NOT part of the semver-stable surface and may change without a major bump.
 */

// ──── Core ────
export { EventEmitter } from './events.js';
export { register } from './extensions/index.js';
export { BaseNode, BreathingNode, registerNode } from './extensions/node.js';
export { Graph } from './graph.js';
export type { PickResult } from './graph.js';
export { runLayout } from './layout/index.js';
export type { LayoutResult } from './layout/index.js';
export { resolveTheme } from './theme.js';

// ──── Configuration & data types ────
export type { Camera } from './renderer/camera.js';
export type {
  ComboConfig,
  ComboData,
  ComboStyleConfig,
  EdgeConfig,
  EdgeLabelParams,
  EdgeLabelPlacement,
  EdgeState,
  ElementState,
  GraphData,
  GraphEdge,
  GraphNode,
  GraphOptions,
  LabelDrawParams,
  LabelLayout,
  LabelMeasureParams,
  LabelPlacement,
  LabelRenderer,
  LabelType,
  LayoutConfig,
  NodeConfig,
  NodeLabelParams,
  NodeState,
  ParallelEdgeMeta,
  ParallelEdgesConfig,
  ResolvedLabelStyle,
  ThemeOption,
  TransformOption,
} from './types.js';

// ──── Behavior config types ────
export type { HoverHighlightConfig } from './behaviors/hoverHighlight.js';
export type { BehaviorConfig, BehaviorName } from './behaviors/index.js';
export type { LassoSelectOptions } from './behaviors/lassoSelect.js';
export type { TooltipContext, TooltipOptions } from './behaviors/tooltip.js';

// ──── Query result types (returned by Graph.getNodeData/getEdgeData/getComboData) ────
// Named `Internal*` for historical reasons (they mirror the in-memory column
// store), but they ARE the public shape returned by the query getters above.
export type { InternalEdge, InternalNode } from './dataModel.js';
export type { InternalCombo } from './types.js';

// ──── Advanced / internal escape hatches ────
// @internal — DataModel, scheduler and the renderer data contract back the
// engine internals. They are exported for power users building custom render
// loops, but are not covered by the 0.1.0 stability guarantee.
export { DataModel } from './dataModel.js';
export type { ChangeRecord, ChangeType, DataModelOptions } from './dataModel.js';
export type {
  NodeExtension,
  NodeExtensionInput,
  NodeOverlayDrawParams,
} from './extensions/node.js';
export type { RendererData } from './renderer/renderer.js';
export { RefreshLevel, RenderScheduler } from './scheduler.js';
