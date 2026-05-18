/**
 * wheel: emit wheel events for nodes, edges, and canvas background.
 * Uses O(1) GPU framebuffer picking via renderer.pickAt().
 *
 * Default browser wheel action (scroll) is prevented when the cursor is over
 * a node or edge so the event can be consumed by application code (e.g. node
 * zoom). When the cursor is on the canvas background, the default zoom-canvas
 * behavior is allowed unless the application calls e.preventDefault().
 */

import type { Renderer } from '../renderer/renderer.js';
import type { Graph } from '../graph.js';

export function wheelEvent(renderer: Renderer, graph: Graph): () => void {
  const canvas = renderer.getCanvas();

  const onWheel = (e: WheelEvent) => {
    const result = renderer.pickAt(e.clientX, e.clientY);

    if (result && result.type === 'node') {
      graph.eventEmitter.emit('node:wheel', { nodeId: result.id, event: e });
      // Do NOT preventDefault — let zoom-canvas also handle it unless app does
    } else if (result && result.type === 'edge') {
      const edges = renderer.getEdges();
      const edge = edges[result.index];
      if (edge) {
        graph.eventEmitter.emit('edge:wheel', {
          edgeIndex: result.index,
          source: edge.source,
          target: edge.target,
          event: e,
        });
      }
    } else {
      graph.eventEmitter.emit('canvas:wheel', { event: e });
    }
  };

  canvas.addEventListener('wheel', onWheel, { passive: true });
  return () => canvas.removeEventListener('wheel', onWheel);
}
