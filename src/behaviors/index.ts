/**
 * Built-in behaviors: zoom-canvas, drag-canvas, highlight-node, highlight-edge,
 * hover-highlight, drag-node, click-select, drag-edge, brush-select, lasso-select,
 * tooltip.
 * Click/wheel/pointer events come from the InteractionDispatcher (mounted by the
 * graph); behaviors are pure consumers of those events.
 * When both highlight-node and highlight-edge are used, one combined hover handler runs (edge takes precedence).
 */

import type { BehaviorExtension } from '../extensions/contracts.js';
import {
  createExtension,
  createExtensionContext,
  destroyExtension,
  hasExtension,
  initializeExtension,
  safeExtensionCall,
} from '../extensions/registry.js';
import type { Graph } from '../graph.js';
import type { Renderer } from '../renderer/renderer.js';
import type { BehaviorOption } from '../types.js';
import { brushSelect } from './brushSelect.js';
import { clickSelect, type ClickSelectConfig } from './clickSelect.js';
import { dragCanvas } from './dragCanvas.js';
import { dragEdge } from './dragEdge.js';
import { dragNode } from './dragNode.js';
import { highlightEdge } from './highlightEdge.js';
import { highlightNode } from './highlightNode.js';
import { hoverHighlight, type HoverHighlightConfig } from './hoverHighlight.js';
import { lassoSelect } from './lassoSelect.js';
import { tooltip, type TooltipOptions } from './tooltip.js';
import { zoomCanvas } from './zoomCanvas.js';

export type { BrushSelectOptions } from './brushSelect.js';
export type { ClickSelectConfig } from './clickSelect.js';
export type { DragCanvasOptions } from './dragCanvas.js';
export type { HoverHighlightConfig } from './hoverHighlight.js';
export type { LassoSelectOptions } from './lassoSelect.js';
export type { TooltipContext, TooltipOptions } from './tooltip.js';

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

export interface BehaviorConfig {
  type: string;
  [key: string]: unknown;
}

type BehaviorFactory = (renderer: Renderer, graph: Graph, config?: BehaviorConfig) => () => void;

const BEHAVIORS: Record<string, BehaviorFactory> = {
  'zoom-canvas': (r) => zoomCanvas(r),
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
  names: (string | BehaviorConfig)[],
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
    const config = typeof nameOrObj === 'string' ? undefined : nameOrObj;
    // Skip individual highlight behaviors if using combined hover
    if (useCombinedHover && (name === 'highlight-node' || name === 'highlight-edge')) continue;
    if (hasExtension('behavior', name)) {
      if (!graph) continue;
      const extension = createExtension<BehaviorExtension>('behavior', name);
      if (!extension) continue;
      const context = createExtensionContext(graph);
      if (!initializeExtension('behavior', name, extension, context, config ?? {})) {
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
      for (const [event, handler] of Object.entries(events)) graph.on(event, handler);
      teardowns.push(() => {
        for (const [event, handler] of Object.entries(events)) graph.off(event, handler);
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
