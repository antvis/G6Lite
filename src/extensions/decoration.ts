import { builtinBadgeRenderer } from './builtinBadge.js';
import type { DecorationRenderer, ExtensionInput } from './contracts.js';
import { createExtension, registerExtension } from './registry.js';

const DECORATION_CACHE = new Map<string, DecorationRenderer>();

export function registerDecoration(
  name: string,
  renderer: ExtensionInput<DecorationRenderer>,
): void {
  registerExtension('decoration', name, renderer);
  DECORATION_CACHE.delete(name);
}

export function getDecorationRenderer(name: string): DecorationRenderer | undefined {
  const cached = DECORATION_CACHE.get(name);
  if (cached) return cached;
  const renderer = createExtension<DecorationRenderer>('decoration', name);
  if (renderer) DECORATION_CACHE.set(name, renderer);
  return renderer;
}

registerDecoration('builtin-badge', builtinBadgeRenderer);
