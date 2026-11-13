# Troubleshooting (/en/docs/compatibility/troubleshooting)



Keep a minimal reproduction and console errors, then change one condition at a time. Verify the environment with the [quick start](/en/docs/getting-started/quick-start) instead of changing data, layout, and styling together.

[Blank canvas](#blank-canvas) · [Graph is very small](#tiny-graph-or-unexpected-position) · [Missing labels](#missing-or-overlapping-labels) · [Installation and runtime](#installation-and-runtime)

## Blank canvas [#blank-canvas]

Check mounted/non-zero container dimensions, initialization errors, unique node IDs, and endpoints. Start with two nodes and an edge, without optional styling or extensions.

```ts
const container = document.querySelector<HTMLElement>('#container');
console.table({
  exists: Boolean(container),
  width: container?.clientWidth ?? 0,
  height: container?.clientHeight ?? 0,
  visibility: document.visibilityState,
});
```

If dimensions are valid but WebGL fails, check GPU/host/CSP instead of repeatedly constructing Graph.
[Runtime requirements](/en/docs/compatibility/browser) · [Data identity rules](/en/docs/api/options#options-data)

## Tiny graph or unexpected position [#tiny-graph-or-unexpected-position]

Check coordinates, outliers, and dimensions before changing fitView padding/maxZoom. First render, resize, setData, and layout fit differently. Do not force fitting after every user zoom.
[Why the graph is still small](/en/docs/guides/viewport#why-is-the-graph-still-small-after-fitting)

## Missing or overlapping labels [#missing-or-overlapping-labels]

Confirm node/edge.style.label produces text; then check zoom thresholds, collisions, colors, and clipping. Disable policies for a comparison, then restore them individually.
[Label guide](/en/docs/guides/label) · [Policy fields](/en/docs/api/options#options-label)

## Clicking, dragging, or edge events do not respond [#clicking-dragging-or-edge-events-do-not-respond]

Check behaviors, required Behavior types, and modifiers; \[] disables defaults. Inspect DOM overlays, edge hit areas, and event types. Subscribing to a derived event does not enable its Behavior.
[Interaction composition](/en/docs/guides/behaviors) · [Event reference](/en/docs/api/graph/events)

## Worker does not run or falls back [#worker-does-not-run-or-falls-back]

Inspect Worker requests, execution threads, clone errors, and server responses. Function/cyclic configuration may not clone; worker: true is not evidence of success.
[Worker deployment and cancellation](/en/docs/guides/layout-worker)

## Leftovers or duplicate responses after unmount [#leftovers-or-duplicate-responses-after-unmount]

Pair creation/destroy, on/off, and requests/cancellation. Handle StrictMode’s extra mounting with cleanup instead of skipping setup.
[React](/en/docs/getting-started/react) · [Vue](/en/docs/getting-started/vue) · [Extension cleanup](/en/docs/api/graph#extension-registration)

## Performance issues [#performance-issues]

### What if force layout makes startup slow? [#what-if-force-layout-makes-startup-slow]

Measure layout separately from render. Omit layout for supplied positions and assess Worker/iteration options where supported. See [performance tuning](/en/docs/metrics/performance#performance-tuning).

### What if highlighting or selection stutters? [#what-if-highlighting-or-selection-stutters]

Reuse Graph and update states instead of rebuilding or replacing the graph for a highlight. See the [state guide](/en/docs/guides/states).

## Installation and runtime [#installation-and-runtime]

### What browsers and WebGL capabilities are required? [#what-browsers-and-webgl-capabilities-are-required]

Real DOM, Canvas 2D, and a usable WebGL1 or WebGL2 context are required. See [runtime requirements](/en/docs/compatibility/browser) for modules, Worker, and CSP.

### Can Graph run directly in Node.js or during SSR? [#can-graph-run-directly-in-nodejs-or-during-ssr]

Graph does not render in ordinary Node.js/SSR. Create it after client mounting and destroy on unmount; see [framework integration](/en/docs/getting-started/react).

### Where should TypeScript types be imported from? [#where-should-typescript-types-be-imported-from]

Import values and types from the `@antv/g6-lite` package root and use the declarations shipped with your installed version. See [Configuration options](/en/docs/api/options) for constructor options and data types.

### What if an installed package does not contain a field? [#what-if-an-installed-package-does-not-contain-a-field]

Identify the actual version and root types rather than copying development-only fields. See [installation](/en/docs/getting-started/quick-start) for known archive and UMD differences.

## Choosing features and finding examples [#choosing-features-and-finding-examples]

### How should I choose between G6Lite and G6 v5? [#how-should-i-choose-between-g6lite-and-g6-v5]

Compare required graphics, runtime, and interactions, then validate with your own data. See [What is G6Lite?](/en/docs) for G6Lite's intended use cases.

### Can I use Combo? [#can-i-use-combo]

Grouping, nesting, and collapsing can be evaluated but remain experimental. Check [Combo boundaries](/en/docs/api/options#options-combo).

### Can examples run online? [#can-examples-run-online]

Run the [example gallery](/en/docs/examples); each case includes code, data descriptions, and interaction expectations.

## Provide reproducible information [#provide-reproducible-information]

```text
Package version / source commit:
Framework / bundler / deployment base path:
Browser / OS / GPU / DPR / container CSS size:
Minimal GraphData and options:
Steps:
Expected / actual:
First console error and failed network request:
Does the minimal quick-start graph work?
```
