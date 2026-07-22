import {
  extensionFactory,
  Graph,
  register,
  type ComboModel,
  type EdgeModel,
  type GraphOptions,
  type NodeModel,
} from '@antv/g6-gl';

declare const options: GraphOptions;
declare const graph: Graph;

const GraphConstructor: new (options: GraphOptions) => Graph = Graph;
const node: NodeModel | undefined = graph.getNodeData('node');
const edge: EdgeModel | undefined = graph.getEdgeData('edge');
const combo: ComboModel | undefined = graph.getComboData('combo');

register(
  'behavior',
  'package-smoke',
  extensionFactory(() => ({
    getEvents: () => ({}),
  })),
);

void GraphConstructor;
void options;
void node;
void edge;
void combo;
