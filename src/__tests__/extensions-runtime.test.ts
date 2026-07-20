import { describe, expect, it, vi } from 'vitest';
import { registerBehaviors } from '../behaviors/index.js';
import { EventEmitter } from '../events.js';
import type { BehaviorExtension } from '../extensions/contracts.js';
import { register } from '../extensions/index.js';
import { createExtension } from '../extensions/registry.js';
import { runLayout } from '../layout/index.js';

describe('runtime extension registry', () => {
  it('creates isolated extension instances from a factory', () => {
    let instanceId = 0;
    register(
      'behavior',
      'factory-behavior',
      () =>
        ({
          id: ++instanceId,
          getEvents: () => ({}),
        } as BehaviorExtension & { id: number }),
    );

    const first = createExtension<BehaviorExtension & { id: number }>(
      'behavior',
      'factory-behavior',
    );
    const second = createExtension<BehaviorExtension & { id: number }>(
      'behavior',
      'factory-behavior',
    );

    expect(first).not.toBe(second);
    expect(first?.id).toBe(1);
    expect(second?.id).toBe(2);
  });

  it('copies legacy object registrations instead of sharing lifecycle state', () => {
    register('plugin', 'legacy-object-plugin', { mount: () => {} });

    const first = createExtension('plugin', 'legacy-object-plugin');
    const second = createExtension('plugin', 'legacy-object-plugin');

    expect(first).not.toBe(second);
  });

  it('executes a registered layout through the standard layout entry', async () => {
    register('layout', 'test-layout', {
      execute: async (data) => ({
        nodes: data.nodes.map((node, index) => ({ ...node, x: index * 10, y: index * 20 })),
      }),
    });

    const result = await runLayout(
      { nodes: [{ id: 'a' }, { id: 'b' }], edges: [] },
      { type: 'test-layout' },
      { width: 100, height: 100 },
    );

    expect(result.nodes).toMatchObject([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 10, y: 20 },
    ]);
  });

  it('passes cancellation to layout extensions and runs their lifecycle', async () => {
    const init = vi.fn();
    const destroy = vi.fn();
    let receivedSignal: AbortSignal | undefined;
    register('layout', 'cancel-aware-layout', {
      init,
      execute: async (data, context) => {
        receivedSignal = context.signal;
        return { nodes: data.nodes.map((node) => ({ ...node, x: 1, y: 2 })) };
      },
      destroy,
    });
    const controller = new AbortController();
    const extensionContext = {} as never;

    await runLayout(
      { nodes: [{ id: 'a' }], edges: [] },
      { type: 'cancel-aware-layout' },
      undefined,
      { signal: controller.signal, extensionContext },
    );

    expect(init).toHaveBeenCalledTimes(1);
    expect(receivedSignal).toBe(controller.signal);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('binds and destroys a registered behavior', () => {
    const handler = vi.fn();
    const destroy = vi.fn();
    register('behavior', 'test-behavior', {
      getEvents: () => ({ 'node:click': handler }),
      destroy,
    });

    const eventEmitter = new EventEmitter();
    const graph = {
      eventEmitter,
      on: eventEmitter.on.bind(eventEmitter),
      off: eventEmitter.off.bind(eventEmitter),
      scheduleRender: vi.fn(),
      screenToGraph: vi.fn(() => ({ x: 0, y: 0 })),
      graphToScreen: vi.fn(() => ({ x: 0, y: 0 })),
      getZoom: vi.fn(() => 1),
      isDestroyed: vi.fn(() => false),
    };
    const renderer = {};

    const teardown = registerBehaviors(
      renderer as never,
      [{ type: 'test-behavior' }],
      graph as never,
    );
    eventEmitter.emit('node:click', { targetId: 'a' });
    expect(handler).toHaveBeenCalledTimes(1);

    teardown();
    eventEmitter.emit('node:click', { targetId: 'a' });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('isolates layout extension errors and returns positioned fallback nodes', async () => {
    register('layout', 'broken-layout', {
      execute: () => {
        throw new Error('boom');
      },
    });

    const result = await runLayout(
      { nodes: [{ id: 'a', x: 3, y: 4 }], edges: [] },
      { type: 'broken-layout' },
    );

    expect(result.nodes).toEqual([{ id: 'a', x: 3, y: 4 }]);
  });
});
