/**
 * drag-canvas: drag to pan.
 * Skips activation when the click hits a node (via WebGL picking) or a combo.
 */

import type { Renderer } from '../renderer/renderer.js';
import type { Graph } from '../graph.js';

export function dragCanvas(renderer: Renderer, graph?: Graph): () => void {
  const canvas = renderer.getCanvas();
  let down: { x: number; y: number; camX: number; camY: number } | null = null;

  const onDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    // Don't start canvas drag if a node or combo is under the cursor
    const pick = renderer.pickAt(e.clientX, e.clientY);
    if (pick) return;
    if (graph && graph.pickComboAt(e.clientX, e.clientY)) return;
    const cam = renderer.getCamera();
    down = { x: e.clientX, y: e.clientY, camX: cam.x, camY: cam.y };
  };
  const onMove = (e: MouseEvent) => {
    if (!down) return;
    const dx = e.clientX - down.x;
    const dy = e.clientY - down.y;
    const zoom = renderer.getCamera().zoom;
    renderer.setCamera({ x: down.camX + dx / zoom, y: down.camY + dy / zoom });
    renderer.scheduleRender();
  };
  const onUp = () => {
    down = null;
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
