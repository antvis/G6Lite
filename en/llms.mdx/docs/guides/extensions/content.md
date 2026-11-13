# Extension system (/en/docs/guides/extensions)



Prefer configuration before developing an extension. Extension covers eight categories; Plugin means independent DOM and peripheral state, not all extension types.

## Choosing a category [#choosing-a-category]

| Task                                         | Tutorial                                                | Contract                                                              |
| -------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------- |
| Reusable nodes, overlays, decoration anchors | [Custom nodes](/en/docs/guides/custom-node)             | [NodeExtension](/en/docs/api/extensions#nodeextension)                |
| Edge bases, business styles, states          | [Custom edges](/en/docs/guides/custom-edge)             | [EdgeExtension](/en/docs/api/extensions#edgeextension)                |
| Node or edge label content                   | [Label Renderer](/en/docs/guides/custom-label-renderer) | [LabelRenderer](/en/docs/api/extensions#labelrenderer)                |
| Node decoration content                      | [Decoration](/en/docs/guides/custom-decoration)         | [DecorationRenderer](/en/docs/api/extensions#decorationrenderer)      |
| Graph event-driven interaction               | [Custom interactions](/en/docs/guides/custom-behavior)  | [Behavior contract](/en/docs/api/options#custom-interaction-contract) |
| Position calculations                        | [Custom layouts](/en/docs/guides/custom-layout)         | [LayoutExtension](/en/docs/api/extensions#layoutextension)            |
| Whole-input preprocessing                    | [Transforms](/en/docs/guides/transform-overview)        | [TransformExtension](/en/docs/api/extensions#transformextension)      |
| Independent DOM, subscriptions, state        | [Plugins](/en/docs/guides/custom-plugin)                | [PluginExtension](/en/docs/api/extensions#pluginextension)            |

Tutorials pair code with live canvases. See the [combined example](/en/docs/examples/extension-system), or [built-in badges](/en/docs/examples/decoration-badges) before implementing common content.

## Registration and activation [#registration-and-activation]

Registration defines a name; Graph configuration activates it. Register before first use. See [registration](/en/docs/api/extensions#extension-types) for overloads, replacement, and compatibility inputs.

## Lifecycle by category [#lifecycle-by-category]

Drawing descriptors are cached and stateless. Runtime factories return fresh instances by category and configuration position, not exactly once per Graph. See [instance scope](/en/docs/api/extensions#instance-scope).

Layout cancellation and standalone execution are in [Custom layouts](/en/docs/guides/custom-layout). To rerun an existing graph, use [layout methods](/en/docs/api/graph#graph-layout).

## Public capability boundary [#public-capability-boundary]

Use [ExtensionContext](/en/docs/api/extensions#extensioncontext) for snapshots, states, coordinates, and cleanup. Avoid context.graph and internal Renderer / DataModel. Drawing extensions retain supported bases, picking, and engine positioning rather than taking over rendering.

Runtime extensions release owned DOM, subscriptions, timers, and asynchronous work. Explicitly injected application capabilities can provide controlled host collaboration, as shown in the Plugin tutorial.

## Decoration visibility [#decoration-visibility]

Follow [Custom decorations](/en/docs/guides/custom-decoration) for measuring, drawing, stacking, overflow, and collisions. See [DecorationRenderer](/en/docs/api/extensions#decorationrenderer) for callbacks and [decoration configuration](/en/docs/api/options#config-node-decoration) for placement fields.

For simple styles, labels, states, or Tooltip, prefer [node](/en/docs/guides/node), [edge](/en/docs/guides/edge), [label](/en/docs/guides/label), and [interaction](/en/docs/guides/behaviors) configuration first. See [Transform / Plugin options](/en/docs/api/options#options-transforms-plugins) for constructor-option boundaries. Import public types from the package root, not source internals.

**Related runnable examples**

* [Extension system showcase](/en/docs/examples/extension-system)
