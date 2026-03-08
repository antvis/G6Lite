/**
 * WebGL renderer: nodes as points, edges as lines.
 */
import type { Camera } from './camera.js';
import type { GraphNode, GraphEdge, NodeConfig, EdgeConfig } from '../types.js';
import type { ThemeTokens } from '../types.js';
export interface LayoutNode extends GraphNode {
    x: number;
    y: number;
}
export interface RendererData {
    nodes: LayoutNode[];
    edges: GraphEdge[];
    nodeConfig?: NodeConfig;
    edgeConfig?: EdgeConfig;
    theme: ThemeTokens;
}
export declare class Renderer {
    private canvas;
    private gl;
    private nodeProgram;
    private lineProgram;
    private nodeBuffer;
    private lineBuffer;
    private nodeCount;
    private lineVertexCount;
    private nodeConfig;
    private edgeConfig;
    private theme;
    private nodes;
    private edges;
    private nodeIdToIndex;
    private camera;
    private highlightNodeIds;
    private highlightEdgeIndices;
    constructor(container: string | HTMLElement);
    setData(data: RendererData): void;
    private buildNodeBuffer;
    private buildLineBuffer;
    private uploadNodeBuffer;
    private uploadLineBuffer;
    draw(): void;
    resize(width: number, height: number): void;
    getCamera(): Camera;
    setCamera(cam: Partial<Camera>): void;
    screenToGraph(screenX: number, screenY: number): [number, number];
    /** Hit test: return node id under (graphX, graphY) or null. */
    hitTestNode(graphX: number, graphY: number): string | null;
    /** Hit test: return edge index under (graphX, graphY) or -1. */
    hitTestEdge(graphX: number, graphY: number): number;
    getNodes(): LayoutNode[];
    getEdges(): GraphEdge[];
    getCanvas(): HTMLCanvasElement;
    setHighlight(option: {
        nodeIds?: Set<string>;
        edgeIndices?: Set<number>;
    }): void;
}
//# sourceMappingURL=renderer.d.ts.map