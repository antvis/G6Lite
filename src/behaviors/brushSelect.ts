/**
 * brush-select: drag to draw a rectangle and select all nodes within it.
 *
 * Usage:
 *   behaviors: ['brush-select']
 *   or with options:
 *   behaviors: [{ type: 'brush-select', key?: 'shift' | 'ctrl' | null }]
 *
 * Events:
 *   graph.on('brush:select', ({ nodeIds }) => { ... })
 *   graph.on('brush:end', ({ nodeIds }) => { ... })
 *
 * The selected nodes have their 'selected' state set via graph.setItemState.
 */

import type { Graph } from '../graph.js';
import type { Renderer } from '../renderer/renderer.js';

export interface BrushSelectOptions {
  /** Modifier key to activate. null = always active. Default: null */
  key?: 'shift' | 'ctrl' | null;
  /** Throttle interval for real-time selection during drag (ms). Default: 100 */
  throttleMs?: number;
}

export function brushSelect(
  renderer: Renderer,
  graph: Graph,
  options?: BrushSelectOptions,
): () => void {
  const modifierKey = options?.key ?? null;
  const throttleMs = options?.throttleMs ?? 100;

  let selecting = false;
  let startX = 0;
  let startY = 0;
  let overlay: HTMLDivElement | null = null;
  let lastSelectTime = 0;
  let pendingSelect = false;
  let currentMouseX = 0;
  let currentMouseY = 0;

  const isModifierHeld = (e: MouseEvent): boolean => {
    if (!modifierKey) return true;
    if (modifierKey === 'shift') return e.shiftKey;
    if (modifierKey === 'ctrl') return e.ctrlKey || e.metaKey;
    return true;
  };

  const createOverlay = (): HTMLDivElement => {
    const div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.border = '2px dashed #1783FF';
    div.style.backgroundColor = 'rgba(23, 131, 255, 0.08)';
    div.style.pointerEvents = 'none';
    div.style.zIndex = '9999';
    div.style.display = 'none';
    document.body.appendChild(div);
    return div;
  };

  const updateOverlay = (x1: number, y1: number, x2: number, y2: number): void => {
    if (!overlay) return;
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    overlay.style.left = `${left}px`;
    overlay.style.top = `${top}px`;
    overlay.style.width = `${width}px`;
    overlay.style.height = `${height}px`;
    overlay.style.display = 'block';
  };

  const selectNodesInRect = (x1: number, y1: number, x2: number, y2: number): void => {
    // Clear previous selection (only 'selected' state)
    const prevSelected = graph.findNodesByState('selected');
    for (const id of prevSelected) {
      graph.setItemState(id, 'selected', false);
    }

    const selectedIds: string[] = [];

    // Convert screen rect to graph coordinates
    const [gx1, gy1] = renderer.screenToGraph(Math.min(x1, x2), Math.min(y1, y2));
    const [gx2, gy2] = renderer.screenToGraph(Math.max(x1, x2), Math.max(y1, y2));

    // Find nodes within the rectangle
    const nodes = graph.getNodes();
    for (const node of nodes) {
      if (node.x >= gx1 && node.x <= gx2 && node.y >= gy1 && node.y <= gy2) {
        graph.setItemState(node.id, 'selected', true);
        selectedIds.push(node.id);
      }
    }

    if (selectedIds.length > 0) {
      graph.eventEmitter.emit('brush:select', { nodeIds: selectedIds });
    }
  };

  // Throttled selection to improve performance on large graphs
  const throttledSelect = (): void => {
    if (!selecting) return;

    const now = performance.now();
    if (now - lastSelectTime >= throttleMs) {
      selectNodesInRect(startX, startY, currentMouseX, currentMouseY);
      lastSelectTime = now;
      pendingSelect = false;
    } else if (!pendingSelect) {
      pendingSelect = true;
      setTimeout(
        () => {
          if (selecting) {
            selectNodesInRect(startX, startY, currentMouseX, currentMouseY);
            lastSelectTime = performance.now();
          }
          pendingSelect = false;
        },
        throttleMs - (now - lastSelectTime),
      );
    }
  };

  const onPointerDown = (payload: { event: MouseEvent }): void => {
    const e = payload.event;
    if (e.button !== 0) return;
    if (!isModifierHeld(e)) return;

    // Started from a non-node pointerdown (canvas/edge/combo) — node hits never
    // reach here, so the former pick guard is unnecessary.
    selecting = true;
    startX = e.clientX;
    startY = e.clientY;
    currentMouseX = e.clientX;
    currentMouseY = e.clientY;
    lastSelectTime = 0;

    if (!overlay) {
      overlay = createOverlay();
    }
  };

  const onMouseMove = (e: MouseEvent): void => {
    if (!selecting) return;
    currentMouseX = e.clientX;
    currentMouseY = e.clientY;
    updateOverlay(startX, startY, currentMouseX, currentMouseY);
    throttledSelect();
  };

  const onMouseUp = (): void => {
    if (!selecting) return;
    selecting = false;

    if (overlay) {
      overlay.style.display = 'none';
    }

    // Execute final selection immediately on mouse up
    selectNodesInRect(startX, startY, currentMouseX, currentMouseY);

    const selectedIds = graph.findNodesByState('selected');
    graph.eventEmitter.emit('brush:end', { nodeIds: selectedIds });
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
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  };
}
