/**
 * drag-node: drag nodes by updating their position via DataModel + PATCH_POSITION.
 * Uses O(1) GPU framebuffer picking for hit detection.
 * Supports multi-select dragging: if the dragged node is selected, all selected nodes move.
 * Supports combo dragging: clicking combo background drags all its child nodes.
 * Emits node:dragstart, node:drag, node:dragend, combo:dragstart, combo:drag, combo:dragend events.
 */

import type { Renderer } from '../renderer/renderer.js';
import type { Graph } from '../graph.js';

export function dragNode(renderer: Renderer, graph: Graph): () => void {
  const canvas = renderer.getCanvas();
  let draggingIds: string[] = [];
  let draggingComboId: string | null = null;
  let startMouse = { x: 0, y: 0 };
  let startPositions: Array<{ x: number; y: number }> = [];

  const onDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    const result = renderer.pickAt(e.clientX, e.clientY);

    if (result && result.type === 'node') {
      e.preventDefault();
      const nodeId = result.id;
      startMouse = { x: e.clientX, y: e.clientY };

      const states = graph.getItemStates(nodeId);
      if (states.includes('selected')) {
        draggingIds = graph.findNodesByState('selected');
      } else {
        draggingIds = [nodeId];
      }

      startPositions = draggingIds.map((id) => {
        const pos = graph.getNodePosition(id);
        return pos ? { x: pos.x, y: pos.y } : { x: 0, y: 0 };
      });

      draggingComboId = null;
      graph.eventEmitter.emit('node:dragstart', {
        nodeId,
        nodeIds: draggingIds,
        event: e,
      });
      return;
    }

    // No node hit — check if we hit a combo background
    const comboId = graph.pickComboAt(e.clientX, e.clientY);
    if (comboId) {
      e.preventDefault();
      startMouse = { x: e.clientX, y: e.clientY };
      draggingComboId = comboId;

      // Get all nodes in this combo (including nested). A collapsed combo's
      // bounds are still computed from its child node positions, so dragging it
      // must move those children regardless of collapsed state.
      const comboData = graph.getComboData(comboId);
      if (comboData) {
        draggingIds = getAllComboNodeIds(graph, comboId);
      } else {
        draggingIds = [];
      }

      startPositions = draggingIds.map((id) => {
        const pos = graph.getNodePosition(id);
        return pos ? { x: pos.x, y: pos.y } : { x: 0, y: 0 };
      });

      graph.eventEmitter.emit('combo:dragstart', { comboId, event: e });
    }
  };

  const onMove = (e: MouseEvent) => {
    if (!draggingIds.length && !draggingComboId) return;
    const camera = renderer.getCamera();
    const dx = (e.clientX - startMouse.x) / camera.zoom;
    const dy = (e.clientY - startMouse.y) / camera.zoom;

    for (let i = 0; i < draggingIds.length; i++) {
      const newX = startPositions[i].x + dx;
      const newY = startPositions[i].y + dy;
      graph.updateNodePosition(draggingIds[i], newX, newY);
    }

    if (draggingComboId) {
      graph.eventEmitter.emit('combo:drag', {
        comboId: draggingComboId,
        dx,
        dy,
        event: e,
      });
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
      graph.eventEmitter.emit('combo:dragend', { comboId: draggingComboId });
      draggingComboId = null;
      draggingIds = [];
      startPositions = [];
    } else if (draggingIds.length) {
      graph.eventEmitter.emit('node:dragend', {
        nodeId: draggingIds[0],
        nodeIds: draggingIds,
      });
      draggingIds = [];
      startPositions = [];
    }
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

function getAllComboNodeIds(graph: Graph, comboId: string): string[] {
  const result: string[] = [];
  const children = graph.getComboChildren(comboId);
  result.push(...children.nodes);
  for (const childComboId of children.combos) {
    result.push(...getAllComboNodeIds(graph, childComboId));
  }
  return result;
}
