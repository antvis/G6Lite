import type { EdgeConfig } from '../types';
import type { EdgeExtension, ExtensionInput } from './contracts';
import { createExtension, registerExtension } from './registry';

const EDGE_CACHE = new Map<string, EdgeExtension>();

export function registerEdge(name: string, extension: ExtensionInput<EdgeExtension>): void {
  registerExtension('edge', name, extension);
  EDGE_CACHE.delete(name);
}

export function getEdgeExtension(name: string | undefined): EdgeExtension | undefined {
  if (!name || name === 'line' || name === 'arc' || name === 'polyline' || name === 'cubic') {
    return undefined;
  }
  const cached = EDGE_CACHE.get(name);
  if (cached) return cached;
  const extension = createExtension<EdgeExtension>('edge', name);
  if (extension) EDGE_CACHE.set(name, extension);
  return extension;
}

export function getEdgeBaseType(config?: EdgeConfig): 'line' | 'arc' | 'polyline' | 'cubic' {
  const type = config?.type;
  switch (type) {
    case 'arc':
    case 'polyline':
    case 'cubic':
    case 'line':
      return type as 'line' | 'arc' | 'polyline' | 'cubic';
  }
  return getEdgeExtension(type)?.base ?? 'line';
}
