/**
 * highlight-edge: hover edge highlights it and its source/target nodes.
 * Consumes pointer events from the InteractionDispatcher (no own picking).
 */

import type { Graph } from '../graph';
import type { Renderer } from '../renderer/renderer';

export function highlightEdge(renderer: Renderer, graph?: Graph): () => void {
  if (!graph) return () => {};
  const canvas = renderer.getCanvas();

  const onOver = (payload: { source: string; target: string; edgeIndex: number }) => {
    canvas.style.cursor = 'pointer';
    renderer.setHighlight({
      nodeIds: new Set([payload.source, payload.target]),
      edgeIndices: new Set([payload.edgeIndex]),
    });
  };

  const onLeave = () => {
    canvas.style.cursor = 'default';
    renderer.setHighlight({ nodeIds: new Set(), edgeIndices: new Set() });
  };

  graph.eventEmitter.on('edge:pointerover', onOver);
  graph.eventEmitter.on('edge:pointerleave', onLeave);
  return () => {
    graph.eventEmitter.off('edge:pointerover', onOver);
    graph.eventEmitter.off('edge:pointerleave', onLeave);
  };
}
