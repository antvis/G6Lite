/**
 * Run AntV Layout on graph data and return nodes with x,y.
 * OpenSpec: layout spec — thin wrapper over @antv/layout.
 */

import type { ExtensionContext, LayoutExtension } from '../extensions/contracts';
import { createExtension, destroyExtension, initializeExtension } from '../extensions/registry';
import type { GraphData, GraphNode, LayoutConfig } from '../types';
import { executeFishboneLayout, type FishboneLayoutOptions } from './fishboneLayout';
import { executeIndentedLayout, type IndentedLayoutOptions } from './indentedLayout';
import { loadLayout, type LayoutInstance } from './layoutLoader';
import { normalizeLibraryLayoutOptions } from './layoutOptions';
import { executeMindmapLayout, type MindmapLayoutOptions } from './mindmapLayout';
import { runLayoutInWorker } from './workerLayout';

export type LayoutResult = { nodes: Array<GraphNode & { x: number; y: number }> };

interface LayoutRuntime {
  signal?: AbortSignal;
  extensionContext?: ExtensionContext;
}

type D3LayoutInstance = LayoutInstance & {
  tick: (iterations?: number) => void;
  stop: () => void;
  getAlpha: () => number;
};

type BuiltInLayoutExecutor = (data: GraphData, config: LayoutConfig) => LayoutResult;

const BUILTIN_EXECUTOR_MAP: Record<string, BuiltInLayoutExecutor> = {
  indented: (data, config) => executeIndentedLayout(data, config as IndentedLayoutOptions),
  mindmap: (data, config) => executeMindmapLayout(data, config as MindmapLayoutOptions),
  fishbone: (data, config) => executeFishboneLayout(data, config as FishboneLayoutOptions),
};

function createFallbackResult(data: GraphData): LayoutResult {
  return {
    nodes: data.nodes.map((node) => ({ ...node, x: node.x ?? 0, y: node.y ?? 0 })),
  };
}

function resolveLayoutConfig(
  config: LayoutConfig,
  viewport?: { width: number; height: number },
): LayoutConfig {
  const resolved = { ...config } as LayoutConfig;
  if (!viewport) return resolved;
  if (resolved.width === undefined) resolved.width = viewport.width;
  if (resolved.height === undefined) resolved.height = viewport.height;
  if (resolved.center === undefined) {
    resolved.center = [Number(resolved.width) / 2, Number(resolved.height) / 2];
  }
  return resolved;
}

async function runExtensionLayout(
  data: GraphData,
  config: LayoutConfig,
  viewport: { width: number; height: number } | undefined,
  runtime: LayoutRuntime,
): Promise<LayoutResult | undefined> {
  const extension = createExtension<LayoutExtension>('layout', config.type);
  if (!extension) return undefined;
  const options = Object.freeze({ ...config });
  try {
    if (runtime.signal?.aborted) return createFallbackResult(data);
    if (
      runtime.extensionContext &&
      !initializeExtension('layout', config.type, extension, runtime.extensionContext, config)
    ) {
      return createFallbackResult(data);
    }
    if (runtime.signal?.aborted) return createFallbackResult(data);
    const result = await extension.execute(data, {
      width: viewport?.width ?? Number(config.width ?? 800),
      height: viewport?.height ?? Number(config.height ?? 600),
      signal: runtime.signal,
      options,
    });
    return runtime.signal?.aborted ? createFallbackResult(data) : result;
  } catch (error) {
    if (!runtime.signal?.aborted) {
      console.error(`[G6-GL] layout extension "${config.type}" failed during execute`, error);
    }
    return createFallbackResult(data);
  } finally {
    destroyExtension('layout', config.type, extension);
  }
}

function runBuiltInLayout(
  data: GraphData,
  config: LayoutConfig,
  runtime: LayoutRuntime,
): LayoutResult | undefined {
  const execute = BUILTIN_EXECUTOR_MAP[config.type];
  if (!execute) return undefined;
  try {
    if (runtime.signal?.aborted) return createFallbackResult(data);
    const result = execute(data, config);
    return runtime.signal?.aborted ? createFallbackResult(data) : result;
  } catch (error) {
    if (!runtime.signal?.aborted) {
      console.error(`[G6-GL] built-in layout "${config.type}" failed during execute`, error);
    }
    return createFallbackResult(data);
  }
}

async function runWorkerLayout(
  data: GraphData,
  config: LayoutConfig,
  runtime: LayoutRuntime,
): Promise<LayoutResult | undefined> {
  try {
    const workerResult = await runLayoutInWorker(data, config, runtime.signal);
    if (runtime.signal?.aborted) return createFallbackResult(data);
    const positions = new Map(
      workerResult.positions.map(
        (position) => [position.id, position] as [string, { x: number; y: number }],
      ),
    );
    return {
      nodes: data.nodes.map((node) => {
        const position = positions.get(node.id);
        return { ...node, x: position?.x ?? 0, y: position?.y ?? 0 };
      }),
    };
  } catch {
    return runtime.signal?.aborted ? createFallbackResult(data) : undefined;
  }
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

async function runLibraryLayout(
  data: GraphData,
  config: LayoutConfig,
  runtime: LayoutRuntime,
): Promise<LayoutResult> {
  const LayoutClass = await loadLayout(config.type);
  if (runtime.signal?.aborted) return createFallbackResult(data);
  const options = normalizeLibraryLayoutOptions(
    config.type,
    config as Record<string, unknown>,
    data.nodes.length,
  );
  const layout = new LayoutClass(options);
  const layoutData = createLibraryLayoutData(data);
  await executeLibraryLayout(layout, config.type, layoutData, options);
  if (runtime.signal?.aborted) return createFallbackResult(data);
  return mergeLibraryLayoutResult(data, layoutData, layout);
}

/**
 * Run the configured layout on graph data; returns nodes with positions.
 * Registered extensions and built-in functional layouts take precedence over
 * worker and @antv/layout execution. Worker failures fall back to the same
 * main-thread library path.
 */
export async function runLayout(
  data: GraphData,
  config: LayoutConfig,
  viewport?: { width: number; height: number },
  runtime: LayoutRuntime = {},
): Promise<LayoutResult> {
  const resolvedConfig = resolveLayoutConfig(config, viewport);

  const extensionResult = await runExtensionLayout(data, resolvedConfig, viewport, runtime);
  if (extensionResult) return extensionResult;

  const builtInResult = runBuiltInLayout(data, resolvedConfig, runtime);
  if (builtInResult) return builtInResult;

  if (resolvedConfig.worker) {
    const workerResult = await runWorkerLayout(data, resolvedConfig, runtime);
    if (workerResult) return workerResult;
  }

  if (runtime.signal?.aborted) return createFallbackResult(data);
  return runLibraryLayout(data, resolvedConfig, runtime);
}
