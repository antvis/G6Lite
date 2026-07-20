import type { Graph } from '../graph.js';
import type {
  ExtensionCategory,
  ExtensionContext,
  ExtensionInput,
  RegisteredExtension,
} from './contracts.js';

const registries = new Map<ExtensionCategory, Map<string, ExtensionInput>>();

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
  registry.set(name, extension);
}

export function createExtension<T extends RegisteredExtension>(
  category: ExtensionCategory,
  name: string,
): T | undefined {
  const input = registries.get(category)?.get(name) as ExtensionInput<T> | undefined;
  if (!input) return undefined;
  if (typeof input === 'function') {
    try {
      return new (input as new () => T)();
    } catch {
      return (input as () => T)();
    }
  }
  return Object.assign(Object.create(Object.getPrototypeOf(input)), input) as T;
}

export function createExtensionContext(graph: Graph): ExtensionContext {
  return {
    graph,
    requestRender: () => graph.scheduleRender(),
    screenToGraph: (point) => graph.screenToGraph(point.x, point.y),
    graphToScreen: (point) => graph.graphToScreen(point.x, point.y),
    getZoom: () => graph.getZoom(),
    isDestroyed: () => graph.isDestroyed(),
  };
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
    console.error(`[G6Lite] ${category} extension "${name}" failed during ${phase}`, error);
    return fallback;
  }
}
