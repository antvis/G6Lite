/**
 * highlight-edge: hover edge highlights it and its source/target nodes.
 * Uses O(1) GPU framebuffer picking via renderer.pickAt().
 * Emits edge:hover (enter) and edge:mouseleave (leave).
 */

import type { Renderer } from '../renderer/renderer.js';
import type { Graph } from '../graph.js';

export function highlightEdge(renderer: Renderer, graph?: Graph): () => void {
  const canvas = renderer.getCanvas();
  let lastEdgeIndex: number | null = null;

  const onMove = (e: MouseEvent) => {
    const result = renderer.pickAt(e.clientX, e.clientY);
    if (result && result.type === 'edge') {
      const edges = renderer.getEdges();
      const edge = edges[result.index];
      if (edge) {
        // Emit leave if previous edge differs
        if (lastEdgeIndex !== null && lastEdgeIndex !== result.index) {
          const prevEdge = edges[lastEdgeIndex];
          if (prevEdge) {
            graph?.eventEmitter.emit('edge:mouseleave', {
              edgeIndex: lastEdgeIndex,
              source: prevEdge.source,
              target: prevEdge.target,
              event: e,
            });
          }
        }
        canvas.style.cursor = 'pointer';
        renderer.setHighlight({
          nodeIds: new Set([edge.source, edge.target]),
          edgeIndices: new Set([result.index]),
        });
        lastEdgeIndex = result.index;
        graph?.eventEmitter.emit('edge:hover', {
          edgeIndex: result.index,
          source: edge.source,
          target: edge.target,
          event: e,
        });
        return;
      }
    }
    // Nothing hit — emit leave
    if (lastEdgeIndex !== null) {
      const edges = renderer.getEdges();
      const prevEdge = edges[lastEdgeIndex];
      if (prevEdge) {
        graph?.eventEmitter.emit('edge:mouseleave', {
          edgeIndex: lastEdgeIndex,
          source: prevEdge.source,
          target: prevEdge.target,
          event: e,
        });
      }
      lastEdgeIndex = null;
    }
    canvas.style.cursor = 'default';
    renderer.setHighlight({ nodeIds: new Set(), edgeIndices: new Set() });
  };

  const onLeave = (e: MouseEvent) => {
    if (lastEdgeIndex !== null) {
      const edges = renderer.getEdges();
      const prevEdge = edges[lastEdgeIndex];
      if (prevEdge) {
        graph?.eventEmitter.emit('edge:mouseleave', {
          edgeIndex: lastEdgeIndex,
          source: prevEdge.source,
          target: prevEdge.target,
          event: e,
        });
      }
      lastEdgeIndex = null;
    }
    canvas.style.cursor = 'default';
    renderer.setHighlight({ nodeIds: new Set(), edgeIndices: new Set() });
  };

  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseleave', onLeave);
  return () => {
    canvas.removeEventListener('mousemove', onMove);
    canvas.removeEventListener('mouseleave', onLeave);
  };
}
