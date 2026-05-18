/**
 * drag-edge: drag edges by re-connecting their source or target endpoint.
 * Uses O(1) GPU framebuffer picking for hit detection.
 *
 * On mousedown over an edge:
 *   - The closer endpoint (source or target) becomes the "drag endpoint".
 *   - On mousemove, the endpoint follows the cursor.
 *   - On mouseup over a node, the edge reconnects to that node.
 *   - On mouseup over empty space, the edge snaps back to its original position.
 *
 * Emits: edge:dragstart, edge:drag, edge:dragend
 */

import type { Renderer } from '../renderer/renderer.js';
import type { Graph } from '../graph.js';

export function dragEdge(renderer: Renderer, graph: Graph): () => void {
  const canvas = renderer.getCanvas();
  let dragging: {
    edgeIndex: number;
    source: string;
    target: string;
    dragEnd: 'source' | 'target';
    originalSource: string;
    originalTarget: string;
  } | null = null;

  const onDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    const result = renderer.pickAt(e.clientX, e.clientY);
    if (!result || result.type !== 'edge') return;

    // Check if drag-node should take priority (node is under cursor)
    const edges = renderer.getEdges();
    const edge = edges[result.index];
    if (!edge) return;

    e.preventDefault();

    // Determine which endpoint is closer to the click position
    const [gx, gy] = renderer.screenToGraph(e.clientX, e.clientY);
    const sourcePos = graph.getNodePosition(edge.source);
    const targetPos = graph.getNodePosition(edge.target);
    if (!sourcePos || !targetPos) return;

    const distToSource = Math.hypot(gx - sourcePos.x, gy - sourcePos.y);
    const distToTarget = Math.hypot(gx - targetPos.x, gy - targetPos.y);
    const dragEnd = distToSource < distToTarget ? 'source' : 'target';

    dragging = {
      edgeIndex: result.index,
      source: edge.source,
      target: edge.target,
      dragEnd,
      originalSource: edge.source,
      originalTarget: edge.target,
    };

    graph.eventEmitter.emit('edge:dragstart', {
      edgeIndex: result.index,
      source: edge.source,
      target: edge.target,
      dragEnd,
      event: e,
    });
  };

  const onMove = (e: MouseEvent) => {
    if (!dragging) return;

    graph.eventEmitter.emit('edge:drag', {
      edgeIndex: dragging.edgeIndex,
      source: dragging.source,
      target: dragging.target,
      dragEnd: dragging.dragEnd,
      event: e,
    });
  };

  const onUp = (e: MouseEvent) => {
    if (!dragging) return;

    // Check if dropped on a node
    const result = renderer.pickAt(e.clientX, e.clientY);
    let reconnected = false;

    if (result && result.type === 'node') {
      const newNodeId = result.id;
      // Don't reconnect to self (source == target for non-loop edges)
      const otherEnd = dragging.dragEnd === 'source' ? dragging.target : dragging.source;
      if (newNodeId !== otherEnd) {
        reconnected = true;
        graph.eventEmitter.emit('edge:dragend', {
          edgeIndex: dragging.edgeIndex,
          source: dragging.dragEnd === 'source' ? newNodeId : dragging.originalSource,
          target: dragging.dragEnd === 'target' ? newNodeId : dragging.originalTarget,
          originalSource: dragging.originalSource,
          originalTarget: dragging.originalTarget,
          reconnected: true,
          newEndpoint: newNodeId,
          event: e,
        });
      }
    }

    if (!reconnected) {
      // Snap back — emit dragend with original positions
      graph.eventEmitter.emit('edge:dragend', {
        edgeIndex: dragging.edgeIndex,
        source: dragging.originalSource,
        target: dragging.originalTarget,
        originalSource: dragging.originalSource,
        originalTarget: dragging.originalTarget,
        reconnected: false,
        event: e,
      });
    }

    dragging = null;
  };

  canvas.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  return () => {
    canvas.removeEventListener('mousedown', onDown);
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  };
}
