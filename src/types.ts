/**
 * Graph data and options types for G6-GL.
 * Aligned with OpenSpec graph-rendering and theme specs.
 */

/** Extended payload attached to a node. */
export interface NodeData extends Record<string, unknown> {
  cluster?: string;
}

/** Node: at least id; optional name and data. */
export interface GraphNode {
  id: string;
  name?: string;
  data?: NodeData;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  states?: NodeState[];
  comboId?: string;
}

/** Extended payload attached to an edge. */
export type EdgeData = Record<string, unknown>;

/** Shared state type for nodes and edges. */
export type BuiltInElementState =
  | 'default'
  | 'active'
  | 'selected'
  | 'disabled'
  | 'highlight'
  | 'inactive'
  | 'hidden';

/** Built-in states plus application-defined state names. */
export type ElementState = BuiltInElementState | (string & {});

export interface NodeDataUpdate {
  id: string;
  data: Record<string, unknown>;
}

export interface EdgeDataUpdate {
  id: string;
  data?: Record<string, unknown>;
  source?: string;
  target?: string;
}

export interface ViewportPoint {
  x: number;
  y: number;
}

export interface ZoomOptions {
  /** Client/screen coordinate that remains visually fixed while zooming. */
  center?: ViewportPoint;
  minZoom?: number;
  maxZoom?: number;
}

export interface FitViewOptions {
  /** CSS-like padding in viewport pixels. */
  padding?: number | [number, number, number, number];
  minZoom?: number;
  maxZoom?: number;
}

export interface SetDataOptions {
  /** Auto-fit after replacement. false preserves the current camera. */
  fitView?: boolean | number | FitViewOptions;
}

export interface NodePositionUpdate {
  id: string;
  x: number;
  y: number;
}

export interface GraphPoint {
  x: number;
  y: number;
}

export interface GraphElementEvent<T = Record<string, unknown>> {
  targetType: 'node' | 'edge' | 'combo' | 'canvas';
  targetId?: string;
  data?: T;
  client: GraphPoint;
  canvas: GraphPoint;
  graph: GraphPoint;
  nativeEvent: MouseEvent | WheelEvent;
  /** @deprecated Use nativeEvent. */
  event: MouseEvent | WheelEvent;
  /** Compatibility fields for existing consumers. */
  nodeId?: string;
  edgeId?: string;
  comboId?: string;
  edgeIndex?: number;
  source?: string;
  target?: string;
}

/** Node states for visual differentiation. */
export type NodeState = ElementState;

/** Edge states for visual differentiation. */
export type EdgeState = ElementState;

/** Edge: at least source and target (node ids); optional data and states. */
export interface GraphEdge {
  id?: string;
  source: string;
  target: string;
  data?: EdgeData;
  states?: EdgeState[];
}

/**
 * Read-only normalized node view returned by Graph query APIs.
 * The view is backed by Graph; update it through Graph data/state APIs.
 */
export interface NodeModel {
  readonly id: string;
  readonly name?: string;
  readonly x: number;
  readonly y: number;
  readonly data?: Readonly<Record<string, unknown>>;
  readonly states: ReadonlySet<ElementState>;
}

/**
 * Read-only normalized edge view returned by Graph query APIs.
 * The view is backed by Graph; update it through Graph data/state APIs.
 */
export interface EdgeModel {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly data?: Readonly<Record<string, unknown>>;
  readonly states: ReadonlySet<ElementState>;
}

/** Configuration for automatic same-endpoint edge separation. */
export interface ParallelEdgesConfig {
  enabled?: boolean;
  /** Offset step in graph coordinates. Defaults to 20. */
  offset?: number;
  /** Grouping fields. Currently only source/target grouping is supported. */
  mergeBy?: Array<'source' | 'target'>;
  /** Whether A->B and B->A belong to the same separation group. Defaults to true. */
  includeReverse?: boolean;
  /** Clamp minimum absolute offset for non-center parallel edges. Defaults to 0. */
  minOffset?: number;
  /** Clamp maximum absolute offset. Defaults to 80. */
  maxOffset?: number;
}

/** Internal metadata attached to edges after process-parallel-edges runs. */
export interface ParallelEdgeMeta {
  groupKey: string;
  groupSize: number;
  groupIndex: number;
  sameDirectionIndex: number;
  sameDirectionSize: number;
  directionSign: 1 | -1;
  offset: number;
  curvature: number;
  isReversedInGroup: boolean;
}

/** Graph data: nodes, edges, and optional combos. */
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  combos?: ComboData[];
}

/** Style value or function for node. */
export type NodeStyleValue<T> = T | ((node: GraphNode) => T);

/** Style overrides applied per node state. */
export interface NodeStateStyleOverride {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  haloWidth?: number;
}

/** Label placement relative to node. */
export type LabelPlacement = 'center' | 'top' | 'bottom' | 'left' | 'right';

/** How a node decoration is attached relative to the selected node side. */
export type NodeDecorationAttachment = 'boundary' | 'outside' | 'inside';
export type NodeDecorationAnchor = 'start' | 'center' | 'end';
export type NodeDecorationPlacement = LabelPlacement | 'follow-label';

export type NodeBadgeKind = 'count' | 'lock' | 'warning' | 'favorite' | 'text' | 'icon';

export interface NodeBadgeItem {
  kind: NodeBadgeKind;
  value?: number | string;
  text?: string;
  icon?: string;
  iconFontFamily?: string;
  fill?: string;
  color?: string;
}

/** Edge label placement along the edge. */
export type EdgeLabelPlacement = 'start' | 'center' | 'end';

/** Label owner type shared by node and edge label renderers. */
export type LabelType = 'node' | 'edge';

/** Final, function-free label style passed to a custom label renderer. */
export interface ResolvedLabelStyle {
  /** Canvas backing-store pixels after DPR/zoom conversion. */
  labelFontSize: number;
  labelFontFamily: string;
  labelFontWeight: string;
  labelColor: string;
  labelPlacement: LabelPlacement | EdgeLabelPlacement;
  /** Canvas backing-store pixels after DPR/zoom conversion. */
  labelOffsetX: number;
  /** Canvas backing-store pixels after DPR/zoom conversion. */
  labelOffsetY: number;
  labelBackground: string | false;
  /** Canvas backing-store pixels after DPR/zoom conversion. */
  labelBackgroundPadding: number;
  /** Canvas backing-store pixels after DPR/zoom conversion; 0 means unlimited. */
  labelMaxWidth: number;
  labelAutoRotate: boolean;
}

/** Measurement result returned by a custom label renderer. */
export interface LabelLayout<T = unknown> {
  /** Full visual width in Canvas backing-store pixels. */
  width: number;
  /** Full visual height in Canvas backing-store pixels. */
  height: number;
  /** Renderer-owned data passed from measure() to draw() for the same label. */
  data?: T;
}

interface LabelParamsBase {
  ctx: CanvasRenderingContext2D;
  text: string;
  style: Readonly<ResolvedLabelStyle>;
  dpr: number;
  zoom: number;
}

/** Custom label renderer context for a node label. */
export interface NodeLabelParams extends LabelParamsBase {
  type: 'node';
  item: GraphNode;
  node: GraphNode;
}

/** Custom label renderer context for an edge label. */
export interface EdgeLabelParams extends LabelParamsBase {
  type: 'edge';
  item: GraphEdge;
  edge: GraphEdge;
  source: GraphNode;
  target: GraphNode;
}

/** Parameters passed to LabelRenderer.measure(). */
export type LabelMeasureParams = NodeLabelParams | EdgeLabelParams;

/** Parameters passed to LabelRenderer.draw(). */
export type LabelDrawParams<T = unknown> =
  | (NodeLabelParams & { layout: Readonly<LabelLayout<T>> })
  | (EdgeLabelParams & { layout: Readonly<LabelLayout<T>> });

/** Shared custom label renderer protocol for node and edge labels. */
export interface LabelRenderer<T = unknown> {
  measure(params: LabelMeasureParams): LabelLayout<T>;
  draw(params: LabelDrawParams<T>): void;
}

export interface NodeDecorationConfig<T = unknown> {
  renderer: string;
  placement?: NodeStyleValue<NodeDecorationPlacement>;
  /** Defaults to `boundary`, which centers the decoration on the node edge. */
  attachment?: NodeDecorationAttachment;
  /** Which edge of the decoration box is aligned to the node-side anchor. */
  anchor?: NodeDecorationAnchor;
  /** Cross-axis offset relative to the node width/height. */
  crossOffsetRatio?: NodeStyleValue<number>;
  /** With `anchor: start`, overlap by CSS pixels or half the boundary-adjacent badge height. */
  boundaryOverlap?: NodeStyleValue<number | 'half-badge'>;
  /** Enables engine-managed vertical item stacking. */
  layout?: 'single' | 'stack';
  items?: T[] | ((node: GraphNode) => T[]);
  sort?: 'none' | 'width-desc';
  maxVisible?: number;
  overflow?: 'clip' | 'hover-expand';
  overflowData?: T | ((hiddenCount: number, node: GraphNode) => T);
  itemGap?: number;
  offsetX?: number;
  offsetY?: number;
  data?: T | ((node: GraphNode) => T);
}

export interface NodeStyleConfig {
  fill?: NodeStyleValue<string>;
  size?: NodeStyleValue<number>;
  width?: NodeStyleValue<number>;
  height?: NodeStyleValue<number>;
  stroke?: NodeStyleValue<string>;
  strokeWidth?: NodeStyleValue<number>;
  opacity?: NodeStyleValue<number>;
  borderRadius?: NodeStyleValue<number>;
  label?: NodeStyleValue<string | false>;
  labelFontSize?: NodeStyleValue<number>;
  labelFontFamily?: NodeStyleValue<string>;
  labelFontWeight?: NodeStyleValue<string>;
  labelColor?: NodeStyleValue<string>;
  labelPlacement?: NodeStyleValue<LabelPlacement>;
  labelOffsetX?: NodeStyleValue<number>;
  labelOffsetY?: NodeStyleValue<number>;
  labelBackground?: NodeStyleValue<string | false>;
  labelBackgroundPadding?: NodeStyleValue<number>;
  labelMaxWidth?: NodeStyleValue<number>;
  icon?: NodeStyleValue<string | false>;
  iconWidth?: NodeStyleValue<number>;
  iconHeight?: NodeStyleValue<number>;
  iconType?: NodeStyleValue<'image' | 'text'>;
  iconFontFamily?: NodeStyleValue<string>;
  iconFontSize?: NodeStyleValue<number>;
  iconColor?: NodeStyleValue<string>;
  iconOffsetX?: NodeStyleValue<number>;
  iconOffsetY?: NodeStyleValue<number>;
}

/** Node config: type and style (WebGL-capable only). */
export interface NodeConfig {
  type?: 'circle' | 'rect' | (string & {});
  /** Registered custom label renderer name. */
  labelRenderer?: string;
  decorations?: NodeDecorationConfig[];
  /** Keeps the default node label below decorated nodes unless labelPlacement is explicit. */
  autoExternalLabelPlacement?: boolean;
  style?: NodeStyleConfig | ((node: GraphNode) => Partial<NodeStyleConfig>);
  stateStyles?: Partial<Record<NodeState, NodeStateStyleOverride>>;
}

/** Style value or function for edge (node1, node2, edge). */
export type EdgeStyleValue<T> = T | ((source: GraphNode, target: GraphNode, edge: GraphEdge) => T);

/** Style overrides applied per edge state. */
export interface EdgeStateStyleOverride {
  stroke?: string;
  lineWidth?: number;
  opacity?: number;
  lineDash?: number[];
}

/** Edge config: type and style (WebGL-capable only). */
export interface EdgeConfig {
  type?: 'line' | 'arc' | 'polyline' | 'cubic' | (string & {});
  /** Registered custom label renderer name. */
  labelRenderer?: string;
  parallelEdges?: ParallelEdgesConfig | boolean;
  style?: {
    stroke?: EdgeStyleValue<string>;
    lineWidth?: EdgeStyleValue<number>;
    curvature?: EdgeStyleValue<number>;
    curveOffset?: EdgeStyleValue<number>;
    endArrow?: EdgeStyleValue<boolean>;
    startArrow?: EdgeStyleValue<boolean>;
    arrowSize?: EdgeStyleValue<number>;
    lineDash?: EdgeStyleValue<number[]>;
    opacity?: EdgeStyleValue<number>;
    radius?: EdgeStyleValue<number>; // polyline corner radius
    router?: 'orth' | 'tree' | 'indented' | 'fishbone'; // polyline routing mode
    indentTarget?: 'left' | 'right'; // indented routing: edge end at child left or right edge
    trunkGap?: number; // indented routing: gap from trunk to child left edge
    // Label
    label?: EdgeStyleValue<string | false>;
    labelFontSize?: EdgeStyleValue<number>;
    labelFontFamily?: EdgeStyleValue<string>;
    labelColor?: EdgeStyleValue<string>;
    labelPlacement?: EdgeStyleValue<EdgeLabelPlacement>;
    labelBackground?: EdgeStyleValue<string | false>;
    labelBackgroundPadding?: EdgeStyleValue<number>;
    labelAutoRotate?: EdgeStyleValue<boolean>;
  };
  stateStyles?: Partial<Record<EdgeState, EdgeStateStyleOverride>>;
}

/** Layout config: type + algorithm-specific options (aligned with @antv/layout). */
export interface LayoutConfig {
  type: string;
  /** Run layout in a Web Worker to avoid blocking the main thread. */
  worker?: boolean;
  /** Layout viewport width; defaults to the canvas width (injected by Graph). */
  width?: number;
  /** Layout viewport height; defaults to the canvas height (injected by Graph). */
  height?: number;
  /** Layout center point; defaults to [width/2, height/2]. */
  center?: [number, number];
  [key: string]: unknown;
}

/** Behavior: string name or config object. */
export type BehaviorOption = string | { type: string; [key: string]: unknown };

/** Data transform config. */
export type TransformOption =
  | 'process-parallel-edges'
  | (string & {})
  | { type: string; options?: Record<string, unknown> | ParallelEdgesConfig };

export interface PluginOption {
  type: string;
  [key: string]: unknown;
}

/** Theme tokens (partial list; extend as needed). */
export interface ThemeTokens {
  nodeFill?: string;
  nodeSize?: number;
  nodeStroke?: string;
  nodeStrokeWidth?: number;
  edgeStroke?: string;
  edgeLineWidth?: number;
  canvasBackground?: string;
  edgeDefaultColor?: string;
  edgeCategoryPalette?: string[];
  edgeArrow?: boolean;
  edgeStateStyles?: Partial<Record<EdgeState, EdgeStateStyleOverride>>;
  nodeStateStyles?: Partial<Record<NodeState, NodeStateStyleOverride>>;
}

/** Theme: preset name or object with type and overrides. */
export type ThemeOption = 'light' | 'dark' | ({ type: 'light' | 'dark' } & Partial<ThemeTokens>);

/** Combo (group container) user data. */
export interface ComboData {
  id: string;
  parentId?: string;
  collapsed?: boolean;
  style?: Partial<ComboStyleConfig>;
  data?: Record<string, unknown>;
  states?: ElementState[];
}

/** Style value or function for combo. */
export type ComboStyleValue<T> = T | ((combo: ComboModel) => T);

/** Style overrides applied per combo state. */
export interface ComboStateStyleOverride {
  fill?: ComboStyleValue<string>;
  stroke?: ComboStyleValue<string>;
  strokeWidth?: ComboStyleValue<number>;
  opacity?: ComboStyleValue<number>;
  borderRadius?: ComboStyleValue<number>;
  label?: ComboStyleValue<string | false>;
  labelFontSize?: ComboStyleValue<number>;
  labelColor?: ComboStyleValue<string>;
}

/** Combo style configuration. */
export interface ComboStyleConfig {
  fill?: ComboStyleValue<string>;
  stroke?: ComboStyleValue<string>;
  strokeWidth?: ComboStyleValue<number>;
  opacity?: ComboStyleValue<number>;
  borderRadius?: ComboStyleValue<number>;
  padding?: number | [number, number, number, number];
  label?: ComboStyleValue<string | false>;
  labelFontSize?: ComboStyleValue<number>;
  labelColor?: ComboStyleValue<string>;
  labelPlacement?: 'top' | 'bottom' | 'inside' | 'center';
  collapsedType?: 'circle' | 'rect';
  collapsedSize?: ComboStyleValue<number | [number, number]>;
  size?: ComboStyleValue<number | [number, number]>;
  count?: boolean | string | ((combo: ComboModel) => boolean | string);
  stateStyles?: Partial<Record<ElementState, ComboStateStyleOverride>>;
}

/** Combo config in GraphOptions. */
export interface ComboConfig {
  style?: ComboStyleConfig;
}

/**
 * Read-only normalized combo view returned by Graph query APIs.
 * The view is backed by Graph; update it through Graph data/state APIs.
 */
export interface ComboModel {
  readonly id: string;
  readonly parentId?: string;
  readonly childNodeIds: ReadonlySet<string>;
  readonly childComboIds: ReadonlySet<string>;
  readonly collapsed: boolean;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly style?: Readonly<Partial<ComboStyleConfig>>;
  readonly data?: Readonly<Record<string, unknown>>;
  readonly states: ReadonlySet<ElementState>;
}

/** Normalized graph element model returned by Graph.getElementData(). */
export type ElementModel = NodeModel | EdgeModel | ComboModel;

/** Mutable combo record owned by the internal DataModel module. */
export interface InternalCombo {
  id: string;
  parentId?: string;
  childNodeIds: Set<string>;
  childComboIds: Set<string>;
  collapsed: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  style?: Partial<ComboStyleConfig>;
  data?: Record<string, unknown>;
  states: Set<ElementState>;
}

/** Full graph options. */
export interface GraphOptions {
  container: string | HTMLElement;
  data: GraphData;
  node?: NodeConfig;
  edge?: EdgeConfig;
  combo?: ComboConfig;
  layout?: LayoutConfig;
  behaviors?: BehaviorOption[];
  transforms?: TransformOption[];
  plugins?: PluginOption[];
  theme?: ThemeOption;
}

/** Internal: node with layout position. */
export interface LayoutNode extends GraphNode {
  x: number;
  y: number;
}
