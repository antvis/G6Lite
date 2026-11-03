import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EventEmitter } from '@src/events.js';
import type { Graph } from '@src/graph.js';
import { bindHeroHighlight } from '../../../site/src/components/homepage/hero-highlight';

function setup() {
  const events = new EventEmitter();
  const canvas = document.createElement('canvas');
  const states = new Set<string>();
  const batchSetState = vi.fn((items: Array<{ id: string; value: boolean }>) => {
    for (const { id, value } of items) {
      if (value) states.add(id);
      else states.delete(id);
    }
  });
  const graph = {
    getEdges: () => [
      { id: 'ab', source: 'a', target: 'b' },
      { id: 'bc', source: 'b', target: 'c' },
    ],
    batchSetState,
    on: events.on.bind(events),
    off: events.off.bind(events),
  };
  const destroy = bindHeroHighlight(graph as unknown as Graph, canvas);
  const over = (nodeId: string) => events.emit('node:pointerover', { nodeId });
  const leave = () => events.emit('node:pointerleave', {});
  return { events, canvas, states, batchSetState, destroy, over, leave };
}

describe('homepage hover stability', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('ignores nodes crossed quickly and highlights a settled neighborhood', () => {
    const h = setup();
    for (const id of ['a', 'b', 'c']) {
      h.over(id);
      vi.advanceTimersByTime(10);
      h.leave();
    }
    expect(h.batchSetState).not.toHaveBeenCalled();
    h.over('a');
    vi.advanceTimersByTime(19);
    expect(h.states.size).toBe(0);
    vi.advanceTimersByTime(1);
    expect(h.states).toEqual(new Set(['a', 'b', 'ab']));
    h.destroy();
  });

  it('switches neighborhoods atomically without clearing their shared nodes', () => {
    const h = setup();
    h.over('a');
    vi.advanceTimersByTime(20);
    h.batchSetState.mockClear();
    h.leave();
    vi.advanceTimersByTime(60);
    expect(h.states).toEqual(new Set(['a', 'b', 'ab']));
    h.over('c');
    vi.advanceTimersByTime(20);
    expect(h.batchSetState).toHaveBeenCalledTimes(1);
    expect(h.batchSetState.mock.calls[0][0]).not.toContainEqual({
      id: 'b',
      state: 'highlight',
      value: false,
    });
    expect(h.states).toEqual(new Set(['b', 'c', 'bc']));
    h.destroy();
  });

  it('clears after the leave grace period and ignores edge hover', () => {
    const h = setup();
    h.over('a');
    vi.advanceTimersByTime(20);
    h.leave();
    vi.advanceTimersByTime(139);
    expect(h.states.size).toBe(3);
    vi.advanceTimersByTime(1);
    expect(h.states.size).toBe(0);
    h.events.emit('edge:pointerover', { source: 'a', target: 'b', edgeIndex: 0 });
    vi.advanceTimersByTime(300);
    expect(h.states.size).toBe(0);
    h.destroy();
  });

  it('cancels pending highlights during dragging and resumes after release', () => {
    const h = setup();
    h.over('a');
    h.canvas.dispatchEvent(new Event('pointerdown'));
    h.over('c');
    vi.advanceTimersByTime(300);
    expect(h.states.size).toBe(0);
    window.dispatchEvent(new Event('pointerup'));
    h.over('c');
    vi.advanceTimersByTime(20);
    expect(h.states).toEqual(new Set(['b', 'c', 'bc']));
    h.destroy();
  });

  it('clears immediately outside the canvas and cancels all work on unmount', () => {
    const h = setup();
    h.over('a');
    vi.advanceTimersByTime(20);
    h.canvas.dispatchEvent(new MouseEvent('mouseleave'));
    expect(h.states.size).toBe(0);
    h.over('c');
    h.destroy();
    vi.advanceTimersByTime(300);
    expect(h.states.size).toBe(0);
    h.batchSetState.mockClear();
    h.over('a');
    vi.advanceTimersByTime(300);
    expect(h.batchSetState).not.toHaveBeenCalled();
  });
});
