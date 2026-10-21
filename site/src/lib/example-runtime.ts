'use client';

export interface SiteExampleHandle {
  destroy(): void;
  fitView(): void | Promise<void>;
  getData?(): unknown;
  ready?: Promise<void>;
}

interface SiteExampleModule {
  run(container: string | HTMLElement): Promise<SiteExampleHandle>;
}

const loaders: Record<string, () => Promise<SiteExampleModule>> = {
  basic: () => import('../../../playground/demos/basic.ts'),
  'default-theme': () => import('../../../playground/demos/default-theme.ts'),
  'data-mutations': () => import('../../../playground/demos/data-mutations.ts'),
  'queries-and-states': () => import('../../../playground/demos/queries-and-states.ts'),
  'set-data': () => import('../../../playground/demos/set-data.ts'),
  'search-focus': () => import('../../../playground/demos/search-focus.ts'),
  'node-style': () => import('../../../playground/demos/node-style.ts'),
  shapes: () => import('../../../playground/demos/shapes.ts'),
  'node-border': () => import('../../../playground/demos/node-border.ts'),
  'edge-arrows': () => import('../../../playground/demos/edge-arrows.ts'),
  'edge-types': () => import('../../../playground/demos/edge-types.ts'),
  'edge-colors': () => import('../../../playground/demos/edge-colors.ts'),
  'edge-states': () => import('../../../playground/demos/edge-states.ts'),
  'edge-hit-area': () => import('../../../playground/demos/edge-hit-area.ts'),
  'parallel-edges': () => import('../../../playground/demos/parallel-edges.ts'),
  'edge-loops': () => import('../../../playground/demos/edge-loops.ts'),
  labels: () => import('../../../playground/demos/labels.ts'),
  'label-rendering-options': () => import('../../../playground/demos/label-rendering-options.ts'),
  'polyline-routing': () => import('../../../playground/demos/polyline-routing.ts'),
  combo: () => import('../../../playground/demos/combo.ts'),
  layouts: () => import('../../../playground/demos/layouts.ts'),
  'layout-gallery': () => import('../../../playground/demos/layout-gallery.ts'),
  flowchart: () => import('../../../playground/demos/flowchart.ts'),
  'indented-tree': () => import('../../../playground/demos/indented-tree.ts'),
  'layout-worker': () => import('../../../playground/demos/layout-worker.ts'),
  'radial-tree': () => import('../../../playground/demos/radial-tree.ts'),
  'dependency-graph': () => import('../../../playground/demos/dependency-graph.ts'),
  relationship: () => import('../../../playground/demos/relationship.ts'),
  'org-chart': () => import('../../../playground/demos/org-chart.ts'),
  mindmap: () => import('../../../playground/demos/mindmap.ts'),
  fishbone: () => import('../../../playground/demos/fishbone.ts'),
  tooltip: () => import('../../../playground/demos/tooltip.ts'),
  hover: () => import('../../../playground/demos/hover.ts'),
  'neighbor-highlight': () => import('../../../playground/demos/neighbor-highlight.ts'),
  'selection-behaviors': () => import('../../../playground/demos/selection-behaviors.ts'),
  'drag-node': () => import('../../../playground/demos/drag-node.ts'),
  'drag-edge': () => import('../../../playground/demos/drag-edge.ts'),
  'event-log': () => import('../../../playground/demos/event-log.ts'),
  'context-menu': () => import('../../../playground/demos/context-menu.ts'),
  'viewport-controls': () => import('../../../playground/demos/viewport-controls.ts'),
  'zoom-options': () => import('../../../playground/demos/zoom-options.ts'),
  'extension-system': () => import('../../../playground/demos/extension-system.ts'),
  'breathing-node': () => import('../../../playground/demos/breathing-node.ts'),
  'custom-label-renderer': () => import('../../../playground/demos/custom-label-renderer.ts'),
  'custom-node-extension': () => import('../../../playground/demos/g6-v5-compat.ts'),
  'custom-behavior': () => import('../../../playground/demos/custom-behavior.ts'),
  'custom-layout': () => import('../../../playground/demos/custom-layout.ts'),
  'decoration-badges': () => import('../../../playground/demos/decoration-badges.ts'),
  'real-dataset': () => import('../../../playground/demos/real-dataset.ts'),
  large: () => import('../../../playground/demos/large.ts'),
  'large-labeled': () => import('../../../playground/demos/large-labeled.ts'),
};

export async function runSiteExample(
  id: string,
  container: HTMLElement,
): Promise<SiteExampleHandle> {
  const loader = loaders[id];
  if (!loader) throw new Error(`Unknown site example: ${id}`);

  const demoModule = await loader();
  const handle = await demoModule.run(container);
  if (!handle || typeof handle.destroy !== 'function') {
    throw new Error(`Site example ${id} did not return a destroyable handle`);
  }
  if (typeof handle.fitView !== 'function') {
    throw new Error(`Site example ${id} did not return a fitView-capable handle`);
  }

  return handle;
}
