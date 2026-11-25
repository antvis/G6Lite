# G6 v5 to G6Lite

Assess whether the current visualization can be preserved before replacing imports. G6Lite is not a drop-in G6 v5 runtime.

## Inventory and decision

List current data shape, element types, layouts, behaviors, events, plugins, animations, renderer assumptions, and update operations. Mark each as directly supported, needing adaptation, or unsupported. Keep the user's existing G6 implementation when required capabilities cannot be preserved and no alternative has been agreed.

Requirements such as React/HTML node trees, multiple renderers, SSR, 3D, full animation orchestration, rich G6 plugin integrations, or graph algorithms need explicit alternatives. Do not claim that changing the package name supplies these features.

## Map the contract explicitly

| Area | G6Lite target | Verification |
| --- | --- | --- |
| Imports | Public `@antv/g6-lite` ESM exports | Installed declarations and package export map |
| Data | `nodes`, `edges`, optional `combos`; node `x`/`y`; business `data` | Unique string IDs and existing endpoints |
| Nodes/edges | Built-in circle/rect and supported edge paths, or a supported extension | Actual appearance, labels, hit areas |
| Styles | G6Lite `node.style`, `edge.style`, state styles | Field names and callback signatures |
| Arrows | Boolean `endArrow`/`startArrow` and numeric `arrowSize` | Render and drag after conversion |
| Layout | A supported built-in or registered optional layout | Parameters, hierarchy, cancellation, Worker behavior |
| Behaviors | G6Lite names and configuration shapes | Required defaults included in a replacement list |
| Events | Typed node/edge/Combo/canvas payloads | IDs, coordinates, selection and drag payloads |
| Data updates | `setData`, incremental mutation/state/position APIs | Camera and state retention policies |
| Extensions | `register()` with G6Lite extension contracts | Activation, fresh stateful instances, cleanup |

Use [API recipes](api-recipes.md) and [layout loading](layouts.md) for concrete code. Custom rendering must fit G6Lite's extension contract; do not port G6 v5 base classes or plugins by name alone.

## Validate against the original behavior

Preserve representative data and compare labels, directions, layout intent, hover, selection, drag, data refresh, and cleanup. Call out intentional differences and unsupported features in the delivery. Performance comparisons need the same topology, viewport, device, and visible features; do not trade away required behavior silently.
