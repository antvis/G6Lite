/**
 * Combined hover: highlight edge (and its nodes) or highlight node (and adjacent). Edge takes precedence.
 */

import type { Renderer } from '../renderer/renderer.js';

export function hoverHighlight(renderer: Renderer): () => void {
  const canvas = renderer.getCanvas();
  const edges = renderer.getEdges();
  const nodes = renderer.getNodes();

  const getAdjacent = (nodeId: string): { nodeIds: Set<string>; edgeIndices: Set<number> } => {
    const nodeIds = new Set<string>([nodeId]);
    const edgeIndices = new Set<number>();
    edges.forEach((e, i) => {
      if (e.source === nodeId || e.target === nodeId) {
        nodeIds.add(e.source).add(e.target);
        edgeIndices.add(i);
      }
    });
    return { nodeIds, edgeIndices };
  };

  const onMove = (e: MouseEvent) => {
    const [gx, gy] = renderer.screenToGraph(e.clientX, e.clientY);
    const edgeIdx = renderer.hitTestEdge(gx, gy);
    if (edgeIdx >= 0) {
      const e = edges[edgeIdx];
      renderer.setHighlight({
        nodeIds: new Set([e.source, e.target]),
        edgeIndices: new Set([edgeIdx]),
      });
      return;
    }
    const nodeId = renderer.hitTestNode(gx, gy);
    if (nodeId) {
      const { nodeIds } = getAdjacent(nodeId);
      renderer.setHighlight({ nodeIds });
      return;
    }
    renderer.setHighlight({});
  };

  canvas.addEventListener('mousemove', onMove);
  return () => canvas.removeEventListener('mousemove', onMove);
}
