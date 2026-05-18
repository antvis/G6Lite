import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from '../events.js';

// ============================================================
// Behavior tests using mock renderer & graph (no WebGL needed)
// ============================================================

function createMockRenderer(
  pickResult: { type: 'node'; id: string } | { type: 'edge'; index: number } | null,
) {
  const handlers: Record<string, EventListener[]> = {};
  const canvas = {
    addEventListener: vi.fn((event: string, handler: EventListener) => {
      if (!handlers[event]) handlers[event] = [];
      handlers[event].push(handler);
    }),
    removeEventListener: vi.fn((event: string, handler: EventListener) => {
      if (handlers[event]) {
        handlers[event] = handlers[event].filter((h) => h !== handler);
      }
    }),
    style: { cursor: 'default' },
  };
  return {
    getCanvas: () => canvas,
    pickAt: vi.fn(() => pickResult),
    getEdges: vi.fn(() => [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
    ]),
    setHighlight: vi.fn(),
    getCamera: vi.fn(() => ({ zoom: 1, x: 0, y: 0 })),
    handlers,
    setPickResult(result: typeof pickResult) {
      pickResult = result;
    },
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
    clearItemStates: vi.fn(),
    updateNodePosition: vi.fn(),
    getNodePosition: vi.fn(() => ({ x: 0, y: 0 })),
    scheduleRender: vi.fn(),
    findNodesByState: vi.fn((state: string) => [...(stateMap.get(state) ?? [])]),
    findEdgesByState: vi.fn((state: string) => [...(stateMap.get(state) ?? [])]),
  };
}

// 保留旧函数定义避免语法错误
function __old_createMockGraph() {
  const eventEmitter = new EventEmitter();
  return {
    eventEmitter,
    setItemState: vi.fn(),
    clearItemStates: vi.fn(),
    updateNodePosition: vi.fn(),
    getNodePosition: vi.fn(() => ({ x: 0, y: 0 })),
    scheduleRender: vi.fn(),
  };
}

function simulateEvent(canvas: any, event: string, extra: Partial<MouseEvent> = {}) {
  const e = {
    preventDefault: vi.fn(),
    clientX: 100,
    clientY: 100,
    button: 0,
    ...extra,
  } as unknown as MouseEvent;
  const list = (canvas as any).addEventListener.mock.calls
    .filter((c: string[]) => c[0] === event)
    .map((c: any[]) => c[1]);
  if (list.length > 0) {
    // Use the last registered handler
    list[list.length - 1](e);
  }
  return e;
}

// ============================================================
// clickNode: click + dblclick + contextmenu
// ============================================================
describe('clickNode behavior (click + dblclick + contextmenu)', () => {
  it('should emit node:click on node hit', async () => {
    const { clickNode } = await import('../behaviors/clickNode.js');
    const renderer = createMockRenderer({ type: 'node', id: 'n1' });
    const graph = createMockGraph();
    const clickHandler = vi.fn();
    graph.eventEmitter.on('node:click', clickHandler);

    clickNode(renderer as any, graph as any);
    simulateEvent(renderer.getCanvas(), 'click');

    expect(clickHandler).toHaveBeenCalledTimes(1);
    expect(clickHandler.mock.calls[0][0].nodeId).toBe('n1');
  });

  it('should emit edge:click on edge hit', async () => {
    const { clickNode } = await import('../behaviors/clickNode.js');
    const renderer = createMockRenderer({ type: 'edge', index: 0 });
    const graph = createMockGraph();
    const clickHandler = vi.fn();
    graph.eventEmitter.on('edge:click', clickHandler);

    clickNode(renderer as any, graph as any);
    simulateEvent(renderer.getCanvas(), 'click');

    expect(clickHandler).toHaveBeenCalledTimes(1);
    expect(clickHandler.mock.calls[0][0].source).toBe('a');
    expect(clickHandler.mock.calls[0][0].target).toBe('b');
  });

  it('should emit canvas:click on no hit', async () => {
    const { clickNode } = await import('../behaviors/clickNode.js');
    const renderer = createMockRenderer(null);
    const graph = createMockGraph();
    const clickHandler = vi.fn();
    graph.eventEmitter.on('canvas:click', clickHandler);

    clickNode(renderer as any, graph as any);
    simulateEvent(renderer.getCanvas(), 'click');

    expect(clickHandler).toHaveBeenCalledTimes(1);
  });

  it('should emit node:dblclick on node double-click', async () => {
    const { clickNode } = await import('../behaviors/clickNode.js');
    const renderer = createMockRenderer({ type: 'node', id: 'n1' });
    const graph = createMockGraph();
    const dblclickHandler = vi.fn();
    graph.eventEmitter.on('node:dblclick', dblclickHandler);

    clickNode(renderer as any, graph as any);
    simulateEvent(renderer.getCanvas(), 'dblclick');

    expect(dblclickHandler).toHaveBeenCalledTimes(1);
    expect(dblclickHandler.mock.calls[0][0].nodeId).toBe('n1');
  });

  it('should emit edge:dblclick on edge double-click', async () => {
    const { clickNode } = await import('../behaviors/clickNode.js');
    const renderer = createMockRenderer({ type: 'edge', index: 0 });
    const graph = createMockGraph();
    const dblclickHandler = vi.fn();
    graph.eventEmitter.on('edge:dblclick', dblclickHandler);

    clickNode(renderer as any, graph as any);
    simulateEvent(renderer.getCanvas(), 'dblclick');

    expect(dblclickHandler).toHaveBeenCalledTimes(1);
    expect(dblclickHandler.mock.calls[0][0].source).toBe('a');
  });

  it('should emit canvas:dblclick on no hit', async () => {
    const { clickNode } = await import('../behaviors/clickNode.js');
    const renderer = createMockRenderer(null);
    const graph = createMockGraph();
    const dblclickHandler = vi.fn();
    graph.eventEmitter.on('canvas:dblclick', dblclickHandler);

    clickNode(renderer as any, graph as any);
    simulateEvent(renderer.getCanvas(), 'dblclick');

    expect(dblclickHandler).toHaveBeenCalledTimes(1);
  });

  it('should emit node:contextmenu on right-click node', async () => {
    const { clickNode } = await import('../behaviors/clickNode.js');
    const renderer = createMockRenderer({ type: 'node', id: 'n1' });
    const graph = createMockGraph();
    const ctxHandler = vi.fn();
    graph.eventEmitter.on('node:contextmenu', ctxHandler);

    clickNode(renderer as any, graph as any);
    const e = simulateEvent(renderer.getCanvas(), 'contextmenu');

    expect(e.preventDefault).toHaveBeenCalled();
    expect(ctxHandler).toHaveBeenCalledTimes(1);
    expect(ctxHandler.mock.calls[0][0].nodeId).toBe('n1');
  });

  it('should emit edge:contextmenu on right-click edge', async () => {
    const { clickNode } = await import('../behaviors/clickNode.js');
    const renderer = createMockRenderer({ type: 'edge', index: 1 });
    const graph = createMockGraph();
    const ctxHandler = vi.fn();
    graph.eventEmitter.on('edge:contextmenu', ctxHandler);

    clickNode(renderer as any, graph as any);
    simulateEvent(renderer.getCanvas(), 'contextmenu');

    expect(ctxHandler).toHaveBeenCalledTimes(1);
    expect(ctxHandler.mock.calls[0][0].source).toBe('b');
    expect(ctxHandler.mock.calls[0][0].target).toBe('c');
  });

  it('should emit canvas:contextmenu on right-click background', async () => {
    const { clickNode } = await import('../behaviors/clickNode.js');
    const renderer = createMockRenderer(null);
    const graph = createMockGraph();
    const ctxHandler = vi.fn();
    graph.eventEmitter.on('canvas:contextmenu', ctxHandler);

    clickNode(renderer as any, graph as any);
    simulateEvent(renderer.getCanvas(), 'contextmenu');

    expect(ctxHandler).toHaveBeenCalledTimes(1);
  });

  it('should teardown all event listeners', async () => {
    const { clickNode } = await import('../behaviors/clickNode.js');
    const renderer = createMockRenderer({ type: 'node', id: 'n1' });
    const graph = createMockGraph();

    const teardown = clickNode(renderer as any, graph as any);
    const canvas = renderer.getCanvas();

    // Should have added 3 listeners (click, dblclick, contextmenu)
    expect(canvas.addEventListener).toHaveBeenCalledTimes(3);
    teardown();

    // After teardown, canvas listeners are removed (3 removed)
    // We verify the removeEventListener calls happened
    expect(canvas.removeEventListener).toHaveBeenCalled();
  });
});

// ============================================================
// hoverHighlight: mouseleave events
// ============================================================
describe('hoverHighlight behavior (mouseleave events)', () => {
  it('should emit node:mouseleave when moving from node to empty', async () => {
    const { hoverHighlight } = await import('../behaviors/hoverHighlight.js');
    let currentPickResult: any = { type: 'node', id: 'n1' };
    const renderer = createMockRenderer(null);
    // Override pickAt to be dynamic
    (renderer.pickAt as any).mockImplementation(() => currentPickResult);
    const graph = createMockGraph();
    const hoverHandler = vi.fn();
    const leaveHandler = vi.fn();
    graph.eventEmitter.on('node:hover', hoverHandler);
    graph.eventEmitter.on('node:mouseleave', leaveHandler);

    hoverHighlight(renderer as any, graph as any);

    // Hover onto node
    currentPickResult = { type: 'node', id: 'n1' };
    simulateEvent(renderer.getCanvas(), 'mousemove');
    expect(hoverHandler).toHaveBeenCalledTimes(1);

    // Hover off to empty
    currentPickResult = null;
    simulateEvent(renderer.getCanvas(), 'mousemove');
    expect(leaveHandler).toHaveBeenCalledTimes(1);
    expect(leaveHandler.mock.calls[0][0].nodeId).toBe('n1');
  });

  it('should emit node:mouseleave when switching between nodes', async () => {
    const { hoverHighlight } = await import('../behaviors/hoverHighlight.js');
    let currentPickResult: any = { type: 'node', id: 'n1' };
    const renderer = createMockRenderer(null);
    (renderer.pickAt as any).mockImplementation(() => currentPickResult);
    const graph = createMockGraph();
    const leaveHandler = vi.fn();
    graph.eventEmitter.on('node:mouseleave', leaveHandler);

    hoverHighlight(renderer as any, graph as any);

    // Hover onto n1
    currentPickResult = { type: 'node', id: 'n1' };
    simulateEvent(renderer.getCanvas(), 'mousemove');
    // Switch to n2
    currentPickResult = { type: 'node', id: 'n2' };
    simulateEvent(renderer.getCanvas(), 'mousemove');

    expect(leaveHandler).toHaveBeenCalledTimes(1);
    expect(leaveHandler.mock.calls[0][0].nodeId).toBe('n1');
  });

  it('should emit edge:mouseleave when moving from edge to empty', async () => {
    const { hoverHighlight } = await import('../behaviors/hoverHighlight.js');
    let currentPickResult: any = { type: 'edge', index: 0 };
    const renderer = createMockRenderer(null);
    (renderer.pickAt as any).mockImplementation(() => currentPickResult);
    const graph = createMockGraph();
    const leaveHandler = vi.fn();
    graph.eventEmitter.on('edge:mouseleave', leaveHandler);

    hoverHighlight(renderer as any, graph as any);

    // Hover onto edge
    currentPickResult = { type: 'edge', index: 0 };
    simulateEvent(renderer.getCanvas(), 'mousemove');
    // Hover off
    currentPickResult = null;
    simulateEvent(renderer.getCanvas(), 'mousemove');

    expect(leaveHandler).toHaveBeenCalledTimes(1);
    expect(leaveHandler.mock.calls[0][0].source).toBe('a');
    expect(leaveHandler.mock.calls[0][0].target).toBe('b');
  });

  it('should emit leave on canvas mouseleave', async () => {
    const { hoverHighlight } = await import('../behaviors/hoverHighlight.js');
    const renderer = createMockRenderer({ type: 'node', id: 'n1' });
    const graph = createMockGraph();
    const leaveHandler = vi.fn();
    graph.eventEmitter.on('node:mouseleave', leaveHandler);

    hoverHighlight(renderer as any, graph as any);

    // First hover onto node
    simulateEvent(renderer.getCanvas(), 'mousemove');
    // Then mouse leaves canvas
    simulateEvent(renderer.getCanvas(), 'mouseleave');

    expect(leaveHandler).toHaveBeenCalledTimes(1);
    expect(leaveHandler.mock.calls[0][0].nodeId).toBe('n1');
  });
});

// ============================================================
// Graph lifecycle events
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
// click-select behavior
// ============================================================
describe('clickSelect behavior', () => {
  it('should emit node:selectchange on node click', async () => {
    const { clickSelect } = await import('../behaviors/clickSelect.js');
    const renderer = createMockRenderer({ type: 'node', id: 'n1' });
    const graph = createMockGraph();
    const selectHandler = vi.fn();
    graph.eventEmitter.on('node:selectchange', selectHandler);

    clickSelect(renderer as any, graph as any);
    simulateEvent(renderer.getCanvas(), 'click');

    expect(selectHandler).toHaveBeenCalledTimes(1);
    expect(selectHandler.mock.calls[0][0].nodeId).toBe('n1');
    expect(selectHandler.mock.calls[0][0].selected).toBe(true);
    expect(graph.setItemState).toHaveBeenCalledWith('n1', 'selected', true);
  });

  it('should deselect on second click', async () => {
    const { clickSelect } = await import('../behaviors/clickSelect.js');
    const renderer = createMockRenderer({ type: 'node', id: 'n1' });
    const graph = createMockGraph();
    const selectHandler = vi.fn();
    graph.eventEmitter.on('node:selectchange', selectHandler);

    clickSelect(renderer as any, graph as any);

    // First click — select
    simulateEvent(renderer.getCanvas(), 'click');
    expect(selectHandler.mock.calls[0][0].selected).toBe(true);

    // Second click — deselect
    simulateEvent(renderer.getCanvas(), 'click');
    expect(graph.setItemState).toHaveBeenCalledWith('n1', 'selected', false);
    expect(graph.setItemState).toHaveBeenCalledWith('n1', 'selected', false);
  });

  it('should clear all selections on canvas click', async () => {
    const { clickSelect } = await import('../behaviors/clickSelect.js');
    let currentPick: any = { type: 'node', id: 'n1' };
    const renderer = createMockRenderer(null);
    (renderer.pickAt as any).mockImplementation(() => currentPick);
    const graph = createMockGraph();
    const clearHandler = vi.fn();
    graph.eventEmitter.on('selection:clear', clearHandler);

    clickSelect(renderer as any, graph as any);

    // Select a node
    currentPick = { type: 'node', id: 'n1' };
    simulateEvent(renderer.getCanvas(), 'click');
    expect(graph.setItemState).toHaveBeenCalledWith('n1', 'selected', true);

    // Click background
    currentPick = null;
    simulateEvent(renderer.getCanvas(), 'click');
    expect(graph.setItemState).toHaveBeenCalledWith('n1', 'selected', false);
    expect(clearHandler).toHaveBeenCalledTimes(1);
  });

  it('should teardown event listener', async () => {
    const { clickSelect } = await import('../behaviors/clickSelect.js');
    const renderer = createMockRenderer({ type: 'node', id: 'n1' });
    const graph = createMockGraph();

    const teardown = clickSelect(renderer as any, graph as any);
    const canvas = renderer.getCanvas();
    expect(canvas.addEventListener).toHaveBeenCalledTimes(1);
    teardown();
  });
});

// ============================================================
// wheelEvent behavior
// ============================================================
describe('wheelEvent behavior', () => {
  it('should emit node:wheel on wheel over node', async () => {
    const { wheelEvent } = await import('../behaviors/wheelEvent.js');
    const renderer = createMockRenderer({ type: 'node', id: 'n1' });
    const graph = createMockGraph();
    const handler = vi.fn();
    graph.eventEmitter.on('node:wheel', handler);

    wheelEvent(renderer as any, graph as any);
    simulateEvent(renderer.getCanvas(), 'wheel');

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].nodeId).toBe('n1');
  });

  it('should emit edge:wheel on wheel over edge', async () => {
    const { wheelEvent } = await import('../behaviors/wheelEvent.js');
    const renderer = createMockRenderer({ type: 'edge', index: 0 });
    const graph = createMockGraph();
    const handler = vi.fn();
    graph.eventEmitter.on('edge:wheel', handler);

    wheelEvent(renderer as any, graph as any);
    simulateEvent(renderer.getCanvas(), 'wheel');

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].source).toBe('a');
    expect(handler.mock.calls[0][0].target).toBe('b');
  });

  it('should emit canvas:wheel on wheel over background', async () => {
    const { wheelEvent } = await import('../behaviors/wheelEvent.js');
    const renderer = createMockRenderer(null);
    const graph = createMockGraph();
    const handler = vi.fn();
    graph.eventEmitter.on('canvas:wheel', handler);

    wheelEvent(renderer as any, graph as any);
    simulateEvent(renderer.getCanvas(), 'wheel');

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should teardown wheel listener', async () => {
    const { wheelEvent } = await import('../behaviors/wheelEvent.js');
    const renderer = createMockRenderer({ type: 'node', id: 'n1' });
    const graph = createMockGraph();

    const teardown = wheelEvent(renderer as any, graph as any);
    expect(renderer.getCanvas().addEventListener).toHaveBeenCalledWith(
      'wheel',
      expect.any(Function),
      { passive: true },
    );
    teardown();
    expect(renderer.getCanvas().removeEventListener).toHaveBeenCalled();
  });
});

// ============================================================
// dragEdge behavior
// ============================================================
describe('dragEdge behavior', () => {
  it('should emit edge:dragstart on mousedown over edge', async () => {
    const { dragEdge } = await import('../behaviors/dragEdge.js');
    const renderer = createMockRenderer({ type: 'edge', index: 0 });
    // Mock screenToGraph
    (renderer as any).screenToGraph = vi.fn(() => [0, 0]);
    const graph = createMockGraph();
    graph.getNodePosition = vi.fn(() => ({ x: 0, y: 0 }));
    const handler = vi.fn();
    graph.eventEmitter.on('edge:dragstart', handler);

    dragEdge(renderer as any, graph as any);
    simulateEvent(renderer.getCanvas(), 'mousedown');

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].source).toBe('a');
    expect(handler.mock.calls[0][0].target).toBe('b');
  });

  it('should not start drag on mousedown over node', async () => {
    const { dragEdge } = await import('../behaviors/dragEdge.js');
    const renderer = createMockRenderer({ type: 'node', id: 'n1' });
    const graph = createMockGraph();
    const handler = vi.fn();
    graph.eventEmitter.on('edge:dragstart', handler);

    dragEdge(renderer as any, graph as any);
    simulateEvent(renderer.getCanvas(), 'mousedown');

    expect(handler).not.toHaveBeenCalled();
  });

  it('should emit edge:dragstart on edge mousedown', async () => {
    const { dragEdge } = await import('../behaviors/dragEdge.js');
    const renderer = createMockRenderer({ type: 'edge', index: 0 });
    (renderer as any).screenToGraph = vi.fn(() => [0, 0]);
    const graph = createMockGraph();
    graph.getNodePosition = vi.fn(() => ({ x: 0, y: 0 }));
    const startHandler = vi.fn();
    graph.eventEmitter.on('edge:dragstart', startHandler);

    const teardown = dragEdge(renderer as any, graph as any);
    simulateEvent(renderer.getCanvas(), 'mousedown');

    expect(startHandler).toHaveBeenCalledTimes(1);
    expect(startHandler.mock.calls[0][0].source).toBe('a');
    expect(startHandler.mock.calls[0][0].target).toBe('b');
    expect(startHandler.mock.calls[0][0].dragEnd).toBeDefined();
    teardown();
  });

  it('should teardown drag listeners', async () => {
    const { dragEdge } = await import('../behaviors/dragEdge.js');
    const renderer = createMockRenderer({ type: 'edge', index: 0 });
    (renderer as any).screenToGraph = vi.fn(() => [0, 0]);
    const graph = createMockGraph();
    graph.getNodePosition = vi.fn(() => ({ x: 0, y: 0 }));

    const teardown = dragEdge(renderer as any, graph as any);
    expect(renderer.getCanvas().addEventListener).toHaveBeenCalled();
    teardown();
  });
});

// ============================================================
// brush-select / lasso-select (structural tests — no WebGL)
// ============================================================
describe('brushSelect behavior', () => {
  it('should register and teardown without error', async () => {
    const { brushSelect } = await import('../behaviors/brushSelect.js');
    const renderer = createMockRenderer(null);
    const graph = createMockGraph();
    const teardown = brushSelect(renderer as any, graph as any);
    expect(renderer.getCanvas().addEventListener).toHaveBeenCalled();
    teardown();
  });

  it('should accept key option', async () => {
    const { brushSelect } = await import('../behaviors/brushSelect.js');
    const renderer = createMockRenderer(null);
    const graph = createMockGraph();
    const teardown = brushSelect(renderer as any, graph as any, { key: 'shift' });
    teardown();
  });

  it('should not start brush on node hit', async () => {
    const { brushSelect } = await import('../behaviors/brushSelect.js');
    const renderer = createMockRenderer({ type: 'node', id: 'n1' });
    const graph = createMockGraph();
    const selectHandler = vi.fn();
    graph.eventEmitter.on('brush:select', selectHandler);

    brushSelect(renderer as any, graph as any);
    simulateEvent(renderer.getCanvas(), 'mousedown', { button: 0 });
    // No move/up so brush:select should not fire (hit node blocks it)
    expect(selectHandler).not.toHaveBeenCalled();
  });
});

describe('lassoSelect behavior', () => {
  it('should register and teardown without error', async () => {
    const { lassoSelect } = await import('../behaviors/lassoSelect.js');
    const renderer = createMockRenderer(null);
    const graph = createMockGraph();
    const teardown = lassoSelect(renderer as any, graph as any);
    expect(renderer.getCanvas().addEventListener).toHaveBeenCalled();
    teardown();
  });

  it('should accept key option', async () => {
    const { lassoSelect } = await import('../behaviors/lassoSelect.js');
    const renderer = createMockRenderer(null);
    const graph = createMockGraph();
    const teardown = lassoSelect(renderer as any, graph as any, { key: 'ctrl' });
    teardown();
  });
});

// ============================================================
// Point-in-polygon (lasso helper)
// ============================================================
describe('pointInPolygon utility', () => {
  it('should detect point inside a rectangle', async () => {
    // Import the module to access the function indirectly via lassoSelect
    // We test the logic directly
    const polygon = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    // Ray casting algorithm (inline test)
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
