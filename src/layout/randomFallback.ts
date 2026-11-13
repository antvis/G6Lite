import type { GraphData, LayoutConfig } from '../types';
import type { LayoutResult } from './runLayout';

/** Preserve the historical placement for unrecognized layout names. */
export function runRandomFallback(data: GraphData, config: LayoutConfig): LayoutResult {
  const { width = 300, height = 300, center = [0, 0] } = config;
  return {
    nodes: data.nodes.map((node) => ({
      ...node,
      x: center[0] + (Math.random() - 0.5) * 0.9 * width,
      y: center[1] + (Math.random() - 0.5) * 0.9 * height,
    })),
  };
}
