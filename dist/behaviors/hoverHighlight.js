/**
 * Combined hover: highlight edge (and its nodes) or highlight node (and adjacent). Edge takes precedence.
 */
export function hoverHighlight(renderer) {
    const canvas = renderer.getCanvas();
    const edges = renderer.getEdges();
    const nodes = renderer.getNodes();
    const getAdjacent = (nodeId) => {
        const nodeIds = new Set([nodeId]);
        const edgeIndices = new Set();
        edges.forEach((e, i) => {
            if (e.source === nodeId || e.target === nodeId) {
                nodeIds.add(e.source).add(e.target);
                edgeIndices.add(i);
            }
        });
        return { nodeIds, edgeIndices };
    };
    const onMove = (e) => {
        const [gx, gy] = renderer.screenToGraph(e.clientX, e.clientY);
        const edgeIdx = renderer.hitTestEdge(gx, gy);
        if (edgeIdx >= 0) {
            const e = edges[edgeIdx];
            renderer.setHighlight({
                nodeIds: new Set([e.source, e.target]),
                edgeIndices: new Set([edgeIdx]),
            });
            return;
        }
        const nodeId = renderer.hitTestNode(gx, gy);
        if (nodeId) {
            const { nodeIds } = getAdjacent(nodeId);
            renderer.setHighlight({ nodeIds });
            return;
        }
        renderer.setHighlight({});
    };
    canvas.addEventListener('mousemove', onMove);
    return () => canvas.removeEventListener('mousemove', onMove);
}
//# sourceMappingURL=hoverHighlight.js.map