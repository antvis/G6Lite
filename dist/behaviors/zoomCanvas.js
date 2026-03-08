/**
 * zoom-canvas: wheel to zoom.
 */
export function zoomCanvas(renderer) {
    const canvas = renderer.getCanvas();
    const onWheel = (e) => {
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
//# sourceMappingURL=zoomCanvas.js.map