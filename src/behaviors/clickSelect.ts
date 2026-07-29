/**
 * click-select: click to select/deselect nodes and edges.
 * Consumes click events from the InteractionDispatcher (no own picking).
 * Supports single-select (default) and multi-select (with modifier key).
 *
 * Config options:
 * - multiple: boolean — enable multi-select (default: false)
 * - trigger: 'shift' | 'ctrl' | 'meta' — modifier key for multi-select (default: 'shift')
 */

import type { Graph } from '../graph';
import type { Renderer } from '../renderer/renderer';

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
  const multiple = config?.multiple ?? false;
  const trigger = config?.trigger ?? 'shift';

  const isModifierPressed = (e: MouseEvent): boolean => {
    switch (trigger) {
      case 'ctrl':
        return e.ctrlKey;
      case 'meta':
        return e.metaKey;
      case 'shift':
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

  const onNodeClick = (payload: { nodeId: string; event: MouseEvent }) => {
    const { nodeId, event: e } = payload;
    const isSelected = graph.findNodesByState('selected').includes(nodeId);

    if (isSelected) {
      graph.setItemState(nodeId, 'selected', false);
      graph.eventEmitter.emit('node:selectchange', { nodeId, selected: false, event: e });
    } else {
      if (!multiple || !isModifierPressed(e)) {
        clearAllSelections(e);
      }
      graph.setItemState(nodeId, 'selected', true);
      graph.eventEmitter.emit('node:selectchange', { nodeId, selected: true, event: e });
    }
  };

  const onEdgeClick = (payload: {
    edgeId?: string;
    edgeIndex: number;
    source: string;
    target: string;
    event: MouseEvent;
  }) => {
    const { edgeId: payloadEdgeId, edgeIndex, source, target, event: e } = payload;
    const edge = renderer.getEdges()[edgeIndex];
    const edgeId =
      payloadEdgeId ?? ((edge as { id?: string } | undefined)?.id as string | undefined);
    if (!edgeId) return;
    const isSelected = graph.findEdgesByState('selected').includes(edgeId);

    if (isSelected) {
      graph.setItemState(edgeId, 'selected', false);
      graph.eventEmitter.emit('edge:selectchange', {
        edgeId,
        edgeIndex,
        source,
        target,
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
        edgeIndex,
        source,
        target,
        selected: true,
        event: e,
      });
    }
  };

  const onCanvasClick = (payload: { event: MouseEvent }) => {
    clearAllSelections(payload.event);
  };

  graph.eventEmitter.on('node:click', onNodeClick);
  graph.eventEmitter.on('edge:click', onEdgeClick);
  graph.eventEmitter.on('canvas:click', onCanvasClick);
  return () => {
    graph.eventEmitter.off('node:click', onNodeClick);
    graph.eventEmitter.off('edge:click', onEdgeClick);
    graph.eventEmitter.off('canvas:click', onCanvasClick);
  };
}
