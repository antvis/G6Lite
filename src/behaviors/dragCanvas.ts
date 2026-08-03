/**
 * drag-canvas: drag to pan.
 * Pan starts on canvas:pointerdown from the InteractionDispatcher — that event
 * fires only when no node/edge/combo is under the cursor, so the former manual
 * pick guard is no longer needed. In-flight move/up tracking is owned here.
 */

import type { Graph } from '../graph';
import type { Renderer } from '../renderer/renderer';
import { getGraphDragDelta } from './dragCoordinates';

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
    const { dx, dy } = getGraphDragDelta(renderer, down, { x: e.clientX, y: e.clientY });
    renderer.setCamera({ x: down.camX + dx, y: down.camY + dy });
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
