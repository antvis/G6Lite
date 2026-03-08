/**
 * Built-in behaviors: zoom-canvas, drag-canvas, highlight-node, highlight-edge.
 * When both highlight-node and highlight-edge are used, one combined hover handler runs (edge takes precedence).
 */
import type { Renderer } from '../renderer/renderer.js';
import { zoomCanvas } from './zoomCanvas.js';
import { dragCanvas } from './dragCanvas.js';
import { highlightNode } from './highlightNode.js';
import { highlightEdge } from './highlightEdge.js';
import { hoverHighlight } from './hoverHighlight.js';
export type BehaviorName = 'zoom-canvas' | 'drag-canvas' | 'highlight-node' | 'highlight-edge';
export declare function registerBehaviors(renderer: Renderer, names: (string | {
    type: string;
})[]): () => void;
export { zoomCanvas, dragCanvas, highlightNode, highlightEdge, hoverHighlight };
//# sourceMappingURL=index.d.ts.map