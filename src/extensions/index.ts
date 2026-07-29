import type { BehaviorOptions, GraphEventMap, LabelRenderer, PluginOptions } from '../types';
import type {
  BehaviorExtension,
  DecorationRenderer,
  EdgeExtension,
  ExtensionInput,
  LayoutExtension,
  PluginExtension,
  TransformExtension,
} from './contracts';
import { registerDecoration } from './decoration';
import { registerEdge } from './edge';
import { registerLabelRenderer } from './label';
import { registerNode, type NodeExtensionInput } from './node';
import { extensionFactory, registerExtension } from './registry';

export { BaseNode, BreathingNode, registerNode } from './node';
export type {
  NodeBoundaryAnchorParams,
  NodeExtension,
  NodeExtensionInput,
  NodeOverlayDrawParams,
} from './node';
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
export function register<TOptions = Record<string, unknown>>(
  type: 'layout',
  name: string,
  extension: ExtensionInput<LayoutExtension<TOptions>>,
): void;
export function register<
  TType extends string,
  TOptions extends BehaviorOptions<TType> = BehaviorOptions<TType>,
  TEventMap extends object = GraphEventMap,
>(
  type: 'behavior',
  name: TType,
  extension: ExtensionInput<BehaviorExtension<TOptions, TEventMap>>,
): void;
export function register<TOptions = Record<string, unknown>>(
  type: 'transform',
  name: string,
  extension: ExtensionInput<TransformExtension<TOptions>>,
): void;
export function register<
  TType extends string,
  TOptions extends PluginOptions<TType> = PluginOptions<TType>,
>(type: 'plugin', name: TType, extension: ExtensionInput<PluginExtension<TOptions>>): void;
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
  BehaviorEventHandlers,
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
  EventArguments,
  LayoutExtension,
  PluginExtension,
  TransformExtension,
} from './contracts';
