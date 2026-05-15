/**
 * drag-node: drag nodes by updating their position via DataModel + PATCH_POSITION.
 * Uses O(1) GPU framebuffer picking for hit detection.
 * Emits node:dragstart, node:drag, node:dragend events.
 */

import type { Renderer } from '../renderer/renderer.js';
import type { Graph } from '../graph.js';

export function dragNode(renderer: Renderer, graph: Graph): () => void {
  const canvas = renderer.getCanvas();
  let draggingNodeId: string | null = null;
  let startMouse = { x: 0, y: 0 };
  let startNodePos = { x: 0, y: 0 };

  const onDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    const result = renderer.pickAt(e.clientX, e.clientY);
    if (result && result.type === 'node') {
      e.preventDefault();
      draggingNodeId = result.id;
      startMouse = { x: e.clientX, y: e.clientY };
      // Get current node position
      const pos = graph.getNodePosition(draggingNodeId);
      if (pos) {
        startNodePos = { x: pos.x, y: pos.y };
      }
      graph.eventEmitter.emit('node:dragstart', { nodeId: draggingNodeId, event: e });
    }
  };

  const onMove = (e: MouseEvent) => {
    if (!draggingNodeId) return;
    const camera = renderer.getCamera();
    const dx = (e.clientX - startMouse.x) / camera.zoom;
    const dy = (e.clientY - startMouse.y) / camera.zoom;
    const newX = startNodePos.x + dx;
    const newY = startNodePos.y + dy;

    graph.updateNodePosition(draggingNodeId, newX, newY);
    graph.eventEmitter.emit('node:drag', { nodeId: draggingNodeId, x: newX, y: newY, event: e });
  };

  const onUp = () => {
    if (draggingNodeId) {
      graph.eventEmitter.emit('node:dragend', { nodeId: draggingNodeId });
      draggingNodeId = null;
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