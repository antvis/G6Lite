/**
 * zoom-canvas: wheel to zoom.
 */

import type { Renderer } from '../renderer/renderer.js';

export function zoomCanvas(renderer: Renderer): () => void {
  const canvas = renderer.getCanvas();
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const cam = renderer.getCamera();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoomRaw = cam.zoom * delta;
    const newZoom = Math.max(0.1, Math.min(20, newZoomRaw));

    // 保持画布中心对应的图空间点不变，使放大缩小时中心稳定
    const w = canvas.width || 1;
    const h = canvas.height || 1;
    // 画布中心在当前相机下对应的图坐标（推导自 graphToNDC 的反函数）
    const centerGraphX = w / (2 * cam.zoom) - cam.x;
    const centerGraphY = h / (2 * cam.zoom) - cam.y;
    // 计算新的相机平移，使该图坐标仍然落在画布中心
    const nextCamX = w / (2 * newZoom) - centerGraphX;
    const nextCamY = h / (2 * newZoom) - centerGraphY;

    renderer.setCamera({ zoom: newZoom, x: nextCamX, y: nextCamY });
    renderer.draw();
  };
  canvas.addEventListener('wheel', onWheel, { passive: false });
  return () => canvas.removeEventListener('wheel', onWheel);
}
