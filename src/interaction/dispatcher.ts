/**
 * InteractionDispatcher: the single source of pointer hit-testing and element
 * event dispatch for the graph. Behaviors (highlight, select, drag, tooltip…)
 * consume the events it emits instead of each doing their own picking.
 *
 * Hit priority: node → edge → combo → canvas (mirrors the former clickNode).
 *
 * Emits on graph.eventEmitter (payloads carry the element `data` so consumers
 * need not re-query):
 *   node:pointerover / node:pointermove / node:pointerleave
 *   node:pointerdown / node:click / node:dblclick / node:contextmenu / node:wheel
 *   edge:* (same set, payload { edgeId, edgeIndex, source, target, data, event })
 *   combo:pointerdown / combo:click / combo:dblclick / combo:contextmenu
 *   canvas:pointermove / canvas:pointerdown / canvas:pointerup
 *   canvas:click / canvas:dblclick / canvas:contextmenu / canvas:wheel
 *
 * Hover (pointerover/move/leave) is tracked on canvas mousemove/mouseleave.
 * pointerdown/up/click/wheel each pick once. Drag behaviors take their gesture
 * start from pointerdown and run their own move/up tracking afterwards.
 */

import type { Graph } from '../graph.js';
import type { Renderer } from '../renderer/renderer.js';

type HoverTarget =
  | { kind: 'node'; id: string }
  | { kind: 'edge'; id: string; index: number }
  | null;

/** A node/edge/combo/canvas hit, resolved once per DOM event. */
type Hit =
  | { kind: 'node'; nodeId: string; data?: Record<string, unknown> }
  | {
      kind: 'edge';
      edgeId: string;
      edgeIndex: number;
      source: string;
      target: string;
      data?: Record<string, unknown>;
    }
  | { kind: 'combo'; comboId: string }
  | { kind: 'canvas' };

export function attachInteraction(renderer: Renderer, graph: Graph): () => void {
  const canvas = renderer.getCanvas();
  const emitter = graph.eventEmitter;
  let lastHover: HoverTarget = null;

  /** Combo pick tolerant of hosts without pickComboAt (e.g. test mocks). */
  const pickCombo = (e: MouseEvent): string | null =>
    (graph as { pickComboAt?: (x: number, y: number) => string | null }).pickComboAt?.(
      e.clientX,
      e.clientY,
    ) ?? null;

  /** Resolve the element under the pointer with node → edge → combo → canvas priority. */
  const resolveHit = (e: MouseEvent): Hit => {
    const result = renderer.pickAt(e.clientX, e.clientY);
    if (result && result.type === 'node') {
      const idx = renderer.getNodeIdToIndex().get(result.id);
      const node = idx !== undefined ? renderer.getNodes()[idx] : undefined;
      return { kind: 'node', nodeId: result.id, data: node?.data };
    }
    if (result && result.type === 'edge') {
      const edge = renderer.getEdges()[result.index];
      if (edge) {
        return {
          kind: 'edge',
          edgeId: (edge as { id?: string }).id ?? String(result.index),
          edgeIndex: result.index,
          source: edge.source,
          target: edge.target,
          data: edge.data,
        };
      }
    }
    const comboId = pickCombo(e);
    if (comboId) return { kind: 'combo', comboId };
    return { kind: 'canvas' };
  };

  /** Emit a click-family or pointerdown event with shared hit priority. */
  const dispatchHit = (
    e: MouseEvent,
    kind: 'pointerdown' | 'click' | 'dblclick' | 'contextmenu' | 'wheel',
  ): void => {
    const hit = resolveHit(e);
    if (hit.kind === 'node') {
      emitter.emit(`node:${kind}`, { nodeId: hit.nodeId, data: hit.data, event: e });
    } else if (hit.kind === 'edge') {
      emitter.emit(`edge:${kind}`, {
        edgeId: hit.edgeId,
        edgeIndex: hit.edgeIndex,
        source: hit.source,
        target: hit.target,
        data: hit.data,
        event: e,
      });
    } else if (hit.kind === 'combo' && kind !== 'wheel') {
      emitter.emit(`combo:${kind}`, { comboId: hit.comboId, event: e });
    } else {
      emitter.emit(`canvas:${kind}`, { event: e });
    }
  };

  // --- Hover state machine -------------------------------------------------

  const emitLeave = (e: MouseEvent): void => {
    if (!lastHover) return;
    if (lastHover.kind === 'node') {
      const idx = renderer.getNodeIdToIndex().get(lastHover.id);
      const node = idx !== undefined ? renderer.getNodes()[idx] : undefined;
      emitter.emit('node:pointerleave', { nodeId: lastHover.id, data: node?.data, event: e });
    } else {
      const edge = renderer.getEdges()[lastHover.index];
      if (edge) {
        emitter.emit('edge:pointerleave', {
          edgeId: (edge as { id?: string }).id ?? String(lastHover.index),
          edgeIndex: lastHover.index,
          source: edge.source,
          target: edge.target,
          data: edge.data,
          event: e,
        });
      }
    }
    lastHover = null;
  };

  const onMouseMove = (e: MouseEvent): void => {
    const hit = resolveHit(e);

    if (hit.kind === 'node') {
      const same = lastHover?.kind === 'node' && lastHover.id === hit.nodeId;
      if (!same) {
        emitLeave(e);
        emitter.emit('node:pointerover', { nodeId: hit.nodeId, data: hit.data, event: e });
        lastHover = { kind: 'node', id: hit.nodeId };
      }
      emitter.emit('node:pointermove', { nodeId: hit.nodeId, data: hit.data, event: e });
      return;
    }

    if (hit.kind === 'edge') {
      const same = lastHover?.kind === 'edge' && lastHover.id === hit.edgeId;
      if (!same) {
        emitLeave(e);
        emitter.emit('edge:pointerover', {
          edgeId: hit.edgeId,
          edgeIndex: hit.edgeIndex,
          source: hit.source,
          target: hit.target,
          data: hit.data,
          event: e,
        });
        lastHover = { kind: 'edge', id: hit.edgeId, index: hit.edgeIndex };
      }
      emitter.emit('edge:pointermove', {
        edgeId: hit.edgeId,
        edgeIndex: hit.edgeIndex,
        source: hit.source,
        target: hit.target,
        data: hit.data,
        event: e,
      });
      return;
    }

    // combo or canvas background — leave any hovered element
    emitLeave(e);
    emitter.emit('canvas:pointermove', { event: e });
  };

  const onMouseLeave = (e: MouseEvent): void => {
    emitLeave(e);
  };

  // --- Press / click / wheel ----------------------------------------------

  const onMouseDown = (e: MouseEvent): void => dispatchHit(e, 'pointerdown');
  const onClick = (e: MouseEvent): void => dispatchHit(e, 'click');
  const onDblClick = (e: MouseEvent): void => dispatchHit(e, 'dblclick');
  const onContextMenu = (e: MouseEvent): void => {
    e.preventDefault();
    dispatchHit(e, 'contextmenu');
  };
  const onWheel = (e: WheelEvent): void => dispatchHit(e, 'wheel');
  const onMouseUp = (e: MouseEvent): void => {
    emitter.emit('canvas:pointerup', { event: e });
  };

  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseleave', onMouseLeave);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('dblclick', onDblClick);
  canvas.addEventListener('contextmenu', onContextMenu);
  canvas.addEventListener('wheel', onWheel, { passive: true });
  window.addEventListener('mouseup', onMouseUp);

  return () => {
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mouseleave', onMouseLeave);
    canvas.removeEventListener('mousedown', onMouseDown);
    canvas.removeEventListener('click', onClick);
    canvas.removeEventListener('dblclick', onDblClick);
    canvas.removeEventListener('contextmenu', onContextMenu);
    canvas.removeEventListener('wheel', onWheel);
    window.removeEventListener('mouseup', onMouseUp);
  };
}
