/**
 * highlight-edge: hover edge highlights it and its source/target nodes.
 */

import type { Renderer } from '../renderer/renderer.js';

export function highlightEdge(renderer: Renderer): () => void {
  const canvas = renderer.getCanvas();
  const edges = renderer.getEdges();

  const onMove = (e: MouseEvent) => {
    const [gx, gy] = renderer.screenToGraph(e.clientX, e.clientY);
    const edgeIdx = renderer.hitTestEdge(gx, gy);
    if (edgeIdx >= 0) {
      const e = edges[edgeIdx];
      const nodeIds = new Set<string>([e.source, e.target]);
      renderer.setHighlight({ nodeIds, edgeIndices: new Set([edgeIdx]) });
    } else {
      const nodeId = renderer.hitTestNode(gx, gy);
      if (!nodeId) renderer.setHighlight({});
    }
  };

  canvas.addEventListener('mousemove', onMove);
  return () => canvas.removeEventListener('mousemove', onMove);
}
