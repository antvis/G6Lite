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
import type { GraphElementEvent } from '../types.js';
import { GESTURE_CONSUME_EVENT } from './gesture.js';

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
  let gesture: { x: number; y: number; consumed: boolean } | null = null;
  let suppressNextClick = false;
  const clickThreshold = 3;

  const createPayload = (
    e: MouseEvent | WheelEvent,
    targetType: GraphElementEvent['targetType'],
    extra: Partial<GraphElementEvent> = {},
  ): GraphElementEvent => {
    const rect = canvas.getBoundingClientRect();
    const canvasPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const graphPoint =
      typeof (graph as { screenToGraph?: unknown }).screenToGraph === 'function'
        ? graph.screenToGraph(e.clientX, e.clientY)
        : typeof (renderer as { screenToGraph?: unknown }).screenToGraph === 'function'
          ? (() => {
              const [x, y] = renderer.screenToGraph(e.clientX, e.clientY);
              return { x, y };
            })()
          : canvasPoint;
    return {
      targetType,
      targetId: extra.targetId,
      client: { x: e.clientX, y: e.clientY },
      canvas: canvasPoint,
      graph: graphPoint,
      nativeEvent: e,
      event: e,
      ...extra,
    };
  };

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
      emitter.emit(
        `node:${kind}`,
        createPayload(e, 'node', {
          targetId: hit.nodeId,
          nodeId: hit.nodeId,
          data: hit.data,
        }),
      );
    } else if (hit.kind === 'edge') {
      emitter.emit(
        `edge:${kind}`,
        createPayload(e, 'edge', {
          targetId: hit.edgeId,
          edgeId: hit.edgeId,
          edgeIndex: hit.edgeIndex,
          source: hit.source,
          target: hit.target,
          data: hit.data,
        }),
      );
    } else if (hit.kind === 'combo' && kind !== 'wheel') {
      emitter.emit(
        `combo:${kind}`,
        createPayload(e, 'combo', {
          targetId: hit.comboId,
          comboId: hit.comboId,
        }),
      );
    } else {
      emitter.emit(`canvas:${kind}`, createPayload(e, 'canvas'));
    }
  };

  // --- Hover state machine -------------------------------------------------

  const emitLeave = (e: MouseEvent): void => {
    if (!lastHover) return;
    if (lastHover.kind === 'node') {
      const idx = renderer.getNodeIdToIndex().get(lastHover.id);
      const node = idx !== undefined ? renderer.getNodes()[idx] : undefined;
      const payload = createPayload(e, 'node', {
        targetId: lastHover.id,
        nodeId: lastHover.id,
        data: node?.data,
      });
      emitter.emit('node:pointerleave', payload);
    } else {
      const edge = renderer.getEdges()[lastHover.index];
      if (edge) {
        const edgeId = (edge as { id?: string }).id ?? String(lastHover.index);
        emitter.emit(
          'edge:pointerleave',
          createPayload(e, 'edge', {
            targetId: edgeId,
            edgeId,
            edgeIndex: lastHover.index,
            source: edge.source,
            target: edge.target,
            data: edge.data,
          }),
        );
      }
    }
    lastHover = null;
  };

  const onMouseMove = (e: MouseEvent): void => {
    // Drag behaviors already own their in-flight pointer tracking. Once the
    // gesture is consumed, hover Picking would only rebuild/read a framebuffer
    // whose result is ignored by the frozen hover behavior.
    if (gesture?.consumed) return;
    const hit = resolveHit(e);

    if (hit.kind === 'node') {
      const same = lastHover?.kind === 'node' && lastHover.id === hit.nodeId;
      if (!same) {
        emitLeave(e);
        const payload = createPayload(e, 'node', {
          targetId: hit.nodeId,
          nodeId: hit.nodeId,
          data: hit.data,
        });
        emitter.emit('node:pointerover', payload);
        emitter.emit('node:pointerenter', payload);
        lastHover = { kind: 'node', id: hit.nodeId };
      }
      emitter.emit(
        'node:pointermove',
        createPayload(e, 'node', {
          targetId: hit.nodeId,
          nodeId: hit.nodeId,
          data: hit.data,
        }),
      );
      return;
    }

    if (hit.kind === 'edge') {
      const same = lastHover?.kind === 'edge' && lastHover.id === hit.edgeId;
      if (!same) {
        emitLeave(e);
        const payload = createPayload(e, 'edge', {
          targetId: hit.edgeId,
          edgeId: hit.edgeId,
          edgeIndex: hit.edgeIndex,
          source: hit.source,
          target: hit.target,
          data: hit.data,
        });
        emitter.emit('edge:pointerover', payload);
        emitter.emit('edge:pointerenter', payload);
        lastHover = { kind: 'edge', id: hit.edgeId, index: hit.edgeIndex };
      }
      emitter.emit(
        'edge:pointermove',
        createPayload(e, 'edge', {
          targetId: hit.edgeId,
          edgeId: hit.edgeId,
          edgeIndex: hit.edgeIndex,
          source: hit.source,
          target: hit.target,
          data: hit.data,
        }),
      );
      return;
    }

    // combo or canvas background — leave any hovered element
    emitLeave(e);
    emitter.emit('canvas:pointermove', createPayload(e, 'canvas'));
  };

  const onMouseLeave = (e: MouseEvent): void => {
    if (gesture?.consumed) return;
    emitLeave(e);
  };

  // --- Press / click / wheel ----------------------------------------------

  const consumeGesture = (): void => {
    if (!gesture) return;
    gesture.consumed = true;
    renderer.setPickingSuspended(true);
  };
  const onMouseDown = (e: MouseEvent): void => {
    gesture = { x: e.clientX, y: e.clientY, consumed: false };
    suppressNextClick = false;
    dispatchHit(e, 'pointerdown');
  };
  const onClick = (e: MouseEvent): void => {
    if (suppressNextClick) {
      suppressNextClick = false;
      return;
    }
    dispatchHit(e, 'click');
  };
  const onDblClick = (e: MouseEvent): void => dispatchHit(e, 'dblclick');
  const onContextMenu = (e: MouseEvent): void => {
    e.preventDefault();
    dispatchHit(e, 'contextmenu');
  };
  const onWheel = (e: WheelEvent): void => dispatchHit(e, 'wheel');
  const onMouseUp = (e: MouseEvent): void => {
    if (gesture) {
      const wasConsumed = gesture.consumed;
      suppressNextClick =
        gesture.consumed ||
        Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y) > clickThreshold;
      gesture = null;
      if (wasConsumed) renderer.setPickingSuspended(false);
    }
    emitter.emit('canvas:pointerup', createPayload(e, 'canvas'));
  };

  emitter.on(GESTURE_CONSUME_EVENT, consumeGesture);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseleave', onMouseLeave);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('dblclick', onDblClick);
  canvas.addEventListener('contextmenu', onContextMenu);
  canvas.addEventListener('wheel', onWheel, { passive: true });
  window.addEventListener('mouseup', onMouseUp);

  return () => {
    if (gesture?.consumed) renderer.setPickingSuspended(false);
    emitter.off(GESTURE_CONSUME_EVENT, consumeGesture);
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
