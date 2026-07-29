/**
 * Worker-based layout execution.
 * Manages a Web Worker lifecycle for off-main-thread layout computation.
 */

import type { GraphData, LayoutConfig } from '../types';

export interface LayoutWorkerResult {
  positions: Array<{ id: string; x: number; y: number }>;
}

let requestId = 0;
const cancelActiveRequests = new Set<() => void>();

/**
 * Run layout in a Web Worker.
 * Each request owns its Worker so cancellation is isolated to the Graph that
 * started the layout. Sharing one Worker would make cancelLayout() terminate
 * unrelated Graph instances and leave their promises pending.
 */
export function runLayoutInWorker(
  data: GraphData,
  config: LayoutConfig,
  signal?: AbortSignal,
): Promise<LayoutWorkerResult> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError());
      return;
    }

    let worker: Worker;
    try {
      worker = new Worker(new URL('./layoutWorker.js', import.meta.url), { type: 'module' });
    } catch (err) {
      reject(new Error(`Failed to create layout worker: ${err}`));
      return;
    }

    const id = ++requestId;
    let settled = false;

    const cleanup = () => {
      worker.removeEventListener('message', handler);
      worker.removeEventListener('error', errorHandler);
      signal?.removeEventListener('abort', abortHandler);
      cancelActiveRequests.delete(abortHandler);
      worker.terminate();
    };

    const resolveOnce = (result: LayoutWorkerResult) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };

    const rejectOnce = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    const handler = (e: MessageEvent) => {
      if (e.data.id !== id) return;
      if (e.data.error) {
        rejectOnce(new Error(`Layout worker error: ${e.data.error}`));
      } else {
        resolveOnce({ positions: e.data.positions });
      }
    };

    const errorHandler = (err: ErrorEvent) => {
      rejectOnce(new Error(`Layout worker error: ${err.message}`));
    };

    const abortHandler = () => rejectOnce(createAbortError());

    worker.addEventListener('message', handler);
    worker.addEventListener('error', errorHandler);
    signal?.addEventListener('abort', abortHandler, { once: true });
    cancelActiveRequests.add(abortHandler);

    // Send minimal data to worker (only id, x, y for nodes; source, target for edges)
    const nodes = data.nodes.map((n) => ({
      id: n.id,
      x: n.x,
      y: n.y,
      data: n.data,
    }));
    const edges = data.edges.map((e) => ({
      source: e.source,
      target: e.target,
      data: e.data,
    }));

    try {
      worker.postMessage({ id, nodes, edges, config });
    } catch (error) {
      rejectOnce(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

/**
 * Internal global cleanup for tests or application shutdown. Normal Graph
 * cancellation is scoped through the request's AbortSignal.
 */
export function terminateLayoutWorker(): void {
  for (const cancel of [...cancelActiveRequests]) cancel();
}

function createAbortError(): Error {
  if (typeof DOMException === 'function') {
    return new DOMException('Layout aborted', 'AbortError');
  }
  const error = new Error('Layout aborted');
  error.name = 'AbortError';
  return error;
}
