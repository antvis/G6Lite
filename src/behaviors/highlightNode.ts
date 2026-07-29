/**
 * highlight-node: hover node highlights it and adjacent nodes/edges.
 * Consumes pointer events from the InteractionDispatcher (no own picking).
 */

import type { Graph } from '../graph';
import type { Renderer } from '../renderer/renderer';

export function highlightNode(renderer: Renderer, graph?: Graph): () => void {
  if (!graph) return () => {};
  const canvas = renderer.getCanvas();

  const onOver = (payload: { nodeId: string }) => {
    const nodeId = payload.nodeId;
    canvas.style.cursor = 'pointer';
    const nodeIds = new Set<string>([nodeId]);
    const edgeIndices = new Set<number>();
    const edges = renderer.getEdges();
    edges.forEach((edge, i) => {
      if (edge.source === nodeId || edge.target === nodeId) {
        nodeIds.add(edge.source).add(edge.target);
        edgeIndices.add(i);
      }
    });
    renderer.setHighlight({ nodeIds, edgeIndices });
  };

  const onLeave = () => {
    canvas.style.cursor = 'default';
    renderer.setHighlight({ nodeIds: new Set(), edgeIndices: new Set() });
  };

  graph.eventEmitter.on('node:pointerover', onOver);
  graph.eventEmitter.on('node:pointerleave', onLeave);
  return () => {
    graph.eventEmitter.off('node:pointerover', onOver);
    graph.eventEmitter.off('node:pointerleave', onLeave);
  };
}
