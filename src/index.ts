/**
 * @antv/g6-gl
 * A high-performance graph analysis engine based on WebGL, designed for large-scale graph data analysis.
 *
 * Public API surface is being re-baselined during the 0.1.0 beta period.
 * Engine internals are excluded from the package root and published API
 * declarations; consume supported APIs only through this entry point.
 */

// ──── Core ────
export { EventEmitter } from './events';
export type { Handler } from './events';
export {
  BaseNode,
  BreathingNode,
  extensionFactory,
  register,
  registerNode,
} from './extensions/index';
export type {
  BehaviorExtension,
  DecorationDrawParams,
  DecorationMeasureParams,
  DecorationRenderer,
  EdgeExtension,
  Extension,
  ExtensionCategory,
  ExtensionConstructor,
  ExtensionContext,
  ExtensionDataContext,
  ExtensionEdgeData,
  ExtensionFactory,
  ExtensionInput,
  ExtensionNodeData,
  ExtensionStateContext,
  ExtensionViewportContext,
  LayoutExtension,
  NodeBoundaryAnchorParams,
  NodeExtension,
  NodeExtensionInput,
  NodeOverlayDrawParams,
  PluginExtension,
  TransformExtension,
} from './extensions/index';
export { Graph } from './graph';
export { runLayout } from './layout/index';
export type { LayoutResult } from './layout/index';
export { resolveTheme } from './theme';

// ──── Configuration & data types ────
export type { Camera } from './renderer/index';
export type {
  BehaviorOption,
  BuiltInElementState,
  ComboConfig,
  ComboData,
  ComboModel,
  ComboStateStyleOverride,
  ComboStyleConfig,
  ComboStyleValue,
  EdgeConfig,
  EdgeData,
  EdgeDataUpdate,
  EdgeLabelParams,
  EdgeLabelPlacement,
  EdgeModel,
  EdgeState,
  EdgeStateStyleOverride,
  EdgeStyleValue,
  ElementModel,
  ElementState,
  FitViewOptions,
  GraphData,
  GraphEdge,
  GraphElementEvent,
  GraphNode,
  GraphOptions,
  GraphPoint,
  LabelDrawParams,
  LabelLayout,
  LabelMeasureParams,
  LabelPlacement,
  LabelRenderer,
  LabelType,
  LayoutConfig,
  NodeBadgeItem,
  NodeBadgeKind,
  NodeConfig,
  NodeData,
  NodeDataUpdate,
  NodeDecorationAnchor,
  NodeDecorationAttachment,
  NodeDecorationConfig,
  NodeDecorationPlacement,
  NodeLabelParams,
  NodeModel,
  NodePositionUpdate,
  NodeState,
  NodeStateStyleOverride,
  NodeStyleConfig,
  NodeStyleValue,
  ParallelEdgesConfig,
  PluginOption,
  ResolvedLabelStyle,
  SetDataOptions,
  ThemeOption,
  ThemeTokens,
  TransformOption,
  ViewportPoint,
  ZoomOptions,
} from './types';

// ──── Behavior config types ────
export type {
  BehaviorConfig,
  BehaviorName,
  DragCanvasOptions,
  HoverHighlightConfig,
  LassoSelectOptions,
  TooltipContext,
  TooltipOptions,
} from './behaviors/index';
