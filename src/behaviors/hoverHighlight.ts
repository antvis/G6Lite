/**
 * Combined hover: highlight edge (and its nodes) or highlight node (and adjacent).
 * Consumes pointer events from the InteractionDispatcher (no own picking).
 * Edge takes precedence — the dispatcher already resolves node-over-edge hit
 * priority, so node and edge pointer streams are mutually exclusive here.
 *
 * Config options:
 * - degree: number — how many hops of neighbors to highlight (default: 1)
 * - inactiveState: string — optional state to apply to non-highlighted elements
 */

import type { Graph } from '../graph';
import type { Renderer } from '../renderer/renderer';
import type { ElementState } from '../types';

export interface HoverHighlightConfig {
  type: string;
  degree?: number;
  inactiveState?: string;
}

export function hoverHighlight(
  renderer: Renderer,
  graph?: Graph,
  config?: HoverHighlightConfig,
): () => void {
  if (!graph) return () => {};
  const canvas = renderer.getCanvas();
  const degree = config?.degree ?? 1;
  const inactiveState = config?.inactiveState;
  let inactiveApplied: string[] = [];
  let highlightApplied: string[] = [];
  let isFrozen = false;

  const batchSetState = (
    items: Array<{ id: string; state: ElementState; value: boolean }>,
  ): void => {
    if (items.length === 0) return;
    if (typeof graph.batchSetState === 'function') {
      graph.batchSetState(items);
      return;
    }
    for (const item of items) {
      graph.setItemState(item.id, item.state, item.value);
    }
  };

  const clearHighlightState = () => {
    if (highlightApplied.length === 0) return;
    batchSetState(
      highlightApplied.map((id) => ({
        id,
        state: 'highlight',
        value: false,
      })),
    );
    highlightApplied = [];
  };

  const clearInactive = () => {
    if (inactiveState && inactiveApplied.length > 0) {
      batchSetState(
        inactiveApplied.map((id) => ({
          id,
          state: inactiveState as ElementState,
          value: false,
        })),
      );
      inactiveApplied = [];
    }
  };

  const applyStateStyles = (nodeIds: Set<string>, edgeIndices: Set<number>) => {
    clearHighlightState();
    clearInactive();

    const edges = renderer.getEdges();
    const edgeIds = new Set<string>();
    edgeIndices.forEach((edgeIndex) => {
      const edgeId = (edges[edgeIndex] as { id?: string } | undefined)?.id;
      if (edgeId) edgeIds.add(edgeId);
    });

    const items: Array<{ id: string; state: ElementState; value: boolean }> = [];
    nodeIds.forEach((id) => {
      items.push({ id, state: 'highlight', value: true });
      highlightApplied.push(id);
    });
    edgeIds.forEach((id) => {
      items.push({ id, state: 'highlight', value: true });
      highlightApplied.push(id);
    });

    if (inactiveState) {
      const inactiveItems: Array<{ id: string; state: ElementState; value: boolean }> = [];
      for (const node of renderer.getNodes()) {
        if (!nodeIds.has(node.id)) {
          inactiveItems.push({ id: node.id, state: inactiveState as ElementState, value: true });
          inactiveApplied.push(node.id);
        }
      }
      edges.forEach((edge, index) => {
        const edgeId = (edge as { id?: string }).id;
        if (edgeId && !edgeIndices.has(index)) {
          inactiveItems.push({ id: edgeId, state: inactiveState as ElementState, value: true });
          inactiveApplied.push(edgeId);
        }
      });
      items.push(...inactiveItems);
    }

    batchSetState(items);
  };

  const collectNeighbors = (startId: string, hops: number): Set<string> => {
    const nodeIds = new Set<string>([startId]);
    if (hops <= 0 || typeof graph.getNeighborNodes !== 'function') return nodeIds;
    let frontier = [startId];
    for (let d = 0; d < hops; d++) {
      const nextFrontier: string[] = [];
      for (const nid of frontier) {
        const neighbors = graph.getNeighborNodes(nid);
        for (const neighbor of neighbors) {
          if (!nodeIds.has(neighbor)) {
            nodeIds.add(neighbor);
            nextFrontier.push(neighbor);
          }
        }
      }
      frontier = nextFrontier;
      if (frontier.length === 0) break;
    }
    return nodeIds;
  };

  const clearHighlight = () => {
    clearHighlightState();
    clearInactive();
    canvas.style.cursor = 'default';
    renderer.setHighlight({ nodeIds: new Set(), edgeIndices: new Set() });
  };

  const onPointerLeave = () => {
    if (isFrozen) return;
    clearHighlight();
  };

  const onEdgeOver = (payload: { source: string; target: string; edgeIndex: number }) => {
    if (isFrozen) return;
    canvas.style.cursor = 'pointer';
    const nodeIds = new Set([payload.source, payload.target]);
    const edgeIndices = new Set([payload.edgeIndex]);
    renderer.setHighlight({ nodeIds, edgeIndices });
    applyStateStyles(nodeIds, edgeIndices);
  };

  const onNodeOver = (payload: { nodeId: string }) => {
    if (isFrozen) return;
    clearInactive();
    const nodeId = payload.nodeId;
    canvas.style.cursor = 'pointer';

    const nodeIds = collectNeighbors(nodeId, degree);
    const edgeIndices = new Set<number>();
    const edges = renderer.getEdges();
    edges.forEach((edge, i) => {
      if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
        edgeIndices.add(i);
      } else if (edge.source === nodeId || edge.target === nodeId) {
        nodeIds.add(edge.source);
        nodeIds.add(edge.target);
        edgeIndices.add(i);
      }
    });

    renderer.setHighlight({ nodeIds, edgeIndices });
    applyStateStyles(nodeIds, edgeIndices);
  };

  const freeze = () => {
    isFrozen = true;
  };

  const unfreeze = () => {
    isFrozen = false;
  };

  graph.eventEmitter.on('edge:pointerover', onEdgeOver);
  graph.eventEmitter.on('edge:pointerleave', onPointerLeave);
  graph.eventEmitter.on('node:pointerover', onNodeOver);
  graph.eventEmitter.on('node:pointerleave', onPointerLeave);
  graph.eventEmitter.on('node:dragstart', freeze);
  graph.eventEmitter.on('combo:dragstart', freeze);
  graph.eventEmitter.on('node:dragend', unfreeze);
  graph.eventEmitter.on('combo:dragend', unfreeze);

  return () => {
    if (highlightApplied.length > 0 || inactiveApplied.length > 0) clearHighlight();
    graph.eventEmitter.off('edge:pointerover', onEdgeOver);
    graph.eventEmitter.off('edge:pointerleave', onPointerLeave);
    graph.eventEmitter.off('node:pointerover', onNodeOver);
    graph.eventEmitter.off('node:pointerleave', onPointerLeave);
    graph.eventEmitter.off('node:dragstart', freeze);
    graph.eventEmitter.off('combo:dragstart', freeze);
    graph.eventEmitter.off('node:dragend', unfreeze);
    graph.eventEmitter.off('combo:dragend', unfreeze);
  };
}
