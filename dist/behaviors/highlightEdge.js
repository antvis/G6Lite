/**
 * highlight-edge: hover edge highlights it and its source/target nodes.
 */
export function highlightEdge(renderer) {
    const canvas = renderer.getCanvas();
    const edges = renderer.getEdges();
    const onMove = (e) => {
        const [gx, gy] = renderer.screenToGraph(e.clientX, e.clientY);
        const edgeIdx = renderer.hitTestEdge(gx, gy);
        if (edgeIdx >= 0) {
            const e = edges[edgeIdx];
            const nodeIds = new Set([e.source, e.target]);
            renderer.setHighlight({ nodeIds, edgeIndices: new Set([edgeIdx]) });
        }
        else {
            const nodeId = renderer.hitTestNode(gx, gy);
            if (!nodeId)
                renderer.setHighlight({});
        }
    };
    canvas.addEventListener('mousemove', onMove);
    return () => canvas.removeEventListener('mousemove', onMove);
}
//# sourceMappingURL=highlightEdge.js.map