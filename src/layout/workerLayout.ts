/**
 * Worker-based layout execution.
 * Manages a Web Worker lifecycle for off-main-thread layout computation.
 */

import type { GraphData, LayoutConfig } from '../types.js';

export interface LayoutWorkerResult {
  positions: Array<{ id: string; x: number; y: number }>;
}

let worker: Worker | null = null;
let requestId = 0;

/**
 * Run layout in a Web Worker.
 * The worker is created lazily and reused across calls.
 */
export function runLayoutInWorker(
  data: GraphData,
  config: LayoutConfig,
): Promise<LayoutWorkerResult> {
  return new Promise((resolve, reject) => {
    try {
      if (!worker) {
        worker = new Worker(new URL('./layoutWorker.js', import.meta.url), { type: 'module' });
      }
    } catch (err) {
      reject(new Error(`Failed to create layout worker: ${err}`));
      return;
    }

    const id = ++requestId;

    const handler = (e: MessageEvent) => {
      if (e.data.id !== id) return;
      worker!.removeEventListener('message', handler);
      worker!.removeEventListener('error', errorHandler);

      if (e.data.error) {
        reject(new Error(`Layout worker error: ${e.data.error}`));
      } else {
        resolve({ positions: e.data.positions });
      }
    };

    const errorHandler = (err: ErrorEvent) => {
      worker!.removeEventListener('message', handler);
      worker!.removeEventListener('error', errorHandler);
      reject(new Error(`Layout worker error: ${err.message}`));
    };

    worker.addEventListener('message', handler);
    worker.addEventListener('error', errorHandler);

    // Send minimal data to worker (only id, x, y for nodes; source, target for edges)
    const nodes = data.nodes.map((n) => ({
      id: n.id,
      x: (n as any).x,
      y: (n as any).y,
      data: n.data,
    }));
    const edges = data.edges.map((e) => ({
      source: e.source,
      target: e.target,
      data: e.data,
    }));

    worker.postMessage({ id, nodes, edges, config });
  });
}

/**
 * Terminate the layout worker. Call this when the graph is destroyed.
 */
export function terminateLayoutWorker(): void {
  if (worker) {
    worker.terminate();
    worker = null;
  }
}
