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
  basic: () => import('../../demos/basic.ts'),
  'default-theme': () => import('../../demos/default-theme.ts'),
  'data-mutations': () => import('../../demos/data-mutations.ts'),
  'queries-and-states': () => import('../../demos/queries-and-states.ts'),
  'set-data': () => import('../../demos/set-data.ts'),
  'search-focus': () => import('../../demos/search-focus.ts'),
  'node-style': () => import('../../demos/node-style.ts'),
  shapes: () => import('../../demos/shapes.ts'),
  'node-border': () => import('../../demos/node-border.ts'),
  'edge-arrows': () => import('../../demos/edge-arrows.ts'),
  'edge-types': () => import('../../demos/edge-types.ts'),
  'edge-colors': () => import('../../demos/edge-colors.ts'),
  'edge-states': () => import('../../demos/edge-states.ts'),
  'edge-hit-area': () => import('../../demos/edge-hit-area.ts'),
  'parallel-edges': () => import('../../demos/parallel-edges.ts'),
  'edge-loops': () => import('../../demos/edge-loops.ts'),
  labels: () => import('../../demos/labels.ts'),
  'label-rendering-options': () => import('../../demos/label-rendering-options.ts'),
  'polyline-routing': () => import('../../demos/polyline-routing.ts'),
  combo: () => import('../../demos/combo.ts'),
  layouts: () => import('../../demos/layouts.ts'),
  'layout-gallery': () => import('../../demos/layout-gallery.ts'),
  flowchart: () => import('../../demos/flowchart.ts'),
  'indented-tree': () => import('../../demos/indented-tree.ts'),
  'layout-worker': () => import('../../demos/layout-worker.ts'),
  'radial-tree': () => import('../../demos/radial-tree.ts'),
  'dependency-graph': () => import('../../demos/dependency-graph.ts'),
  relationship: () => import('../../demos/relationship.ts'),
  'org-chart': () => import('../../demos/org-chart.ts'),
  mindmap: () => import('../../demos/mindmap.ts'),
  fishbone: () => import('../../demos/fishbone.ts'),
  tooltip: () => import('../../demos/tooltip.ts'),
  hover: () => import('../../demos/hover.ts'),
  'neighbor-highlight': () => import('../../demos/neighbor-highlight.ts'),
  'selection-behaviors': () => import('../../demos/selection-behaviors.ts'),
  'drag-node': () => import('../../demos/drag-node.ts'),
  'drag-edge': () => import('../../demos/drag-edge.ts'),
  'event-log': () => import('../../demos/event-log.ts'),
  'context-menu': () => import('../../demos/context-menu.ts'),
  'viewport-controls': () => import('../../demos/viewport-controls.ts'),
  'zoom-options': () => import('../../demos/zoom-options.ts'),
  'extension-system': () => import('../../demos/extension-system.ts'),
  'breathing-node': () => import('../../demos/breathing-node.ts'),
  'custom-label-renderer': () => import('../../demos/custom-label-renderer.ts'),
  'custom-node-extension': () => import('../../demos/g6-v5-compat.ts'),
  'custom-behavior': () => import('../../demos/custom-behavior.ts'),
  'custom-layout': () => import('../../demos/custom-layout.ts'),
  'decoration-badges': () => import('../../demos/decoration-badges.ts'),
  'real-dataset': () => import('../../demos/real-dataset.ts'),
  large: () => import('../../demos/large.ts'),
  'large-labeled': () => import('../../demos/large-labeled.ts'),
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
