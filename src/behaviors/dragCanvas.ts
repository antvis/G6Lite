/**
 * drag-canvas: drag to pan.
 */

import type { Renderer } from '../renderer/renderer.js';

export function dragCanvas(renderer: Renderer): () => void {
  const canvas = renderer.getCanvas();
  let down: { x: number; y: number; camX: number; camY: number } | null = null;

  const onDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    const cam = renderer.getCamera();
    down = { x: e.clientX, y: e.clientY, camX: cam.x, camY: cam.y };
    renderer.setMoving(true);
  };
  const onMove = (e: MouseEvent) => {
    if (!down) return;
    const dx = e.clientX - down.x;
    const dy = e.clientY - down.y;
    const zoom = renderer.getCamera().zoom;
    // 使拖拽方向与鼠标方向一致：
    // 鼠标向右拖，画面向右移动；鼠标向下拖，画面向下移动。
    renderer.setCamera({ x: down.camX + dx / zoom, y: down.camY + dy / zoom });
    renderer.scheduleRender();
  };
  const onUp = () => {
    if (down) renderer.setMoving(false);
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
