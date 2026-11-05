import { afterEach, describe, expect, it, vi } from 'vitest';
import { brushSelect } from '@src/behaviors/brushSelect.js';
import { lassoSelect } from '@src/behaviors/lassoSelect.js';
import { EventEmitter } from '@src/events.js';
import type { Graph } from '@src/graph.js';
import type { Renderer } from '@src/renderer/renderer.js';

const cleanups: Array<() => void> = [];
afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
});

function fixture() {
  const selected = new Set<string>();
  const emitter = new EventEmitter();
  const graph = {
    eventEmitter: emitter,
    getNodes: () => [
      { id: 'a', x: 20, y: 20 },
      { id: 'b', x: 80, y: 80 },
      { id: 'outside', x: 150, y: 150 },
    ],
    findNodesByState: () => [...selected],
    setItemState: (id: string, _state: string, value: boolean) => {
      if (value) selected.add(id);
      else selected.delete(id);
    },
  } as unknown as Graph;
  // The canvas is offset from the browser origin; gestures use client coordinates.
  const renderer = {
    screenToGraph: (x: number, y: number) => [x - 200, y - 100],
  } as unknown as Renderer;
  const move = (x: number, y: number) =>
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: x + 200, clientY: y + 100 }));
  const down = (flags: MouseEventInit) =>
    emitter.emit('canvas:pointerdown', {
      event: new MouseEvent('mousedown', { button: 0, clientX: 200, clientY: 100, ...flags }),
    });
  return { selected, emitter, graph, renderer, move, down };
}

describe('selection example modifier gestures', () => {
  it('Shift brush selects contained nodes in graph coordinates and tears down its overlay', () => {
    const f = fixture();
    const end = vi.fn();
    f.emitter.on('brush:end', end);
    const teardown = brushSelect(f.renderer, f.graph, { key: 'shift', throttleMs: 0 });
    cleanups.push(teardown);
    const before = document.body.children.length;
    f.down({ shiftKey: true });
    f.move(100, 100);
    window.dispatchEvent(new MouseEvent('mouseup'));
    expect([...f.selected]).toEqual(['a', 'b']);
    expect(end).toHaveBeenLastCalledWith({ nodeIds: ['a', 'b'] });
    teardown();
    expect(document.body.children.length).toBe(before);
    f.selected.clear();
    f.down({ shiftKey: true });
    f.move(100, 100);
    window.dispatchEvent(new MouseEvent('mouseup'));
    expect(f.selected.size).toBe(0);
  });

  it.each([{ ctrlKey: true }, { metaKey: true }])(
    'Ctrl/Command lasso selects the enclosed polygon with %j',
    (flags) => {
      const f = fixture();
      const end = vi.fn();
      f.emitter.on('lasso:end', end);
      cleanups.push(lassoSelect(f.renderer, f.graph, { key: 'ctrl', throttleMs: 0 }));
      const before = document.body.children.length;
      f.down(flags);
      f.move(100, 0);
      f.move(100, 100);
      f.move(0, 100);
      f.move(0, 0);
      window.dispatchEvent(new MouseEvent('mouseup'));
      expect([...f.selected]).toEqual(['a', 'b']);
      expect(end).toHaveBeenLastCalledWith({ nodeIds: ['a', 'b'] });
      expect(document.body.children.length).toBe(before);
    },
  );

  it('unmodified drags activate neither configured selection gesture', () => {
    const f = fixture();
    cleanups.push(brushSelect(f.renderer, f.graph, { key: 'shift' }));
    cleanups.push(lassoSelect(f.renderer, f.graph, { key: 'ctrl' }));
    f.down({});
    f.move(100, 0);
    f.move(100, 100);
    f.move(0, 100);
    window.dispatchEvent(new MouseEvent('mouseup'));
    expect(f.selected.size).toBe(0);
  });
});
