import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_BEHAVIORS, resolveBehaviorOptions } from '@src/behaviors/index.js';
import { EventEmitter } from '@src/events.js';
import type { Graph } from '@src/graph.js';
import { GESTURE_CONSUME_EVENT } from '@src/interaction/gesture.js';
import type { Renderer } from '@src/renderer/renderer.js';

function asRenderer<T>(renderer: T): Renderer {
  return renderer as unknown as Renderer;
}

function asGraph<T>(graph: T): Graph {
  return graph as unknown as Graph;
}

describe('default canvas navigation behaviors', () => {
  it('enables zoom and canvas drag when behaviors is omitted', () => {
    expect(resolveBehaviorOptions()).toEqual(['zoom-canvas', 'drag-canvas']);
    expect(DEFAULT_BEHAVIORS).toEqual(['zoom-canvas', 'drag-canvas']);
  });

  it('respects an explicit empty behavior list', () => {
    expect(resolveBehaviorOptions([])).toEqual([]);
  });

  it('does not merge defaults into an explicit behavior list', () => {
    expect(resolveBehaviorOptions(['tooltip'])).toEqual(['tooltip']);
    expect(resolveBehaviorOptions(['zoom-canvas'])).toEqual(['zoom-canvas']);
  });

  it('returns a fresh default list for each graph', () => {
    const first = resolveBehaviorOptions();
    first.push('tooltip');
    expect(resolveBehaviorOptions()).toEqual(['zoom-canvas', 'drag-canvas']);
  });
});

describe('dragCanvas behavior', () => {
  it('does not pan for Shift gestures reserved by brush-select', async () => {
    const { dragCanvas } = await import('@src/behaviors/dragCanvas.js');
    const renderer = {
      getCamera: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
      screenToGraph: vi.fn((x: number, y: number) => [x, y]),
      setCamera: vi.fn(),
      scheduleRender: vi.fn(),
    };
    const graph = { eventEmitter: new EventEmitter() };
    const teardown = dragCanvas(asRenderer(renderer), asGraph(graph));

    graph.eventEmitter.emit('canvas:pointerdown', { event: mouseEvent({ shiftKey: true }) });
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 140, clientY: 140 }));

    expect(renderer.setCamera).not.toHaveBeenCalled();
    teardown();
  });

  it('still pans for an unmodified canvas drag', async () => {
    const { dragCanvas } = await import('@src/behaviors/dragCanvas.js');
    const renderer = {
      getCamera: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
      screenToGraph: vi.fn((x: number, y: number) => [x, y]),
      setCamera: vi.fn(),
      scheduleRender: vi.fn(),
    };
    const graph = { eventEmitter: new EventEmitter() };
    const teardown = dragCanvas(asRenderer(renderer), asGraph(graph));

    graph.eventEmitter.emit('canvas:pointerdown', { event: mouseEvent() });
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 140, clientY: 140 }));

    expect(renderer.setCamera).toHaveBeenCalled();
    teardown();
  });
});

// ============================================================
// Behavior tests — post-dispatcher architecture.
//
// Behaviors are now pure consumers of the InteractionDispatcher's element
// events. So these tests no longer simulate raw DOM events; they emit the
// dispatcher's normalized events on graph.eventEmitter and assert the
// behavior's side-effects (setItemState / setHighlight / emitted events).
// The dispatcher's own hit-testing is covered in interaction.test.ts.
// ============================================================

function createMockRenderer() {
  const canvas = { style: { cursor: 'default' } };
  return {
    getCanvas: () => canvas,
    pickAt: vi.fn(
      () => null as { type: 'node'; id: string } | { type: 'edge'; index: number } | null,
    ),
    getNodes: vi.fn(() => [
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 10, y: 0 },
      { id: 'c', x: 20, y: 0 },
    ]),
    getEdges: vi.fn(() => [
      { id: 'e0', source: 'a', target: 'b' },
      { id: 'e1', source: 'b', target: 'c' },
    ]),
    getNodeIdToIndex: vi.fn(
      () =>
        new Map([
          ['a', 0],
          ['b', 1],
          ['c', 2],
        ]),
    ),
    setHighlight: vi.fn(),
    getCamera: vi.fn(() => ({ zoom: 1, x: 0, y: 0 })),
    screenToGraph: vi.fn((x: number, y: number) => [x, y]),
  };
}

function createMockGraph() {
  const eventEmitter = new EventEmitter();
  const stateMap = new Map<string, Set<string>>();

  const setItemState = vi.fn((id: string, state: string, value: boolean) => {
    if (!stateMap.has(state)) stateMap.set(state, new Set());
    const set = stateMap.get(state)!;
    if (value) set.add(id);
    else set.delete(id);
  });

  return {
    eventEmitter,
    setItemState,
    getItemStates: vi.fn((id: string) => {
      const out: string[] = [];
      for (const [state, set] of stateMap) if (set.has(id)) out.push(state);
      return out;
    }),
    clearItemStates: vi.fn(),
    updateNodePosition: vi.fn(),
    getNodePosition: vi.fn((id: string) => {
      const map: Record<string, { x: number; y: number }> = {
        a: { x: 0, y: 0 },
        b: { x: 10, y: 0 },
        c: { x: 20, y: 0 },
      };
      return map[id] ?? null;
    }),
    getNodes: vi.fn(() => [
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 10, y: 0 },
      { id: 'c', x: 20, y: 0 },
    ]),
    getNeighborNodes: vi.fn(() => [] as string[]),
    getComboData: vi.fn(() => null),
    getComboChildren: vi.fn(() => ({ nodes: [] as string[], combos: [] as string[] })),
    scheduleRender: vi.fn(),
    findNodesByState: vi.fn((state: string) => [...(stateMap.get(state) ?? [])]),
    findEdgesByState: vi.fn((state: string) => [...(stateMap.get(state) ?? [])]),
  };
}

/** Build a fake MouseEvent payload for dispatcher events. */
function mouseEvent(extra: Partial<MouseEvent> = {}): MouseEvent {
  return {
    preventDefault: vi.fn(),
    clientX: 100,
    clientY: 100,
    button: 0,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    ...extra,
  } as unknown as MouseEvent;
}

// ============================================================
// clickSelect — consumes node:click / edge:click / canvas:click
// ============================================================
describe('clickSelect behavior', () => {
  it('selects a node on node:click', async () => {
    const { clickSelect } = await import('@src/behaviors/clickSelect.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();
    const selectHandler = vi.fn();
    graph.eventEmitter.on('node:selectchange', selectHandler);

    clickSelect(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('node:click', { nodeId: 'a', event: mouseEvent() });

    expect(selectHandler).toHaveBeenCalledTimes(1);
    expect(selectHandler.mock.calls[0][0].nodeId).toBe('a');
    expect(selectHandler.mock.calls[0][0].selected).toBe(true);
    expect(graph.setItemState).toHaveBeenCalledWith('a', 'selected', true);
  });

  it('deselects a node on a second node:click', async () => {
    const { clickSelect } = await import('@src/behaviors/clickSelect.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();

    clickSelect(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('node:click', { nodeId: 'a', event: mouseEvent() });
    graph.eventEmitter.emit('node:click', { nodeId: 'a', event: mouseEvent() });

    expect(graph.setItemState).toHaveBeenNthCalledWith(1, 'a', 'selected', true);
    expect(graph.setItemState).toHaveBeenNthCalledWith(2, 'a', 'selected', false);
  });

  it('clears all selections on canvas:click', async () => {
    const { clickSelect } = await import('@src/behaviors/clickSelect.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();
    const clearHandler = vi.fn();
    graph.eventEmitter.on('selection:clear', clearHandler);

    clickSelect(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('node:click', { nodeId: 'a', event: mouseEvent() });
    graph.eventEmitter.emit('canvas:click', { event: mouseEvent() });

    expect(graph.setItemState).toHaveBeenCalledWith('a', 'selected', false);
    expect(clearHandler).toHaveBeenCalledTimes(1);
  });

  it('selects an edge on edge:click', async () => {
    const { clickSelect } = await import('@src/behaviors/clickSelect.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();
    const handler = vi.fn();
    graph.eventEmitter.on('edge:selectchange', handler);

    clickSelect(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('edge:click', {
      edgeIndex: 0,
      source: 'a',
      target: 'b',
      event: mouseEvent(),
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].edgeId).toBe('e0');
    expect(graph.setItemState).toHaveBeenCalledWith('e0', 'selected', true);
  });

  it('teardown unsubscribes from click events', async () => {
    const { clickSelect } = await import('@src/behaviors/clickSelect.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();
    const handler = vi.fn();
    graph.eventEmitter.on('node:selectchange', handler);

    const teardown = clickSelect(asRenderer(renderer), asGraph(graph));
    teardown();
    graph.eventEmitter.emit('node:click', { nodeId: 'a', event: mouseEvent() });
    expect(handler).not.toHaveBeenCalled();
  });
});

// ============================================================
// hoverHighlight — consumes *:pointerover / *:pointerleave
// ============================================================
describe('hoverHighlight behavior', () => {
  it('highlights a node and its incident edges on node:pointerover', async () => {
    const { hoverHighlight } = await import('@src/behaviors/hoverHighlight.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();

    hoverHighlight(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('node:pointerover', { nodeId: 'a', event: mouseEvent() });

    expect(renderer.setHighlight).toHaveBeenCalledTimes(1);
    const arg = renderer.setHighlight.mock.calls[0][0];
    expect(arg.nodeIds.has('a')).toBe(true);
    // edge e0 (a→b) is incident to 'a'
    expect(arg.edgeIndices.has(0)).toBe(true);
    expect(graph.setItemState).toHaveBeenCalledWith('a', 'highlight', true);
    expect(graph.setItemState).toHaveBeenCalledWith('e0', 'highlight', true);
  });

  it('highlights edge endpoints on edge:pointerover', async () => {
    const { hoverHighlight } = await import('@src/behaviors/hoverHighlight.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();

    hoverHighlight(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('edge:pointerover', {
      edgeIndex: 0,
      source: 'a',
      target: 'b',
      event: mouseEvent(),
    });

    const arg = renderer.setHighlight.mock.calls[0][0];
    expect(arg.nodeIds.has('a')).toBe(true);
    expect(arg.nodeIds.has('b')).toBe(true);
    expect(arg.edgeIndices.has(0)).toBe(true);
    expect(graph.setItemState).toHaveBeenCalledWith('a', 'highlight', true);
    expect(graph.setItemState).toHaveBeenCalledWith('b', 'highlight', true);
    expect(graph.setItemState).toHaveBeenCalledWith('e0', 'highlight', true);
  });

  it('clears highlight on node:pointerleave', async () => {
    const { hoverHighlight } = await import('@src/behaviors/hoverHighlight.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();

    hoverHighlight(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('node:pointerover', { nodeId: 'a', event: mouseEvent() });
    graph.eventEmitter.emit('node:pointerleave', { nodeId: 'a', event: mouseEvent() });

    const lastArg = renderer.setHighlight.mock.calls.at(-1)![0];
    expect(lastArg.nodeIds.size).toBe(0);
    expect(lastArg.edgeIndices.size).toBe(0);
    expect(graph.setItemState).toHaveBeenCalledWith('a', 'highlight', false);
    expect(graph.setItemState).toHaveBeenCalledWith('e0', 'highlight', false);
  });

  it('applies inactive state to non-highlighted nodes and edges', async () => {
    const { hoverHighlight } = await import('@src/behaviors/hoverHighlight.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();

    hoverHighlight(asRenderer(renderer), asGraph(graph), {
      type: 'hover-highlight',
      inactiveState: 'inactive',
    });
    graph.eventEmitter.emit('edge:pointerover', {
      edgeIndex: 0,
      source: 'a',
      target: 'b',
      event: mouseEvent(),
    });

    expect(graph.setItemState).toHaveBeenCalledWith('c', 'inactive', true);
    expect(graph.setItemState).toHaveBeenCalledWith('e1', 'inactive', true);
  });

  it('freezes hover changes while a node is being dragged', async () => {
    const { hoverHighlight } = await import('@src/behaviors/hoverHighlight.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();

    hoverHighlight(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('node:dragstart', { nodeId: 'a', nodeIds: ['a'] });
    graph.eventEmitter.emit('node:pointerover', { nodeId: 'b', event: mouseEvent() });
    graph.eventEmitter.emit('edge:pointerover', {
      edgeIndex: 1,
      source: 'b',
      target: 'c',
      event: mouseEvent(),
    });

    expect(renderer.setHighlight).not.toHaveBeenCalled();
    expect(graph.setItemState).not.toHaveBeenCalled();

    graph.eventEmitter.emit('node:dragend', { nodeId: 'a', nodeIds: ['a'] });
    expect(renderer.setHighlight).not.toHaveBeenCalled();

    graph.eventEmitter.emit('node:pointerover', { nodeId: 'b', event: mouseEvent() });
    expect(renderer.setHighlight).toHaveBeenCalledTimes(1);
  });

  it('uses the same hover freeze semantics for combo dragging', async () => {
    const { hoverHighlight } = await import('@src/behaviors/hoverHighlight.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();

    hoverHighlight(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('combo:dragstart', { comboId: 'combo-a' });
    graph.eventEmitter.emit('node:pointerover', { nodeId: 'b', event: mouseEvent() });
    expect(renderer.setHighlight).not.toHaveBeenCalled();

    graph.eventEmitter.emit('combo:dragend', { comboId: 'combo-a' });
    graph.eventEmitter.emit('node:pointerover', { nodeId: 'b', event: mouseEvent() });
    expect(renderer.setHighlight).toHaveBeenCalledTimes(1);
  });

  it('does not clear an existing hover until the drag ends and the pointer moves again', async () => {
    const { hoverHighlight } = await import('@src/behaviors/hoverHighlight.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();

    hoverHighlight(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('node:pointerover', { nodeId: 'a', event: mouseEvent() });
    graph.eventEmitter.emit('node:dragstart', { nodeId: 'a', nodeIds: ['a'] });
    graph.eventEmitter.emit('node:pointerleave', { nodeId: 'a', event: mouseEvent() });

    expect(renderer.setHighlight).toHaveBeenCalledTimes(1);

    graph.eventEmitter.emit('node:dragend', { nodeId: 'a', nodeIds: ['a'] });
    expect(renderer.setHighlight).toHaveBeenCalledTimes(1);

    graph.eventEmitter.emit('node:pointerleave', { nodeId: 'a', event: mouseEvent() });
    expect(renderer.setHighlight).toHaveBeenCalledTimes(2);
    const lastArg = renderer.setHighlight.mock.calls.at(-1)![0];
    expect(lastArg.nodeIds.size).toBe(0);
    expect(lastArg.edgeIndices.size).toBe(0);
  });

  it('teardown unsubscribes', async () => {
    const { hoverHighlight } = await import('@src/behaviors/hoverHighlight.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();

    const teardown = hoverHighlight(asRenderer(renderer), asGraph(graph));
    teardown();
    graph.eventEmitter.emit('node:pointerover', { nodeId: 'a', event: mouseEvent() });
    expect(renderer.setHighlight).not.toHaveBeenCalled();
  });

  it('teardown clears active renderer and element highlight state', async () => {
    const { hoverHighlight } = await import('@src/behaviors/hoverHighlight.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();

    const teardown = hoverHighlight(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('node:pointerover', { nodeId: 'a', event: mouseEvent() });
    teardown();

    const lastArg = renderer.setHighlight.mock.calls.at(-1)![0];
    expect(lastArg.nodeIds.size).toBe(0);
    expect(lastArg.edgeIndices.size).toBe(0);
    expect(graph.setItemState).toHaveBeenCalledWith('a', 'highlight', false);
    expect(graph.setItemState).toHaveBeenCalledWith('e0', 'highlight', false);
  });
});

// ============================================================
// dragNode — gesture start from node:pointerdown / combo:pointerdown
// ============================================================
describe('dragNode behavior', () => {
  it('waits for movement beyond the threshold before emitting node:dragstart', async () => {
    const { dragNode } = await import('@src/behaviors/dragNode.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();
    const startHandler = vi.fn();
    graph.eventEmitter.on('node:dragstart', startHandler);

    dragNode(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('node:pointerdown', { nodeId: 'a', event: mouseEvent() });

    expect(startHandler).not.toHaveBeenCalled();
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 0 }));
    expect(startHandler).toHaveBeenCalledTimes(1);
    expect(startHandler.mock.calls[0][0].nodeId).toBe('a');
    expect(startHandler.mock.calls[0][0].nodeIds).toEqual(['a']);
  });

  it('consumes the pointer gesture when node dragging starts', async () => {
    const { dragNode } = await import('@src/behaviors/dragNode.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();
    const consumeHandler = vi.fn();
    graph.eventEmitter.on(GESTURE_CONSUME_EVENT, consumeHandler);

    const teardown = dragNode(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('node:pointerdown', { nodeId: 'a', event: mouseEvent() });
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 110, clientY: 100 }));

    expect(consumeHandler).toHaveBeenCalledTimes(1);
    teardown();
  });

  it('drags all selected nodes and emits dragend with the selected node ids', async () => {
    const { dragNode } = await import('@src/behaviors/dragNode.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();
    graph.setItemState('a', 'selected', true);
    graph.setItemState('b', 'selected', true);
    const endHandler = vi.fn();
    graph.eventEmitter.on('node:dragend', endHandler);

    const teardown = dragNode(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('node:pointerdown', { nodeId: 'a', event: mouseEvent() });
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 110, clientY: 105 }));
    window.dispatchEvent(new MouseEvent('mouseup'));

    expect(graph.findNodesByState).toHaveBeenCalledWith('selected');
    expect(graph.updateNodePosition).toHaveBeenNthCalledWith(1, 'a', 10, 5);
    expect(graph.updateNodePosition).toHaveBeenNthCalledWith(2, 'b', 20, 5);
    expect(endHandler).toHaveBeenCalledWith({ nodeId: 'a', nodeIds: ['a', 'b'] });
    teardown();
  });

  it('drags nested combo nodes and emits the combo drag lifecycle', async () => {
    const { dragNode } = await import('@src/behaviors/dragNode.js');
    const renderer = createMockRenderer();
    renderer.getCamera.mockReturnValue({ zoom: 2, x: 0, y: 0 });
    renderer.screenToGraph.mockImplementation((x: number, y: number) => [x / 2, y / 2]);
    const graph = createMockGraph();
    graph.getComboData.mockReturnValue({ id: 'root' });
    graph.getComboChildren.mockImplementation((comboId: string) =>
      comboId === 'root' ? { nodes: ['a'], combos: ['child'] } : { nodes: ['b'], combos: [] },
    );
    const startHandler = vi.fn();
    const dragHandler = vi.fn();
    const endHandler = vi.fn();
    graph.eventEmitter.on('combo:dragstart', startHandler);
    graph.eventEmitter.on('combo:drag', dragHandler);
    graph.eventEmitter.on('combo:dragend', endHandler);

    const teardown = dragNode(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('combo:pointerdown', { comboId: 'root', event: mouseEvent() });
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 110, clientY: 106 }));
    window.dispatchEvent(new MouseEvent('mouseup'));

    expect(graph.getComboChildren).toHaveBeenCalledWith('root');
    expect(graph.getComboChildren).toHaveBeenCalledWith('child');
    expect(graph.updateNodePosition).toHaveBeenNthCalledWith(1, 'a', 5, 3);
    expect(graph.updateNodePosition).toHaveBeenNthCalledWith(2, 'b', 15, 3);
    expect(startHandler).toHaveBeenCalledTimes(1);
    expect(dragHandler).toHaveBeenCalledWith(
      expect.objectContaining({ comboId: 'root', dx: 5, dy: 3 }),
    );
    expect(endHandler).toHaveBeenCalledWith({ comboId: 'root' });
    teardown();
  });

  it('does not emit dragend for a plain click', async () => {
    const { dragNode } = await import('@src/behaviors/dragNode.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();
    const endHandler = vi.fn();
    graph.eventEmitter.on('node:dragend', endHandler);

    const teardown = dragNode(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('node:pointerdown', { nodeId: 'a', event: mouseEvent() });
    window.dispatchEvent(new MouseEvent('mouseup'));

    expect(endHandler).not.toHaveBeenCalled();
    teardown();
  });

  it('ignores non-left-button pointerdown', async () => {
    const { dragNode } = await import('@src/behaviors/dragNode.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();
    const startHandler = vi.fn();
    graph.eventEmitter.on('node:dragstart', startHandler);

    dragNode(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('node:pointerdown', { nodeId: 'a', event: mouseEvent({ button: 2 }) });

    expect(startHandler).not.toHaveBeenCalled();
  });

  it('teardown unsubscribes from pointerdown', async () => {
    const { dragNode } = await import('@src/behaviors/dragNode.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();
    const startHandler = vi.fn();
    graph.eventEmitter.on('node:dragstart', startHandler);

    const teardown = dragNode(asRenderer(renderer), asGraph(graph));
    teardown();
    graph.eventEmitter.emit('node:pointerdown', { nodeId: 'a', event: mouseEvent() });
    expect(startHandler).not.toHaveBeenCalled();
  });
});

// ============================================================
// dragEdge — gesture start from edge:pointerdown, drop on canvas:pointerup
// ============================================================
describe('dragEdge behavior', () => {
  it('emits edge:dragstart on edge:pointerdown', async () => {
    const { dragEdge } = await import('@src/behaviors/dragEdge.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();
    const handler = vi.fn();
    graph.eventEmitter.on('edge:dragstart', handler);

    dragEdge(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('edge:pointerdown', {
      edgeIndex: 0,
      source: 'a',
      target: 'b',
      event: mouseEvent(),
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].source).toBe('a');
    expect(handler.mock.calls[0][0].target).toBe('b');
    expect(handler.mock.calls[0][0].dragEnd).toBeDefined();
  });

  it('reconnects to a node on canvas:pointerup over a node', async () => {
    const { dragEdge } = await import('@src/behaviors/dragEdge.js');
    const renderer = createMockRenderer();
    renderer.pickAt.mockReturnValue({ type: 'node', id: 'c' });
    const graph = createMockGraph();
    const endHandler = vi.fn();
    graph.eventEmitter.on('edge:dragend', endHandler);

    dragEdge(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('edge:pointerdown', {
      edgeIndex: 0,
      source: 'a',
      target: 'b',
      event: mouseEvent({ clientX: 0, clientY: 0 }), // closer to source 'a'
    });
    graph.eventEmitter.emit('canvas:pointerup', { event: mouseEvent() });

    expect(endHandler).toHaveBeenCalledTimes(1);
    expect(endHandler.mock.calls[0][0].reconnected).toBe(true);
    expect(endHandler.mock.calls[0][0].newEndpoint).toBe('c');
  });

  it('does not start drag on edge:pointerdown with non-left button', async () => {
    const { dragEdge } = await import('@src/behaviors/dragEdge.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();
    const handler = vi.fn();
    graph.eventEmitter.on('edge:dragstart', handler);

    dragEdge(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('edge:pointerdown', {
      edgeIndex: 0,
      source: 'a',
      target: 'b',
      event: mouseEvent({ button: 2 }),
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('teardown unsubscribes', async () => {
    const { dragEdge } = await import('@src/behaviors/dragEdge.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();
    const handler = vi.fn();
    graph.eventEmitter.on('edge:dragstart', handler);

    const teardown = dragEdge(asRenderer(renderer), asGraph(graph));
    teardown();
    graph.eventEmitter.emit('edge:pointerdown', {
      edgeIndex: 0,
      source: 'a',
      target: 'b',
      event: mouseEvent(),
    });
    expect(handler).not.toHaveBeenCalled();
  });
});

// ============================================================
// Graph lifecycle events (EventEmitter contract)
// ============================================================
describe('Graph lifecycle events', () => {
  it('EventEmitter supports afterrender event name', () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();
    emitter.on('afterrender', handler);
    emitter.emit('afterrender', { nodeCount: 100, edgeCount: 200 });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toEqual({ nodeCount: 100, edgeCount: 200 });
  });

  it('EventEmitter supports resize event name', () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();
    emitter.on('resize', handler);
    emitter.emit('resize', { width: 1024, height: 768 });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toEqual({ width: 1024, height: 768 });
  });

  it('EventEmitter supports destroy event name', () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();
    emitter.on('destroy', handler);
    emitter.emit('destroy');
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

// ============================================================
// brush-select / lasso-select — start from canvas:pointerdown
// ============================================================
describe('brushSelect behavior', () => {
  it('registers and tears down without error', async () => {
    const { brushSelect } = await import('@src/behaviors/brushSelect.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();
    const teardown = brushSelect(asRenderer(renderer), asGraph(graph));
    expect(typeof teardown).toBe('function');
    teardown();
  });

  it('accepts a key option', async () => {
    const { brushSelect } = await import('@src/behaviors/brushSelect.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();
    const teardown = brushSelect(asRenderer(renderer), asGraph(graph), { key: 'shift' });
    teardown();
  });

  it('does not start on node:pointerdown (only canvas/edge/combo subscribed)', async () => {
    const { brushSelect } = await import('@src/behaviors/brushSelect.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();
    const endHandler = vi.fn();
    graph.eventEmitter.on('brush:end', endHandler);

    brushSelect(asRenderer(renderer), asGraph(graph));
    // node:pointerdown is not subscribed → brush never starts → mouseup emits nothing
    graph.eventEmitter.emit('node:pointerdown', { nodeId: 'a', event: mouseEvent() });
    window.dispatchEvent(new MouseEvent('mouseup'));
    expect(endHandler).not.toHaveBeenCalled();
  });

  it('replaces the current selection with nodes inside the brush rectangle', async () => {
    const { brushSelect } = await import('@src/behaviors/brushSelect.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();
    const selectHandler = vi.fn();
    graph.eventEmitter.on('brush:select', selectHandler);
    graph.setItemState('c', 'selected', true);
    graph.setItemState.mockClear();
    const teardown = brushSelect(asRenderer(renderer), asGraph(graph), { throttleMs: 0 });

    graph.eventEmitter.emit('canvas:pointerdown', {
      event: mouseEvent({ clientX: -1, clientY: -1 }),
    });
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 15, clientY: 1 }));

    expect(graph.setItemState).toHaveBeenCalledWith('c', 'selected', false);
    expect(graph.setItemState).toHaveBeenCalledWith('a', 'selected', true);
    expect(graph.setItemState).toHaveBeenCalledWith('b', 'selected', true);
    expect(selectHandler).toHaveBeenCalledWith({ nodeIds: ['a', 'b'] });
    teardown();
  });

  it('cancels pending throttled selection on teardown', async () => {
    vi.useFakeTimers();
    try {
      const { brushSelect } = await import('@src/behaviors/brushSelect.js');
      const renderer = createMockRenderer();
      const graph = createMockGraph();
      const teardown = brushSelect(asRenderer(renderer), asGraph(graph));

      graph.eventEmitter.emit('canvas:pointerdown', { event: mouseEvent() });
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 120, clientY: 120 }));

      expect(vi.getTimerCount()).toBe(1);
      teardown();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('cancels pending throttled selection before the final mouseup selection', async () => {
    vi.useFakeTimers();
    try {
      const { brushSelect } = await import('@src/behaviors/brushSelect.js');
      const renderer = createMockRenderer();
      const graph = createMockGraph();
      const endHandler = vi.fn();
      graph.eventEmitter.on('brush:end', endHandler);
      const teardown = brushSelect(asRenderer(renderer), asGraph(graph));

      graph.eventEmitter.emit('canvas:pointerdown', { event: mouseEvent() });
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 120, clientY: 120 }));
      expect(vi.getTimerCount()).toBe(1);

      window.dispatchEvent(new MouseEvent('mouseup'));
      expect(vi.getTimerCount()).toBe(0);
      expect(endHandler).toHaveBeenCalledTimes(1);
      teardown();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('lassoSelect behavior', () => {
  it('registers and tears down without error', async () => {
    const { lassoSelect } = await import('@src/behaviors/lassoSelect.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();
    const teardown = lassoSelect(asRenderer(renderer), asGraph(graph));
    expect(typeof teardown).toBe('function');
    teardown();
  });

  it('accepts a key option', async () => {
    const { lassoSelect } = await import('@src/behaviors/lassoSelect.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();
    const teardown = lassoSelect(asRenderer(renderer), asGraph(graph), { key: 'ctrl' });
    teardown();
  });

  it('starts on canvas:pointerdown and selects on mouseup', async () => {
    const { lassoSelect } = await import('@src/behaviors/lassoSelect.js');
    const renderer = createMockRenderer();
    const graph = createMockGraph();
    const endHandler = vi.fn();
    graph.eventEmitter.on('lasso:end', endHandler);

    lassoSelect(asRenderer(renderer), asGraph(graph));
    graph.eventEmitter.emit('canvas:pointerdown', { event: mouseEvent() });
    window.dispatchEvent(new MouseEvent('mouseup'));
    expect(endHandler).toHaveBeenCalledTimes(1);
  });
});

// ============================================================
// Point-in-polygon (lasso helper, ray-casting)
// ============================================================
describe('pointInPolygon utility', () => {
  it('detects a point inside a rectangle', () => {
    const polygon = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    function pointInPolygon(px: number, py: number, poly: Array<{ x: number; y: number }>) {
      let inside = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i].x,
          yi = poly[i].y;
        const xj = poly[j].x,
          yj = poly[j].y;
        const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    }
    expect(pointInPolygon(5, 5, polygon)).toBe(true);
    expect(pointInPolygon(0, 0, polygon)).toBe(true); // boundary
    expect(pointInPolygon(15, 5, polygon)).toBe(false);
    expect(pointInPolygon(-1, -1, polygon)).toBe(false);
  });
});
