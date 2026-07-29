import type { Graph } from '../graph';
import type {
  BehaviorConfig,
  BehaviorOptions,
  EdgeConfig,
  EdgeStateStyleOverride,
  ElementState,
  GraphData,
  GraphEdge,
  GraphEventMap,
  GraphNode,
  LabelLayout,
  PluginOption,
  PluginOptions,
} from '../types';

export type ExtensionCategory =
  'node' | 'edge' | 'label' | 'decoration' | 'layout' | 'behavior' | 'transform' | 'plugin';

/** Read-only node snapshot exposed to extensions. */
export interface ExtensionNodeData {
  readonly id: string;
  readonly name?: string;
  readonly x: number;
  readonly y: number;
  readonly data?: Readonly<Record<string, unknown>>;
  readonly states: readonly ElementState[];
}

/** Read-only edge snapshot exposed to extensions. */
export interface ExtensionEdgeData {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly data?: Readonly<Record<string, unknown>>;
  readonly states: readonly ElementState[];
}

export interface ExtensionDataContext {
  getNode(id: string): ExtensionNodeData | undefined;
  getEdge(id: string): ExtensionEdgeData | undefined;
  getNodeIds(): string[];
  getEdgeIds(): string[];
  updateNode(id: string, data: Record<string, unknown>): void;
  updateEdge(id: string, data: Record<string, unknown>): void;
}

export interface ExtensionStateContext {
  set(id: string, states: ElementState[]): void;
  setAll(stateMap: Record<string, ElementState[]>): void;
  get(id: string): ElementState[];
  clear(id: string): void;
}

export interface ExtensionViewportContext {
  screenToGraph(point: { x: number; y: number }): { x: number; y: number };
  graphToScreen(point: { x: number; y: number }): { x: number; y: number };
  getZoom(): number;
}

export interface ExtensionContext {
  /** @deprecated Use data, state, viewport, and requestRender instead. */
  graph: Graph;
  data: ExtensionDataContext;
  state: ExtensionStateContext;
  viewport: ExtensionViewportContext;
  requestRender(): void;
  /** @deprecated Use viewport.screenToGraph. */
  screenToGraph(point: { x: number; y: number }): { x: number; y: number };
  /** @deprecated Use viewport.graphToScreen. */
  graphToScreen(point: { x: number; y: number }): { x: number; y: number };
  /** @deprecated Use viewport.getZoom. */
  getZoom(): number;
  isDestroyed(): boolean;
}

export interface Extension<TOptions = Record<string, unknown>> {
  init?(context: ExtensionContext, options: Readonly<TOptions>): void;
  destroy?(): void;
}

export interface LayoutExtension<TOptions = Record<string, unknown>> extends Extension<TOptions> {
  execute(
    data: GraphData,
    context: {
      readonly width: number;
      readonly height: number;
      readonly signal?: AbortSignal;
      readonly options: Readonly<TOptions>;
    },
  ):
    | { nodes: Array<GraphData['nodes'][number] & { x: number; y: number }> }
    | Promise<{
        nodes: Array<GraphData['nodes'][number] & { x: number; y: number }>;
      }>;
}

/** Extracts the argument tuple declared for an event-map entry. */
export type EventArguments<T> = T extends readonly unknown[] ? T : never;

/** Event handlers declared by a behavior, keyed by graph event name. */
export type BehaviorEventHandlers<TEventMap extends object = GraphEventMap> = Partial<{
  [K in keyof TEventMap]: (...args: EventArguments<TEventMap[K]>) => void;
}>;

export interface BehaviorExtension<
  TOptions extends BehaviorOptions = BehaviorConfig,
  TEventMap extends object = GraphEventMap,
> extends Extension<TOptions> {
  getEvents(): BehaviorEventHandlers<TEventMap>;
}

export interface TransformExtension<
  TOptions = Record<string, unknown>,
> extends Extension<TOptions> {
  update?(options: Readonly<Partial<TOptions>>): void;
  beforeRender?(data: GraphData): GraphData;
}

export interface PluginExtension<
  TOptions extends PluginOptions = PluginOption,
> extends Extension<TOptions> {
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

/** Recommended registration form for stateful extensions. */
export type ExtensionFactory<T = unknown> = () => T;

/**
 * @deprecated Register a factory that returns the extension instance instead.
 * Constructor registration remains available during the beta migration period.
 */
export type ExtensionConstructor<T = unknown> = new () => T;
export type ExtensionInput<T = unknown> = T | ExtensionFactory<T> | ExtensionConstructor<T>;
