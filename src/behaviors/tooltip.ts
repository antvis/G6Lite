/**
 * tooltip: a floating overlay that follows the pointer (hover) or pins on click.
 *
 * Pure consumer of InteractionDispatcher events — does its own zero picking:
 *   trigger: 'hover' (default) → node/edge pointerover/pointermove show & track,
 *                                 pointerleave hides (after `delay` debounce).
 *   trigger: 'click'          → node/edge click shows (re-click toggles), any
 *                                 canvas:click hides.
 *
 * The overlay is a single `position:fixed; pointer-events:none` div appended to
 * document.body, flipped at viewport edges. Default content is text (XSS-safe);
 * a custom getContent returning an HTML string is injected as innerHTML and the
 * caller owns escaping (same contract as G6).
 *
 * Usage:
 *   behaviors: ['tooltip']
 *   behaviors: [{ type: 'tooltip', trigger: 'click', getContent: (ctx) => ... }]
 */

import type { Graph } from '../graph';
import type { Renderer } from '../renderer/renderer';

export interface TooltipContext {
  itemType: 'node' | 'edge';
  nodeId?: string;
  edgeId?: string;
  edgeIndex?: number;
  source?: string;
  target?: string;
  data?: Record<string, unknown>;
  event: MouseEvent;
}

export interface TooltipOptions {
  /** Trigger mode. Default: 'hover'. */
  trigger?: 'hover' | 'click';
  /**
   * Build the tooltip body. A custom string is treated as trusted HTML for
   * backward compatibility; escape untrusted values or return an HTMLElement
   * whose textContent you control.
   */
  getContent?: (ctx: TooltipContext) => string | HTMLElement;
  /** Gate display per element. Return false to suppress. Default: always show. */
  enable?: (ctx: TooltipContext) => boolean;
  /** Pixel offset [dx, dy] from the pointer. Default: [10, 10]. */
  offset?: [number, number];
  /** Hover debounce in ms before show. Default: 80. */
  delay?: number;
  /** Overlay class name. Default: 'g6lite-tooltip'. */
  className?: string;
  /** DOM mount and collision boundary. Defaults to document.body. */
  container?: HTMLElement;
}

type NodePayload = { nodeId: string; data?: Record<string, unknown>; event: MouseEvent };
type EdgePayload = {
  edgeId?: string;
  edgeIndex: number;
  source: string;
  target: string;
  data?: Record<string, unknown>;
  event: MouseEvent;
};

const defaultContent = (ctx: TooltipContext): string => {
  if (ctx.itemType === 'node') {
    return String(ctx.data?.label ?? ctx.nodeId ?? '');
  }
  return String(ctx.data?.label ?? `${ctx.source} → ${ctx.target}`);
};

export function tooltip(renderer: Renderer, graph?: Graph, options?: TooltipOptions): () => void {
  if (!graph) return () => {};

  const trigger = options?.trigger ?? 'hover';
  const customGetContent = options?.getContent;
  const getContent = customGetContent ?? defaultContent;
  const allowHtml = customGetContent !== undefined;
  const enable = options?.enable;
  const [offsetX, offsetY] = options?.offset ?? [10, 10];
  const delay = options?.delay ?? 80;
  const className = options?.className ?? 'g6lite-tooltip';
  const container = options?.container ?? document.body;

  let el: HTMLDivElement | null = null;
  let showTimer: ReturnType<typeof setTimeout> | null = null;
  // For click trigger: identity of the currently pinned element (toggle support).
  let pinnedKey: string | null = null;

  const ensureEl = (): HTMLDivElement => {
    if (el) return el;
    const div = document.createElement('div');
    div.className = className;
    div.style.position = 'fixed';
    div.style.pointerEvents = 'none';
    div.style.zIndex = '9999';
    div.style.visibility = 'hidden';
    div.style.top = '0';
    div.style.left = '0';
    container.appendChild(div);
    el = div;
    return div;
  };

  const setBody = (
    content: string | HTMLElement,
    target: HTMLDivElement,
    trustedHtml: boolean,
  ): void => {
    if (typeof content === 'string') {
      if (trustedHtml) target.innerHTML = content;
      else target.textContent = content;
    } else {
      target.replaceChildren(content);
    }
  };

  /** Position the overlay near the pointer, flipping at the viewport edges. */
  const place = (event: MouseEvent, target: HTMLDivElement): void => {
    const boundary =
      container === document.body
        ? { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight }
        : container.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    let x = event.clientX + offsetX;
    let y = event.clientY + offsetY;
    if (x + rect.width > boundary.right) x = event.clientX - offsetX - rect.width;
    if (y + rect.height > boundary.bottom) y = event.clientY - offsetY - rect.height;
    x = Math.max(boundary.left, x);
    y = Math.max(boundary.top, y);
    // The body-mounted overlay is fixed, so x/y are already viewport-relative.
    // Adding window.scrollX/scrollY would incorrectly shift it after page scroll.
    const localX = container === document.body ? x : x - boundary.left + container.scrollLeft;
    const localY = container === document.body ? y : y - boundary.top + container.scrollTop;
    target.style.left = `${localX}px`;
    target.style.top = `${localY}px`;
  };

  const show = (ctx: TooltipContext): void => {
    if (enable && !enable(ctx)) return;
    const target = ensureEl();
    setBody(getContent(ctx), target, allowHtml);
    target.style.visibility = 'visible';
    place(ctx.event, target);
  };

  const hide = (): void => {
    if (showTimer) {
      clearTimeout(showTimer);
      showTimer = null;
    }
    pinnedKey = null;
    if (el) el.style.visibility = 'hidden';
  };

  const nodeCtx = (p: NodePayload): TooltipContext => ({
    itemType: 'node',
    nodeId: p.nodeId,
    data: p.data,
    event: p.event,
  });
  const edgeCtx = (p: EdgePayload): TooltipContext => ({
    itemType: 'edge',
    edgeId: p.edgeId,
    edgeIndex: p.edgeIndex,
    source: p.source,
    target: p.target,
    data: p.data,
    event: p.event,
  });

  // --- Hover trigger -------------------------------------------------------

  const onNodeOver = (p: NodePayload): void => {
    if (showTimer) clearTimeout(showTimer);
    showTimer = setTimeout(() => show(nodeCtx(p)), delay);
  };
  const onEdgeOver = (p: EdgePayload): void => {
    if (showTimer) clearTimeout(showTimer);
    showTimer = setTimeout(() => show(edgeCtx(p)), delay);
  };
  const onNodeMove = (p: NodePayload): void => {
    if (el && el.style.visibility === 'visible') show(nodeCtx(p));
  };
  const onEdgeMove = (p: EdgePayload): void => {
    if (el && el.style.visibility === 'visible') show(edgeCtx(p));
  };

  // --- Click trigger -------------------------------------------------------

  const onNodeClick = (p: NodePayload): void => {
    const key = `node:${p.nodeId}`;
    if (pinnedKey === key) {
      hide();
      return;
    }
    show(nodeCtx(p));
    pinnedKey = key;
  };
  const onEdgeClick = (p: EdgePayload): void => {
    const key = `edge:${p.edgeId ?? p.edgeIndex}`;
    if (pinnedKey === key) {
      hide();
      return;
    }
    show(edgeCtx(p));
    pinnedKey = key;
  };

  const emitter = graph.eventEmitter;

  if (trigger === 'hover') {
    emitter.on('node:pointerover', onNodeOver);
    emitter.on('node:pointermove', onNodeMove);
    emitter.on('node:pointerleave', hide);
    emitter.on('edge:pointerover', onEdgeOver);
    emitter.on('edge:pointermove', onEdgeMove);
    emitter.on('edge:pointerleave', hide);
  } else {
    emitter.on('node:click', onNodeClick);
    emitter.on('edge:click', onEdgeClick);
    emitter.on('canvas:click', hide);
  }

  return () => {
    if (trigger === 'hover') {
      emitter.off('node:pointerover', onNodeOver);
      emitter.off('node:pointermove', onNodeMove);
      emitter.off('node:pointerleave', hide);
      emitter.off('edge:pointerover', onEdgeOver);
      emitter.off('edge:pointermove', onEdgeMove);
      emitter.off('edge:pointerleave', hide);
    } else {
      emitter.off('node:click', onNodeClick);
      emitter.off('edge:click', onEdgeClick);
      emitter.off('canvas:click', hide);
    }
    if (showTimer) clearTimeout(showTimer);
    if (el) {
      el.remove();
      el = null;
    }
  };
}
