/**
 * Built-in behaviors: zoom-canvas, drag-canvas, highlight-node, highlight-edge,
 * click-node, drag-node.
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

export type BehaviorName = 'zoom-canvas' | 'drag-canvas' | 'highlight-node' | 'highlight-edge' | 'click-node' | 'drag-node';

/**
 * Behavior factory: some behaviors only need the renderer, others need the graph too.
 * We pass both always — behaviors that don't need graph simply ignore it.
 */
type BehaviorFactory = (renderer: Renderer, graph: Graph) => () => void;

const BEHAVIORS: Record<BehaviorName, BehaviorFactory> = {
  'zoom-canvas': (r) => zoomCanvas(r),
  'drag-canvas': (r) => dragCanvas(r),
  'highlight-node': (r, g) => highlightNode(r, g),
  'highlight-edge': (r, g) => highlightEdge(r, g),
  'click-node': (r, g) => clickNode(r, g),
  'drag-node': (r, g) => dragNode(r, g),
};

export function registerBehaviors(renderer: Renderer, names: (string | { type: string })[], graph?: Graph): () => void {
  const teardowns: Array<() => void> = [];
  const hasNodeHighlight = names.some((n) => (typeof n === 'string' ? n : n.type) === 'highlight-node');
  const hasEdgeHighlight = names.some((n) => (typeof n === 'string' ? n : n.type) === 'highlight-edge');
  const useCombinedHover = hasNodeHighlight && hasEdgeHighlight;

  for (const nameOrObj of names) {
    const name = typeof nameOrObj === 'string' ? nameOrObj : nameOrObj.type;
    // Skip individual highlight behaviors if using combined hover
    if (useCombinedHover && (name === 'highlight-node' || name === 'highlight-edge')) continue;
    const fn = BEHAVIORS[name as BehaviorName];
    if (fn) {
      teardowns.push(fn(renderer, graph as Graph));
    }
  }

  if (useCombinedHover) {
    teardowns.push(hoverHighlight(renderer, graph));
  }

  return () => teardowns.forEach((f) => f());
}

export { zoomCanvas, dragCanvas, highlightNode, highlightEdge, hoverHighlight, clickNode, dragNode };