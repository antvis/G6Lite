/**
 * highlight-edge: hover edge highlights it and its source/target nodes.
 * Uses O(1) GPU framebuffer picking via renderer.pickAt().
 */

import type { Renderer } from '../renderer/renderer.js';
import type { Graph } from '../graph.js';

export function highlightEdge(renderer: Renderer, graph?: Graph): () => void {
  const canvas = renderer.getCanvas();

  const onMove = (e: MouseEvent) => {
    const result = renderer.pickAt(e.clientX, e.clientY);
    if (result && result.type === 'edge') {
      canvas.style.cursor = 'pointer';
      const edges = renderer.getEdges();
      const edge = edges[result.index];
      if (edge) {
        renderer.setHighlight({
          nodeIds: new Set([edge.source, edge.target]),
          edgeIndices: new Set([result.index]),
        });
        graph?.eventEmitter.emit('edge:hover', { edgeIndex: result.index, source: edge.source, target: edge.target, event: e });
        return;
      }
    }
    canvas.style.cursor = 'default';
    renderer.setHighlight({ nodeIds: new Set(), edgeIndices: new Set() });
  };

  const onLeave = () => {
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