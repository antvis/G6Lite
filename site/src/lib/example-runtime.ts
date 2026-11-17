'use client';

import type { FitViewOptions, Graph } from '../../../src/index.ts';
import { fitDemoView } from './demo-fit';

export interface SiteExampleHandle {
  destroy(): void;
  fitView(): void | Promise<void>;
  getData?(): unknown;
  getGraphs?(): readonly Graph[];
  ready?: Promise<void>;
}

interface SiteExampleModule {
  run(container: string | HTMLElement, fitPreview?: (graph: Graph, options?: FitViewOptions) => void): Promise<SiteExampleHandle>;
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

const compactExamples = new Set([
  'breathing-node', 'context-menu', 'custom-behavior', 'custom-label-renderer',
  'custom-node-extension', 'decoration-badges', 'edge-hit-area', 'edge-loops',
  'edge-types', 'event-log', 'extension-system', 'node-border', 'node-style', 'parallel-edges',
  'polyline-routing', 'shapes', 'tooltip',
]);

function fitExamplePreview(
  handle: SiteExampleHandle,
  getGraphs: () => readonly Graph[],
  container: HTMLElement,
  toolbar: HTMLElement | null,
  compact: boolean,
): SiteExampleHandle {
  let graphs = new Set<Graph>();
  let controls = new Set<Element>();
  let frame = 0;
  let needsFit = false;
  let destroyed = false;
  const events = ['resize', 'afterrender', 'afterlayout', 'datachange'] as const;

  // Layout completion is emitted before the new coordinates are committed.
  // Fit in the next frame, after the graph and any demo-specific handlers finish.
  const schedule = () => {
    if (!destroyed && !frame) frame = requestAnimationFrame(refresh);
  };
  const scheduleFit = () => {
    needsFit = true;
    schedule();
  };
  const resizeObserver = new ResizeObserver(scheduleFit);
  const mutationObserver = new MutationObserver((records) => {
    if (records.some((record) => record.type === 'attributes')) scheduleFit();
    // Changes to log text do not add or replace a canvas or control panel.
    if (records.some((record) => [...record.addedNodes, ...record.removedNodes]
      .some((node) => node instanceof Element))) schedule();
  });

  function refresh() {
    frame = 0;
    const nextGraphs = new Set(getGraphs().filter((graph) => !graph.destroyed));
    const nextControls = new Set(container.querySelectorAll('.g6lite-demo-controls'));
    for (const graph of graphs) {
      if (nextGraphs.has(graph)) continue;
      for (const event of events) graph.off(event, scheduleFit);
    }
    for (const graph of nextGraphs) {
      if (graphs.has(graph)) continue;
      for (const event of events) graph.on(event, scheduleFit);
      needsFit = true;
    }
    for (const control of controls) {
      if (!nextControls.has(control)) {
        resizeObserver.unobserve(control);
        needsFit = true;
      }
    }
    for (const control of nextControls) {
      if (!controls.has(control)) resizeObserver.observe(control);
    }
    graphs = nextGraphs;
    controls = nextControls;
    if (!needsFit) return;
    needsFit = false;
    for (const graph of graphs) fitDemoView(graph, toolbar, { compact, overlayRoot: container });
  }

  const fitView = () => {
    if (destroyed) return;
    cancelAnimationFrame(frame);
    needsFit = true;
    refresh();
  };
  mutationObserver.observe(container, { childList: true, subtree: true, attributeFilter: ['aria-expanded'] });
  if (toolbar) resizeObserver.observe(toolbar);
  fitView();
  return {
    fitView,
    getData: handle.getData?.bind(handle),
    ready: handle.ready?.then(fitView),
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      for (const graph of graphs) {
        for (const event of events) graph.off(event, scheduleFit);
      }
      handle.destroy();
    },
  };
}

export async function runSiteExample(
  id: string,
  container: HTMLElement,
  toolbar: HTMLElement | null = null,
): Promise<SiteExampleHandle> {
  const loader = loaders[id];
  if (!loader) throw new Error(`Unknown site example: ${id}`);

  const demoModule = await loader();
  const handle = await demoModule.run(container, (graph, options) =>
    fitDemoView(graph, toolbar, { options, overlayRoot: container }),
  );
  if (!handle || typeof handle.destroy !== 'function') {
    throw new Error(`Site example ${id} did not return a destroyable handle`);
  }
  if (typeof handle.fitView !== 'function') {
    throw new Error(`Site example ${id} did not return a fitView-capable handle`);
  }

  if (id === 'zoom-options') return handle;
  const { Graph } = await import('@antv/g6-lite');
  const getGraphs = handle instanceof Graph ? () => [handle] : handle.getGraphs?.bind(handle);
  return getGraphs ? fitExamplePreview(handle, getGraphs, container, toolbar, compactExamples.has(id)) : handle;
}
