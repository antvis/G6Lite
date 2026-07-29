import type { LabelRenderer } from '../types';
import type { ExtensionInput } from './contracts';
import { createExtension, registerExtension } from './registry';

const LABEL_CACHE = new Map<string, LabelRenderer>();

export function registerLabelRenderer<T = unknown>(
  name: string,
  renderer: ExtensionInput<LabelRenderer<T>>,
): void {
  registerExtension('label', name, renderer as ExtensionInput<LabelRenderer>);
  LABEL_CACHE.delete(name);
}

export function getLabelRenderer(name: string | undefined): LabelRenderer | undefined {
  if (!name) return undefined;
  const cached = LABEL_CACHE.get(name);
  if (cached) return cached;
  const renderer = createExtension<LabelRenderer>('label', name);
  if (renderer) LABEL_CACHE.set(name, renderer);
  return renderer;
}
