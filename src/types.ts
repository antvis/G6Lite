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
}

/** Extended payload attached to an edge. */
export interface EdgeData extends Record<string, unknown> {}

/** Edge: at least source and target (node ids); optional data. */
export interface GraphEdge {
  source: string;
  target: string;
  data?: EdgeData;
}

/** Graph data: nodes and edges arrays. */
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** Style value or function for node. */
export type NodeStyleValue<T> = T | ((node: GraphNode) => T);

/** Node config: type and style (WebGL-capable only). */
export interface NodeConfig {
  type?: 'circle' | 'rect';
  style?: {
    fill?: NodeStyleValue<string>;
    size?: NodeStyleValue<number>;
    width?: NodeStyleValue<number>;
    height?: NodeStyleValue<number>;
  };
}

/** Style value or function for edge (node1, node2, edge). */
export type EdgeStyleValue<T> = T | ((source: GraphNode, target: GraphNode, edge: GraphEdge) => T);

/** Edge config: type and style (WebGL-capable only). */
export interface EdgeConfig {
  type?: 'line' | 'arc';
  style?: {
    stroke?: EdgeStyleValue<string>;
    lineWidth?: EdgeStyleValue<number>;
    curvature?: EdgeStyleValue<number>;
  };
}

/** Layout config: type + algorithm-specific options (aligned with @antv/layout). */
export interface LayoutConfig {
  type: string;
  [key: string]: unknown;
}

/** Behavior: string name or config object. */
export type BehaviorOption = string | { type: string; [key: string]: unknown };

/** Theme tokens (partial list; extend as needed). */
export interface ThemeTokens {
  nodeFill?: string;
  nodeSize?: number;
  edgeStroke?: string;
  edgeLineWidth?: number;
  canvasBackground?: string;
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
