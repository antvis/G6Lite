/**
 * Built-in behaviors: zoom-canvas, drag-canvas, highlight-node, highlight-edge,
 * hover-highlight, drag-node, click-select, drag-edge, brush-select, lasso-select,
 * tooltip.
 * Click/wheel/pointer events come from the InteractionDispatcher (mounted by the
 * graph); behaviors are pure consumers of those events.
 * When both highlight-node and highlight-edge are used, one combined hover handler runs (edge takes precedence).
 */

import type { BehaviorExtension } from '../extensions/contracts';
import {
  createExtension,
  createExtensionContext,
  destroyExtension,
  hasExtension,
  initializeExtension,
  safeExtensionCall,
} from '../extensions/registry';
import type { Graph } from '../graph';
import type { Renderer } from '../renderer/renderer';
import type { BehaviorConfig, BehaviorOption } from '../types';
import { brushSelect, type BrushSelectOptions } from './brushSelect';
import { clickSelect, type ClickSelectConfig } from './clickSelect';
import { dragCanvas, type DragCanvasOptions } from './dragCanvas';
import { dragEdge } from './dragEdge';
import { dragNode } from './dragNode';
import { highlightEdge } from './highlightEdge';
import { highlightNode } from './highlightNode';
import { hoverHighlight, type HoverHighlightConfig } from './hoverHighlight';
import { lassoSelect, type LassoSelectOptions } from './lassoSelect';
import { tooltip, type TooltipOptions } from './tooltip';
import { resolveZoomCanvasOptions, zoomCanvas, type ZoomCanvasOptions } from './zoomCanvas';

export type { BrushSelectOptions } from './brushSelect';
export type { ClickSelectConfig } from './clickSelect';
export type { DragCanvasOptions } from './dragCanvas';
export type { HoverHighlightConfig } from './hoverHighlight';
export type { LassoSelectOptions } from './lassoSelect';
export type { TooltipContext, TooltipOptions } from './tooltip';
export type { ZoomCanvasOptions } from './zoomCanvas';

export type BehaviorName =
  | 'zoom-canvas'
  | 'drag-canvas'
  | 'highlight-node'
  | 'highlight-edge'
  | 'hover-highlight'
  | 'drag-node'
  | 'click-select'
  | 'drag-edge'
  | 'brush-select'
  | 'lasso-select'
  | 'tooltip';

/** Built-in behavior name to its supported object configuration. */
export interface BuiltInBehaviorOptionsMap {
  'zoom-canvas': BehaviorConfig<'zoom-canvas', ZoomCanvasOptions>;
  'drag-canvas': BehaviorConfig<'drag-canvas', DragCanvasOptions>;
  'highlight-node': BehaviorConfig<'highlight-node'>;
  'highlight-edge': BehaviorConfig<'highlight-edge'>;
  'hover-highlight': BehaviorConfig<'hover-highlight', Omit<HoverHighlightConfig, 'type'>>;
  'drag-node': BehaviorConfig<'drag-node'>;
  'click-select': BehaviorConfig<'click-select', Omit<ClickSelectConfig, 'type'>>;
  'drag-edge': BehaviorConfig<'drag-edge'>;
  'brush-select': BehaviorConfig<'brush-select', BrushSelectOptions>;
  'lasso-select': BehaviorConfig<'lasso-select', LassoSelectOptions>;
  tooltip: BehaviorConfig<'tooltip', TooltipOptions>;
}

export type BuiltInBehaviorConfig = BuiltInBehaviorOptionsMap[keyof BuiltInBehaviorOptionsMap];

type BehaviorFactory = (renderer: Renderer, graph: Graph, config?: BehaviorConfig) => () => void;

const BEHAVIORS: Record<string, BehaviorFactory> = {
  'zoom-canvas': (r, _g, config) =>
    zoomCanvas(r, resolveZoomCanvasOptions(resolveZoomCanvasConfig(config))),
  'drag-canvas': (r, g, config) =>
    dragCanvas(r, g, {
      ignoreModifierKeys:
        typeof config?.ignoreModifierKeys === 'boolean' ? config.ignoreModifierKeys : undefined,
    }),
  'highlight-node': (r, g) => highlightNode(r, g),
  'highlight-edge': (r, g) => highlightEdge(r, g),
  'drag-node': (r, g) => dragNode(r, g),
  'hover-highlight': (r, g, config) => hoverHighlight(r, g, resolveHoverHighlightConfig(config)),
  'click-select': (r, g, config) => clickSelect(r, g, resolveClickSelectConfig(config)),
  'drag-edge': (r, g) => dragEdge(r, g),
  'brush-select': (r, g, config) =>
    brushSelect(r, g, config?.key ? { key: config.key as 'shift' | 'ctrl' | null } : undefined),
  'lasso-select': (r, g, config) =>
    lassoSelect(r, g, config?.key ? { key: config.key as 'shift' | 'ctrl' | null } : undefined),
  tooltip: (r, g, config) => tooltip(r, g, resolveTooltipOptions(config)),
};

export const DEFAULT_BEHAVIORS: readonly BehaviorName[] = ['zoom-canvas', 'drag-canvas'];

/**
 * Default viewport navigation is enabled only when behaviors is omitted.
 * An explicit array, including an empty one, is treated as the complete list.
 */
export function resolveBehaviorOptions(behaviors?: BehaviorOption[]): BehaviorOption[] {
  return behaviors === undefined ? [...DEFAULT_BEHAVIORS] : behaviors;
}

export function registerBehaviors(
  renderer: Renderer,
  names: BehaviorOption[],
  graph?: Graph,
): () => void {
  const teardowns: Array<() => void> = [];
  const usesBuiltIn = (name: string) => Boolean(BEHAVIORS[name]) && !hasExtension('behavior', name);
  const hasNodeHighlight = names.some(
    (n) =>
      (typeof n === 'string' ? n : n.type) === 'highlight-node' && usesBuiltIn('highlight-node'),
  );
  const hasEdgeHighlight = names.some(
    (n) =>
      (typeof n === 'string' ? n : n.type) === 'highlight-edge' && usesBuiltIn('highlight-edge'),
  );
  const useCombinedHover = hasNodeHighlight && hasEdgeHighlight;

  for (const nameOrObj of names) {
    const name = typeof nameOrObj === 'string' ? nameOrObj : nameOrObj.type;
    const config: BehaviorConfig = typeof nameOrObj === 'string' ? { type: nameOrObj } : nameOrObj;
    // Skip individual highlight behaviors if using combined hover
    if (useCombinedHover && (name === 'highlight-node' || name === 'highlight-edge')) continue;
    if (hasExtension('behavior', name)) {
      if (!graph) continue;
      const extension = createExtension<BehaviorExtension>('behavior', name);
      if (!extension) continue;
      const context = createExtensionContext(graph);
      if (!initializeExtension('behavior', name, extension, context, config)) {
        destroyExtension('behavior', name, extension);
        continue;
      }
      const events = safeExtensionCall(
        'behavior',
        name,
        'getEvents',
        () => extension.getEvents(),
        {},
      );
      const bindings: Array<{ event: string; handler: (...args: unknown[]) => void }> = [];
      for (const [event, handler] of Object.entries(events)) {
        if (typeof handler !== 'function') continue;
        const wrapped = (...args: unknown[]): void => {
          safeExtensionCall(
            'behavior',
            name,
            `event:${event}`,
            () => (handler as (...handlerArgs: unknown[]) => void)(...args),
            undefined,
          );
        };
        graph.on(event, wrapped);
        bindings.push({ event, handler: wrapped });
      }
      teardowns.push(() => {
        for (const binding of bindings) graph.off(binding.event, binding.handler);
        destroyExtension('behavior', name, extension);
      });
      continue;
    }
    const fn = BEHAVIORS[name];
    if (fn) {
      teardowns.push(fn(renderer, graph as Graph, config));
    }
  }

  if (useCombinedHover) {
    const hoverConfig = names.find(
      (n): n is BehaviorConfig =>
        typeof n !== 'string' && (n.type === 'highlight-node' || n.type === 'highlight-edge'),
    );
    teardowns.push(hoverHighlight(renderer, graph, resolveHoverHighlightConfig(hoverConfig)));
  }

  return () => teardowns.forEach((f) => f());
}

function resolveHoverHighlightConfig(config?: BehaviorConfig): HoverHighlightConfig | undefined {
  if (!config) return undefined;
  return {
    type: config.type,
    degree: typeof config.degree === 'number' ? config.degree : undefined,
    inactiveState: typeof config.inactiveState === 'string' ? config.inactiveState : undefined,
  };
}

function resolveZoomCanvasConfig(config?: BehaviorConfig): ZoomCanvasOptions | undefined {
  if (!config) return undefined;
  return {
    sensitivity: typeof config.sensitivity === 'number' ? config.sensitivity : undefined,
    minZoom: typeof config.minZoom === 'number' ? config.minZoom : undefined,
    maxZoom: typeof config.maxZoom === 'number' ? config.maxZoom : undefined,
  };
}

function resolveClickSelectConfig(config?: BehaviorConfig): ClickSelectConfig | undefined {
  if (!config) return undefined;
  const trigger = config.trigger;
  return {
    type: config.type,
    multiple: typeof config.multiple === 'boolean' ? config.multiple : undefined,
    trigger: trigger === 'shift' || trigger === 'ctrl' || trigger === 'meta' ? trigger : undefined,
  };
}

function resolveTooltipOptions(config?: BehaviorConfig): TooltipOptions | undefined {
  if (!config) return undefined;
  const options: TooltipOptions = {};
  if (config.trigger === 'hover' || config.trigger === 'click') options.trigger = config.trigger;
  if (typeof config.getContent === 'function') {
    options.getContent = config.getContent as TooltipOptions['getContent'];
  }
  if (typeof config.enable === 'function') {
    options.enable = config.enable as TooltipOptions['enable'];
  }
  if (
    Array.isArray(config.offset) &&
    config.offset.length === 2 &&
    config.offset.every((value) => typeof value === 'number')
  ) {
    options.offset = config.offset as [number, number];
  }
  if (typeof config.delay === 'number') options.delay = config.delay;
  if (typeof config.className === 'string') options.className = config.className;
  if (typeof HTMLElement !== 'undefined' && config.container instanceof HTMLElement) {
    options.container = config.container;
  }
  return options;
}

export {
  brushSelect,
  clickSelect,
  dragCanvas,
  dragEdge,
  dragNode,
  highlightEdge,
  highlightNode,
  hoverHighlight,
  lassoSelect,
  tooltip,
  zoomCanvas,
};
