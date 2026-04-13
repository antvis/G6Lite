/**
 * Combined hover: highlight edge (and its nodes) or highlight node (and adjacent).
 * Uses screenToGraph + O(n) hit testing. Edge takes precedence.
 */

import type { Renderer } from '../renderer/renderer.js';

export function hoverHighlight(renderer: Renderer): () => void {
  const canvas = renderer.getCanvas();

  const onMove = (e: MouseEvent) => {
    const edges = renderer.getEdges();
    const [gx, gy] = renderer.screenToGraph(e.clientX, e.clientY);

    // Try edge hit first
    const edgeIdx = renderer.hitTestEdge(gx, gy);
    if (edgeIdx >= 0) {
      const edge = edges[edgeIdx];
      canvas.style.cursor = 'pointer';
      renderer.setHighlight({
        nodeIds: new Set([edge.source, edge.target]),
        edgeIndices: new Set([edgeIdx]),
      });
      return;
    }

    // Try node hit
    const nodeId = renderer.hitTestNode(gx, gy);
    if (nodeId) {
      canvas.style.cursor = 'pointer';
      const nodeIds = new Set<string>([nodeId]);
      const edgeIndices = new Set<number>();
      edges.forEach((edge, i) => {
        if (edge.source === nodeId || edge.target === nodeId) {
          nodeIds.add(edge.source).add(edge.target);
          edgeIndices.add(i);
        }
      });
      renderer.setHighlight({ nodeIds, edgeIndices });
      return;
    }

    canvas.style.cursor = 'default';
    renderer.setHighlight({});
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
