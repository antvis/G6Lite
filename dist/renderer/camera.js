/**
 * 2D pan + zoom camera for graph space -> NDC.
 */
export function createCamera() {
    return { x: 0, y: 0, zoom: 1 };
}
/** Graph (x,y) -> NDC. */
export function graphToNDC(graphX, graphY, width, height, cam) {
    const sx = (2 * cam.zoom) / width;
    const sy = (2 * cam.zoom) / height;
    const ndcX = (graphX + cam.x) * sx - 1;
    const ndcY = 1 - (graphY + cam.y) * sy;
    return [ndcX, ndcY];
}
/** Screen (pixel) -> graph coords. */
export function screenToGraph(screenX, screenY, width, height, cam) {
    const ndcX = (screenX / width) * 2 - 1;
    const ndcY = 1 - (screenY / height) * 2;
    const gx = (ndcX + 1) / (2 * cam.zoom) - cam.x;
    const gy = (1 - ndcY) / (2 * cam.zoom) - cam.y;
    return [gx, gy];
}
//# sourceMappingURL=camera.js.map