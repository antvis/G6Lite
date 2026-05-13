/**
 * highlight-node: hover node highlights it and adjacent nodes/edges.
 * Uses O(1) GPU framebuffer picking via renderer.pickAt().
 */

import type { Renderer } from '../renderer/renderer.js';
import type { Graph } from '../graph.js';

export function highlightNode(renderer: Renderer, graph?: Graph): () => void {
  const canvas = renderer.getCanvas();

  const onMove = (e: MouseEvent) => {
    const result = renderer.pickAt(e.clientX, e.clientY);
    if (result && result.type === 'node') {
      canvas.style.cursor = 'pointer';
      const nodeId = result.id;
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
      graph?.eventEmitter.emit('node:hover', { nodeId, event: e });
    } else {
      canvas.style.cursor = 'default';
      renderer.setHighlight({ nodeIds: new Set(), edgeIndices: new Set() });
    }
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