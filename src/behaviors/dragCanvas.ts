/**
 * drag-canvas: drag to pan.
 * Pan starts on canvas:pointerdown from the InteractionDispatcher — that event
 * fires only when no node/edge/combo is under the cursor, so the former manual
 * pick guard is no longer needed. In-flight move/up tracking is owned here.
 */

import type { Graph } from '../graph.js';
import type { Renderer } from '../renderer/renderer.js';

export interface DragCanvasOptions {
  /** Keep modifier-key gestures available for brush/lasso selection. Default: true. */
  ignoreModifierKeys?: boolean;
}

export function dragCanvas(
  renderer: Renderer,
  graph?: Graph,
  options?: DragCanvasOptions,
): () => void {
  if (!graph) return () => {};
  const ignoreModifierKeys = options?.ignoreModifierKeys ?? true;
  let down: { x: number; y: number; camX: number; camY: number } | null = null;

  const onDown = (payload: { event: MouseEvent }) => {
    const e = payload.event;
    if (e.button !== 0) return;
    if (ignoreModifierKeys && (e.shiftKey || e.ctrlKey || e.metaKey)) return;
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

  graph.eventEmitter.on('canvas:pointerdown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  return () => {
    graph.eventEmitter.off('canvas:pointerdown', onDown);
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  };
}
