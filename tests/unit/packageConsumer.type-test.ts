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

// Internal engine members must not leak into the published Graph declaration.
// @ts-expect-error Internal event transport is not part of the package API.
void graph.eventEmitter;
// @ts-expect-error Layout snapshots are exposed through supported extension APIs.
graph.getLayoutNodes();
// @ts-expect-error Direct canvas access is internal.
graph.getCanvas();
// @ts-expect-error Renderer indices are internal.
graph.getNodeIndex('node');
// @ts-expect-error Low-level picking is internal.
graph.pickAt(0, 0);
// @ts-expect-error Renderer highlight transport is internal.
graph.setHighlight({});
// @ts-expect-error Renderer highlight transport is internal.
graph.clearHighlight();
// @ts-expect-error Direct renderer data replacement is internal.
graph.updateData(null as never);
// @ts-expect-error Render scheduling is exposed through extension context only.
graph.scheduleRender();
// @ts-expect-error Low-level combo picking is internal.
graph.pickComboAt(0, 0);

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
