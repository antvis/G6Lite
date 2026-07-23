import type {
  ComboModel,
  ComboStyleValue,
  EdgeModel,
  ElementModel,
  ElementState,
  EventEmitter,
  ExtensionContext,
  ExtensionEdgeData,
  ExtensionNodeData,
  Graph,
  Handler,
  NodeModel,
} from '@antv/g6-gl';

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
type InternalNodeExport = import('@antv/g6-gl').InternalNode;
// @ts-expect-error Internal storage records are not exported from the package root.
type InternalEdgeExport = import('@antv/g6-gl').InternalEdge;
// @ts-expect-error Internal storage records are not exported from the package root.
type InternalComboExport = import('@antv/g6-gl').InternalCombo;

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
  | InternalNodeExport
  | InternalEdgeExport
  | InternalComboExport;
