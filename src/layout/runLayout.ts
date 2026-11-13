/**
 * Run AntV Layout on graph data and return nodes with x,y.
 * OpenSpec: layout spec — thin wrapper over @antv/layout.
 */

import type { ExtensionContext, LayoutExtension } from '../extensions/contracts';
import { createExtension, destroyExtension, initializeExtension } from '../extensions/registry';
import type { GraphData, GraphNode, LayoutConfig } from '../types';
import { getLayoutLoader } from './layoutLoader';
import { createFallbackResult, runLibraryLayout } from './libraryLayout';
import { runRandomFallback } from './randomFallback';
import { runLayoutInWorker } from './workerLayout';

export type LayoutResult = { nodes: Array<GraphNode & { x: number; y: number }> };

const OPTIONAL_LAYOUTS = new Set(['mds', 'radial', 'indented', 'mindmap', 'fishbone', 'random']);

interface LayoutRuntime {
  signal?: AbortSignal;
  extensionContext?: ExtensionContext;
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
      console.error(`[G6Lite] layout extension "${config.type}" failed during execute`, error);
    }
    return createFallbackResult(data);
  } finally {
    destroyExtension('layout', config.type, extension);
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

/**
 * Run the configured layout on graph data; returns nodes with positions.
 * Registered extensions take precedence over built-in Worker execution. Worker failures fall back to the same
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

  if (runtime.signal?.aborted) return createFallbackResult(data);

  const { type } = resolvedConfig;
  if (OPTIONAL_LAYOUTS.has(type)) {
    throw new Error(
      `[G6Lite] Register layout "${type}" from @antv/g6-lite/layouts/${type} before use.`,
    );
  }

  const loadLayout = getLayoutLoader(type);
  if (!loadLayout) return runRandomFallback(data, resolvedConfig);

  if (resolvedConfig.worker) {
    const workerResult = await runWorkerLayout(data, resolvedConfig, runtime);
    if (workerResult) return workerResult;
  }

  if (runtime.signal?.aborted) return createFallbackResult(data);
  return runLibraryLayout(await loadLayout(), data, resolvedConfig, runtime.signal);
}
