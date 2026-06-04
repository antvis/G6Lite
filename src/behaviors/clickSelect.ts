/**
 * click-select: click to select/deselect nodes and edges.
 * Supports single-select (default) and multi-select (with modifier key).
 *
 * Config options:
 * - multiple: boolean — enable multi-select (default: false)
 * - trigger: 'shift' | 'ctrl' | 'meta' — modifier key for multi-select (default: 'shift')
 */

import type { Renderer } from '../renderer/renderer.js';
import type { Graph } from '../graph.js';

export interface ClickSelectConfig {
  type: string;
  multiple?: boolean;
  trigger?: 'shift' | 'ctrl' | 'meta';
}

export function clickSelect(
  renderer: Renderer,
  graph: Graph,
  config?: ClickSelectConfig,
): () => void {
  const canvas = renderer.getCanvas();
  const multiple = config?.multiple ?? false;
  const trigger = config?.trigger ?? 'shift';

  const isModifierPressed = (e: MouseEvent): boolean => {
    switch (trigger) {
      case 'shift':
        return e.shiftKey;
      case 'ctrl':
        return e.ctrlKey;
      case 'meta':
        return e.metaKey;
      default:
        return e.shiftKey;
    }
  };

  const clearAllSelections = (e: MouseEvent) => {
    const selectedNodeIds = graph.findNodesByState('selected');
    const selectedEdgeIds = graph.findEdgesByState('selected');
    const clearedIds: string[] = [];

    for (const id of selectedNodeIds) {
      graph.setItemState(id, 'selected', false);
      clearedIds.push(id);
    }
    for (const id of selectedEdgeIds) {
      graph.setItemState(id, 'selected', false);
      clearedIds.push(id);
    }

    if (clearedIds.length > 0) {
      graph.eventEmitter.emit('selection:clear', { ids: clearedIds, event: e });
    }
  };

  const onClick = (e: MouseEvent) => {
    const result = renderer.pickAt(e.offsetX, e.offsetY);

    if (result && result.type === 'node') {
      const nodeId = result.id;
      const isSelected = graph.findNodesByState('selected').includes(nodeId);

      if (isSelected) {
        graph.setItemState(nodeId, 'selected', false);
        graph.eventEmitter.emit('node:selectchange', {
          nodeId,
          selected: false,
          event: e,
        });
      } else {
        if (!multiple || !isModifierPressed(e)) {
          clearAllSelections(e);
        }
        graph.setItemState(nodeId, 'selected', true);
        graph.eventEmitter.emit('node:selectchange', {
          nodeId,
          selected: true,
          event: e,
        });
      }
    } else if (result && result.type === 'edge') {
      const edges = renderer.getEdges();
      const edge = edges[result.index];
      if (edge && (edge as any).id) {
        const edgeId = (edge as any).id as string;
        const isSelected = graph.findEdgesByState('selected').includes(edgeId);

        if (isSelected) {
          graph.setItemState(edgeId, 'selected', false);
          graph.eventEmitter.emit('edge:selectchange', {
            edgeId,
            edgeIndex: result.index,
            source: edge.source,
            target: edge.target,
            selected: false,
            event: e,
          });
        } else {
          if (!multiple || !isModifierPressed(e)) {
            clearAllSelections(e);
          }
          graph.setItemState(edgeId, 'selected', true);
          graph.eventEmitter.emit('edge:selectchange', {
            edgeId,
            edgeIndex: result.index,
            source: edge.source,
            target: edge.target,
            selected: true,
            event: e,
          });
        }
      }
    } else {
      clearAllSelections(e);
    }
  };

  canvas.addEventListener('click', onClick);
  return () => canvas.removeEventListener('click', onClick);
}
