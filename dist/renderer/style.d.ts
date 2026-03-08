/**
 * Resolve style value or function for nodes and edges.
 */
import type { GraphNode, GraphEdge, NodeConfig, EdgeConfig } from '../types.js';
import type { ThemeTokens } from '../types.js';
export interface ResolvedNodeStyle {
    fill: string;
    size: number;
}
export interface ResolvedEdgeStyle {
    stroke: string;
    lineWidth: number;
}
export declare function resolveNodeStyle(node: GraphNode & {
    x: number;
    y: number;
}, config: NodeConfig | undefined, theme: ThemeTokens): ResolvedNodeStyle;
export declare function resolveEdgeStyle(source: GraphNode & {
    x: number;
    y: number;
}, target: GraphNode & {
    x: number;
    y: number;
}, edge: GraphEdge, config: EdgeConfig | undefined, theme: ThemeTokens): ResolvedEdgeStyle;
//# sourceMappingURL=style.d.ts.map