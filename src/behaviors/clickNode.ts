/**
 * click-node: emit click events for nodes, edges, and canvas background.
 * Uses O(1) GPU framebuffer picking via renderer.pickAt().
 */

import type { Renderer } from '../renderer/renderer.js';
import type { Graph } from '../graph.js';

export function clickNode(renderer: Renderer, graph: Graph): () => void {
  const canvas = renderer.getCanvas();

  const onClick = (e: MouseEvent) => {
    const result = renderer.pickAt(e.clientX, e.clientY);
    if (result && result.type === 'node') {
      graph.eventEmitter.emit('node:click', { nodeId: result.id, event: e });
    } else if (result && result.type === 'edge') {
      const edges = renderer.getEdges();
      const edge = edges[result.index];
      if (edge) {
        graph.eventEmitter.emit('edge:click', { edgeIndex: result.index, source: edge.source, target: edge.target, event: e });
      }
    } else {
      graph.eventEmitter.emit('canvas:click', { event: e });
    }
  };

  canvas.addEventListener('click', onClick);
  return () => canvas.removeEventListener('click', onClick);
}