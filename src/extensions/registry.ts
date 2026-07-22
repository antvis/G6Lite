import type { Graph } from '../graph.js';
import type {
  Extension,
  ExtensionCategory,
  ExtensionConstructor,
  ExtensionContext,
  ExtensionFactory,
  ExtensionInput,
  RegisteredExtension,
} from './contracts.js';

type RegistryEntry =
  | { kind: 'instance'; value: unknown }
  | { kind: 'factory'; value: ExtensionFactory }
  | { kind: 'constructor'; value: ExtensionConstructor };

const registries = new Map<ExtensionCategory, Map<string, RegistryEntry>>();
const explicitFactories = new WeakSet<ExtensionFactory>();

/** Marks a function as the preferred extension factory form. */
export function extensionFactory<T>(factory: ExtensionFactory<T>): ExtensionFactory<T> {
  explicitFactories.add(factory as ExtensionFactory);
  return factory;
}

export function registerExtension(
  category: ExtensionCategory,
  name: string,
  extension: ExtensionInput,
): void {
  if (!name.trim()) throw new Error(`${category} extension name must not be empty`);
  let registry = registries.get(category);
  if (!registry) {
    registry = new Map();
    registries.set(category, registry);
  }
  registry.set(name, normalizeExtensionInput(extension));
}

export function hasExtension(category: ExtensionCategory, name: string): boolean {
  return registries.get(category)?.has(name) ?? false;
}

export function createExtension<T = RegisteredExtension>(
  category: ExtensionCategory,
  name: string,
): T | undefined {
  const entry = registries.get(category)?.get(name);
  if (!entry) return undefined;
  return safeExtensionCall<T | undefined>(
    category,
    name,
    'create',
    () => instantiateExtension<T>(entry),
    undefined,
  );
}

function instantiateExtension<T>(entry: RegistryEntry): T {
  switch (entry.kind) {
    case 'factory':
      return entry.value() as T;
    case 'constructor':
      return new entry.value() as T;
    case 'instance':
      return cloneExtension(entry.value) as T;
  }
}

function normalizeExtensionInput(input: ExtensionInput): RegistryEntry {
  if (typeof input !== 'function') return { kind: 'instance', value: input };
  if (explicitFactories.has(input as ExtensionFactory)) {
    return { kind: 'factory', value: input as ExtensionFactory };
  }
  if (isLegacyConstructor(input)) {
    return { kind: 'constructor', value: input as ExtensionConstructor };
  }
  return { kind: 'factory', value: input as ExtensionFactory };
}

function isLegacyConstructor(input: unknown): input is ExtensionConstructor {
  if (typeof input !== 'function') return false;
  if (/^\s*class(?:\s|\{)/u.test(Function.prototype.toString.call(input))) return true;
  const prototype = (input as { prototype?: object }).prototype;
  return Boolean(
    prototype && Object.getOwnPropertyNames(prototype).some((name) => name !== 'constructor'),
  );
}

/**
 * Best-effort compatibility cloning for legacy instance registrations.
 * Stateful extensions that require guaranteed isolation should use extensionFactory().
 */
function cloneExtension<T>(input: T, seen = new WeakMap<object, unknown>()): T {
  if (typeof input !== 'object' || input === null) return input;

  const existing = seen.get(input);
  if (existing !== undefined) return existing as T;

  if (Array.isArray(input)) {
    const clone: unknown[] = [];
    seen.set(input, clone);
    copyEnumerableState(input, clone, seen);
    return clone as T;
  }

  const prototype = Object.getPrototypeOf(input);
  if (prototype === Object.prototype || prototype === null) {
    const clone = Object.create(prototype) as object;
    seen.set(input, clone);
    copyEnumerableState(input, clone, seen);
    return clone as T;
  }

  const Constructor = (input as { constructor?: unknown }).constructor;
  if (typeof Constructor === 'function') {
    try {
      // Constructing the class initializes native and #private state correctly.
      const clone = new (Constructor as new () => object)();
      seen.set(input, clone);
      copyEnumerableState(input, clone, seen);
      return clone as T;
    } catch {
      // A legacy instance whose constructor requires arguments remains usable, but
      // only extensionFactory() can guarantee an isolated replacement for it.
    }
  }

  return input;
}

function copyEnumerableState(source: object, target: object, seen: WeakMap<object, unknown>): void {
  for (const key of Reflect.ownKeys(source)) {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    if (!descriptor?.enumerable) continue;
    if ('value' in descriptor) descriptor.value = cloneExtension(descriptor.value, seen);
    try {
      Object.defineProperty(target, key, descriptor);
    } catch {
      // Constructor-created instances may expose non-configurable public state.
      if ('value' in descriptor) Reflect.set(target, key, descriptor.value);
    }
  }
}

export function createExtensionContext(graph: Graph): ExtensionContext {
  const viewport = {
    screenToGraph: (point: { x: number; y: number }) => graph.screenToGraph(point.x, point.y),
    graphToScreen: (point: { x: number; y: number }) => graph.graphToScreen(point.x, point.y),
    getZoom: () => graph.getZoom(),
  };
  return {
    graph,
    data: {
      getNode: (id) => {
        const node = graph.getNodeData(id);
        if (!node) return undefined;
        return {
          id: node.id,
          name: node.name,
          x: node.x,
          y: node.y,
          data: node.data ? { ...node.data } : undefined,
          states: [...node.states],
        };
      },
      getEdge: (id) => {
        const edge = graph.getEdgeData(id);
        if (!edge) return undefined;
        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          data: edge.data ? { ...edge.data } : undefined,
          states: [...edge.states],
        };
      },
      getNodeIds: () => graph.getNodes().map((node) => node.id),
      getEdgeIds: () => graph.getEdges().map((edge, index) => edge.id ?? String(index)),
      updateNode: (id, data) => graph.updateNodeData(id, data),
      updateEdge: (id, data) => graph.updateEdgeData(id, data),
    },
    state: {
      set: (id, states) => graph.setElementStates(id, states),
      setAll: (stateMap) => graph.setElementStates(stateMap),
      get: (id) => graph.getItemStates(id),
      clear: (id) => graph.clearItemStates(id),
    },
    viewport,
    requestRender: () => graph.scheduleRender(),
    screenToGraph: viewport.screenToGraph,
    graphToScreen: viewport.graphToScreen,
    getZoom: viewport.getZoom,
    isDestroyed: () => graph.isDestroyed(),
  };
}

export function initializeExtension<TOptions>(
  category: ExtensionCategory,
  name: string,
  extension: Extension<TOptions>,
  context: ExtensionContext,
  options: TOptions,
): boolean {
  return safeExtensionCall(
    category,
    name,
    'init',
    () => {
      extension.init?.(context, options);
      return true;
    },
    false,
  );
}

export function updateExtension<TOptions>(
  category: ExtensionCategory,
  name: string,
  extension: Extension<TOptions>,
  options: Partial<TOptions>,
): boolean {
  return safeExtensionCall(
    category,
    name,
    'update',
    () => {
      extension.update?.(options);
      return true;
    },
    false,
  );
}

export function destroyExtension(
  category: ExtensionCategory,
  name: string,
  extension: Extension,
): void {
  safeExtensionCall(category, name, 'destroy', () => extension.destroy?.(), undefined);
}

export function safeExtensionCall<T>(
  category: ExtensionCategory,
  name: string,
  phase: string,
  fn: () => T,
  fallback: T,
): T {
  try {
    return fn();
  } catch (error) {
    console.error(`[G6-GL] ${category} extension "${name}" failed during ${phase}`, error);
    return fallback;
  }
}
