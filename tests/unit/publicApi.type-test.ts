import type {
  ComboModel,
  ComboStyleValue,
  EdgeModel,
  ElementModel,
  ElementState,
  ExtensionContext,
  ExtensionEdgeData,
  ExtensionNodeData,
  Graph,
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
  | InternalNodeExport
  | InternalEdgeExport
  | InternalComboExport;
