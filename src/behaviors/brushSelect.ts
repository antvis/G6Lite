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

import type { Renderer } from '../renderer/renderer.js';
import type { Graph } from '../graph.js';

export interface BrushSelectOptions {
  /** Modifier key to activate. null = always active. Default: null */
  key?: 'shift' | 'ctrl' | null;
}

export function brushSelect(
  renderer: Renderer,
  graph: Graph,
  options?: BrushSelectOptions,
): () => void {
  const canvas = renderer.getCanvas();
  const modifierKey = options?.key ?? null;

  let selecting = false;
  let startX = 0;
  let startY = 0;
  let overlay: HTMLDivElement | null = null;

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

  const onMouseDown = (e: MouseEvent): void => {
    // Only activate on left button with modifier (if specified)
    if (e.button !== 0) return;
    if (!isModifierHeld(e)) return;

    // Check if we hit a node — if so, don't start brush (let drag-node handle it)
    const hit = renderer.pickAt(e.offsetX, e.offsetY);
    if (hit && hit.type === 'node') return;

    selecting = true;
    startX = e.clientX;
    startY = e.clientY;

    if (!overlay) {
      overlay = createOverlay();
    }
  };

  const onMouseMove = (e: MouseEvent): void => {
    if (!selecting) return;
    updateOverlay(startX, startY, e.clientX, e.clientY);
    // Note: CR suggests throttling selectNodesInRect for performance,
    // but keeping real-time for responsiveness on small graphs.
    // For large graphs (>1000 nodes), consider throttling.
    selectNodesInRect(startX, startY, e.clientX, e.clientY);
  };

  const onMouseUp = (e: MouseEvent): void => {
    if (!selecting) return;
    selecting = false;

    if (overlay) {
      overlay.style.display = 'none';
    }

    // Final selection set is already applied, just emit end event
    const selectedIds = graph.findNodesByState('selected');
    graph.eventEmitter.emit('brush:end', { nodeIds: selectedIds });
  };

  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  return () => {
    canvas.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  };
}
