/**
 * drag-canvas: drag to pan.
 */
export function dragCanvas(renderer) {
    const canvas = renderer.getCanvas();
    let down = null;
    const onDown = (e) => {
        if (e.button !== 0)
            return;
        const cam = renderer.getCamera();
        down = { x: e.clientX, y: e.clientY, camX: cam.x, camY: cam.y };
    };
    const onMove = (e) => {
        if (!down)
            return;
        const dx = e.clientX - down.x;
        const dy = e.clientY - down.y;
        const zoom = renderer.getCamera().zoom;
        renderer.setCamera({ x: down.camX - dx / zoom, y: down.camY + dy / zoom });
        renderer.draw();
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
//# sourceMappingURL=dragCanvas.js.map