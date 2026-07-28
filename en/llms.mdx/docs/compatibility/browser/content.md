# Browsers and runtime environment (/en/docs/compatibility/browser)



G6-GL requires WebGL 1.0 and a modern browser capable of running the ESM/ES2020 package. Canvas 2D is used for labels and combo outlines. WebGL 2.0 is not required.

Recommended minimums for the untranspiled package are Chrome/Edge 80+, Firefox 74+, Safari 13.1+, and iOS Safari 13.4+. These are syntax and platform capability boundaries, not a complete certified device matrix.

G6-GL needs a real DOM canvas and WebGL context. In Next.js, Nuxt, or other SSR frameworks, instantiate `Graph` only on the client. Standard mini-program runtimes without compatible DOM and WebGL surfaces are not supported.

Hardware acceleration, mobile GPU memory, high DPR, and browser limits on active WebGL contexts affect capacity. Handle `WebGL not supported`, keep graph containers at non-zero size, and test realistic devices.
