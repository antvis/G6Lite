# Migrate from G6 v5 (/en/docs/compatibility/g6-v5-migration)



G6-GL borrows G6 configuration concepts but is not a complete replacement for G6 v5. Migration is most suitable when large-graph interaction and state updates are the primary bottleneck and the product uses core node, edge, layout, and behavior capabilities.

Do not migrate blindly when the project depends on the complete plugin ecosystem, animation system, complex Canvas element customization, or built-in graph analysis.

Suggested process:

1. Reproduce one real workflow in the deployed Playground.
2. Normalize data to nodes, edges, and optional combos.
3. Map styles and states through package-root Graph options.
4. Replace G6 behavior names with supported G6-GL behaviors.
5. Verify layouts, events, incremental updates, compatibility, and performance on target devices.

Keep the original implementation until the real-data acceptance suite passes.
