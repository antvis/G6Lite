import type { GraphData, GraphNode, LayoutConfig } from '../types';
import type { LayoutConstructor, LayoutInstance } from './layoutLoader';
import { normalizeLibraryLayoutOptions } from './layoutOptions';
import type { LayoutResult } from './runLayout';

type D3LayoutInstance = LayoutInstance & {
  tick: (iterations?: number) => void;
  stop: () => void;
  getAlpha: () => number;
};

export function createFallbackResult(data: GraphData): LayoutResult {
  return {
    nodes: data.nodes.map((node) => ({ ...node, x: node.x ?? 0, y: node.y ?? 0 })),
  };
}

function createLibraryLayoutData(data: GraphData): GraphData {
  const spread = Math.max(200, Math.sqrt(data.nodes.length) * 30);
  return {
    nodes: data.nodes.map((node) => {
      if (node.x !== undefined && node.y !== undefined) return node;
      return {
        ...node,
        x: node.x ?? Math.random() * spread,
        y: node.y ?? Math.random() * spread,
      };
    }),
    edges: data.edges,
  };
}

async function executeLibraryLayout(
  layout: LayoutInstance,
  type: string,
  layoutData: GraphData,
  options: Record<string, unknown>,
): Promise<void> {
  if (type !== 'd3-force' || !('tick' in layout) || !('stop' in layout)) {
    await layout.execute(layoutData);
    return;
  }

  const simulation = layout as D3LayoutInstance;
  const execution = simulation.execute(layoutData);
  simulation.stop();
  const alphaMin = (options.alphaMin as number) ?? 0.001;
  for (let index = 0; index < 300 && simulation.getAlpha() >= alphaMin; index++) {
    simulation.tick(1);
  }
  void execution;
}

function mergeLibraryLayoutResult(
  data: GraphData,
  layoutData: GraphData,
  layout: LayoutInstance,
): LayoutResult {
  const positions = new Map<string, [number, number]>();
  layout.forEachNode((node) => positions.set(node.id, [node.x, node.y]));
  const layoutNodes = new Map(layoutData.nodes.map((node) => [node.id, node]));
  return {
    nodes: data.nodes.map((node) => {
      const position = positions.get(node.id);
      const layoutNode = layoutNodes.get(node.id);
      const mergedData = layoutNode?.data ? { ...node.data, ...layoutNode.data } : node.data;
      if (position && node.x === position[0] && node.y === position[1] && !layoutNode?.data) {
        return node as GraphNode & { x: number; y: number };
      }
      return {
        ...node,
        data: mergedData,
        x: position?.[0] ?? 0,
        y: position?.[1] ?? 0,
      };
    }),
  };
}

export async function runLibraryLayout(
  LayoutClass: LayoutConstructor,
  data: GraphData,
  config: LayoutConfig,
  signal?: AbortSignal,
): Promise<LayoutResult> {
  if (signal?.aborted) return createFallbackResult(data);
  const options = normalizeLibraryLayoutOptions(
    config.type,
    config as Record<string, unknown>,
    data.nodes.length,
  );
  const layout = new LayoutClass(options);
  const layoutData = createLibraryLayoutData(data);
  await executeLibraryLayout(layout, config.type, layoutData, options);
  if (signal?.aborted) return createFallbackResult(data);
  return mergeLibraryLayoutResult(data, layoutData, layout);
}
