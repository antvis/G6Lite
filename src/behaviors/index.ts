/**
 * Built-in behaviors: zoom-canvas, drag-canvas, highlight-node, highlight-edge,
 * click-node, drag-node, click-select, drag-edge, wheel, brush-select, lasso-select.
 * When both highlight-node and highlight-edge are used, one combined hover handler runs (edge takes precedence).
 */

import type { Renderer } from '../renderer/renderer.js';
import type { Graph } from '../graph.js';
import { zoomCanvas } from './zoomCanvas.js';
import { dragCanvas } from './dragCanvas.js';
import { highlightNode } from './highlightNode.js';
import { highlightEdge } from './highlightEdge.js';
import { hoverHighlight } from './hoverHighlight.js';
import { clickNode } from './clickNode.js';
import { dragNode } from './dragNode.js';
import { clickSelect } from './clickSelect.js';
import { dragEdge } from './dragEdge.js';
import { wheelEvent } from './wheelEvent.js';
import { brushSelect } from './brushSelect.js';
import { lassoSelect } from './lassoSelect.js';

export type BehaviorName =
  | 'zoom-canvas'
  | 'drag-canvas'
  | 'highlight-node'
  | 'highlight-edge'
  | 'hover-highlight'
  | 'click-node'
  | 'drag-node'
  | 'click-select'
  | 'drag-edge'
  | 'wheel'
  | 'brush-select'
  | 'lasso-select';

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
  'click-node': (r, g) => clickNode(r, g),
  'drag-node': (r, g) => dragNode(r, g),
  'hover-highlight': (r, g, config) => hoverHighlight(r, g, config as any),
  'click-select': (r, g, config) => clickSelect(r, g, config as any),
  'drag-edge': (r, g) => dragEdge(r, g),
  wheel: (r, g) => wheelEvent(r, g),
  'brush-select': (r, g, config) =>
    brushSelect(r, g, config?.key ? { key: config.key as 'shift' | 'ctrl' | null } : undefined),
  'lasso-select': (r, g, config) =>
    lassoSelect(r, g, config?.key ? { key: config.key as 'shift' | 'ctrl' | null } : undefined),
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
  zoomCanvas,
  dragCanvas,
  highlightNode,
  highlightEdge,
  hoverHighlight,
  clickNode,
  dragNode,
  clickSelect,
  dragEdge,
  wheelEvent,
  brushSelect,
  lassoSelect,
};
