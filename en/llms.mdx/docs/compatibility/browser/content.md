# Browsers and runtime environment (/en/docs/compatibility/browser)



G6-GL prefers WebGL 2.0 and falls back to WebGL 1.0. Canvas 2D is used for labels and combo outlines, so WebGL 2.0 is not a hard requirement.

## Minimum versions [#minimum-versions]

| Browser                  | Minimum        | Release year | Main boundary                                     |
| ------------------------ | -------------- | ------------ | ------------------------------------------------- |
| Chrome                   | 80+            | 2020         | ES2020 syntax, native ESM, and WebGL 1.0          |
| Firefox                  | 74+            | 2020         | ES2020 syntax, native ESM, and WebGL 1.0          |
| Safari on macOS          | 13.1+          | 2020         | ES2020 syntax and WebGL 1.0                       |
| Safari on iOS            | 13.4+          | 2020         | ES2020 syntax; mobile GPU limits still apply      |
| Edge                     | 80+ (Chromium) | 2020         | Chromium-based Edge only; EdgeHTML is unsupported |
| Android WebView / Chrome | 80+            | 2020         | ES2020 syntax; validate low-end GPU capacity      |

Internet Explorer and EdgeHTML are not supported. These are syntax and platform boundaries for the untranspiled ESM-only package, not a complete certified device matrix. See [Can I Use optional chaining](https://caniuse.com/mdn-javascript_operators_optional_chaining), [Chrome 80](https://developer.chrome.com/blog/new-in-chrome-80), [Firefox 74](https://www.mozilla.org/firefox/74.0/releasenotes/), and [Safari 13.1](https://webkit.org/blog/10247/new-webkit-features-in-safari-13-1/).

## Coverage reference [#coverage-reference]

Using global usage data from `caniuse-lite@1.0.30001806`, retrieved on **2026-07-29**:

* The browser families and minimum versions explicitly listed above account for approximately &#x2A;*90.4%** of global browser usage.
* Across every browser tracked by Can I Use, versions supporting both WebGL 1.0 and native ESM account for approximately &#x2A;*94.8%**.

Sources: [Can I Use WebGL](https://caniuse.com/webgl), [JavaScript modules](https://caniuse.com/es6-module), and [caniuse-lite](https://github.com/browserslist/caniuse-lite). These figures are selection references, not G6-GL device certification rates. Enterprise browsers, embedded WebViews, disabled GPU acceleration, and low-end devices require separate validation.

## Comparison with sigma.js [#comparison-with-sigmajs]

The sigma.js v3 README describes a WebGL renderer for graphs with thousands of nodes and edges, built on Graphology. Its `sigma@3.0.3` package provides both ESM and CommonJS builds. The official [README](https://github.com/jacomyal/sigma.js#readme) and [package metadata](https://github.com/jacomyal/sigma.js/blob/main/packages/sigma/package.json) checked on 2026-07-29 do not publish an equivalent minimum-browser matrix.

An omitted matrix should not be interpreted as legacy-browser support. Both libraries require WebGL and a modern JavaScript toolchain; G6-GL explicitly documents the syntax floor of its untranspiled package, while sigma.js consumers need to validate their own build target.

G6-GL needs a real DOM canvas and WebGL context. In Next.js, Nuxt, or other SSR frameworks, instantiate `Graph` only on the client. Standard mini-program runtimes without compatible DOM and WebGL surfaces are not supported.

The renderer uses `regl`, which dynamically compiles WebGL commands. If the host enables Content Security Policy, `script-src` must allow `'unsafe-eval'`; `'wasm-unsafe-eval'` alone is not sufficient. Hosts that cannot allow this directive are not supported by the current renderer.

Hardware acceleration, mobile GPU memory, high DPR, and browser limits on active WebGL contexts affect capacity. Handle `WebGL not supported`, keep graph containers at non-zero size, and test realistic devices.
