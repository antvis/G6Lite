/**
 * highlight-node: hover node highlights it and adjacent nodes/edges.
 * Uses screenToGraph + O(n) hit testing.
 */

import type { Renderer } from '../renderer/renderer.js';

export function highlightNode(renderer: Renderer): () => void {
  const canvas = renderer.getCanvas();

  const onMove = (e: MouseEvent) => {
    const [gx, gy] = renderer.screenToGraph(e.clientX, e.clientY);
    const nodeId = renderer.hitTestNode(gx, gy);
    if (nodeId) {
      canvas.style.cursor = 'pointer';
      const edges = renderer.getEdges();
      const nodeIds = new Set<string>([nodeId]);
      const edgeIndices = new Set<number>();
      edges.forEach((edge, i) => {
        if (edge.source === nodeId || edge.target === nodeId) {
          nodeIds.add(edge.source).add(edge.target);
          edgeIndices.add(i);
        }
      });
      renderer.setHighlight({ nodeIds, edgeIndices });
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
