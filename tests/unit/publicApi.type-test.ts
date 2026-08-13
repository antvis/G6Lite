import type {
  BehaviorExtension,
  BehaviorName,
  BehaviorOptions,
  BrushSelectOptions,
  BuiltInBehaviorOptionsMap,
  CanvasGraphEvent,
  ClickSelectConfig,
  ComboModel,
  ComboStyleValue,
  EdgeModel,
  ElementModel,
  ElementState,
  EventEmitter,
  ExtensionContext,
  ExtensionEdgeData,
  ExtensionNodeData,
  FitViewOptions,
  Graph,
  GraphEventMap,
  GraphOptions,
  EdgeConfig,
  EdgeStyleValue,
  Handler,
  LabelOptions,
  NodeModel,
  NodeGraphEvent,
  NodeDecorationConfig,
  PluginExtension,
  TransformExtension,
  ZoomCanvasOptions,
} from '@antv/g6-lite';

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2
    ? true
    : false;
type Assert<Condition extends true> = Condition;

type NodeGetter = Assert<Equal<ReturnType<Graph['getNodeData']>, NodeModel | undefined>>;
type EdgeGetter = Assert<Equal<ReturnType<Graph['getEdgeData']>, EdgeModel | undefined>>;
type ComboGetter = Assert<Equal<ReturnType<Graph['getComboData']>, ComboModel | undefined>>;
type ElementGetter = Assert<Equal<ReturnType<Graph['getElementData']>, ElementModel | undefined>>;
type NodeCollection = Assert<Equal<ReturnType<Graph['getNodes']>, readonly NodeModel[]>>;
type EdgeCollection = Assert<Equal<ReturnType<Graph['getEdges']>, readonly EdgeModel[]>>;
type ExtensionNodeGetter = Assert<
  Equal<ReturnType<ExtensionContext['data']['getNode']>, ExtensionNodeData | undefined>
>;
type ExtensionEdgeGetter = Assert<
  Equal<ReturnType<ExtensionContext['data']['getEdge']>, ExtensionEdgeData | undefined>
>;
type EventPayload = { id: string; selected: boolean };
type EventPayloadHandler = Handler<[payload: EventPayload]>;
type EventHandlerParameters = Assert<Equal<Parameters<EventPayloadHandler>, [EventPayload]>>;
type NodeClickEvent = Assert<
  Equal<GraphEventMap['node:click'][0], NodeGraphEvent<Record<string, unknown>, MouseEvent>>
>;
type CanvasWheelEvent = Assert<
  Equal<GraphEventMap['canvas:wheel'][0], CanvasGraphEvent<WheelEvent>>
>;
type DestroyEventArguments = Assert<Equal<GraphEventMap['destroy'], []>>;
type BuiltInBehaviorNames = Assert<Equal<keyof BuiltInBehaviorOptionsMap, BehaviorName>>;
type DragCanvasModifierOption = Assert<
  Equal<BuiltInBehaviorOptionsMap['drag-canvas']['ignoreModifierKeys'], boolean | undefined>
>;
type ZoomCanvasSensitivityOption = Assert<
  Equal<BuiltInBehaviorOptionsMap['zoom-canvas']['sensitivity'], number | undefined>
>;
type ZoomCanvasMinimumOption = Assert<
  Equal<BuiltInBehaviorOptionsMap['zoom-canvas']['minZoom'], ZoomCanvasOptions['minZoom']>
>;
type BrushSelectMapType = Assert<
  Equal<BuiltInBehaviorOptionsMap['brush-select']['key'], BrushSelectOptions['key']>
>;
type ClickSelectMapType = Assert<
  Equal<BuiltInBehaviorOptionsMap['click-select']['multiple'], ClickSelectConfig['multiple']>
>;
type BehaviorHasNoUpdate = Assert<
  Equal<'update' extends keyof BehaviorExtension ? true : false, false>
>;
type PluginHasNoUpdate = Assert<
  Equal<'update' extends keyof PluginExtension ? true : false, false>
>;
type TransformHasUpdate = Assert<
  Equal<'update' extends keyof TransformExtension ? true : false, true>
>;
type AutoFitOnResizeOption = Assert<
  Equal<GraphOptions['autoFitOnResize'], boolean | number | FitViewOptions | undefined>
>;
type GraphLabelOption = Assert<Equal<GraphOptions['label'], LabelOptions | undefined>>;
type UpdateLabelOption = Assert<
  Equal<Parameters<Graph['updateOptions']>[0]['label'], LabelOptions | undefined>
>;
type NodeLabelMinimumZoom = Assert<Equal<LabelOptions['nodeMinZoom'], number | undefined>>;
type EdgeLabelMinimumZoom = Assert<Equal<LabelOptions['edgeMinZoom'], number | undefined>>;
type DecorationMinimumZoom = Assert<Equal<NodeDecorationConfig['minZoom'], number | undefined>>;
type DecorationCollisionOption = Assert<
  Equal<NodeDecorationConfig['hideOnCollision'], boolean | undefined>
>;
type EdgeHitAreaWidth = Assert<
  Equal<NonNullable<NonNullable<EdgeConfig['style']>['hitAreaWidth']>, EdgeStyleValue<number>>
>;

declare const emitter: EventEmitter;
const eventPayloadHandler: EventPayloadHandler = (payload) => {
  const id: string = payload.id;
  void id;
};
emitter.on('node:selectchange', eventPayloadHandler);
emitter.once('node:selectchange', eventPayloadHandler);
emitter.off('node:selectchange', eventPayloadHandler);
emitter.emit('node:selectchange', { id: 'node', selected: true });
emitter.emit('destroy');

// @ts-expect-error Handler payloads keep their declared tuple contract.
eventPayloadHandler({ id: 'node' });

declare const graph: Graph;
graph.on('node:click', (event) => {
  const nodeId: string = event.nodeId;
  const nativeEvent: MouseEvent = event.nativeEvent;
  void nodeId;
  void nativeEvent;
});
graph.on('canvas:wheel', (event) => {
  const nativeEvent: WheelEvent = event.nativeEvent;
  void nativeEvent;
});
graph.once('destroy', () => undefined);
graph.on('business:custom', (payload: { id: string }) => {
  const id: string = payload.id;
  void id;
});

interface TypeTestBehaviorOptions extends BehaviorOptions<'type-test-behavior'> {
  state?: ElementState;
}

const typeTestBehavior: BehaviorExtension<TypeTestBehaviorOptions> = {
  init(_context, options) {
    const type: 'type-test-behavior' = options.type;
    void type;
    // @ts-expect-error Extension options are read-only lifecycle inputs.
    options.state = 'active';
  },
  getEvents() {
    return {
      'node:click': (event) => {
        const nodeId: string = event.nodeId;
        void nodeId;
      },
      destroy: () => undefined,
    };
  },
};
void typeTestBehavior;

const node = graph.getNodeData('node');
if (node) {
  const states: ReadonlySet<ElementState> = node.states;
  void states;

  // @ts-expect-error Query models are read-only views; use Graph.updateNodePosition().
  node.x = 1;
  // @ts-expect-error Query model states must be updated through Graph state APIs.
  node.states.add('selected');
}

declare const extensionContext: ExtensionContext;
const extensionNode = extensionContext.data.getNode('node');
if (extensionNode) {
  // @ts-expect-error Extension data snapshots are read-only.
  extensionNode.id = 'other';
  // @ts-expect-error Extension payload snapshots are read-only.
  if (extensionNode.data) extensionNode.data.value = 1;
  // @ts-expect-error Extension state snapshots are read-only.
  extensionNode.states.push('selected');
}

const comboStyle: ComboStyleValue<number> = (combo) => {
  const model: ComboModel = combo;
  return model.width;
};
void comboStyle;

// @ts-expect-error Internal storage records are not exported from the package root.
type InternalNodeExport = import('@antv/g6-lite').InternalNode;
// @ts-expect-error Internal storage records are not exported from the package root.
type InternalEdgeExport = import('@antv/g6-lite').InternalEdge;
// @ts-expect-error Internal storage records are not exported from the package root.
type InternalComboExport = import('@antv/g6-lite').InternalCombo;

export type PublicApiTypeAssertions =
  | NodeGetter
  | EdgeGetter
  | ComboGetter
  | ElementGetter
  | NodeCollection
  | EdgeCollection
  | ExtensionNodeGetter
  | ExtensionEdgeGetter
  | EventHandlerParameters
  | NodeClickEvent
  | CanvasWheelEvent
  | DestroyEventArguments
  | BuiltInBehaviorNames
  | DragCanvasModifierOption
  | ZoomCanvasSensitivityOption
  | ZoomCanvasMinimumOption
  | BrushSelectMapType
  | ClickSelectMapType
  | BehaviorHasNoUpdate
  | PluginHasNoUpdate
  | TransformHasUpdate
  | AutoFitOnResizeOption
  | GraphLabelOption
  | UpdateLabelOption
  | NodeLabelMinimumZoom
  | EdgeLabelMinimumZoom
  | DecorationMinimumZoom
  | DecorationCollisionOption
  | EdgeHitAreaWidth
  | InternalNodeExport
  | InternalEdgeExport
  | InternalComboExport;
