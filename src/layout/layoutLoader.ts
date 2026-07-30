import type { GraphData, GraphNode } from '../types';

export type LayoutInstance = {
  execute: (data: GraphData) => Promise<void>;
  forEachNode: (fn: (node: GraphNode & { x: number; y: number }) => void) => void;
};

export type LayoutConstructor = new (options?: Record<string, unknown>) => LayoutInstance;

export type LayoutLoader = () => Promise<LayoutConstructor>;

const LAYOUT_LOADERS: Record<string, LayoutLoader> = {
  circular: () =>
    import('@antv/layout/lib/algorithm/circular/index.js').then(
      ({ CircularLayout }) => CircularLayout as unknown as LayoutConstructor,
    ),
  concentric: () =>
    import('@antv/layout/lib/algorithm/concentric/index.js').then(
      ({ ConcentricLayout }) => ConcentricLayout as unknown as LayoutConstructor,
    ),
  'd3-force': () =>
    import('@antv/layout/lib/algorithm/d3-force/index.js').then(
      ({ D3ForceLayout }) => D3ForceLayout as unknown as LayoutConstructor,
    ),
  force: () =>
    import('@antv/layout/lib/algorithm/force/index.js').then(
      ({ ForceLayout }) => ForceLayout as unknown as LayoutConstructor,
    ),
  'force-atlas2': () =>
    import('@antv/layout/lib/algorithm/force-atlas2/index.js').then(
      ({ ForceAtlas2Layout }) => ForceAtlas2Layout as unknown as LayoutConstructor,
    ),
  fruchterman: () =>
    import('@antv/layout/lib/algorithm/fruchterman/index.js').then(
      ({ FruchtermanLayout }) => FruchtermanLayout as unknown as LayoutConstructor,
    ),
  grid: () =>
    import('@antv/layout/lib/algorithm/grid/index.js').then(
      ({ GridLayout }) => GridLayout as unknown as LayoutConstructor,
    ),
  random: () =>
    import('@antv/layout/lib/algorithm/random/index.js').then(
      ({ RandomLayout }) => RandomLayout as unknown as LayoutConstructor,
    ),
};

const OPTIONAL_LAYOUT_IMPORTS: Record<string, string> = {
  dagre: '@antv/g6-gl/layouts/dagre',
  mds: '@antv/g6-gl/layouts/mds',
  radial: '@antv/g6-gl/layouts/radial',
};

/** Register an opt-in layout loader without pulling its implementation into the root entry. */
export function registerLayoutLoader(type: string, loader: LayoutLoader): void {
  LAYOUT_LOADERS[type] = loader;
}

/** Fail before worker dispatch when an opt-in layout has not been enabled. */
export function assertLayoutAvailable(type: string): void {
  const importPath = OPTIONAL_LAYOUT_IMPORTS[type];
  if (importPath && !LAYOUT_LOADERS[type]) {
    throw new Error(
      `Layout "${type}" is optional. Import and call its enable function from "${importPath}" first.`,
    );
  }
}

/** Load only the requested @antv/layout algorithm. Unknown types preserve the random fallback. */
export function loadLayout(type: string): Promise<LayoutConstructor> {
  assertLayoutAvailable(type);
  return (LAYOUT_LOADERS[type] ?? LAYOUT_LOADERS.random)();
}
