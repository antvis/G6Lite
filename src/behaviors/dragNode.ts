/**
 * drag-node: drag nodes by updating their position via DataModel + PATCH_POSITION.
 * Gesture start (which node/combo) comes from the InteractionDispatcher's
 * pointerdown events; the in-flight move/up tracking is owned here (it computes
 * a per-drag position delta that does not belong on the global event bus).
 * Supports multi-select dragging: if the dragged node is selected, all selected nodes move.
 * Supports combo dragging: clicking combo background drags all its child nodes.
 * Emits node:dragstart, node:drag, node:dragend, combo:dragstart, combo:drag, combo:dragend events.
 */

import type { Graph } from '../graph.js';
import type { Renderer } from '../renderer/renderer.js';

export function dragNode(renderer: Renderer, graph: Graph): () => void {
  let draggingIds: string[] = [];
  let draggingComboId: string | null = null;
  let startMouse = { x: 0, y: 0 };
  let startPositions: Array<{ x: number; y: number }> = [];
  let dragStarted = false;
  const dragThreshold = 3;

  const beginNodeDrag = (nodeId: string, e: MouseEvent) => {
    e.preventDefault();
    startMouse = { x: e.clientX, y: e.clientY };

    const states = graph.getItemStates(nodeId);
    draggingIds = states.includes('selected') ? graph.findNodesByState('selected') : [nodeId];

    startPositions = draggingIds.map((id) => {
      const pos = graph.getNodePosition(id);
      return pos ? { x: pos.x, y: pos.y } : { x: 0, y: 0 };
    });

    draggingComboId = null;
    dragStarted = false;
  };

  const beginComboDrag = (comboId: string, e: MouseEvent) => {
    e.preventDefault();
    startMouse = { x: e.clientX, y: e.clientY };
    draggingComboId = comboId;

    // A collapsed combo's bounds are still computed from its child node
    // positions, so dragging it must move those children regardless of state.
    const comboData = graph.getComboData(comboId);
    draggingIds = comboData ? getAllComboNodeIds(graph, comboId) : [];

    startPositions = draggingIds.map((id) => {
      const pos = graph.getNodePosition(id);
      return pos ? { x: pos.x, y: pos.y } : { x: 0, y: 0 };
    });
    dragStarted = false;
  };

  const onNodeDown = (payload: { nodeId: string; event: MouseEvent }) => {
    if (payload.event.button !== 0) return;
    beginNodeDrag(payload.nodeId, payload.event);
  };

  const onComboDown = (payload: { comboId: string; event: MouseEvent }) => {
    if (payload.event.button !== 0) return;
    beginComboDrag(payload.comboId, payload.event);
  };

  const onMove = (e: MouseEvent) => {
    if (!draggingIds.length && !draggingComboId) return;
    const camera = renderer.getCamera();
    const dx = (e.clientX - startMouse.x) / camera.zoom;
    const dy = (e.clientY - startMouse.y) / camera.zoom;
    if (!dragStarted) {
      if (Math.hypot(e.clientX - startMouse.x, e.clientY - startMouse.y) <= dragThreshold) return;
      dragStarted = true;
      if (draggingComboId) {
        graph.eventEmitter.emit('combo:dragstart', { comboId: draggingComboId, event: e });
      } else {
        graph.eventEmitter.emit('node:dragstart', {
          nodeId: draggingIds[0],
          nodeIds: draggingIds,
          event: e,
        });
      }
    }

    for (let i = 0; i < draggingIds.length; i++) {
      graph.updateNodePosition(draggingIds[i], startPositions[i].x + dx, startPositions[i].y + dy);
    }

    if (draggingComboId) {
      graph.eventEmitter.emit('combo:drag', { comboId: draggingComboId, dx, dy, event: e });
    } else {
      graph.eventEmitter.emit('node:drag', {
        nodeId: draggingIds[0],
        nodeIds: draggingIds,
        dx,
        dy,
        event: e,
      });
    }
  };

  const onUp = () => {
    if (draggingComboId) {
      if (dragStarted) graph.eventEmitter.emit('combo:dragend', { comboId: draggingComboId });
      draggingComboId = null;
      draggingIds = [];
      startPositions = [];
    } else if (draggingIds.length) {
      if (dragStarted) {
        graph.eventEmitter.emit('node:dragend', { nodeId: draggingIds[0], nodeIds: draggingIds });
      }
      draggingIds = [];
      startPositions = [];
    }
    dragStarted = false;
  };

  graph.eventEmitter.on('node:pointerdown', onNodeDown);
  graph.eventEmitter.on('combo:pointerdown', onComboDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  return () => {
    graph.eventEmitter.off('node:pointerdown', onNodeDown);
    graph.eventEmitter.off('combo:pointerdown', onComboDown);
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  };
}

function getAllComboNodeIds(graph: Graph, comboId: string): string[] {
  const result: string[] = [];
  const children = graph.getComboChildren(comboId);
  result.push(...children.nodes);
  for (const childComboId of children.combos) {
    result.push(...getAllComboNodeIds(graph, childComboId));
  }
  return result;
}
