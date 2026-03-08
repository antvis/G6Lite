/**
 * 2D pan + zoom camera for graph space -> NDC.
 */
export interface Camera {
    x: number;
    y: number;
    zoom: number;
}
export declare function createCamera(): Camera;
/** Graph (x,y) -> NDC. */
export declare function graphToNDC(graphX: number, graphY: number, width: number, height: number, cam: Camera): [number, number];
/** Screen (pixel) -> graph coords. */
export declare function screenToGraph(screenX: number, screenY: number, width: number, height: number, cam: Camera): [number, number];
//# sourceMappingURL=camera.d.ts.map