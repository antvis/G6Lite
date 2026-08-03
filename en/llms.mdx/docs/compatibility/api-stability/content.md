# API stability and release boundary (/en/docs/compatibility/api-stability)



G6Lite remains in the `0.1.x` beta. The npm package root and `package.json#exports` define the only public API boundary. Do not import deep `src/` or build-output paths.

Recommended public entries include `Graph`, `register()`, `extensionFactory()`, `runLayout()`, and the configuration/data/extension types exported from the package root.

## ESM and CommonJS [#esm-and-commonjs]

The package root is ESM-only and does not provide a `require('@antv/g6-lite')` condition. A CommonJS feasibility test confirmed that a synchronous entry and declarations can be emitted, but a dual package must also preserve two runtime contracts:

* ESM and CommonJS consumers must share one extension registry when both formats are loaded by the same application.
* After application bundling, `layout.worker: true` must still resolve and load the package's module Worker instead of silently falling back to the main thread.

The current CommonJS consumer build cannot reliably preserve that Worker asset relationship and requests a missing Worker file; independent dual builds also create separate module-scoped registries. This release therefore does not publish a partial CommonJS build whose synchronous import works while Worker or extension behavior differs.

Applications that still use a CommonJS toolchain can cross the client boundary with dynamic import:

```js
const { Graph } = await import('@antv/g6-lite');
```

This does not change the requirement for a real DOM, Canvas, and WebGL environment.

Deprecated compatibility APIs include `BaseNode`, `BreathingNode`, `registerNode()`, `context.graph`, flattened ExtensionContext coordinate methods, `Graph#getAllData()`, and the old event `originalEvent` field. New code should use functional extensions, structured context, explicit queries, and current event objects.

Combo collapse, nesting, and runtime regrouping remain experimental. Read the [Changelog](/en/docs/changelog) before upgrades and run type, build, and critical example checks.
