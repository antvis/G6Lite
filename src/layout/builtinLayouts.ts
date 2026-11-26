import { D3ForceLayout, ForceAtlas2Layout, ForceLayout, FruchtermanLayout } from '@antv/layout';
import type { LayoutConstructor } from '../types';

/**
 * Built-in layouts bundled with G6Lite, focused on large-scale graph analysis.
 * Other @antv/layout algorithms can be passed directly as `layout.type`.
 */
export const BUILTIN_LAYOUTS: Record<string, LayoutConstructor> = {
  force: ForceLayout as unknown as LayoutConstructor,
  'force-atlas2': ForceAtlas2Layout as unknown as LayoutConstructor,
  'd3-force': D3ForceLayout as unknown as LayoutConstructor,
  fruchterman: FruchtermanLayout as unknown as LayoutConstructor,
};
