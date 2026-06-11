/**
 * drag-edge: drag edges by re-connecting their source or target endpoint.
 * Gesture start comes from the InteractionDispatcher's edge:pointerdown event;
 * the drop target is resolved here on canvas:pointerup (a single pickAt at
 * release, which the dispatcher intentionally leaves to consumers).
 *
 * On edge pointerdown:
 *   - The closer endpoint (source or target) becomes the "drag endpoint".
 *   - On mousemove, the endpoint follows the cursor.
 *   - On mouseup over a node, the edge reconnects to that node.
 *   - On mouseup over empty space, the edge snaps back to its original position.
 *
 * Emits: edge:dragstart, edge:drag, edge:dragend
 */

import type { Graph } from '../graph.js';
import type { Renderer } from '../renderer/renderer.js';

export function dragEdge(renderer: Renderer, graph: Graph): () => void {
  let dragging: {
    edgeIndex: number;
    source: string;
    target: string;
    dragEnd: 'source' | 'target';
    originalSource: string;
    originalTarget: string;
  } | null = null;

  const onDown = (payload: {
    edgeIndex: number;
    source: string;
    target: string;
    event: MouseEvent;
  }) => {
    const e = payload.event;
    if (e.button !== 0) return;

    e.preventDefault();

    // Determine which endpoint is closer to the click position.
    const [gx, gy] = renderer.screenToGraph(e.clientX, e.clientY);
    const sourcePos = graph.getNodePosition(payload.source);
    const targetPos = graph.getNodePosition(payload.target);
    if (!sourcePos || !targetPos) return;

    const distToSource = Math.hypot(gx - sourcePos.x, gy - sourcePos.y);
    const distToTarget = Math.hypot(gx - targetPos.x, gy - targetPos.y);
    const dragEnd = distToSource < distToTarget ? 'source' : 'target';

    dragging = {
      edgeIndex: payload.edgeIndex,
      source: payload.source,
      target: payload.target,
      dragEnd,
      originalSource: payload.source,
      originalTarget: payload.target,
    };

    graph.eventEmitter.emit('edge:dragstart', {
      edgeIndex: payload.edgeIndex,
      source: payload.source,
      target: payload.target,
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

  const onUp = (payload: { event: MouseEvent }) => {
    if (!dragging) return;
    const e = payload.event;

    // Resolve the drop target with a single pickAt at release.
    const result = renderer.pickAt(e.clientX, e.clientY);
    let reconnected = false;

    if (result && result.type === 'node') {
      const newNodeId = result.id;
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

  graph.eventEmitter.on('edge:pointerdown', onDown);
  window.addEventListener('mousemove', onMove);
  graph.eventEmitter.on('canvas:pointerup', onUp);
  return () => {
    graph.eventEmitter.off('edge:pointerdown', onDown);
    window.removeEventListener('mousemove', onMove);
    graph.eventEmitter.off('canvas:pointerup', onUp);
  };
}
