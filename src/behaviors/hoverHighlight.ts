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

import type { Graph } from '../graph.js';
import type { Renderer } from '../renderer/renderer.js';

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

  const clearInactive = () => {
    if (inactiveState && inactiveApplied.length > 0) {
      for (const id of inactiveApplied) {
        graph.setItemState(id, inactiveState as any, false);
      }
      inactiveApplied = [];
    }
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
    clearInactive();
    canvas.style.cursor = 'default';
    renderer.setHighlight({ nodeIds: new Set(), edgeIndices: new Set() });
  };

  const onEdgeOver = (payload: { source: string; target: string; edgeIndex: number }) => {
    clearInactive();
    canvas.style.cursor = 'pointer';
    renderer.setHighlight({
      nodeIds: new Set([payload.source, payload.target]),
      edgeIndices: new Set([payload.edgeIndex]),
    });
  };

  const onNodeOver = (payload: { nodeId: string }) => {
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

    if (inactiveState) {
      const allNodes = renderer.getNodes();
      const newInactive: string[] = [];
      for (const n of allNodes) {
        if (!nodeIds.has(n.id)) {
          graph.setItemState(n.id, inactiveState as any, true);
          newInactive.push(n.id);
        }
      }
      inactiveApplied = newInactive;
    }
  };

  graph.eventEmitter.on('edge:pointerover', onEdgeOver);
  graph.eventEmitter.on('edge:pointerleave', clearHighlight);
  graph.eventEmitter.on('node:pointerover', onNodeOver);
  graph.eventEmitter.on('node:pointerleave', clearHighlight);

  return () => {
    graph.eventEmitter.off('edge:pointerover', onEdgeOver);
    graph.eventEmitter.off('edge:pointerleave', clearHighlight);
    graph.eventEmitter.off('node:pointerover', onNodeOver);
    graph.eventEmitter.off('node:pointerleave', clearHighlight);
  };
}
