import { describe, expect, it, vi } from 'vitest';
import { clickSelect } from '@src/behaviors/clickSelect.js';
import { dragNode } from '@src/behaviors/dragNode.js';
import { EventEmitter } from '@src/events.js';
import type { Graph } from '@src/graph.js';
import { attachInteraction } from '@src/interaction/dispatcher.js';
import { GESTURE_CONSUME_EVENT } from '@src/interaction/gesture.js';
import type { Renderer } from '@src/renderer/renderer.js';

// ============================================================
// InteractionDispatcher — the single source of pointer hit-testing
// and element-event dispatch. Tests drive a real jsdom canvas and a
// mock renderer whose pickAt result we steer per event.
// ============================================================

type Pick = { type: 'node'; id: string } | { type: 'edge'; index: number } | null;

function asRenderer<T>(renderer: T): Renderer {
  return renderer as unknown as Renderer;
}

function asGraph<T>(graph: T): Graph {
  return graph as unknown as Graph;
}

function setup(initialPick: Pick = null) {
  let pick: Pick = initialPick;
  const selectedNodeIds = new Set<string>();
  const canvas = document.createElement('canvas');
  const renderer = {
    getCanvas: () => canvas,
    pickAt: vi.fn(() => pick),
    getNodes: vi.fn(() => [
      { id: 'a', x: 0, y: 0, data: { label: 'A' } },
      { id: 'b', x: 10, y: 0, data: { label: 'B' } },
    ]),
    getEdges: vi.fn(() => [{ id: 'e0', source: 'a', target: 'b', data: { label: 'E0' } }]),
    getNodeIdToIndex: vi.fn(
      () =>
        new Map([
          ['a', 0],
          ['b', 1],
        ]),
    ),
    getCamera: vi.fn(() => ({ zoom: 1, x: 0, y: 0 })),
    setPickingSuspended: vi.fn(),
  };
  const graph = {
    eventEmitter: new EventEmitter(),
    getItemStates: vi.fn((id: string) => (selectedNodeIds.has(id) ? ['selected'] : [])),
    findNodesByState: vi.fn((state: string) => (state === 'selected' ? [...selectedNodeIds] : [])),
    findEdgesByState: vi.fn(() => [] as string[]),
    getNodePosition: vi.fn((id: string) =>
      id === 'a' ? { x: 0, y: 0 } : id === 'b' ? { x: 10, y: 0 } : null,
    ),
    updateNodePosition: vi.fn(),
    setItemState: vi.fn((id: string, state: string, value: boolean) => {
      if (state !== 'selected') return;
      if (value) selectedNodeIds.add(id);
      else selectedNodeIds.delete(id);
    }),
  };
  const teardown = attachInteraction(asRenderer(renderer), asGraph(graph));
  return {
    canvas,
    renderer,
    graph,
    emitter: graph.eventEmitter,
    selectedNodeIds,
    teardown,
    setPick(p: Pick) {
      pick = p;
    },
  };
}

function fire(canvas: HTMLCanvasElement, type: string, init: MouseEventInit = {}) {
  const Ctor = type === 'wheel' ? WheelEvent : MouseEvent;
  const ev = new Ctor(type, {
    clientX: 50,
    clientY: 50,
    button: 0,
    bubbles: true,
    ...init,
  });
  canvas.dispatchEvent(ev);
  return ev;
}

describe('InteractionDispatcher — hover state machine', () => {
  it('emits node:pointerover with nodeId + data when entering a node', () => {
    const t = setup({ type: 'node', id: 'a' });
    const over = vi.fn();
    t.emitter.on('node:pointerover', over);

    fire(t.canvas, 'mousemove');

    expect(over).toHaveBeenCalledTimes(1);
    expect(over.mock.calls[0][0].nodeId).toBe('a');
    expect(over.mock.calls[0][0].data).toEqual({ label: 'A' });
    t.teardown();
  });

  it('emits pointermove (not a second pointerover) on the same node', () => {
    const t = setup({ type: 'node', id: 'a' });
    const over = vi.fn();
    const move = vi.fn();
    t.emitter.on('node:pointerover', over);
    t.emitter.on('node:pointermove', move);

    fire(t.canvas, 'mousemove');
    fire(t.canvas, 'mousemove');

    expect(over).toHaveBeenCalledTimes(1);
    expect(move).toHaveBeenCalledTimes(2);
    t.teardown();
  });

  it('leaves the old node and enters the new when switching nodes', () => {
    const t = setup({ type: 'node', id: 'a' });
    const leave = vi.fn();
    const over = vi.fn();
    t.emitter.on('node:pointerleave', leave);
    t.emitter.on('node:pointerover', over);

    fire(t.canvas, 'mousemove'); // enter a
    t.setPick({ type: 'node', id: 'b' });
    fire(t.canvas, 'mousemove'); // leave a, enter b

    expect(leave).toHaveBeenCalledTimes(1);
    expect(leave.mock.calls[0][0].nodeId).toBe('a');
    expect(over).toHaveBeenCalledTimes(2);
    expect(over.mock.calls[1][0].nodeId).toBe('b');
    t.teardown();
  });

  it('emits canvas:pointermove and leaves the node when moving to empty space', () => {
    const t = setup({ type: 'node', id: 'a' });
    const leave = vi.fn();
    const canvasMove = vi.fn();
    t.emitter.on('node:pointerleave', leave);
    t.emitter.on('canvas:pointermove', canvasMove);

    fire(t.canvas, 'mousemove'); // enter a
    t.setPick(null);
    fire(t.canvas, 'mousemove'); // to empty

    expect(leave).toHaveBeenCalledTimes(1);
    expect(canvasMove).toHaveBeenCalledTimes(1);
    t.teardown();
  });

  it('emits edge:pointerover with source/target/edgeId/edgeIndex', () => {
    const t = setup({ type: 'edge', index: 0 });
    const over = vi.fn();
    t.emitter.on('edge:pointerover', over);

    fire(t.canvas, 'mousemove');

    expect(over).toHaveBeenCalledTimes(1);
    expect(over.mock.calls[0][0]).toMatchObject({
      edgeId: 'e0',
      edgeIndex: 0,
      source: 'a',
      target: 'b',
    });
    t.teardown();
  });

  it('leaves the hovered element on canvas mouseleave', () => {
    const t = setup({ type: 'node', id: 'a' });
    const leave = vi.fn();
    t.emitter.on('node:pointerleave', leave);

    fire(t.canvas, 'mousemove');
    t.canvas.dispatchEvent(new MouseEvent('mouseleave'));

    expect(leave).toHaveBeenCalledTimes(1);
    expect(leave.mock.calls[0][0].nodeId).toBe('a');
    t.teardown();
  });
});

describe('InteractionDispatcher — press / click / wheel', () => {
  it('uses graph and renderer coordinate converters in event payloads', () => {
    const graphCoordinates = setup({ type: 'node', id: 'a' });
    const graphScreenToGraph = vi.fn(() => ({ x: 7, y: 8 }));
    (
      graphCoordinates.graph as typeof graphCoordinates.graph & {
        screenToGraph: typeof graphScreenToGraph;
      }
    ).screenToGraph = graphScreenToGraph;
    const graphClick = vi.fn();
    graphCoordinates.emitter.on('node:click', graphClick);

    fire(graphCoordinates.canvas, 'click', { clientX: 30, clientY: 40 });

    expect(graphScreenToGraph).toHaveBeenCalledWith(30, 40);
    expect(graphClick.mock.calls[0][0].graph).toEqual({ x: 7, y: 8 });
    graphCoordinates.teardown();

    const rendererCoordinates = setup({ type: 'node', id: 'a' });
    const rendererScreenToGraph = vi.fn(() => [9, 10] as [number, number]);
    (
      rendererCoordinates.renderer as typeof rendererCoordinates.renderer & {
        screenToGraph: typeof rendererScreenToGraph;
      }
    ).screenToGraph = rendererScreenToGraph;
    const rendererClick = vi.fn();
    rendererCoordinates.emitter.on('node:click', rendererClick);

    fire(rendererCoordinates.canvas, 'click', { clientX: 60, clientY: 70 });

    expect(rendererScreenToGraph).toHaveBeenCalledWith(60, 70);
    expect(rendererClick.mock.calls[0][0].graph).toEqual({ x: 9, y: 10 });
    rendererCoordinates.teardown();
  });

  it('emits node:pointerdown when pressing on a node', () => {
    const t = setup({ type: 'node', id: 'a' });
    const down = vi.fn();
    t.emitter.on('node:pointerdown', down);
    fire(t.canvas, 'mousedown');
    expect(down).toHaveBeenCalledTimes(1);
    expect(down.mock.calls[0][0].nodeId).toBe('a');
    t.teardown();
  });

  it('emits canvas:pointerdown when pressing empty space', () => {
    const t = setup(null);
    const down = vi.fn();
    t.emitter.on('canvas:pointerdown', down);
    fire(t.canvas, 'mousedown');
    expect(down).toHaveBeenCalledTimes(1);
    t.teardown();
  });

  it('emits node:click / edge:click / canvas:click by hit priority', () => {
    const node = setup({ type: 'node', id: 'a' });
    const nodeClick = vi.fn();
    node.emitter.on('node:click', nodeClick);
    fire(node.canvas, 'click');
    expect(nodeClick).toHaveBeenCalledTimes(1);
    node.teardown();

    const edge = setup({ type: 'edge', index: 0 });
    const edgeClick = vi.fn();
    edge.emitter.on('edge:click', edgeClick);
    fire(edge.canvas, 'click');
    expect(edgeClick).toHaveBeenCalledTimes(1);
    edge.teardown();

    const blank = setup(null);
    const canvasClick = vi.fn();
    blank.emitter.on('canvas:click', canvasClick);
    fire(blank.canvas, 'click');
    expect(canvasClick).toHaveBeenCalledTimes(1);
    blank.teardown();
  });

  it('suppresses the click generated after a drag gesture', () => {
    const t = setup(null);
    const canvasClick = vi.fn();
    t.emitter.on('canvas:click', canvasClick);

    fire(t.canvas, 'mousedown', { clientX: 10, clientY: 10 });
    window.dispatchEvent(new MouseEvent('mouseup', { clientX: 30, clientY: 30 }));
    fire(t.canvas, 'click', { clientX: 30, clientY: 30 });

    expect(canvasClick).not.toHaveBeenCalled();
    t.teardown();
  });

  it('suppresses click after an explicitly consumed gesture even without mouseup movement', () => {
    const t = setup({ type: 'node', id: 'a' });
    const nodeClick = vi.fn();
    t.emitter.on('node:click', nodeClick);

    fire(t.canvas, 'mousedown', { clientX: 10, clientY: 10 });
    t.emitter.emit(GESTURE_CONSUME_EVENT);
    t.setPick({ type: 'node', id: 'b' });
    window.dispatchEvent(new MouseEvent('mouseup', { clientX: 10, clientY: 10 }));
    fire(t.canvas, 'click', { clientX: 10, clientY: 10 });

    expect(nodeClick).not.toHaveBeenCalled();
    expect(t.renderer.pickAt).toHaveBeenCalledTimes(1);
    t.teardown();
  });

  it('skips hover picking after drag consumes the gesture and resumes after mouseup', () => {
    const t = setup({ type: 'node', id: 'a' });
    const over = vi.fn();
    t.emitter.on('node:pointerover', over);

    fire(t.canvas, 'mousedown', { clientX: 10, clientY: 10 });
    expect(t.renderer.pickAt).toHaveBeenCalledTimes(1);

    t.emitter.emit(GESTURE_CONSUME_EVENT);
    expect(t.renderer.setPickingSuspended).toHaveBeenCalledWith(true);
    fire(t.canvas, 'mousemove', { clientX: 20, clientY: 20 });
    fire(t.canvas, 'mousemove', { clientX: 30, clientY: 30 });
    expect(t.renderer.pickAt).toHaveBeenCalledTimes(1);
    expect(over).not.toHaveBeenCalled();

    window.dispatchEvent(new MouseEvent('mouseup', { clientX: 30, clientY: 30 }));
    expect(t.renderer.setPickingSuspended).toHaveBeenLastCalledWith(false);
    fire(t.canvas, 'mousemove', { clientX: 31, clientY: 31 });
    expect(t.renderer.pickAt).toHaveBeenCalledTimes(2);
    expect(over).toHaveBeenCalledTimes(1);
    t.teardown();
  });

  it('does not select B when A is dragged onto B', () => {
    const t = setup({ type: 'node', id: 'a' });
    const teardownDrag = dragNode(asRenderer(t.renderer), asGraph(t.graph));
    const teardownSelect = clickSelect(asRenderer(t.renderer), asGraph(t.graph));

    fire(t.canvas, 'mousedown', { clientX: 10, clientY: 10 });
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 20, clientY: 20 }));
    t.setPick({ type: 'node', id: 'b' });
    window.dispatchEvent(new MouseEvent('mouseup', { clientX: 20, clientY: 20 }));
    fire(t.canvas, 'click', { clientX: 20, clientY: 20 });

    expect(t.graph.updateNodePosition).toHaveBeenCalled();
    expect(t.selectedNodeIds.has('b')).toBe(false);

    teardownSelect();
    teardownDrag();
    t.teardown();
  });

  it('only consumes the click associated with the drag gesture', () => {
    const t = setup({ type: 'node', id: 'a' });
    const nodeClick = vi.fn();
    t.emitter.on('node:click', nodeClick);

    fire(t.canvas, 'mousedown', { clientX: 10, clientY: 10 });
    t.emitter.emit(GESTURE_CONSUME_EVENT);
    window.dispatchEvent(new MouseEvent('mouseup', { clientX: 10, clientY: 10 }));
    fire(t.canvas, 'click', { clientX: 10, clientY: 10 });

    fire(t.canvas, 'mousedown', { clientX: 10, clientY: 10 });
    window.dispatchEvent(new MouseEvent('mouseup', { clientX: 10, clientY: 10 }));
    fire(t.canvas, 'click', { clientX: 10, clientY: 10 });

    expect(nodeClick).toHaveBeenCalledTimes(1);
    t.teardown();
  });

  it('keeps click dispatch for movement within the click threshold', () => {
    const t = setup(null);
    const canvasClick = vi.fn();
    t.emitter.on('canvas:click', canvasClick);

    fire(t.canvas, 'mousedown', { clientX: 10, clientY: 10 });
    window.dispatchEvent(new MouseEvent('mouseup', { clientX: 12, clientY: 11 }));
    fire(t.canvas, 'click', { clientX: 12, clientY: 11 });

    expect(canvasClick).toHaveBeenCalledTimes(1);
    t.teardown();
  });

  it('emits node:wheel over a node and canvas:wheel over empty space', () => {
    const t = setup({ type: 'node', id: 'a' });
    const nodeWheel = vi.fn();
    t.emitter.on('node:wheel', nodeWheel);
    fire(t.canvas, 'wheel');
    expect(nodeWheel).toHaveBeenCalledTimes(1);
    t.teardown();

    const blank = setup(null);
    const canvasWheel = vi.fn();
    blank.emitter.on('canvas:wheel', canvasWheel);
    fire(blank.canvas, 'wheel');
    expect(canvasWheel).toHaveBeenCalledTimes(1);
    blank.teardown();
  });

  it('emits canvas:pointerup on window mouseup', () => {
    const t = setup(null);
    const up = vi.fn();
    t.emitter.on('canvas:pointerup', up);
    window.dispatchEvent(new MouseEvent('mouseup'));
    expect(up).toHaveBeenCalledTimes(1);
    t.teardown();
  });
});

describe('InteractionDispatcher — teardown', () => {
  it('stops dispatching after teardown', () => {
    const t = setup({ type: 'node', id: 'a' });
    const over = vi.fn();
    const click = vi.fn();
    t.emitter.on('node:pointerover', over);
    t.emitter.on('node:click', click);

    t.teardown();
    fire(t.canvas, 'mousemove');
    fire(t.canvas, 'click');
    window.dispatchEvent(new MouseEvent('mouseup'));

    expect(over).not.toHaveBeenCalled();
    expect(click).not.toHaveBeenCalled();
  });
});
