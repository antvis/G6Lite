/**
 * Graph: main entry. Creates container canvas, runs layout, renders with WebGL, registers behaviors.
 */
import type { GraphOptions } from './types.js';
export declare class Graph {
    private options;
    private containerEl;
    private canvas;
    private renderer;
    private behaviorTeardown;
    private resizeObserver;
    private layoutNodes;
    constructor(options: GraphOptions);
    render(): Promise<void>;
    destroy(): void;
}
//# sourceMappingURL=graph.d.ts.map