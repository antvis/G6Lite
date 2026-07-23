import { afterEach, describe, expect, it, vi } from 'vitest';
import { runLayoutInWorker, terminateLayoutWorker } from '@src/layout/workerLayout.js';

type WorkerListener = (event: MessageEvent | ErrorEvent) => void;

class FakeWorker {
  static instances: FakeWorker[] = [];

  readonly listeners = new Map<string, Set<WorkerListener>>();
  readonly postMessage = vi.fn();
  readonly terminate = vi.fn();

  constructor() {
    FakeWorker.instances.push(this);
  }

  addEventListener(type: string, listener: WorkerListener): void {
    let listeners = this.listeners.get(type);
    if (!listeners) {
      listeners = new Set();
      this.listeners.set(type, listeners);
    }
    listeners.add(listener);
  }

  removeEventListener(type: string, listener: WorkerListener): void {
    this.listeners.get(type)?.delete(listener);
  }

  emitMessage(data: unknown): void {
    const event = { data } as MessageEvent;
    for (const listener of this.listeners.get('message') ?? []) listener(event);
  }
}

const data = { nodes: [{ id: 'node' }], edges: [] };
const config = { type: 'grid', worker: true } as const;

afterEach(() => {
  terminateLayoutWorker();
  FakeWorker.instances = [];
  vi.unstubAllGlobals();
});

describe('layout worker request lifecycle', () => {
  it('terminates and rejects the owned Worker when its signal is aborted', async () => {
    vi.stubGlobal('Worker', FakeWorker);
    const controller = new AbortController();
    const result = runLayoutInWorker(data, config, controller.signal);
    const worker = FakeWorker.instances[0];

    controller.abort();

    await expect(result).rejects.toMatchObject({ name: 'AbortError' });
    expect(worker.terminate).toHaveBeenCalledTimes(1);
  });

  it('does not cancel another request when one Graph aborts its layout', async () => {
    vi.stubGlobal('Worker', FakeWorker);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const first = runLayoutInWorker(data, config, firstController.signal);
    const second = runLayoutInWorker(data, config, secondController.signal);
    const [firstWorker, secondWorker] = FakeWorker.instances;
    const secondRequest = secondWorker.postMessage.mock.calls[0][0] as { id: number };

    firstController.abort();
    secondWorker.emitMessage({
      id: secondRequest.id,
      positions: [{ id: 'node', x: 10, y: 20 }],
    });

    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    await expect(second).resolves.toEqual({
      positions: [{ id: 'node', x: 10, y: 20 }],
    });
    expect(firstWorker.terminate).toHaveBeenCalledTimes(1);
    expect(secondWorker.terminate).toHaveBeenCalledTimes(1);
  });

  it('rejects all active requests when the internal global cleanup is requested', async () => {
    vi.stubGlobal('Worker', FakeWorker);
    const first = runLayoutInWorker(data, config);
    const second = runLayoutInWorker(data, config);

    terminateLayoutWorker();

    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    await expect(second).rejects.toMatchObject({ name: 'AbortError' });
    expect(FakeWorker.instances.every((worker) => worker.terminate.mock.calls.length === 1)).toBe(
      true,
    );
  });
});
