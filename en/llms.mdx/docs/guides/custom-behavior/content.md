# Custom interactions (/en/docs/guides/custom-behavior)





When built-ins cannot express a business rule, consume public Graph events through a Behavior and update data or state through ExtensionContext. Here, clicking a node makes it uniquely active. Canvas clicks clear only active, preserving A's initial selected state.

## Public type pattern [#public-type-pattern]

Give the name a literal type and business options their own type, then use satisfies at activation. Full generics, event mappings, and lifecycle signatures are in the [Behavior contract](/en/docs/api/options#custom-interaction-contract).

## Recommended exports [#recommended-exports]

Export a stable name, options type, and explicit registration function. Register before creating Graph, and use a business or package prefix to avoid global registry collisions. Do not rely on import side effects for registration order.

## Complete implementation [#complete-implementation]

The code below drives the canvas. Every factory call creates a fresh closure. State updates remove only the state owned by this Behavior and append it to the target. click-select is omitted, so clicks do not alter selected.



```ts
import {
  Graph, register,
  type BehaviorExtension, type BehaviorOptions, type ElementState, type ExtensionContext,
} from '@antv/g6-lite';

export const BUSINESS_SELECT = 'docs-business-select' as const;
export interface BusinessSelectOptions extends BehaviorOptions<typeof BUSINESS_SELECT> {
  state?: ElementState;
}

export function createBusinessSelect(): BehaviorExtension<BusinessSelectOptions> {
  let context: ExtensionContext | undefined;
  let state: ElementState = 'active';
  const select = (nodeId?: string) => {
    if (!context || context.isDestroyed()) return;
    const next: Record<string, ElementState[]> = {};
    for (const id of context.data.getNodeIds()) {
      const retained = context.state.get(id).filter((value) => value !== state);
      next[id] = id === nodeId ? [...retained, state] : retained;
    }
    context.state.setAll(next);
  };
  return {
    init(nextContext, options) { context = nextContext; state = options.state ?? 'active'; },
    getEvents() {
      return {
        'node:click': ({ nodeId, nativeEvent }) => {
          if (nativeEvent.button === 0) select(nodeId);
        },
        'canvas:click': () => select(),
      };
    },
    destroy() { context = undefined; },
  };
}

// #region registration
export function registerBusinessSelect() {
  register('behavior', BUSINESS_SELECT, () => createBusinessSelect());
}
// #endregion registration

export async function run(container: HTMLElement) {
  registerBusinessSelect();
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'A', x: 0, y: 0, states: ['selected'] },
        { id: 'B', x: 160, y: 0 }, { id: 'C', x: 320, y: 0 },
      ],
      edges: [{ source: 'A', target: 'B' }, { source: 'B', target: 'C' }],
    },
    node: {
      style: { size: 32, label: (node) => node.id, labelOffsetY: 8 },
      stateStyles: { active: { fill: '#F08F56', stroke: '#914C1D', strokeWidth: 2 } },
    },
    behaviors: [{ type: BUSINESS_SELECT, state: 'active' } satisfies BusinessSelectOptions],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  const status = document.createElement('div');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;z-index:20;background:white;color:#334155;padding:6px 10px;border-radius:6px;font:12px system-ui;';
  status.setAttribute('role', 'status');
  const updateStatus = () => {
    status.textContent = `active: ${graph.findNodesByState('active').join(', ') || 'none'} | selected: ${graph.findNodesByState('selected').join(', ') || 'none'}`;
  };
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { status.remove(); destroy(); };
  try {
    await graph.render();
    graph.on('node:click', updateStatus);
    graph.on('canvas:click', updateStatus);
    updateStatus();
    container.append(status);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```



## Register and activate [#register-and-activate]

The example calls registerBusinessSelect before constructing Graph and checks the configuration with satisfies BusinessSelectOptions. String names also activate the Behavior; normalized init options include type, and missing state defaults to active.

Multiple Graphs can reuse the registered factory; each mounted Behavior owns its context and state. Re-registering a name does not replace mounted instances. See [mounting and updates](/en/docs/api/options#mounting-and-updates).

## Event typing [#event-typing]

getEvents infers argument tuples from GraphEventMap. node:click has typed nodeId and nativeEvent; destroy has no arguments. Extend consumer event types by intersection:

```ts
import type { BehaviorExtension, BehaviorOptions, GraphEventMap } from '@antv/g6-lite';

interface BusinessEventMap {
  'business:reset': [payload: { source: 'toolbar' | 'shortcut' }];
}
type BusinessBehavior = BehaviorExtension<
  BehaviorOptions<'business-select'>,
  GraphEventMap & BusinessEventMap
>;
```

The application can call `graph.emit('business:reset', { source: 'toolbar' })` to invoke this handler. Augment `GraphEventMap` to check the payload at the call site. See the [custom event example](/en/docs/guides/events/custom).

## Lifecycle and cleanup [#lifecycle-and-cleanup]

The engine runs create → init → getEvents, then unbinds handlers and calls destroy on teardown. [`setBehaviors()`](/en/docs/api/graph#setbehaviors) and `updateOptions({ behaviors })` destroy the old behaviors and create those in the new list. A behavior with the same name still receives new options in the new instance’s init. Readonly options are a type constraint, with no guarantee of runtime freezing.

The engine cleans up getEvents bindings. Clean up your own window listeners, timers, observers, and DOM in destroy. Graph stays alive when behaviors switch, so use a behavior-local AbortController or teardown flag for asynchronous work and handle Promise rejections.

## Use a custom behavior in your project [#boundaries-and-replacement]

Use `context.state` to change element states and `context.data.updateNode()` or `updateEdge()` to change business data. Register the behavior under a distinct name, such as `docs-business-select`, to avoid overriding a built-in behavior. [Extension context API](/en/docs/api/extensions#extensioncontext) · [Registration rules](/en/docs/api/extensions#registration-rules)

In the example above, click B, then click empty canvas. B gains and then loses its `active` state. A stays `selected` throughout. The `select()` function in the full code shows how to change only the state owned by this behavior. [Try the example](#complete-implementation)

Continue with the [Behavior reference](/en/docs/api/options#options-behaviors), [interaction guide](/en/docs/guides/behaviors), or [Extension system](/en/docs/guides/extensions).

**Related runnable examples**

* [Register a custom interaction](/en/docs/examples/custom-behavior)
