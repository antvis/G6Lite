/**
 * @antv/g6-lite
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
  BehaviorEventHandlers,
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
  EventArguments,
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
  BehaviorConfig,
  BehaviorOption,
  BehaviorOptions,
  BuiltInElementState,
  CanvasGraphEvent,
  ComboConfig,
  ComboData,
  ComboGraphEvent,
  ComboModel,
  ComboStateStyleOverride,
  ComboStyleConfig,
  ComboStyleValue,
  EdgeConfig,
  EdgeData,
  EdgeDataUpdate,
  EdgeGraphEvent,
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
  GraphEventMap,
  GraphNode,
  GraphOptions,
  GraphPoint,
  LabelDrawParams,
  LabelLayout,
  LabelMeasureParams,
  LabelOptions,
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
  NodeGraphEvent,
  NodePositionUpdate,
  NodeState,
  NodeStateStyleOverride,
  NodeStyleConfig,
  NodeStyleValue,
  ParallelEdgesConfig,
  PluginOption,
  PluginOptions,
  ResolvedLabelStyle,
  SetDataOptions,
  ThemeOption,
  ThemeTokens,
  TransformOption,
  ViewportPoint,
  ZoomOptions,
  ZoomRangeOptions,
} from './types';

// ──── Behavior config types ────
export type {
  BehaviorName,
  BrushSelectOptions,
  BuiltInBehaviorConfig,
  BuiltInBehaviorOptionsMap,
  ClickSelectConfig,
  DragCanvasOptions,
  HoverHighlightConfig,
  LassoSelectOptions,
  TooltipContext,
  TooltipOptions,
  ZoomCanvasOptions,
} from './behaviors/index';
