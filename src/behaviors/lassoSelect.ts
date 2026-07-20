/**
 * lasso-select: drag to draw a freeform path and select all nodes within it.
 *
 * Usage:
 *   behaviors: ['lasso-select']
 *   or with options:
 *   behaviors: [{ type: 'lasso-select', key?: 'shift' | 'ctrl' | null }]
 *
 * Events:
 *   graph.on('lasso:select', ({ nodeIds }) => { ... })
 *   graph.on('lasso:end', ({ nodeIds }) => { ... })
 *
 * Point-in-polygon test uses ray-casting algorithm.
 */

import type { Graph } from '../graph.js';
import type { Renderer } from '../renderer/renderer.js';

export interface LassoSelectOptions {
  /** Modifier key to activate. Default: null (always active) */
  key?: 'shift' | 'ctrl' | null;
  /** Throttle interval for real-time selection during drag (ms). Default: 100 */
  throttleMs?: number;
}

/** Ray-casting point-in-polygon test */
function pointInPolygon(px: number, py: number, polygon: Array<{ x: number; y: number }>): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x,
      yi = polygon[i].y;
    const xj = polygon[j].x,
      yj = polygon[j].y;
    const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function lassoSelect(
  renderer: Renderer,
  graph: Graph,
  options?: LassoSelectOptions,
): () => void {
  const modifierKey = options?.key ?? null;

  let selecting = false;
  let path: Array<{ sx: number; sy: number; gx: number; gy: number }> = [];
  let svgOverlay: SVGSVGElement | null = null;
  let polyline: SVGPolylineElement | null = null;
  let selectedIds: string[] = [];
  const throttleMs = options?.throttleMs ?? 100;
  let lastSelectTime = 0;

  const isModifierHeld = (e: MouseEvent): boolean => {
    if (!modifierKey) return true;
    if (modifierKey === 'shift') return e.shiftKey;
    if (modifierKey === 'ctrl') return e.ctrlKey || e.metaKey;
    return true;
  };

  const createSvgOverlay = (): SVGSVGElement => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'fixed';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '9999';

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    line.setAttribute('fill', 'rgba(23, 131, 255, 0.05)');
    line.setAttribute('stroke', '#1783FF');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '6 3');
    polyline = line;
    svg.appendChild(line);

    document.body.appendChild(svg);
    return svg;
  };

  const updatePolyline = (): void => {
    if (!polyline || path.length < 2) return;
    const points = path.map((p) => `${p.sx},${p.sy}`).join(' ');
    polyline.setAttribute('points', points);
  };

  const selectNodesInPath = (): void => {
    // Clear previous selection
    for (const id of selectedIds) {
      graph.setItemState(id, 'selected', false);
    }
    selectedIds = [];

    if (path.length < 3) return;

    // Convert to graph coordinates for point-in-polygon test
    const graphPath = path.map((p) => ({ x: p.gx, y: p.gy }));

    const nodes = graph.getNodes();
    for (const node of nodes) {
      if (pointInPolygon(node.x, node.y, graphPath)) {
        graph.setItemState(node.id, 'selected', true);
        selectedIds.push(node.id);
      }
    }

    if (selectedIds.length > 0) {
      graph.eventEmitter.emit('lasso:select', { nodeIds: selectedIds });
    }
  };

  const onPointerDown = (payload: { event: MouseEvent }): void => {
    const e = payload.event;
    if (e.button !== 0) return;
    if (!isModifierHeld(e)) return;

    // Started from a non-node pointerdown (canvas/edge/combo); node hits never
    // reach here, so the former pick guard is unnecessary.
    selecting = true;
    lastSelectTime = 0;
    const [gx, gy] = renderer.screenToGraph(e.clientX, e.clientY);
    path = [{ sx: e.clientX, sy: e.clientY, gx, gy }];

    if (!svgOverlay) {
      svgOverlay = createSvgOverlay();
    }
  };

  const onMouseMove = (e: MouseEvent): void => {
    if (!selecting) return;

    const [gx, gy] = renderer.screenToGraph(e.clientX, e.clientY);
    path.push({ sx: e.clientX, sy: e.clientY, gx, gy });
    updatePolyline();

    const now = performance.now();
    if (now - lastSelectTime >= throttleMs) {
      selectNodesInPath();
      lastSelectTime = now;
    }
  };

  const onMouseUp = (): void => {
    if (!selecting) return;
    selecting = false;

    // Final selection with complete path
    selectNodesInPath();

    graph.eventEmitter.emit('lasso:end', { nodeIds: selectedIds });

    // Clean up overlay
    if (svgOverlay) {
      svgOverlay.remove();
      svgOverlay = null;
      polyline = null;
    }
    path = [];
  };

  graph.eventEmitter.on('canvas:pointerdown', onPointerDown);
  graph.eventEmitter.on('edge:pointerdown', onPointerDown);
  graph.eventEmitter.on('combo:pointerdown', onPointerDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  return () => {
    graph.eventEmitter.off('canvas:pointerdown', onPointerDown);
    graph.eventEmitter.off('edge:pointerdown', onPointerDown);
    graph.eventEmitter.off('combo:pointerdown', onPointerDown);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    if (svgOverlay) {
      svgOverlay.remove();
      svgOverlay = null;
      polyline = null;
    }
  };
}
