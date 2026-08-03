# Custom Behavior (/en/docs/guides/custom-behavior)



A Behavior consumes public Graph events and updates data or states through `ExtensionContext`. Use it for graph interactions such as business selection, highlighting, or event coordination. Use a Plugin for independently owned DOM, observers, keyboard listeners, or peripheral controllers, and use a Transform for render-time data preprocessing.

## Public type pattern [#public-type-pattern]

The core public types are:

```ts
interface BehaviorOptions<TType extends string = string> {
  type: TType;
}

type BehaviorConfig<
  TType extends string = string,
  TOptions extends object = Record<string, unknown>,
> = Readonly<BehaviorOptions<TType> & TOptions>;

interface BehaviorExtension<
  TOptions extends BehaviorOptions = BehaviorConfig,
  TEventMap extends object = GraphEventMap,
> {
  init?(context: ExtensionContext, options: Readonly<TOptions>): void;
  getEvents(): BehaviorEventHandlers<TEventMap>;
  destroy?(): void;
}
```

`GraphEventMap` is the single “event name → argument tuple” contract. It infers a required `nodeId` and `MouseEvent` for `'node:click'`, a `WheelEvent` for `'canvas:wheel'`, and zero arguments for `destroy`.

## Recommended exports [#recommended-exports]

A reusable Behavior should export a stable name, its options type, and an explicit registration function:

```text
src/
  behavior.ts
  index.ts
tests/
  behavior.test.ts
```

Avoid registration through import side effects alone. Applications should call the registration function before creating the Graph so global registry ordering and name replacement remain visible.

## Complete implementation [#complete-implementation]

```ts
import {
  extensionFactory,
  register,
  type BehaviorExtension,
  type BehaviorOptions,
  type ElementState,
  type ExtensionContext,
} from '@antv/g6-lite';

export const BUSINESS_SELECT_BEHAVIOR = 'business-select' as const;

export interface BusinessSelectBehaviorOptions extends BehaviorOptions<
  typeof BUSINESS_SELECT_BEHAVIOR
> {
  state?: ElementState;
}

function createBusinessSelectBehavior(): BehaviorExtension<BusinessSelectBehaviorOptions> {
  let context: ExtensionContext | undefined;
  let state: ElementState = 'selected';

  return {
    init(nextContext, options) {
      context = nextContext;
      state = options.state ?? 'selected';
    },

    getEvents() {
      return {
        'node:click': ({ nodeId, nativeEvent }) => {
          if (nativeEvent.button !== 0) return;
          context?.state.set(nodeId, [state]);
        },
        'canvas:click': () => {
          if (!context) return;
          const stateMap = Object.fromEntries(context.data.getNodeIds().map((id) => [id, []]));
          context.state.setAll(stateMap);
        },
      };
    },

    destroy() {
      context = undefined;
    },
  };
}

export function registerBusinessSelectBehavior(): void {
  register('behavior', BUSINESS_SELECT_BEHAVIOR, extensionFactory(createBusinessSelectBehavior));
}
```

This pattern does not extend `this`, inherit from a base class, or require intersection-type assertions. Every factory call returns a fresh closure so Graph instances do not share context or mutable options.

## Register and activate [#register-and-activate]

```ts
registerBusinessSelectBehavior();

const graph = new Graph({
  container: 'container',
  data,
  behaviors: [
    'zoom-canvas',
    {
      type: BUSINESS_SELECT_BEHAVIOR,
      state: 'active',
    } satisfies BusinessSelectBehaviorOptions,
  ],
});
```

Both a string reference and an object activate the extension. A string is normalized to `{ type: BUSINESS_SELECT_BEHAVIOR }`, so the read-only options passed to `init()` always include `type`.

`BuiltInBehaviorOptionsMap` maps built-in names to their supported object configurations, while `BuiltInBehaviorConfig` is their union. `GraphOptions.behaviors` remains open for third-party names; use `satisfies YourBehaviorOptions` to strictly check a custom object.

## Event typing [#event-typing]

A Behavior consumes the complete `GraphEventMap` by default:

```ts
const behavior: BehaviorExtension<BusinessSelectBehaviorOptions> = {
  getEvents() {
    return {
      'node:click': ({ nodeId, nativeEvent }) => {
        // nodeId: string
        // nativeEvent: MouseEvent
      },
      'canvas:wheel': ({ nativeEvent }) => {
        // nativeEvent: WheelEvent
      },
      destroy: () => {
        // zero arguments
      },
    };
  },
};
```

The second generic can extend a host-defined event contract:

```ts
interface BusinessEventMap {
  'business:selection-reset': [payload: { source: 'toolbar' | 'shortcut' }];
}

type BusinessBehavior = BehaviorExtension<
  BusinessSelectBehaviorOptions,
  GraphEventMap & BusinessEventMap
>;
```

This generic adds consumer-side typing only. This release does not add a public event `emit` API; do not use internal `graph.eventEmitter` to publish events.

## Lifecycle and cleanup [#lifecycle-and-cleanup]

The supported Behavior lifecycle is `create → init → getEvents → destroy`. Behavior does not promise `update()`; Graph destroys the old instance and creates a new one when interactions are remounted.

The runtime automatically registers and removes handlers returned by `getEvents()`. Each handler is error-isolated with diagnostics that include the Behavior name and event name, so one failure does not stop unrelated handlers.

Listeners on `window` or `document`, timers, observers, and asynchronous work created directly by the Behavior must still be released in `destroy()`. Resources better owned by a peripheral component should live in a Plugin.

## Boundaries and replacement [#boundaries-and-replacement]

* Import public APIs only from the `@antv/g6-lite` package root.
* Use `context.data`, `context.state`, `context.viewport`, `requestRender()`, and `isDestroyed()`; new code must not depend on deprecated `context.graph`.
* Do not access Renderer, picking, DataModel, WebGL state, or GPU buffers.
* A registered Behavior replaces a built-in Behavior with the same name. A failing registered implementation does not fall back to the built-in implementation.
* Prefix extension names with a business or package namespace to reduce global registry collisions.

If an interaction requires low-level gesture sessions, camera writes, position writes, or a general overlay root that is not public yet, extend the public contract first instead of bypassing it with assertions.

See `playground/demos/extension-system.ts` for a complete runnable example.
