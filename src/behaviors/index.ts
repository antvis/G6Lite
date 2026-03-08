/**
 * Built-in behaviors: zoom-canvas, drag-canvas, highlight-node, highlight-edge.
 * When both highlight-node and highlight-edge are used, one combined hover handler runs (edge takes precedence).
 */

import type { Renderer } from '../renderer/renderer.js';
import { zoomCanvas } from './zoomCanvas.js';
import { dragCanvas } from './dragCanvas.js';
import { highlightNode } from './highlightNode.js';
import { highlightEdge } from './highlightEdge.js';
import { hoverHighlight } from './hoverHighlight.js';

export type BehaviorName = 'zoom-canvas' | 'drag-canvas' | 'highlight-node' | 'highlight-edge';

const BEHAVIORS: Record<BehaviorName, (r: Renderer) => () => void> = {
  'zoom-canvas': zoomCanvas,
  'drag-canvas': dragCanvas,
  'highlight-node': highlightNode,
  'highlight-edge': highlightEdge,
};

export function registerBehaviors(renderer: Renderer, names: (string | { type: string })[]): () => void {
  const teardowns: Array<() => void> = [];
  const hasNodeHighlight = names.some((n) => (typeof n === 'string' ? n : n.type) === 'highlight-node');
  const hasEdgeHighlight = names.some((n) => (typeof n === 'string' ? n : n.type) === 'highlight-edge');
  const useCombinedHover = hasNodeHighlight && hasEdgeHighlight;

  for (const nameOrObj of names) {
    const name = typeof nameOrObj === 'string' ? nameOrObj : nameOrObj.type;
    if (useCombinedHover && (name === 'highlight-node' || name === 'highlight-edge')) continue;
    const fn = BEHAVIORS[name as BehaviorName];
    if (fn) teardowns.push(fn(renderer));
  }

  if (useCombinedHover) teardowns.push(hoverHighlight(renderer));

  return () => teardowns.forEach((f) => f());
}

export { zoomCanvas, dragCanvas, highlightNode, highlightEdge, hoverHighlight };
