import type { Graph } from '../graph.js';
import type {
  EdgeConfig,
  EdgeStateStyleOverride,
  GraphData,
  GraphEdge,
  GraphElementEvent,
  GraphNode,
  LabelLayout,
} from '../types.js';

export type ExtensionCategory =
  | 'edge'
  | 'decoration'
  | 'layout'
  | 'behavior'
  | 'transform'
  | 'plugin';

export interface ExtensionContext {
  graph: Graph;
  requestRender(): void;
  screenToGraph(point: { x: number; y: number }): { x: number; y: number };
  graphToScreen(point: { x: number; y: number }): { x: number; y: number };
  getZoom(): number;
  isDestroyed(): boolean;
}

export interface Extension<TOptions = Record<string, unknown>> {
  init?(context: ExtensionContext, options: TOptions): void;
  update?(options: Partial<TOptions>): void;
  destroy?(): void;
}

export interface LayoutExtension<TOptions = Record<string, unknown>> extends Extension<TOptions> {
  execute(
    data: GraphData,
    context: { width: number; height: number; signal?: AbortSignal },
  ):
    | { nodes: Array<GraphData['nodes'][number] & { x: number; y: number }> }
    | Promise<{
        nodes: Array<GraphData['nodes'][number] & { x: number; y: number }>;
      }>;
}

export interface BehaviorExtension<TOptions = Record<string, unknown>> extends Extension<TOptions> {
  getEvents(): Record<string, (event: GraphElementEvent) => void>;
}

export interface TransformExtension<TOptions = Record<string, unknown>>
  extends Extension<TOptions> {
  beforeRender?(data: GraphData): GraphData;
}

export interface PluginExtension<TOptions = Record<string, unknown>> extends Extension<TOptions> {
  mount?(container: HTMLElement): void;
}

/** Immutable edge rendering descriptor; Graph owns all runtime state. */
export interface EdgeExtension {
  base?: 'line' | 'arc' | 'polyline' | 'cubic';
  style?: Partial<NonNullable<EdgeConfig['style']>>;
  stateStyles?: Partial<Record<string, EdgeStateStyleOverride>>;
  getStyle?(
    source: GraphNode,
    target: GraphNode,
    edge: GraphEdge,
  ): Partial<NonNullable<EdgeConfig['style']>>;
}

export interface DecorationMeasureParams<T = unknown> {
  ctx: CanvasRenderingContext2D;
  node: GraphNode;
  data: T;
  dpr: number;
  zoom: number;
  /** Final node dimensions in Canvas backing-store pixels. */
  nodeWidth: number;
  /** Final node dimensions in Canvas backing-store pixels. */
  nodeHeight: number;
}

export interface DecorationDrawParams<T = unknown> extends DecorationMeasureParams<T> {
  layout: Readonly<LabelLayout>;
}

/** Stateless decoration content renderer; LabelLayerRenderer owns positioning and scheduling. */
export interface DecorationRenderer<T = unknown> {
  measure(params: DecorationMeasureParams<T>): LabelLayout;
  draw(params: DecorationDrawParams<T>): void;
}

export type RegisteredExtension =
  | LayoutExtension
  | BehaviorExtension
  | TransformExtension
  | PluginExtension
  | EdgeExtension
  | DecorationRenderer;

export type ExtensionFactory<T = unknown> = () => T;
export type ExtensionConstructor<T = unknown> = new () => T;
export type ExtensionInput<T = unknown> = T | ExtensionFactory<T> | ExtensionConstructor<T>;
