/**
 * click-select: click to select/deselect nodes and edges.
 * Clicking a node/edge toggles its 'selected' state.
 * Clicking the canvas background clears all selections.
 */

import type { Renderer } from '../renderer/renderer.js';
import type { Graph } from '../graph.js';

export function clickSelect(renderer: Renderer, graph: Graph): () => void {
  const canvas = renderer.getCanvas();
  /** Track currently selected items for clearing on canvas click. */
  const selectedNodeIds = new Set<string>();
  const selectedEdgeIndices = new Set<number>();

  const onClick = (e: MouseEvent) => {
    const result = renderer.pickAt(e.clientX, e.clientY);

    if (result && result.type === 'node') {
      const nodeId = result.id;
      if (selectedNodeIds.has(nodeId)) {
        // Deselect
        graph.clearItemStates(nodeId);
        selectedNodeIds.delete(nodeId);
      } else {
        // Select
        graph.setItemState(nodeId, 'selected', true);
        selectedNodeIds.add(nodeId);
      }
      graph.eventEmitter.emit('node:selectchange', {
        nodeId,
        selected: selectedNodeIds.has(nodeId),
        event: e,
      });
    } else if (result && result.type === 'edge') {
      const edgeIdx = result.index;
      const edges = renderer.getEdges();
      const edge = edges[edgeIdx];
      if (edge) {
        if (selectedEdgeIndices.has(edgeIdx)) {
          // Deselect — use source-target as identifier since edges lack stable IDs
          selectedEdgeIndices.delete(edgeIdx);
          // Clear states: find the edge by source-target pair via DataModel
          graph.eventEmitter.emit('edge:selectchange', {
            edgeIndex: edgeIdx,
            source: edge.source,
            target: edge.target,
            selected: false,
            event: e,
          });
        } else {
          selectedEdgeIndices.add(edgeIdx);
          graph.eventEmitter.emit('edge:selectchange', {
            edgeIndex: edgeIdx,
            source: edge.source,
            target: edge.target,
            selected: true,
            event: e,
          });
        }
      }
    } else {
      // Canvas click — clear all node selections
      for (const id of selectedNodeIds) {
        graph.clearItemStates(id);
      }
      const clearedNodeIds = [...selectedNodeIds];
      selectedNodeIds.clear();
      selectedEdgeIndices.clear();
      if (clearedNodeIds.length > 0) {
        graph.eventEmitter.emit('selection:clear', { ids: clearedNodeIds, event: e });
      }
    }
  };

  canvas.addEventListener('click', onClick);
  return () => canvas.removeEventListener('click', onClick);
}
