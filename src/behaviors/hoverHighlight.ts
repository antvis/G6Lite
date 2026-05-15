/**
 * Combined hover: highlight edge (and its nodes) or highlight node (and adjacent).
 * Uses O(1) GPU framebuffer picking via renderer.pickAt(). Edge takes precedence.
 * Emits node:hover / edge:hover (enter) and node:mouseleave / edge:mouseleave (leave).
 */

import type { Renderer } from '../renderer/renderer.js';
import type { Graph } from '../graph.js';

/** Track the last hovered item to emit leave events when hover target changes. */
type HoverTarget =
  | { kind: 'node'; id: string }
  | { kind: 'edge'; index: number; source: string; target: string }
  | null;

export function hoverHighlight(renderer: Renderer, graph?: Graph): () => void {
  const canvas = renderer.getCanvas();
  let lastHover: HoverTarget = null;

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
        // Emit leave if previous hover target differs
        if (lastHover?.kind !== 'edge' || lastHover.index !== result.index) {
          emitLeave(e);
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
      // Emit leave if previous hover target differs
      if (lastHover?.kind !== 'node' || lastHover.id !== nodeId) {
        emitLeave(e);
      }
      canvas.style.cursor = 'pointer';
      const nodeIds = new Set<string>([nodeId]);
      const edgeIndices = new Set<number>();
      const edges = renderer.getEdges();
      edges.forEach((edge, i) => {
        if (edge.source === nodeId || edge.target === nodeId) {
          nodeIds.add(edge.source).add(edge.target);
          edgeIndices.add(i);
        }
      });
      renderer.setHighlight({ nodeIds, edgeIndices });
      lastHover = { kind: 'node', id: nodeId };
      graph?.eventEmitter.emit('node:hover', { nodeId, event: e });
      return;
    }

    // Nothing hit — emit leave and clear highlight
    emitLeave(e);
    canvas.style.cursor = 'default';
    renderer.setHighlight({ nodeIds: new Set(), edgeIndices: new Set() });
  };

  const onLeave = (e: MouseEvent) => {
    emitLeave(e);
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
