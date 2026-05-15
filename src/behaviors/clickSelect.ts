/**
 * click-select: click to select/deselect nodes and edges.
 * Clicking a node/edge toggles its 'selected' state.
 * Clicking the canvas background clears all selections.
 *
 * CR Fixes:
 * - Use DataModel edge.id instead of edgeIndex for stable identity
 * - Sync state via graph.setItemState/clearItemStates
 * - Query current selection via graph.findNodesByState (single source of truth)
 * - Only clear 'selected' state, not all states
 */

import type { Renderer } from '../renderer/renderer.js';
import type { Graph } from '../graph.js';

export function clickSelect(renderer: Renderer, graph: Graph): () => void {
  const canvas = renderer.getCanvas();

  const onClick = (e: MouseEvent) => {
    const result = renderer.pickAt(e.offsetX, e.offsetY);

    if (result && result.type === 'node') {
      const nodeId = result.id;
      if (graph.findNodesByState('selected').includes(nodeId)) {
        // Deselect
        graph.setItemState(nodeId, 'selected', false);
        graph.eventEmitter.emit('node:selectchange', {
          nodeId,
          selected: false,
          event: e,
        });
      } else {
        // Select
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
        if (graph.findEdgesByState('selected').includes(edgeId)) {
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
      // Canvas click — clear all selections (only 'selected' state)
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
    }
  };

  canvas.addEventListener('click', onClick);
  return () => canvas.removeEventListener('click', onClick);
}
