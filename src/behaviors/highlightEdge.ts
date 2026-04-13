/**
 * highlight-edge: hover edge highlights it and its source/target nodes.
 * Uses screenToGraph + O(n) hit testing.
 */

import type { Renderer } from '../renderer/renderer.js';

export function highlightEdge(renderer: Renderer): () => void {
  const canvas = renderer.getCanvas();

  const onMove = (e: MouseEvent) => {
    const [gx, gy] = renderer.screenToGraph(e.clientX, e.clientY);
    const edges = renderer.getEdges();
    const edgeIdx = renderer.hitTestEdge(gx, gy);
    if (edgeIdx >= 0) {
      canvas.style.cursor = 'pointer';
      const edge = edges[edgeIdx];
      renderer.setHighlight({
        nodeIds: new Set([edge.source, edge.target]),
        edgeIndices: new Set([edgeIdx]),
      });
    } else {
      canvas.style.cursor = 'default';
      renderer.setHighlight({});
    }
  };

  const onLeave = () => {
    canvas.style.cursor = 'default';
    renderer.setHighlight({});
  };

  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseleave', onLeave);
  return () => {
    canvas.removeEventListener('mousemove', onMove);
    canvas.removeEventListener('mouseleave', onLeave);
  };
}
