/**
 * Run AntV Layout on graph data and return nodes with x,y.
 * OpenSpec: layout spec — thin wrapper over @antv/layout.
 */
import type { GraphData, GraphNode, LayoutConfig } from '../types.js';
export type LayoutResult = {
    nodes: Array<GraphNode & {
        x: number;
        y: number;
    }>;
};
/**
 * Run the configured layout on graph data; returns nodes with positions.
 * Layout options are passed through to the underlying @antv/layout algorithm.
 */
export declare function runLayout(data: GraphData, config: LayoutConfig): Promise<LayoutResult>;
//# sourceMappingURL=runLayout.d.ts.map