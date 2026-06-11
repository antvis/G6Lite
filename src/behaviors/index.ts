/**
 * Built-in behaviors: zoom-canvas, drag-canvas, highlight-node, highlight-edge,
 * hover-highlight, drag-node, click-select, drag-edge, brush-select, lasso-select,
 * tooltip.
 * Click/wheel/pointer events come from the InteractionDispatcher (mounted by the
 * graph); behaviors are pure consumers of those events.
 * When both highlight-node and highlight-edge are used, one combined hover handler runs (edge takes precedence).
 */

import type { Graph } from '../graph.js';
import type { Renderer } from '../renderer/renderer.js';
import { brushSelect } from './brushSelect.js';
import { clickSelect } from './clickSelect.js';
import { dragCanvas } from './dragCanvas.js';
import { dragEdge } from './dragEdge.js';
import { dragNode } from './dragNode.js';
import { highlightEdge } from './highlightEdge.js';
import { highlightNode } from './highlightNode.js';
import { hoverHighlight } from './hoverHighlight.js';
import { lassoSelect } from './lassoSelect.js';
import { tooltip } from './tooltip.js';
import { zoomCanvas } from './zoomCanvas.js';

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
  'drag-canvas': (r, g) => dragCanvas(r, g),
  'highlight-node': (r, g) => highlightNode(r, g),
  'highlight-edge': (r, g) => highlightEdge(r, g),
  'drag-node': (r, g) => dragNode(r, g),
  'hover-highlight': (r, g, config) => hoverHighlight(r, g, config as any),
  'click-select': (r, g, config) => clickSelect(r, g, config as any),
  'drag-edge': (r, g) => dragEdge(r, g),
  'brush-select': (r, g, config) =>
    brushSelect(r, g, config?.key ? { key: config.key as 'shift' | 'ctrl' | null } : undefined),
  'lasso-select': (r, g, config) =>
    lassoSelect(r, g, config?.key ? { key: config.key as 'shift' | 'ctrl' | null } : undefined),
  tooltip: (r, g, config) => tooltip(r, g, config as any),
};

export function registerBehaviors(
  renderer: Renderer,
  names: (string | BehaviorConfig)[],
  graph?: Graph,
): () => void {
  const teardowns: Array<() => void> = [];
  const hasNodeHighlight = names.some(
    (n) => (typeof n === 'string' ? n : n.type) === 'highlight-node',
  );
  const hasEdgeHighlight = names.some(
    (n) => (typeof n === 'string' ? n : n.type) === 'highlight-edge',
  );
  const useCombinedHover = hasNodeHighlight && hasEdgeHighlight;

  for (const nameOrObj of names) {
    const name = typeof nameOrObj === 'string' ? nameOrObj : nameOrObj.type;
    const config = typeof nameOrObj === 'string' ? undefined : nameOrObj;
    // Skip individual highlight behaviors if using combined hover
    if (useCombinedHover && (name === 'highlight-node' || name === 'highlight-edge')) continue;
    const fn = BEHAVIORS[name];
    if (fn) {
      teardowns.push(fn(renderer, graph as Graph, config));
    }
  }

  if (useCombinedHover) {
    const hoverConfig = names.find(
      (n) => typeof n !== 'string' && (n.type === 'highlight-node' || n.type === 'highlight-edge'),
    );
    teardowns.push(
      hoverHighlight(
        renderer,
        graph,
        typeof hoverConfig === 'string' ? undefined : (hoverConfig as any),
      ),
    );
  }

  return () => teardowns.forEach((f) => f());
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
