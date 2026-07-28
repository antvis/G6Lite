# API stability and release boundary (/en/docs/compatibility/api-stability)



G6-GL remains in the `0.1.x` beta. The npm package root and `package.json#exports` define the only public API boundary. Do not import deep `src/` or build-output paths.

Recommended public entries include `Graph`, `register()`, `extensionFactory()`, `runLayout()`, and the configuration/data/extension types exported from the package root.

Deprecated compatibility APIs include `BaseNode`, `BreathingNode`, `registerNode()`, `context.graph`, flattened ExtensionContext coordinate methods, `Graph#getAllData()`, and the old event `originalEvent` field. New code should use functional extensions, structured context, explicit queries, and current event objects.

Combo collapse, nesting, and runtime regrouping remain experimental. Read the [Changelog](/en/docs/changelog) before upgrades and run type, build, and critical example checks.
