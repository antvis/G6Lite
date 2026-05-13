/**
 * Graph data and options types for G6Lite.
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
  states?: NodeState[];
}

/** Extended payload attached to an edge. */
export interface EdgeData extends Record<string, unknown> {}

/** Shared state type for nodes and edges. */
export type ElementState = 'default' | 'active' | 'selected' | 'disabled' | 'highlight' | 'inactive';

/** Node states for visual differentiation. */
export type NodeState = ElementState;

/** Edge states for visual differentiation. */
export type EdgeState = ElementState;

/** Edge: at least source and target (node ids); optional data and states. */
export interface GraphEdge {
  source: string;
  target: string;
  data?: EdgeData;
  states?: EdgeState[];
}

/** Graph data: nodes and edges arrays. */
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** Style value or function for node. */
export type NodeStyleValue<T> = T | ((node: GraphNode) => T);

/** Style overrides applied per node state. */
export interface NodeStateStyleOverride {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

/** Node config: type and style (WebGL-capable only). */
export interface NodeConfig {
  type?: 'circle' | 'rect';
  style?: {
    fill?: NodeStyleValue<string>;
    size?: NodeStyleValue<number>;
    width?: NodeStyleValue<number>;
    height?: NodeStyleValue<number>;
    stroke?: NodeStyleValue<string>;
    strokeWidth?: NodeStyleValue<number>;
    opacity?: NodeStyleValue<number>;
    borderRadius?: NodeStyleValue<number>;
  };
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
  type?: 'line' | 'arc' | 'polyline' | 'cubic';
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
    radius?: EdgeStyleValue<number>;  // polyline corner radius
    router?: 'orth' | 'tree' | 'indented' | 'fishbone';  // polyline routing mode
    indentTarget?: 'left' | 'right';  // indented routing: edge end at child left or right edge
    trunkGap?: number;  // indented routing: gap from trunk to child left edge
  };
  stateStyles?: Partial<Record<EdgeState, EdgeStateStyleOverride>>;
}

/** Layout config: type + algorithm-specific options (aligned with @antv/layout). */
export interface LayoutConfig {
  type: string;
  /** Run layout in a Web Worker to avoid blocking the main thread. */
  worker?: boolean;
  [key: string]: unknown;
}

/** Behavior: string name or config object. */
export type BehaviorOption = string | { type: string; [key: string]: unknown };

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
export type ThemeOption = 'light' | 'dark' | { type: 'light' | 'dark' } & Partial<ThemeTokens>;

/** Full graph options. */
export interface GraphOptions {
  container: string | HTMLElement;
  data: GraphData;
  node?: NodeConfig;
  edge?: EdgeConfig;
  layout?: LayoutConfig;
  behaviors?: BehaviorOption[];
  theme?: ThemeOption;
}

/** Internal: node with layout position. */
export interface LayoutNode extends GraphNode {
  x: number;
  y: number;
}
