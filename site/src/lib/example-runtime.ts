'use client';

export interface SiteExampleHandle {
  destroy(): void;
  fitView(): void | Promise<void>;
  ready?: Promise<void>;
}

interface SiteExampleModule {
  run(container: string | HTMLElement): Promise<SiteExampleHandle>;
}

const loaders: Record<string, () => Promise<SiteExampleModule>> = {
  basic: () => import('../../../playground/demos/basic.ts'),
  'data-mutations': () => import('../../../playground/demos/data-mutations.ts'),
  'queries-and-states': () => import('../../../playground/demos/queries-and-states.ts'),
  'node-style': () => import('../../../playground/demos/node-style.ts'),
  'edge-arrows': () => import('../../../playground/demos/edge-arrows.ts'),
  'parallel-edges': () => import('../../../playground/demos/parallel-edges.ts'),
  combo: () => import('../../../playground/demos/combo.ts'),
  layouts: () => import('../../../playground/demos/layouts.ts'),
  'layout-gallery': () => import('../../../playground/demos/layout-gallery.ts'),
  tooltip: () => import('../../../playground/demos/tooltip.ts'),
  'selection-behaviors': () => import('../../../playground/demos/selection-behaviors.ts'),
  'viewport-controls': () => import('../../../playground/demos/viewport-controls.ts'),
  'extension-system': () => import('../../../playground/demos/extension-system.ts'),
  'real-dataset': () => import('../../../playground/demos/real-dataset.ts'),
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
