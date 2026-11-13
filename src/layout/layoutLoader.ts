import type { GraphData, GraphNode } from '../types';

export type LayoutInstance = {
  execute: (data: GraphData) => Promise<void>;
  forEachNode: (fn: (node: GraphNode & { x: number; y: number }) => void) => void;
};

export type LayoutConstructor = new (options?: Record<string, unknown>) => LayoutInstance;

type LayoutLoader = () => Promise<LayoutConstructor>;

const LAYOUT_LOADERS: Record<string, LayoutLoader> = {
  circular: () =>
    import('@antv/layout/lib/algorithm/circular/index.js').then(
      ({ CircularLayout }) => CircularLayout as unknown as LayoutConstructor,
    ),
  concentric: () =>
    import('@antv/layout/lib/algorithm/concentric/index.js').then(
      ({ ConcentricLayout }) => ConcentricLayout as unknown as LayoutConstructor,
    ),
  dagre: () =>
    import('@antv/layout/lib/algorithm/dagre/index.js').then(
      ({ DagreLayout }) => DagreLayout as unknown as LayoutConstructor,
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
};

/** Resolve a built-in algorithm without starting the import. */
export function getLayoutLoader(type: string): LayoutLoader | undefined {
  return Object.prototype.hasOwnProperty.call(LAYOUT_LOADERS, type)
    ? LAYOUT_LOADERS[type]
    : undefined;
}
