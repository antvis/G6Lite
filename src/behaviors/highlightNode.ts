/**
 * highlight-node: hover node highlights it and adjacent nodes/edges.
 * Uses O(1) GPU framebuffer picking via renderer.pickAt().
 * Emits node:hover (enter) and node:mouseleave (leave).
 */

import type { Renderer } from '../renderer/renderer.js';
import type { Graph } from '../graph.js';

export function highlightNode(renderer: Renderer, graph?: Graph): () => void {
  const canvas = renderer.getCanvas();
  let lastNodeId: string | null = null;

  const onMove = (e: MouseEvent) => {
    const result = renderer.pickAt(e.clientX, e.clientY);
    if (result && result.type === 'node') {
      const nodeId = result.id;
      // Emit leave if previous node differs
      if (lastNodeId !== null && lastNodeId !== nodeId) {
        graph?.eventEmitter.emit('node:mouseleave', { nodeId: lastNodeId, event: e });
      }
      canvas.style.cursor = 'pointer';
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
      lastNodeId = nodeId;
      graph?.eventEmitter.emit('node:hover', { nodeId, event: e });
    } else {
      // Nothing hit — emit leave
      if (lastNodeId !== null) {
        graph?.eventEmitter.emit('node:mouseleave', { nodeId: lastNodeId, event: e });
        lastNodeId = null;
      }
      canvas.style.cursor = 'default';
      renderer.setHighlight({ nodeIds: new Set(), edgeIndices: new Set() });
    }
  };

  const onLeave = (e: MouseEvent) => {
    if (lastNodeId !== null) {
      graph?.eventEmitter.emit('node:mouseleave', { nodeId: lastNodeId, event: e });
      lastNodeId = null;
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
