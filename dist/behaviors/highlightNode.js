/**
 * highlight-node: hover node highlights it and adjacent nodes/edges.
 */
export function highlightNode(renderer) {
    const canvas = renderer.getCanvas();
    const nodes = renderer.getNodes();
    const edges = renderer.getEdges();
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
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
        const nodeId = renderer.hitTestNode(gx, gy);
        if (nodeId) {
            const { nodeIds } = getAdjacent(nodeId);
            renderer.setHighlight({ nodeIds });
        }
        else {
            renderer.setHighlight({});
        }
    };
    canvas.addEventListener('mousemove', onMove);
    return () => canvas.removeEventListener('mousemove', onMove);
}
//# sourceMappingURL=highlightNode.js.map