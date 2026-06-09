/**
 * Combined hover: highlight edge (and its nodes) or highlight node (and adjacent).
 * Uses O(1) GPU framebuffer picking via renderer.pickAt(). Edge takes precedence.
 * Emits node:hover / edge:hover (enter) and node:mouseleave / edge:mouseleave (leave).
 *
 * Config options:
 * - degree: number — how many hops of neighbors to highlight (default: 1)
 * - inactiveState: string — optional state to apply to non-highlighted elements
 */

import type { Renderer } from '../renderer/renderer.js';
import type { Graph } from '../graph.js';

export interface HoverHighlightConfig {
  type: string;
  degree?: number;
  inactiveState?: string;
}

/** Track the last hovered item to emit leave events when hover target changes. */
type HoverTarget =
  | { kind: 'node'; id: string }
  | { kind: 'edge'; index: number; source: string; target: string }
  | null;

export function hoverHighlight(
  renderer: Renderer,
  graph?: Graph,
  config?: HoverHighlightConfig,
): () => void {
  const canvas = renderer.getCanvas();
  const degree = config?.degree ?? 1;
  const inactiveState = config?.inactiveState;
  let lastHover: HoverTarget = null;
  let inactiveApplied: string[] = [];

  const clearInactive = () => {
    if (inactiveState && graph && inactiveApplied.length > 0) {
      for (const id of inactiveApplied) {
        graph.setItemState(id, inactiveState as any, false);
      }
      inactiveApplied = [];
    }
  };

  const collectNeighbors = (startId: string, hops: number): Set<string> => {
    const nodeIds = new Set<string>([startId]);
    if (!graph || hops <= 0 || typeof graph.getNeighborNodes !== 'function') return nodeIds;
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

  const emitLeave = (e: MouseEvent) => {
    if (!lastHover) return;
    if (lastHover.kind === 'node') {
      graph?.eventEmitter.emit('node:mouseleave', { nodeId: lastHover.id, event: e });
    } else if (lastHover.kind === 'edge') {
      graph?.eventEmitter.emit('edge:mouseleave', {
        edgeIndex: lastHover.index,
        source: lastHover.source,
        target: lastHover.target,
        event: e,
      });
    }
    lastHover = null;
  };

  const onMove = (e: MouseEvent) => {
    const result = renderer.pickAt(e.clientX, e.clientY);

    // Edge takes precedence
    if (result && result.type === 'edge') {
      const edges = renderer.getEdges();
      const edge = edges[result.index];
      if (edge) {
        if (lastHover?.kind !== 'edge' || lastHover.index !== result.index) {
          emitLeave(e);
          clearInactive();
        }
        canvas.style.cursor = 'pointer';
        renderer.setHighlight({
          nodeIds: new Set([edge.source, edge.target]),
          edgeIndices: new Set([result.index]),
        });
        lastHover = { kind: 'edge', index: result.index, source: edge.source, target: edge.target };
        graph?.eventEmitter.emit('edge:hover', {
          edgeIndex: result.index,
          source: edge.source,
          target: edge.target,
          event: e,
        });
        return;
      }
    }

    // Node hit
    if (result && result.type === 'node') {
      const nodeId = result.id;
      if (lastHover?.kind !== 'node' || lastHover.id !== nodeId) {
        emitLeave(e);
        clearInactive();
      }
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

      if (inactiveState && graph) {
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

      lastHover = { kind: 'node', id: nodeId };
      graph?.eventEmitter.emit('node:hover', { nodeId, event: e });
      return;
    }

    // Nothing hit — emit leave and clear highlight
    emitLeave(e);
    clearInactive();
    canvas.style.cursor = 'default';
    renderer.setHighlight({ nodeIds: new Set(), edgeIndices: new Set() });
  };

  const onLeave = (e: MouseEvent) => {
    emitLeave(e);
    clearInactive();
    canvas.style.cursor = 'default';
    renderer.setHighlight({ nodeIds: new Set(), edgeIndices: new Set() });
  };

  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseleave', onLeave);
  return () => {
    canvas.removeEventListener('mousemove', onMove);
    canvas.removeEventListener('mouseleave', onLeave);
  };
}
