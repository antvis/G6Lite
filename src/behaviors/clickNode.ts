/**
 * click-node: emit click, dblclick, and contextmenu events for nodes, edges, and canvas.
 * Uses O(1) GPU framebuffer picking via renderer.pickAt().
 */

import type { Renderer } from '../renderer/renderer.js';
import type { Graph } from '../graph.js';

export function clickNode(renderer: Renderer, graph: Graph): () => void {
  const canvas = renderer.getCanvas();

  // ──── click ────
  const onClick = (e: MouseEvent) => {
    const result = renderer.pickAt(e.offsetX, e.offsetY);
    if (result && result.type === 'node') {
      graph.eventEmitter.emit('node:click', { nodeId: result.id, event: e });
    } else if (result && result.type === 'edge') {
      const edges = renderer.getEdges();
      const edge = edges[result.index];
      if (edge) {
        graph.eventEmitter.emit('edge:click', {
          edgeIndex: result.index,
          source: edge.source,
          target: edge.target,
          event: e,
        });
      }
    } else {
      graph.eventEmitter.emit('canvas:click', { event: e });
    }
  };

  // ──── dblclick (P1) ────
  const onDblClick = (e: MouseEvent) => {
    const result = renderer.pickAt(e.offsetX, e.offsetY);
    if (result && result.type === 'node') {
      graph.eventEmitter.emit('node:dblclick', { nodeId: result.id, event: e });
    } else if (result && result.type === 'edge') {
      const edges = renderer.getEdges();
      const edge = edges[result.index];
      if (edge) {
        graph.eventEmitter.emit('edge:dblclick', {
          edgeIndex: result.index,
          source: edge.source,
          target: edge.target,
          event: e,
        });
      }
    } else {
      graph.eventEmitter.emit('canvas:dblclick', { event: e });
    }
  };

  // ──── contextmenu / right-click (P0) ────
  const onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    const result = renderer.pickAt(e.offsetX, e.offsetY);
    if (result && result.type === 'node') {
      graph.eventEmitter.emit('node:contextmenu', { nodeId: result.id, event: e });
    } else if (result && result.type === 'edge') {
      const edges = renderer.getEdges();
      const edge = edges[result.index];
      if (edge) {
        graph.eventEmitter.emit('edge:contextmenu', {
          edgeIndex: result.index,
          source: edge.source,
          target: edge.target,
          event: e,
        });
      }
    } else {
      graph.eventEmitter.emit('canvas:contextmenu', { event: e });
    }
  };

  canvas.addEventListener('click', onClick);
  canvas.addEventListener('dblclick', onDblClick);
  canvas.addEventListener('contextmenu', onContextMenu);
  return () => {
    canvas.removeEventListener('click', onClick);
    canvas.removeEventListener('dblclick', onDblClick);
    canvas.removeEventListener('contextmenu', onContextMenu);
  };
}
