import type { LabelRenderer } from '../types.js';
import type {
  BehaviorExtension,
  DecorationRenderer,
  EdgeExtension,
  ExtensionInput,
  LayoutExtension,
  PluginExtension,
  TransformExtension,
} from './contracts.js';
import { registerDecoration } from './decoration.js';
import { registerEdge } from './edge.js';
import { registerLabelRenderer } from './label.js';
import { registerNode, type NodeExtensionInput } from './node.js';
import { extensionFactory, registerExtension } from './registry.js';

export { extensionFactory };

export function register(type: 'node', name: string, extension: NodeExtensionInput): void;
export function register<T = unknown>(
  type: 'label',
  name: string,
  renderer: ExtensionInput<LabelRenderer<T>>,
): void;
export function register(
  type: 'edge',
  name: string,
  extension: ExtensionInput<EdgeExtension>,
): void;
export function register(
  type: 'decoration',
  name: string,
  extension: ExtensionInput<DecorationRenderer>,
): void;
export function register(
  type: 'layout',
  name: string,
  extension: ExtensionInput<LayoutExtension>,
): void;
export function register(
  type: 'behavior',
  name: string,
  extension: ExtensionInput<BehaviorExtension>,
): void;
export function register(
  type: 'transform',
  name: string,
  extension: ExtensionInput<TransformExtension>,
): void;
export function register(
  type: 'plugin',
  name: string,
  extension: ExtensionInput<PluginExtension>,
): void;
export function register(
  type: 'node' | 'label' | 'edge' | 'decoration' | 'layout' | 'behavior' | 'transform' | 'plugin',
  name: string,
  extension: unknown,
): void {
  if (type === 'node') {
    registerNode(name, extension as NodeExtensionInput);
    return;
  }
  if (type === 'label') {
    registerLabelRenderer(name, extension as ExtensionInput<LabelRenderer>);
    return;
  }
  if (type === 'edge') {
    registerEdge(name, extension as ExtensionInput<EdgeExtension>);
    return;
  }
  if (type === 'decoration') {
    registerDecoration(name, extension as ExtensionInput<DecorationRenderer>);
    return;
  }
  registerExtension(type, name, extension as never);
}

export type {
  BehaviorExtension,
  DecorationDrawParams,
  DecorationMeasureParams,
  DecorationRenderer,
  EdgeExtension,
  Extension,
  ExtensionCategory,
  ExtensionConstructor,
  ExtensionContext,
  ExtensionDataContext,
  ExtensionEdgeData,
  ExtensionFactory,
  ExtensionInput,
  ExtensionNodeData,
  ExtensionStateContext,
  ExtensionViewportContext,
  LayoutExtension,
  PluginExtension,
  TransformExtension,
} from './contracts.js';
