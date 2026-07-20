import type { LabelRenderer } from '../types.js';
import { registerLabelRenderer } from './label.js';
import { registerNode, type NodeExtensionInput } from './node.js';

export function register(type: 'node', name: string, extension: NodeExtensionInput): void;
export function register<T = unknown>(
  type: 'label',
  name: string,
  renderer: LabelRenderer<T>,
): void;
export function register(type: 'node' | 'label', name: string, extension: unknown): void {
  if (type === 'node') {
    registerNode(name, extension as NodeExtensionInput);
    return;
  }
  if (type === 'label') {
    registerLabelRenderer(name, extension as LabelRenderer);
    return;
  }
  throw new Error(`Unsupported extension type: ${String(type)}`);
}
