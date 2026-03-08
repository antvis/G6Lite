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
    const newZoom = cam.zoom * delta;
    renderer.setCamera({ zoom: Math.max(0.1, Math.min(20, newZoom)) });
    renderer.draw();
  };
  canvas.addEventListener('wheel', onWheel, { passive: false });
  return () => canvas.removeEventListener('wheel', onWheel);
}
