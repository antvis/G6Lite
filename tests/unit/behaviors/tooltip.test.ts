import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tooltip } from '@src/behaviors/tooltip.js';
import { EventEmitter } from '@src/events.js';
import type { Graph } from '@src/graph.js';
import type { Renderer } from '@src/renderer/renderer.js';

function asRenderer<T>(renderer: T): Renderer {
  return renderer as unknown as Renderer;
}

function asGraph<T>(graph: T): Graph {
  return graph as unknown as Graph;
}

// ============================================================
// Tooltip behavior — pure consumer of dispatcher events. Drives
// node/edge over/move/leave/click on a mock graph.eventEmitter and
// asserts the floating overlay's visibility and content.
// ============================================================

function setup() {
  const emitter = new EventEmitter();
  const renderer = { getCanvas: () => document.createElement('canvas') };
  const graph = { eventEmitter: emitter };
  return { emitter, renderer, graph };
}

function mouseEvent(extra: Partial<MouseEvent> = {}): MouseEvent {
  return { clientX: 100, clientY: 100, ...extra } as MouseEvent;
}

function getOverlay(className = 'g6lite-tooltip'): HTMLElement | null {
  return document.querySelector(`.${className}`);
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.querySelectorAll('.g6lite-tooltip, .custom-tip').forEach((el) => el.remove());
});

describe('tooltip — teardown safety', () => {
  it('can be torn down without error and removes its overlay', () => {
    const { renderer, graph } = setup();
    const teardown = tooltip(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('node:pointerover', {
      nodeId: 'a',
      data: { label: 'A' },
      event: mouseEvent(),
    });
    vi.advanceTimersByTime(100);
    expect(getOverlay()).not.toBeNull();
    teardown();
    expect(getOverlay()).toBeNull();
  });

  it('returns a no-op teardown when graph is missing', () => {
    const { renderer } = setup();
    expect(() => tooltip(asRenderer(renderer), undefined)()).not.toThrow();
  });
});

describe('tooltip — hover trigger', () => {
  it('shows after the delay on node:pointerover with the node label', () => {
    const { renderer, graph } = setup();
    const teardown = tooltip(asRenderer(renderer), asGraph(graph), { delay: 80 });

    graph.eventEmitter.emit('node:pointerover', {
      nodeId: 'a',
      data: { label: 'Node A' },
      event: mouseEvent(),
    });
    // Not shown until the delay elapses
    expect(getOverlay()?.style.visibility).not.toBe('visible');

    vi.advanceTimersByTime(80);
    const el = getOverlay();
    expect(el?.style.visibility).toBe('visible');
    expect(el?.innerHTML).toContain('Node A');
    teardown();
  });

  it('falls back to nodeId when data has no label', () => {
    const { renderer, graph } = setup();
    const teardown = tooltip(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('node:pointerover', { nodeId: 'xyz', data: {}, event: mouseEvent() });
    vi.advanceTimersByTime(80);
    expect(getOverlay()?.innerHTML).toContain('xyz');
    teardown();
  });

  it('renders the default data label as text instead of executable HTML', () => {
    const { renderer, graph } = setup();
    const teardown = tooltip(asRenderer(renderer), asGraph(graph));
    const label = '<img src=x onerror="globalThis.__tooltipXss = true">Unsafe';

    graph.eventEmitter.emit('node:pointerover', {
      nodeId: 'unsafe',
      data: { label },
      event: mouseEvent(),
    });
    vi.advanceTimersByTime(80);

    const overlay = getOverlay();
    expect(overlay?.textContent).toBe(label);
    expect(overlay?.querySelector('img')).toBeNull();
    teardown();
  });

  it('hides on node:pointerleave', () => {
    const { renderer, graph } = setup();
    const teardown = tooltip(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('node:pointerover', {
      nodeId: 'a',
      data: { label: 'A' },
      event: mouseEvent(),
    });
    vi.advanceTimersByTime(80);
    expect(getOverlay()?.style.visibility).toBe('visible');

    graph.eventEmitter.emit('node:pointerleave', { nodeId: 'a', event: mouseEvent() });
    expect(getOverlay()?.style.visibility).toBe('hidden');
    teardown();
  });

  it('does not show when enable returns false', () => {
    const { renderer, graph } = setup();
    const teardown = tooltip(asRenderer(renderer), asGraph(graph), { enable: () => false });
    graph.eventEmitter.emit('node:pointerover', {
      nodeId: 'a',
      data: { label: 'A' },
      event: mouseEvent(),
    });
    vi.advanceTimersByTime(80);
    // overlay only gets created on a real show, so it should be absent or hidden
    expect(getOverlay()?.style.visibility ?? 'hidden').toBe('hidden');
    teardown();
  });

  it('shows edge content (source → target) on edge:pointerover', () => {
    const { renderer, graph } = setup();
    const teardown = tooltip(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('edge:pointerover', {
      edgeIndex: 0,
      source: 'a',
      target: 'b',
      data: {},
      event: mouseEvent(),
    });
    vi.advanceTimersByTime(80);
    expect(getOverlay()?.innerHTML).toContain('a → b');
    teardown();
  });
});

describe('tooltip — click trigger', () => {
  it('shows immediately on node:click and hides on canvas:click', () => {
    const { renderer, graph } = setup();
    const teardown = tooltip(asRenderer(renderer), asGraph(graph), { trigger: 'click' });

    graph.eventEmitter.emit('node:click', {
      nodeId: 'a',
      data: { label: 'A' },
      event: mouseEvent(),
    });
    expect(getOverlay()?.style.visibility).toBe('visible');

    graph.eventEmitter.emit('canvas:click', { event: mouseEvent() });
    expect(getOverlay()?.style.visibility).toBe('hidden');
    teardown();
  });

  it('toggles off when the same node is clicked twice', () => {
    const { renderer, graph } = setup();
    const teardown = tooltip(asRenderer(renderer), asGraph(graph), { trigger: 'click' });

    graph.eventEmitter.emit('node:click', {
      nodeId: 'a',
      data: { label: 'A' },
      event: mouseEvent(),
    });
    expect(getOverlay()?.style.visibility).toBe('visible');
    graph.eventEmitter.emit('node:click', {
      nodeId: 'a',
      data: { label: 'A' },
      event: mouseEvent(),
    });
    expect(getOverlay()?.style.visibility).toBe('hidden');
    teardown();
  });

  it('does not react to hover events in click mode', () => {
    const { renderer, graph } = setup();
    const teardown = tooltip(asRenderer(renderer), asGraph(graph), { trigger: 'click' });
    graph.eventEmitter.emit('node:pointerover', {
      nodeId: 'a',
      data: { label: 'A' },
      event: mouseEvent(),
    });
    vi.advanceTimersByTime(200);
    expect(getOverlay()?.style.visibility ?? 'hidden').toBe('hidden');
    teardown();
  });
});

describe('tooltip — custom content & class', () => {
  it('keeps a fixed body overlay in viewport coordinates when the page is scrolled', () => {
    vi.stubGlobal('scrollX', 240);
    vi.stubGlobal('scrollY', 160);
    const { renderer, graph } = setup();
    const teardown = tooltip(asRenderer(renderer), asGraph(graph), { delay: 0 });

    graph.eventEmitter.emit('node:pointerover', {
      nodeId: 'a',
      data: { label: 'A' },
      event: mouseEvent({ clientX: 100, clientY: 80 }),
    });
    vi.advanceTimersByTime(0);

    const overlay = getOverlay();
    expect(overlay?.style.position).toBe('fixed');
    expect(overlay?.style.left).toBe('110px');
    expect(overlay?.style.top).toBe('90px');
    teardown();
  });

  it('positions an overlay in custom-container local coordinates', () => {
    const { renderer, graph } = setup();
    const container = document.createElement('div');
    container.getBoundingClientRect = () =>
      ({ left: 40, top: 30, right: 340, bottom: 230, width: 300, height: 200 }) as DOMRect;
    document.body.appendChild(container);
    const teardown = tooltip(asRenderer(renderer), asGraph(graph), { container, delay: 0 });

    graph.eventEmitter.emit('node:pointerover', {
      nodeId: 'a',
      data: { label: 'A' },
      event: mouseEvent({ clientX: 100, clientY: 80 }),
    });
    vi.advanceTimersByTime(0);

    const overlay = container.querySelector<HTMLElement>('.g6lite-tooltip');
    expect(overlay?.style.left).toBe('70px');
    expect(overlay?.style.top).toBe('60px');
    teardown();
    container.remove();
  });

  it('uses a custom getContent and className', () => {
    const { renderer, graph } = setup();
    const teardown = tooltip(asRenderer(renderer), asGraph(graph), {
      className: 'custom-tip',
      getContent: (ctx) => `<b>${ctx.nodeId}</b>`,
    });
    graph.eventEmitter.emit('node:pointerover', { nodeId: 'n7', data: {}, event: mouseEvent() });
    vi.advanceTimersByTime(80);
    const el = getOverlay('custom-tip');
    expect(el).not.toBeNull();
    expect(el?.innerHTML).toBe('<b>n7</b>');
    teardown();
  });

  it('accepts an HTMLElement for safely constructed custom content', () => {
    const { renderer, graph } = setup();
    const teardown = tooltip(asRenderer(renderer), asGraph(graph), {
      getContent: (ctx) => {
        const strong = document.createElement('strong');
        strong.textContent = `<${ctx.nodeId}>`;
        return strong;
      },
    });

    graph.eventEmitter.emit('node:pointerover', { nodeId: 'n8', data: {}, event: mouseEvent() });
    vi.advanceTimersByTime(80);

    const overlay = getOverlay();
    expect(overlay?.querySelector('strong')?.textContent).toBe('<n8>');
    teardown();
  });

  it('teardown unsubscribes listeners (no overlay after teardown)', () => {
    const { renderer, graph } = setup();
    const teardown = tooltip(asRenderer(renderer), asGraph(graph));
    teardown();
    graph.eventEmitter.emit('node:pointerover', {
      nodeId: 'a',
      data: { label: 'A' },
      event: mouseEvent(),
    });
    vi.advanceTimersByTime(80);
    expect(getOverlay()).toBeNull();
  });
});
