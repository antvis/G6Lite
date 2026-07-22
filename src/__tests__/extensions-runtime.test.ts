import { describe, expect, it, vi } from 'vitest';
import { registerBehaviors } from '../behaviors/index.js';
import { EventEmitter } from '../events.js';
import type {
  BehaviorExtension,
  Extension,
  ExtensionContext,
  TransformExtension,
} from '../extensions/contracts.js';
import { extensionFactory, register } from '../extensions/index.js';
import {
  createExtension,
  createExtensionContext,
  destroyExtension,
  initializeExtension,
  updateExtension,
} from '../extensions/registry.js';
import { Graph } from '../graph.js';
import { runLayout } from '../layout/index.js';
import type { GraphData, TransformOption } from '../types.js';

describe('runtime extension registry', () => {
  it('creates isolated extension instances from a factory', () => {
    let instanceId = 0;
    register(
      'behavior',
      'factory-behavior',
      extensionFactory(
        () =>
          ({
            id: ++instanceId,
            getEvents: () => ({}),
          } as BehaviorExtension & { id: number }),
      ),
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
    register('plugin', 'legacy-object-plugin', {
      state: { nested: { count: 0 }, values: ['initial'] },
      mount: () => {},
    });

    const first = createExtension<{
      state: { nested: { count: number }; values: string[] };
    }>('plugin', 'legacy-object-plugin');
    const second = createExtension<{
      state: { nested: { count: number }; values: string[] };
    }>('plugin', 'legacy-object-plugin');

    expect(first).not.toBe(second);
    expect(first?.state).not.toBe(second?.state);
    expect(first?.state.nested).not.toBe(second?.state.nested);
    expect(first?.state.values).not.toBe(second?.state.values);

    first!.state.nested.count = 1;
    first!.state.values.push('first');
    expect(second?.state).toEqual({ nested: { count: 0 }, values: ['initial'] });
  });

  it('constructs legacy class instances so private fields remain valid', () => {
    class LegacyPrivatePlugin {
      #count = 0;

      increment(): number {
        return ++this.#count;
      }
    }

    register('plugin', 'legacy-private-plugin', new LegacyPrivatePlugin());

    const first = createExtension<LegacyPrivatePlugin>('plugin', 'legacy-private-plugin');
    const second = createExtension<LegacyPrivatePlugin>('plugin', 'legacy-private-plugin');

    expect(first).not.toBe(second);
    expect(first?.increment()).toBe(1);
    expect(first?.increment()).toBe(2);
    expect(second?.increment()).toBe(1);
  });

  it('runs init, update, and destroy through the common lifecycle helpers', () => {
    const calls: Array<string | number> = [];
    const extension: Extension<{ value: number }> = {
      init: (_context, options) => calls.push('init', options.value),
      update: (options) => calls.push('update', options.value ?? -1),
      destroy: () => calls.push('destroy'),
    };
    const context = {} as ExtensionContext;

    initializeExtension('plugin', 'lifecycle-test', extension, context, { value: 1 });
    updateExtension('plugin', 'lifecycle-test', extension, { value: 2 });
    destroyExtension('plugin', 'lifecycle-test', extension);

    expect(calls).toEqual(['init', 1, 'update', 2, 'destroy']);
  });

  it('exposes controlled data, state, and viewport capabilities', () => {
    const nodeData = {
      id: 'n1',
      x: 1,
      y: 2,
      data: { value: 1 },
      states: new Set(['selected']),
    };
    const edgeData = {
      id: 'e1',
      source: 'n1',
      target: 'n2',
      data: { weight: 2 },
      states: new Set<string>(),
    };
    const graph = {
      getNodeData: vi.fn(() => nodeData),
      getEdgeData: vi.fn(() => edgeData),
      getNodes: vi.fn(() => [{ id: 'n1' }, { id: 'n2' }]),
      getEdges: vi.fn(() => [{ id: 'e1' }]),
      updateNodeData: vi.fn(),
      updateEdgeData: vi.fn(),
      setElementStates: vi.fn(),
      getItemStates: vi.fn(() => ['selected']),
      clearItemStates: vi.fn(),
      scheduleRender: vi.fn(),
      screenToGraph: vi.fn(() => ({ x: 3, y: 4 })),
      graphToScreen: vi.fn(() => ({ x: 5, y: 6 })),
      getZoom: vi.fn(() => 2),
      isDestroyed: vi.fn(() => false),
    };
    const context = createExtensionContext(graph as never);

    const nodeSnapshot = context.data.getNode('n1');
    const edgeSnapshot = context.data.getEdge('e1');
    expect(nodeSnapshot).toMatchObject({ id: 'n1', states: ['selected'] });
    expect(edgeSnapshot).toMatchObject({ id: 'e1', states: [] });
    expect(nodeSnapshot?.data).not.toBe(nodeData.data);
    expect(edgeSnapshot?.data).not.toBe(edgeData.data);

    (nodeSnapshot!.data as Record<string, unknown>).value = 9;
    (edgeSnapshot!.data as Record<string, unknown>).weight = 9;
    (nodeSnapshot!.states as string[]).push('active');
    expect(nodeData.data.value).toBe(1);
    expect(edgeData.data.weight).toBe(2);
    expect([...nodeData.states]).toEqual(['selected']);
    expect(context.data.getNodeIds()).toEqual(['n1', 'n2']);
    expect(context.data.getEdgeIds()).toEqual(['e1']);
    context.data.updateNode('n1', { value: 2 });
    context.data.updateEdge('e1', { weight: 3 });
    context.state.set('n1', ['active']);
    context.state.setAll({ n1: [], n2: ['selected'] });
    expect(context.state.get('n1')).toEqual(['selected']);
    context.state.clear('n1');
    expect(context.viewport.screenToGraph({ x: 0, y: 0 })).toEqual({ x: 3, y: 4 });
    expect(context.viewport.graphToScreen({ x: 0, y: 0 })).toEqual({ x: 5, y: 6 });
    expect(context.viewport.getZoom()).toBe(2);

    expect(graph.updateNodeData).toHaveBeenCalledWith('n1', { value: 2 });
    expect(graph.updateEdgeData).toHaveBeenCalledWith('e1', { weight: 3 });
    expect(graph.setElementStates).toHaveBeenCalledTimes(2);
    expect(graph.clearItemStates).toHaveBeenCalledWith('n1');
  });

  it('isolates duplicate transform configurations and destroys stale instances', () => {
    let created = 0;
    let updated = 0;
    let destroyed = 0;
    register(
      'transform',
      'scoped-transform',
      extensionFactory(() => {
        created += 1;
        let label = '';
        const extension: TransformExtension<{ label: string }> = {
          init: (_context, options) => {
            label = options.label;
          },
          update: (options) => {
            updated += 1;
            if (options.label) label = options.label;
          },
          beforeRender: (data) => ({
            ...data,
            nodes: data.nodes.map((node) => ({
              ...node,
              data: {
                ...node.data,
                labels: [...((node.data?.labels as string[] | undefined) ?? []), label],
              },
            })),
          }),
          destroy: () => {
            destroyed += 1;
          },
        };
        return extension;
      }),
    );

    const graph = Object.create(Graph.prototype) as Graph;
    const harness = graph as unknown as {
      options: { transforms: TransformOption[] };
      transformInstances: Map<string, unknown>;
      _destroyed: boolean;
      layoutGeneration: number;
      applyRegisteredTransforms(data: GraphData, generation: number): GraphData;
    };
    harness.options = {
      transforms: [
        { type: 'scoped-transform', options: { label: 'a' } },
        { type: 'scoped-transform', options: { label: 'b' } },
      ],
    };
    harness.transformInstances = new Map();
    harness._destroyed = false;
    harness.layoutGeneration = 0;
    const data: GraphData = { nodes: [{ id: 'n1' }], edges: [] };

    const first = harness.applyRegisteredTransforms(data, 0);
    expect(first.nodes[0].data?.labels).toEqual(['a', 'b']);
    expect(created).toBe(2);

    harness.options.transforms = [
      { type: 'scoped-transform', options: { label: 'a2' } },
      { type: 'scoped-transform', options: { label: 'b2' } },
    ];
    const second = harness.applyRegisteredTransforms(data, 0);
    expect(second.nodes[0].data?.labels).toEqual(['a2', 'b2']);
    expect(created).toBe(2);
    expect(updated).toBe(2);

    harness.options.transforms = [{ type: 'scoped-transform', options: { label: 'a3' } }];
    harness.applyRegisteredTransforms(data, 0);
    expect(destroyed).toBe(1);

    harness.options.transforms = [];
    harness.applyRegisteredTransforms(data, 0);
    expect(destroyed).toBe(2);
  });

  it('recreates plugins per mount and destroys the previous instances', () => {
    let created = 0;
    let initialized = 0;
    let mounted = 0;
    let destroyed = 0;
    register(
      'plugin',
      'scoped-plugin',
      extensionFactory(() => {
        created += 1;
        return {
          init: () => {
            initialized += 1;
          },
          mount: () => {
            mounted += 1;
          },
          destroy: () => {
            destroyed += 1;
          },
        };
      }),
    );

    const graph = Object.create(Graph.prototype) as Graph;
    const harness = graph as unknown as {
      options: { plugins: Array<{ type: string }> };
      containerEl: HTMLElement;
      pluginTeardowns: Array<() => void>;
      _destroyed: boolean;
      layoutGeneration: number;
      mountPlugins(generation: number): void;
    };
    harness.options = { plugins: [{ type: 'scoped-plugin' }] };
    harness.containerEl = document.createElement('div');
    harness.pluginTeardowns = [];
    harness._destroyed = false;
    harness.layoutGeneration = 0;

    harness.mountPlugins(0);
    harness.mountPlugins(0);

    expect(created).toBe(2);
    expect(initialized).toBe(2);
    expect(mounted).toBe(2);
    expect(destroyed).toBe(1);
    harness.pluginTeardowns.forEach((teardown) => teardown());
    expect(destroyed).toBe(2);
  });

  it('supports legacy class constructors without invoking them as factories', () => {
    class LegacyBehavior implements BehaviorExtension {
      readonly kind = 'legacy';

      getEvents() {
        return {};
      }
    }

    register('behavior', 'legacy-class-behavior', LegacyBehavior);

    const extension = createExtension<LegacyBehavior>('behavior', 'legacy-class-behavior');

    expect(extension).toBeInstanceOf(LegacyBehavior);
    expect(extension?.kind).toBe('legacy');
  });

  it('does not retry a failing factory as a constructor', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const factory = vi.fn(() => {
      throw new Error('factory failed');
    });
    register('plugin', 'failing-factory', factory);

    expect(createExtension('plugin', 'failing-factory')).toBeUndefined();
    expect(factory).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });

  it('does not retry a failing legacy constructor as a factory', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let attempts = 0;
    class FailingPlugin {
      constructor() {
        attempts += 1;
        throw new Error('constructor failed');
      }
    }
    register('plugin', 'failing-constructor', FailingPlugin);

    expect(createExtension('plugin', 'failing-constructor')).toBeUndefined();
    expect(attempts).toBe(1);
    expect(consoleError).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });

  it('executes a registered layout directly without Graph context and exposes readonly options', async () => {
    const init = vi.fn();
    const destroy = vi.fn();
    let receivedOptions: Readonly<Record<string, unknown>> | undefined;
    register('layout', 'test-layout', {
      init,
      execute: async (data, runtime) => {
        receivedOptions = runtime.options;
        return {
          nodes: data.nodes.map((node, index) => ({ ...node, x: index * 10, y: index * 20 })),
        };
      },
      destroy,
    });

    const result = await runLayout(
      { nodes: [{ id: 'a' }, { id: 'b' }], edges: [] },
      { type: 'test-layout', gap: 24 },
      { width: 100, height: 100 },
    );

    expect(result.nodes).toMatchObject([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 10, y: 20 },
    ]);
    expect(init).not.toHaveBeenCalled();
    expect(receivedOptions).toMatchObject({
      type: 'test-layout',
      gap: 24,
      width: 100,
      height: 100,
      center: [50, 50],
    });
    expect(Object.isFrozen(receivedOptions)).toBe(true);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('passes cancellation to layout extensions and runs their lifecycle', async () => {
    const calls: string[] = [];
    const init = vi.fn(() => calls.push('init'));
    const destroy = vi.fn(() => calls.push('destroy'));
    let receivedSignal: AbortSignal | undefined;
    register('layout', 'cancel-aware-layout', {
      init,
      execute: async (data, context) => {
        calls.push('execute');
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
    expect(calls).toEqual(['init', 'execute', 'destroy']);
  });

  it('does not execute a layout when init cancels its Graph-managed run', async () => {
    const controller = new AbortController();
    const execute = vi.fn((data: GraphData) => ({
      nodes: data.nodes.map((node) => ({ ...node, x: 100, y: 200 })),
    }));
    const destroy = vi.fn();
    register('layout', 'cancel-during-init-layout', {
      init: () => controller.abort(),
      execute,
      destroy,
    });

    const result = await runLayout(
      { nodes: [{ id: 'a', x: 3, y: 4 }], edges: [] },
      { type: 'cancel-during-init-layout' },
      undefined,
      { signal: controller.signal, extensionContext: {} as never },
    );

    expect(execute).not.toHaveBeenCalled();
    expect(result.nodes).toEqual([{ id: 'a', x: 3, y: 4 }]);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('discards an async layout result when its signal is cancelled while executing', async () => {
    const controller = new AbortController();
    let releaseExecution: (() => void) | undefined;
    let markStarted: (() => void) | undefined;
    const executionStarted = new Promise<void>((resolve) => {
      markStarted = resolve;
    });
    const executionGate = new Promise<void>((resolve) => {
      releaseExecution = resolve;
    });
    const destroy = vi.fn();
    register('layout', 'cancel-during-execute-layout', {
      execute: async (data) => {
        markStarted?.();
        await executionGate;
        return { nodes: data.nodes.map((node) => ({ ...node, x: 100, y: 200 })) };
      },
      destroy,
    });

    const pending = runLayout(
      { nodes: [{ id: 'a', x: 3, y: 4 }], edges: [] },
      { type: 'cancel-during-execute-layout' },
      undefined,
      { signal: controller.signal, extensionContext: {} as never },
    );
    await executionStarted;
    controller.abort();
    releaseExecution?.();

    await expect(pending).resolves.toEqual({ nodes: [{ id: 'a', x: 3, y: 4 }] });
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('creates and destroys a fresh layout extension for every execution', async () => {
    let created = 0;
    let destroyed = 0;
    register(
      'layout',
      'scoped-layout',
      extensionFactory(() => {
        created += 1;
        return {
          execute: async (data) => ({
            nodes: data.nodes.map((node) => ({ ...node, x: 0, y: 0 })),
          }),
          destroy: () => {
            destroyed += 1;
          },
        };
      }),
    );

    const data = { nodes: [{ id: 'a' }], edges: [] };
    await runLayout(data, { type: 'scoped-layout' });
    await runLayout(data, { type: 'scoped-layout' });

    expect(created).toBe(2);
    expect(destroyed).toBe(2);
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

  it('lets a registered behavior explicitly override a built-in name', () => {
    const init = vi.fn();
    const destroy = vi.fn();
    register(
      'behavior',
      'zoom-canvas',
      extensionFactory(() => ({ init, getEvents: () => ({}), destroy })),
    );
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

    const teardown = registerBehaviors({} as never, ['zoom-canvas'], graph as never);

    expect(init).toHaveBeenCalledTimes(1);
    teardown();
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('does not mount a behavior after its init phase fails', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const getEvents = vi.fn(() => ({}));
    const destroy = vi.fn();
    register('behavior', 'broken-init-behavior', {
      init: () => {
        throw new Error('init failed');
      },
      getEvents,
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

    registerBehaviors({} as never, ['broken-init-behavior'], graph as never);

    expect(getEvents).not.toHaveBeenCalled();
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
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
