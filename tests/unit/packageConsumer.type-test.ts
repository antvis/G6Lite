import {
  extensionFactory,
  Graph,
  register,
  type BehaviorExtension,
  type BehaviorOptions,
  type ComboModel,
  type EdgeModel,
  type ElementState,
  type ExtensionContext,
  type GraphEventMap,
  type GraphOptions,
  type NodeModel,
  type PluginExtension,
  type PluginOptions,
  type ZoomCanvasOptions,
} from '@antv/g6-lite';

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

const PACKAGE_BEHAVIOR = 'package-typed-behavior' as const;

interface PackageBehaviorOptions extends BehaviorOptions<typeof PACKAGE_BEHAVIOR> {
  state?: ElementState;
}

interface PackageBehaviorEventMap {
  'business:reset': [payload: { source: 'toolbar' | 'shortcut' }];
}

function createPackageBehavior(): BehaviorExtension<
  PackageBehaviorOptions,
  GraphEventMap & PackageBehaviorEventMap
> {
  let context: ExtensionContext | undefined;
  let state: ElementState = 'selected';
  return {
    init(nextContext, behaviorOptions) {
      context = nextContext;
      state = behaviorOptions.state ?? 'selected';
    },
    getEvents() {
      return {
        'node:click': ({ nodeId }) => context?.state.set(nodeId, [state]),
        'business:reset': () => {
          if (!context) return;
          context.state.setAll(Object.fromEntries(context.data.getNodeIds().map((id) => [id, []])));
        },
      };
    },
    destroy() {
      context = undefined;
    },
  };
}

register('behavior', PACKAGE_BEHAVIOR, extensionFactory(createPackageBehavior));

const PACKAGE_PLUGIN = 'package-typed-plugin' as const;

interface PackagePluginOptions extends PluginOptions<typeof PACKAGE_PLUGIN> {
  label?: string;
}

function createPackagePlugin(): PluginExtension<PackagePluginOptions> {
  let element: HTMLElement | undefined;
  let label = '';
  return {
    init(_context, pluginOptions) {
      label = pluginOptions.label ?? '';
    },
    mount(container) {
      element = document.createElement('div');
      element.textContent = label;
      container.appendChild(element);
    },
    destroy() {
      element?.remove();
      element = undefined;
    },
  };
}

register('plugin', PACKAGE_PLUGIN, extensionFactory(createPackagePlugin));

const typedOptions: GraphOptions = {
  container: 'container',
  data: { nodes: [], edges: [] },
  autoFitOnResize: { padding: 24, minZoom: 0.2, maxZoom: 1.5 },
  behaviors: [
    {
      type: 'zoom-canvas',
      sensitivity: 0.5,
      minZoom: 0.2,
      maxZoom: 8,
    } satisfies ZoomCanvasOptions & { type: 'zoom-canvas' },
    { type: PACKAGE_BEHAVIOR, state: 'active' } satisfies PackageBehaviorOptions,
  ],
  plugins: [{ type: PACKAGE_PLUGIN, label: 'Package plugin' } satisfies PackagePluginOptions],
};

graph.on('node:click', ({ nodeId, nativeEvent }) => {
  const id: string = nodeId;
  const event: MouseEvent = nativeEvent;
  void id;
  void event;
});
graph.once('destroy', () => undefined);

void GraphConstructor;
void options;
void node;
void edge;
void combo;
void typedOptions;
