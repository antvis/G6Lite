/**
 * highlight-node: hover node highlights it and adjacent nodes/edges.
 */

import type { Renderer } from '../renderer/renderer.js';

export function highlightNode(renderer: Renderer): () => void {
  const canvas = renderer.getCanvas();
  const nodes = renderer.getNodes();
  const edges = renderer.getEdges();
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

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
    const nodeId = renderer.hitTestNode(gx, gy);
    if (nodeId) {
      const { nodeIds } = getAdjacent(nodeId);
      renderer.setHighlight({ nodeIds });
    } else {
      renderer.setHighlight({});
    }
  };

  canvas.addEventListener('mousemove', onMove);
  return () => canvas.removeEventListener('mousemove', onMove);
}
