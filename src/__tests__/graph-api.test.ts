import { describe, it, expect, vi } from 'vitest';
import { DataModel } from '../dataModel.js';
import { EventEmitter } from '../events.js';

// ============================================================
// P0/P1 API tests using DataModel directly (no WebGL needed)
// ============================================================

describe('P0: getNodeData / getEdgeData', () => {
  it('should return node by ID (O(1))', () => {
    const dm = new DataModel({ theme: {} });
    dm.addNode({ id: 'n1', x: 10, y: 20, data: { label: 'hello' } });
    dm.addNode({ id: 'n2', x: 30, y: 40 });

    const node = dm.getNode('n1');
    expect(node).toBeDefined();
    expect(node!.id).toBe('n1');
    expect(node!.x).toBe(10);
    expect(node!.y).toBe(20);
    expect(node!.data).toEqual({ label: 'hello' });
  });

  it('should return undefined for missing node', () => {
    const dm = new DataModel({ theme: {} });
    expect(dm.getNode('missing')).toBeUndefined();
  });

  it('should return edge by ID (O(1))', () => {
    const dm = new DataModel({ theme: {} });
    dm.addNode({ id: 'a', x: 0, y: 0 });
    dm.addNode({ id: 'b', x: 1, y: 1 });
    const edgeId = dm.addEdge({ source: 'a', target: 'b', data: { weight: 5 } });

    const edge = dm.getEdge(edgeId);
    expect(edge).toBeDefined();
    expect(edge!.source).toBe('a');
    expect(edge!.target).toBe('b');
    expect(edge!.data).toEqual({ weight: 5 });
  });

  it('should return undefined for missing edge', () => {
    const dm = new DataModel({ theme: {} });
    expect(dm.getEdge('e999')).toBeUndefined();
  });
});

describe('P0: replaceData (backing setData)', () => {
  it('should replace all nodes and edges', () => {
    const dm = new DataModel({ theme: {} });
    dm.addNode({ id: 'old1', x: 0, y: 0 });
    dm.addEdge({ source: 'old1', target: 'old1' });

    dm.replaceData(
      [
        { id: 'new1', x: 10, y: 10 },
        { id: 'new2', x: 20, y: 20 },
      ],
      [{ source: 'new1', target: 'new2' }],
    );

    expect(dm.getNodeCount()).toBe(2);
    expect(dm.getEdgeCount()).toBe(1);
    expect(dm.hasNode('old1')).toBe(false);
    expect(dm.hasNode('new1')).toBe(true);
    expect(dm.hasNode('new2')).toBe(true);
  });

  it('should emit dataReplaced change', () => {
    const dm = new DataModel({ theme: {} });
    dm.replaceData([{ id: 'n1', x: 0, y: 0 }], []);
    const changes = dm.getChanges();
    expect(changes.some((c) => c.type === 'dataReplaced')).toBe(true);
  });
});

describe('P1: batchSetState (via DataModel)', () => {
  it('should set multiple states in batch', () => {
    const dm = new DataModel({ theme: {} });
    dm.addNode({ id: 'n1', x: 0, y: 0 });
    dm.addNode({ id: 'n2', x: 1, y: 1 });
    dm.addNode({ id: 'n3', x: 2, y: 2 });

    dm.setNodeState('n1', 'selected', true);
    dm.setNodeState('n2', 'active', true);
    dm.setNodeState('n3', 'highlight', true);

    const n1 = dm.getNode('n1')!;
    const n2 = dm.getNode('n2')!;
    const n3 = dm.getNode('n3')!;
    expect(n1.states.has('selected')).toBe(true);
    expect(n2.states.has('active')).toBe(true);
    expect(n3.states.has('highlight')).toBe(true);
  });

  it('should produce state change records', () => {
    const dm = new DataModel({ theme: {} });
    dm.addNode({ id: 'n1', x: 0, y: 0 });
    dm.getChanges(); // clear

    dm.setNodeState('n1', 'selected', true);
    dm.setNodeState('n1', 'active', true);
    const changes = dm.getChanges();
    expect(changes.filter((c) => c.type === 'nodeStateChanged').length).toBe(2);
  });
});

describe('P1: getItemStates (via DataModel)', () => {
  it('should return active states', () => {
    const dm = new DataModel({ theme: {} });
    dm.addNode({ id: 'n1', x: 0, y: 0 });
    dm.setNodeState('n1', 'selected', true);
    dm.setNodeState('n1', 'highlight', true);

    const node = dm.getNode('n1')!;
    const states = Array.from(node.states);
    expect(states).toContain('selected');
    expect(states).toContain('highlight');
    expect(states.length).toBe(2);
  });

  it('should return empty array when no states', () => {
    const dm = new DataModel({ theme: {} });
    dm.addNode({ id: 'n1', x: 0, y: 0 });
    const node = dm.getNode('n1')!;
    expect(Array.from(node.states)).toEqual([]);
  });
});

describe('P1: hidden state', () => {
  it('should set and clear hidden state', () => {
    const dm = new DataModel({ theme: {} });
    dm.addNode({ id: 'n1', x: 0, y: 0 });

    dm.setNodeState('n1', 'hidden', true);
    expect(dm.getNode('n1')!.states.has('hidden')).toBe(true);

    dm.setNodeState('n1', 'hidden', false);
    expect(dm.getNode('n1')!.states.has('hidden')).toBe(false);
  });

  it('should work for edges too', () => {
    const dm = new DataModel({ theme: {} });
    dm.addNode({ id: 'a', x: 0, y: 0 });
    dm.addNode({ id: 'b', x: 1, y: 1 });
    const eid = dm.addEdge({ source: 'a', target: 'b' });

    dm.setEdgeState(eid, 'hidden', true);
    expect(dm.getEdge(eid)!.states.has('hidden')).toBe(true);

    dm.setEdgeState(eid, 'hidden', false);
    expect(dm.getEdge(eid)!.states.has('hidden')).toBe(false);
  });
});

describe('P1: click-select multiple', () => {
  it('should support multi-select with shift key', async () => {
    const { clickSelect } = await import('../behaviors/clickSelect.js');

    let currentPickResult: any = { type: 'node', id: 'n1' };
    const handlers: Record<string, EventListener[]> = {};
    const canvas = {
      addEventListener: vi.fn((event: string, handler: EventListener) => {
        if (!handlers[event]) handlers[event] = [];
        handlers[event].push(handler);
      }),
      removeEventListener: vi.fn(),
      style: { cursor: 'default' },
    };
    const renderer = {
      getCanvas: () => canvas,
      pickAt: vi.fn(() => currentPickResult),
      getEdges: vi.fn(() => []),
    };

    const stateMap = new Map<string, Set<string>>();
    const eventEmitter = new EventEmitter();
    const graph = {
      eventEmitter,
      setItemState: vi.fn((id: string, state: string, value: boolean) => {
        if (!stateMap.has(state)) stateMap.set(state, new Set());
        const set = stateMap.get(state)!;
        if (value) set.add(id);
        else set.delete(id);
      }),
      findNodesByState: vi.fn((state: string) => [...(stateMap.get(state) ?? [])]),
      findEdgesByState: vi.fn((state: string) => [...(stateMap.get(state) ?? [])]),
    };

    clickSelect(renderer as any, graph as any, {
      type: 'click-select',
      multiple: true,
      trigger: 'shift',
    });

    // Click n1 without shift — selects n1
    const e1 = { clientX: 10, clientY: 10, shiftKey: false } as any;
    handlers['click'][0](e1);
    expect(stateMap.get('selected')?.has('n1')).toBe(true);

    // Click n2 with shift — adds n2, keeps n1
    currentPickResult = { type: 'node', id: 'n2' };
    const e2 = { clientX: 20, clientY: 20, shiftKey: true } as any;
    handlers['click'][0](e2);
    expect(stateMap.get('selected')?.has('n1')).toBe(true);
    expect(stateMap.get('selected')?.has('n2')).toBe(true);

    // Click n3 without shift — clears previous, selects only n3
    currentPickResult = { type: 'node', id: 'n3' };
    const e3 = { clientX: 30, clientY: 30, shiftKey: false } as any;
    handlers['click'][0](e3);
    expect(stateMap.get('selected')?.has('n1')).toBe(false);
    expect(stateMap.get('selected')?.has('n2')).toBe(false);
    expect(stateMap.get('selected')?.has('n3')).toBe(true);
  });
});

describe('P1: hover-highlight degree', () => {
  it('should highlight multi-hop neighbors', async () => {
    const { hoverHighlight } = await import('../behaviors/hoverHighlight.js');

    const handlers: Record<string, EventListener[]> = {};
    const canvas = {
      addEventListener: vi.fn((event: string, handler: EventListener) => {
        if (!handlers[event]) handlers[event] = [];
        handlers[event].push(handler);
      }),
      removeEventListener: vi.fn(),
      style: { cursor: 'default' },
    };
    const highlightArg = { nodeIds: new Set<string>(), edgeIndices: new Set<number>() };
    const renderer = {
      getCanvas: () => canvas,
      pickAt: vi.fn(() => ({ type: 'node', id: 'n1' })),
      getEdges: vi.fn(() => [
        { source: 'n1', target: 'n2' },
        { source: 'n2', target: 'n3' },
        { source: 'n3', target: 'n4' },
      ]),
      getNodes: vi.fn(() => [
        { id: 'n1', x: 0, y: 0 },
        { id: 'n2', x: 1, y: 1 },
        { id: 'n3', x: 2, y: 2 },
        { id: 'n4', x: 3, y: 3 },
      ]),
      setHighlight: vi.fn((arg: any) => {
        highlightArg.nodeIds = arg.nodeIds;
        highlightArg.edgeIndices = arg.edgeIndices;
      }),
    };

    const eventEmitter = new EventEmitter();
    const graph = {
      eventEmitter,
      getNeighborNodes: vi.fn((nodeId: string) => {
        const adj: Record<string, string[]> = {
          n1: ['n2'],
          n2: ['n1', 'n3'],
          n3: ['n2', 'n4'],
          n4: ['n3'],
        };
        return adj[nodeId] ?? [];
      }),
      setItemState: vi.fn(),
    };

    hoverHighlight(renderer as any, graph as any, {
      type: 'hover-highlight',
      degree: 2,
    });

    // Simulate mousemove hitting n1
    const e = { clientX: 10, clientY: 10 } as MouseEvent;
    handlers['mousemove'][0](e);

    // With degree=2, starting from n1: hop1=n2, hop2=n3
    // So highlighted nodes should include n1, n2, n3
    expect(highlightArg.nodeIds.has('n1')).toBe(true);
    expect(highlightArg.nodeIds.has('n2')).toBe(true);
    expect(highlightArg.nodeIds.has('n3')).toBe(true);
  });
});

describe('P0: setLayout + layout (config only)', () => {
  it('DataModel supports replaceData for layout re-execution', () => {
    const dm = new DataModel({ theme: {} });
    dm.addNode({ id: 'n1', x: 0, y: 0 });
    dm.addNode({ id: 'n2', x: 1, y: 1 });
    dm.addEdge({ source: 'n1', target: 'n2' });
    dm.getChanges(); // clear

    // Simulate layout result
    dm.replaceData(
      [
        { id: 'n1', x: 100, y: 200 },
        { id: 'n2', x: 300, y: 400 },
      ],
      [{ source: 'n1', target: 'n2' }],
    );

    expect(dm.getNode('n1')!.x).toBe(100);
    expect(dm.getNode('n1')!.y).toBe(200);
    expect(dm.getNode('n2')!.x).toBe(300);
    expect(dm.getNode('n2')!.y).toBe(400);
    const changes = dm.getChanges();
    expect(changes.some((c) => c.type === 'dataReplaced')).toBe(true);
  });
});

describe('P1: getAdjacentEdges with direction', () => {
  it('should return all adjacent edges', () => {
    const dm = new DataModel({ theme: {} });
    dm.addNode({ id: 'a', x: 0, y: 0 });
    dm.addNode({ id: 'b', x: 1, y: 1 });
    dm.addNode({ id: 'c', x: 2, y: 2 });
    dm.addEdge({ source: 'a', target: 'b' });
    dm.addEdge({ source: 'c', target: 'a' });
    dm.addEdge({ source: 'b', target: 'c' });

    const edges = dm.getAdjacentEdges('a');
    expect(edges.length).toBe(2);
    expect(edges.some((e) => e.source === 'a' && e.target === 'b')).toBe(true);
    expect(edges.some((e) => e.source === 'c' && e.target === 'a')).toBe(true);
  });
});
