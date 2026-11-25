# Diagnosis and performance

Start with the observed failure and a small reproduction. Retain the application's package version and capture the browser console/network evidence before proposing library internals changes.

## Symptom guide

| Symptom | Check first | Likely correction |
| --- | --- | --- |
| `G6Lite` is undefined | Script response, status, CSP, load order | Load the UMD entry before initialization; show an actionable load error |
| Blank canvas | Actual container bounds, selector, WebGL, console errors | Use an existing sized client-side DOM element; reduce to two nodes |
| All nodes overlap | Coordinates, layout type, optional registration | Supply coordinates or load/register the selected layout |
| Missing labels/borders | `node.style` fields and callback return values | Use `label`, `labelColor`, `strokeWidth`; remove G6 v5 option shapes |
| State styles do not apply | State names, configuration location, whole-object node style function | Use per-field node style callbacks and node/edge `stateStyles` |
| Dragging fails after arrows were added | Arrow value types | Use boolean `endArrow`/`startArrow`, numeric `arrowSize` |
| Hover does not dim unrelated nodes | Behavior name, `inactiveState`, stateStyles | Use `hover-highlight` plus the `inactive` state configuration |
| Click listener runs but nothing is selected | Active behaviors | Enable `click-select`; listening and state mutation are separate |
| Camera jumps on refresh | `setData` second argument and later fit calls | Pass `{ fitView: false }` and avoid immediately fitting afterward |
| Selection disappears on refresh | Stable IDs and incoming `states` | Preserve the required state explicitly in replacement data |
| Stale data or duplicate canvases in React | Effect dependencies, async initialization, cleanup | Keep one instance per mount, serialize/guard updates, destroy on cleanup |
| Menu drifts while zooming | DOM mounting location and coordinate space | Use client coordinates for fixed DOM and canvas coordinates for local overlays |
| Layout finishes but the page stalls | Worker assets, actual thread, callbacks, graph density | Verify fallback; bound iterations and label work |
| Multiple graphs eventually fail | Unmount cleanup and WebGL context count | Destroy unused graphs and owned overlays/listeners |

## Isolate without losing evidence

1. Record package version, input size, browser/device, container dimensions, error text, and relevant failing requests.
2. Reduce to valid node IDs, existing edge endpoints, a sized container, and a built-in layout or supplied coordinates.
3. Add labels/styles, interactions, Combo, optional layouts, and extensions back according to the failing feature. Confirm the first addition that reproduces it.
4. Compare that configuration to installed declarations and an official example. If it is a library defect, retain the minimal reproduction and expected/observed behavior.

For React/SSR, Graph construction belongs in a client effect. Static imports of the ESM package are not evidence that Graph can render server-side. For async refresh, check whether `setData()` ran before `render()` completed; no initialized runtime exists at that point.

## Measure performance before tuning

Separate business-data conversion, layout, first draw, interaction frame times, and retained memory. Record node/edge counts, topology, labels, viewport, DPR, browser, GPU, and production/development mode. Compare the same dataset and settings before and after a change.

Use state batches and position patches for frequent interactions. Avoid full dataset replacement for every hover, drag, or small attribute change. Precompute repeated lookups outside style callbacks and reduce label density before touching renderer internals. Check layout iteration settings and actual Worker use as described in [layouts.md](layouts.md).

Destroy and recreate several times when investigating leaks or framework lifecycle failures. Observe application-owned listeners, DOM overlays, timers, and Workers as well as Graph. Report measured results and limits; a small headless or software-GPU run does not establish real-device capacity.

Official references: [Graph API](https://g6lite.antv.vision/en/docs/api/graph), [Worker deployment](https://g6lite.antv.vision/en/docs/guides/layout-worker), [viewport policies](https://g6lite.antv.vision/en/docs/guides/viewport), [performance](https://g6lite.antv.vision/en/docs/metrics/performance).
