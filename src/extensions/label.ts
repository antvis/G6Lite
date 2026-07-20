import type { LabelRenderer } from '../types.js';

const LABEL_REGISTRY = new Map<string, LabelRenderer>();

export function registerLabelRenderer<T = unknown>(name: string, renderer: LabelRenderer<T>): void {
  if (!name.trim()) {
    throw new Error('Label renderer name must not be empty');
  }
  LABEL_REGISTRY.set(name, renderer as unknown as LabelRenderer);
}

export function getLabelRenderer(name: string | undefined): LabelRenderer | undefined {
  if (!name) return undefined;
  return LABEL_REGISTRY.get(name);
}
