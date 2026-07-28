# FAQ (/en/docs/faq)



## Should I use G6-GL or G6 v5? [#should-i-use-g6-gl-or-g6-v5]

Choose G6-GL when WebGL rendering, frequent state updates, and a smaller controlled capability surface match the product. Choose G6 v5 when the complete plugin, animation, and element ecosystem matters more.

## Why is first render slow with a force layout? [#why-is-first-render-slow-with-a-force-layout]

Layout computation often dominates first render. Reuse existing coordinates, control iterations, use a worker, or choose a deterministic layout. Measure with the repository Benchmark runner.

## Can G6-GL run during SSR? [#can-g6-gl-run-during-ssr]

No. It needs a real DOM canvas and WebGL context. Instantiate `Graph` in a client-only lifecycle such as React `useEffect`.

## Where do TypeScript types come from? [#where-do-typescript-types-come-from]

Import values and types from `@antv/g6-gl`. Deep `src/` paths are not public API.

## Are combos stable? [#are-combos-stable]

Combo rendering is available, but collapse, nesting, and runtime regrouping remain experimental in `0.1.x`.
