import { describe, expect, it, vi } from 'vitest';
import { DataModel } from '@src/dataModel.js';
import { EventEmitter } from '@src/events.js';
import { Graph } from '@src/graph.js';
import type { Renderer } from '@src/renderer/renderer.js';
import { RefreshLevel } from '@src/scheduler.js';

function asRenderer<T>(renderer: T): Renderer {
  return renderer as unknown as Renderer;
}

function asGraph<T>(graph: T): Graph {
  return graph as unknown as Graph;
}

function modifierEvent(shiftKey: boolean): MouseEvent {
  return { shiftKey } as MouseEvent;
}

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

  it('should preserve explicit edge IDs', () => {
    const dm = new DataModel({ theme: {} });
    dm.addNode({ id: 'a', x: 0, y: 0 });
    dm.addNode({ id: 'b', x: 1, y: 1 });

    const edgeId = dm.addEdge({ id: 'business-edge', source: 'a', target: 'b' });

    expect(edgeId).toBe('business-edge');
    expect(dm.getEdge('business-edge')).toMatchObject({
      id: 'business-edge',
      source: 'a',
      target: 'b',
    });
  });

  it('should reject duplicate explicit edge IDs', () => {
    const dm = new DataModel({ theme: {} });
    dm.addEdge({ id: 'edge-1', source: 'a', target: 'b' });

    expect(() => dm.addEdge({ id: 'edge-1', source: 'b', target: 'c' })).toThrow(
      'Duplicate edge id: edge-1',
    );
  });

  it('should avoid generated ID collisions with explicit IDs', () => {
    const dm = new DataModel({ theme: {} });
    dm.addEdge({ id: 'e0', source: 'a', target: 'b' });

    const generatedId = dm.addEdge({ source: 'b', target: 'c' });

    expect(generatedId).toBe('e1');
    expect(dm.hasEdge('e0')).toBe(true);
    expect(dm.hasEdge('e1')).toBe(true);
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

  it('should preserve explicit edge IDs during replaceData', () => {
    const dm = new DataModel({ theme: {} });
    dm.replaceData(
      [
        { id: 'a', x: 0, y: 0 },
        { id: 'b', x: 1, y: 1 },
      ],
      [{ id: 'edge-ab', source: 'a', target: 'b' }],
    );

    expect(dm.getEdge('edge-ab')).toMatchObject({ id: 'edge-ab', source: 'a', target: 'b' });
  });

  it('should emit dataReplaced change', () => {
    const dm = new DataModel({ theme: {} });
    dm.replaceData([{ id: 'n1', x: 0, y: 0 }], []);
    const changes = dm.getChanges();
    expect(changes.some((c) => c.type === 'dataReplaced')).toBe(true);
  });
});

describe('P0: batch data updates', () => {
  it('updates multiple node positions with one change record', () => {
    const dm = new DataModel({ theme: {} });
    dm.addNodes([
      { id: 'n1', x: 0, y: 0 },
      { id: 'n2', x: 1, y: 1 },
    ]);
    dm.getChanges();

    const ids = dm.updateNodePositions([
      { id: 'n1', x: 10, y: 20 },
      { id: 'n2', x: 1, y: 1 },
    ]);

    expect(ids).toEqual(['n1']);
    expect(dm.getNode('n1')).toMatchObject({ x: 10, y: 20 });
    expect(dm.getChanges()).toEqual([{ type: 'nodePositionChanged', ids: ['n1'] }]);
  });

  it('updates multiple nodes with one change record', () => {
    const dm = new DataModel({ theme: {} });
    dm.addNodes([
      { id: 'n1', x: 0, y: 0, data: { value: 1 } },
      { id: 'n2', x: 1, y: 1, data: { value: 2 } },
    ]);
    dm.getChanges();

    const ids = dm.updateNodeDataBatch([
      { id: 'n1', data: { value: 10 } },
      { id: 'n2', data: { extra: true } },
    ]);

    expect(ids).toEqual(['n1', 'n2']);
    expect(dm.getNode('n1')?.data).toEqual({ value: 10 });
    expect(dm.getNode('n2')?.data).toEqual({ value: 2, extra: true });
    expect(dm.getChanges()).toEqual([{ type: 'nodeDataChanged', ids: ['n1', 'n2'] }]);
  });

  it('updates edge data and endpoints in one batch', () => {
    const dm = new DataModel({ theme: {} });
    dm.addNodes([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 1, y: 1 },
      { id: 'c', x: 2, y: 2 },
    ]);
    dm.addEdge({ id: 'e1', source: 'a', target: 'b', data: { weight: 1 } });
    dm.getChanges();

    dm.updateEdgeDataBatch([{ id: 'e1', source: 'c', data: { weight: 2 } }]);

    expect(dm.getEdge('e1')).toMatchObject({ source: 'c', target: 'b', data: { weight: 2 } });
    expect(dm.getChanges()).toEqual([{ type: 'edgeDataChanged', ids: ['e1'] }]);
  });

  it('rejects an edge endpoint that references a missing node', () => {
    const dm = new DataModel({ theme: {} });
    dm.addNode({ id: 'a', x: 0, y: 0 });
    dm.addEdge({ id: 'e1', source: 'a', target: 'a' });

    expect(() => dm.updateEdgeDataBatch([{ id: 'e1', target: 'missing' }])).toThrow(
      'Edge e1 references missing target node: missing',
    );
  });

  it('keeps batch edge updates atomic when a later endpoint is invalid', () => {
    const dm = new DataModel({ theme: {} });
    dm.addNodes([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 1, y: 1 },
    ]);
    dm.addEdges([
      { id: 'e1', source: 'a', target: 'b', data: { weight: 1 } },
      { id: 'e2', source: 'b', target: 'a' },
    ]);
    dm.getChanges();

    expect(() =>
      dm.updateEdgeDataBatch([
        { id: 'e1', data: { weight: 2 }, source: 'b' },
        { id: 'e2', target: 'missing' },
      ]),
    ).toThrow('Edge e2 references missing target node: missing');

    expect(dm.getEdge('e1')).toMatchObject({ source: 'a', target: 'b', data: { weight: 1 } });
    expect(dm.getChanges()).toEqual([]);
  });
});

describe('P0: destroyed Graph API safety', () => {
  it('turns mutation and renderer APIs into safe no-ops after destroy', () => {
    const graph = Object.create(Graph.prototype) as Graph & Record<string, unknown>;
    const addNode = vi.fn();
    const addEdge = vi.fn();
    const setCamera = vi.fn();
    const pickAt = vi.fn();
    Object.assign(graph, {
      _destroyed: true,
      initialized: true,
      dataModel: { addNode, addEdge },
      scheduler: { schedule: vi.fn() },
      renderer: { setCamera, pickAt },
      eventEmitter: new EventEmitter(),
      layoutNodes: [],
    });

    expect(() => graph.addNode({ id: 'n1', x: 0, y: 0 })).not.toThrow();
    expect(graph.addEdge({ source: 'a', target: 'b' })).toBe('');
    expect(graph.pickAt(10, 10)).toBeNull();
    expect(graph.screenToGraph(10, 10)).toEqual({ x: 0, y: 0 });
    graph.zoomTo(2);

    expect(addNode).not.toHaveBeenCalled();
    expect(addEdge).not.toHaveBeenCalled();
    expect(setCamera).not.toHaveBeenCalled();
    expect(pickAt).not.toHaveBeenCalled();
  });

  it('does not allow listeners to be reattached after destroy', () => {
    const graph = Object.create(Graph.prototype) as Graph & Record<string, unknown>;
    const eventEmitter = new EventEmitter();
    const handler = vi.fn();
    Object.assign(graph, { _destroyed: true, eventEmitter });

    graph.on('node:click', handler);
    graph.once('node:click', handler);
    eventEmitter.emit('node:click');

    expect(handler).not.toHaveBeenCalled();
  });
});

describe('P1: repeated render resource lifecycle', () => {
  it('tears down every per-render resource exactly once', () => {
    const graph = Object.create(Graph.prototype) as Graph & Record<string, unknown>;
    const behaviorTeardown = vi.fn();
    const interactionTeardown = vi.fn();
    const pluginTeardown = vi.fn();
    const schedulerDestroy = vi.fn();
    const observerDisconnect = vi.fn();
    const labelDestroy = vi.fn();
    const comboDestroy = vi.fn();

    Object.assign(graph, {
      behaviorTeardown,
      interactionTeardown,
      pluginTeardowns: [pluginTeardown],
      scheduler: { destroy: schedulerDestroy },
      resizeObserver: { disconnect: observerDisconnect },
      labelRenderer: { destroy: labelDestroy },
      comboRenderer: { destroy: comboDestroy },
    });

    (graph as unknown as { teardownRenderRuntime(): void }).teardownRenderRuntime();
    (graph as unknown as { teardownRenderRuntime(): void }).teardownRenderRuntime();

    expect(behaviorTeardown).toHaveBeenCalledTimes(1);
    expect(interactionTeardown).toHaveBeenCalledTimes(1);
    expect(pluginTeardown).toHaveBeenCalledTimes(1);
    expect(schedulerDestroy).toHaveBeenCalledTimes(1);
    expect(observerDisconnect).toHaveBeenCalledTimes(1);
    expect(labelDestroy).toHaveBeenCalledTimes(1);
    expect(comboDestroy).toHaveBeenCalledTimes(1);
    expect(graph).toMatchObject({
      behaviorTeardown: null,
      interactionTeardown: null,
      pluginTeardowns: [],
      scheduler: null,
      resizeObserver: null,
      labelRenderer: null,
      comboRenderer: null,
    });
  });

  it('aborts the active layout and invalidates its generation', () => {
    const graph = Object.create(Graph.prototype) as Graph & Record<string, unknown>;
    const abort = vi.fn();
    Object.assign(graph, {
      _destroyed: false,
      layoutGeneration: 4,
      layoutAbortController: { abort },
    });

    graph.cancelLayout();

    expect(abort).toHaveBeenCalledTimes(1);
    expect(graph.layoutGeneration).toBe(5);
    expect(graph.layoutAbortController).toBeNull();
  });

  it('starts initial layout without an extra animation-frame yield', async () => {
    const requestFrame = vi.fn();
    vi.stubGlobal('requestAnimationFrame', requestFrame);
    let finishLayout:
      ((result: { nodes: Array<{ id: string; x: number; y: number }> }) => void) | undefined;
    const executeLayout = vi.fn(
      () =>
        new Promise<{ nodes: Array<{ id: string; x: number; y: number }> }>((resolve) => {
          finishLayout = resolve;
        }),
    );
    const graph = Object.create(Graph.prototype) as Graph & Record<string, unknown>;
    Object.assign(graph, {
      _destroyed: false,
      layoutGeneration: 0,
      layoutAbortController: null,
      transformInstances: new Map(),
      options: {
        data: { nodes: [{ id: 'node' }], edges: [] },
        layout: { type: 'grid' },
      },
      containerEl: { clientWidth: 400, clientHeight: 300 },
      renderer: { resize: vi.fn(), clearWithTheme: vi.fn() },
      eventEmitter: new EventEmitter(),
      executeLayout,
    });

    const rendering = graph.render();
    expect(requestFrame).not.toHaveBeenCalled();
    expect(executeLayout).toHaveBeenCalledTimes(1);
    graph.cancelLayout();
    finishLayout?.({ nodes: [{ id: 'node', x: 0, y: 0 }] });
    await rendering;

    expect(requestFrame).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('derives automatic worker layout without mutating the configured options', async () => {
    const layout = { type: 'grid' };
    const executeLayout = vi.fn(async (data: { nodes: Array<{ id: string }> }, config) => ({
      nodes: data.nodes.map((node, index) => ({ ...node, x: index, y: index })),
      config,
    }));
    const graph = Object.create(Graph.prototype) as Graph & Record<string, unknown>;
    Object.assign(graph, {
      _destroyed: false,
      layoutGeneration: 1,
      options: { layout },
      eventEmitter: new EventEmitter(),
      executeLayout,
    });
    const nodes = Array.from({ length: 1000 }, (_, index) => ({ id: `node-${index}` }));

    await (
      graph as unknown as {
        runConfiguredLayout(
          data: { nodes: Array<{ id: string }>; edges: [] },
          generation: number,
        ): Promise<unknown>;
      }
    ).runConfiguredLayout({ nodes, edges: [] }, 1);

    expect(layout).toEqual({ type: 'grid' });
    expect(executeLayout).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ type: 'grid', worker: true }),
    );
    expect(executeLayout.mock.calls[0][1]).not.toBe(layout);
  });
});

describe('P1: public data snapshot boundary', () => {
  it('snapshots configured data before the first render', () => {
    const source = {
      nodes: [{ id: 'node', data: { label: 'original' }, states: ['selected' as const] }],
      edges: [{ id: 'edge', source: 'node', target: 'node', data: { weight: 1 } }],
      combos: [{ id: 'combo', style: { padding: 12 }, data: { label: 'group' } }],
    };
    const graph = Object.create(Graph.prototype) as Graph & Record<string, unknown>;
    Object.assign(graph, { dataModel: null, options: { data: source } });

    const snapshot = graph.getData();
    snapshot.nodes[0].data!.label = 'changed';
    snapshot.nodes[0].states!.push('active');
    snapshot.edges[0].data!.weight = 2;
    snapshot.combos![0].style!.padding = 24;
    snapshot.combos![0].data!.label = 'changed';

    expect(source.nodes[0].data.label).toBe('original');
    expect(source.nodes[0].states).toEqual(['selected']);
    expect(source.edges[0].data.weight).toBe(1);
    expect(source.combos[0].style.padding).toBe(12);
    expect(source.combos[0].data.label).toBe('group');
  });

  it('returns independent arrays, records, data objects, and state arrays', () => {
    const dataModel = new DataModel({ theme: {} });
    dataModel.replaceData(
      [{ id: 'node', x: 1, y: 2, data: { label: 'original' }, states: ['selected'] }],
      [
        {
          id: 'edge',
          source: 'node',
          target: 'node',
          data: { weight: 1 },
          states: ['active'],
        },
      ],
    );
    dataModel.initCombos(
      [{ id: 'combo', data: { label: 'group' }, states: ['highlight'] }],
      [{ id: 'node', comboId: 'combo' }],
    );
    const graph = Object.create(Graph.prototype) as Graph & Record<string, unknown>;
    Object.assign(graph, { dataModel });

    const snapshot = graph.getData();
    snapshot.nodes[0].x = 100;
    snapshot.nodes[0].data!.label = 'changed';
    snapshot.nodes[0].states!.push('active');
    snapshot.edges[0].data!.weight = 2;
    snapshot.combos![0].data!.label = 'changed';
    snapshot.combos![0].states!.push('selected');
    snapshot.nodes.length = 0;

    expect(dataModel.getNode('node')).toMatchObject({
      x: 1,
      data: { label: 'original' },
    });
    expect(Array.from(dataModel.getNode('node')!.states)).toEqual(['selected']);
    expect(dataModel.getEdge('edge')!.data).toEqual({ weight: 1 });
    expect(dataModel.getCombo('combo')!.data).toEqual({ label: 'group' });
    expect(Array.from(dataModel.getCombo('combo')!.states)).toEqual(['highlight']);
    expect(dataModel.getNodeCount()).toBe(1);
  });
});

describe('P1: public camera and coordinate boundary', () => {
  it('round-trips client coordinates with canvas offset and backing-store scale', () => {
    const graph = Object.create(Graph.prototype) as Graph & Record<string, unknown>;
    const rect = {
      left: 100,
      top: 50,
      width: 400,
      height: 200,
      right: 500,
      bottom: 250,
      x: 100,
      y: 50,
      toJSON: () => ({}),
    } as DOMRect;
    const canvas = {
      width: 800,
      height: 600,
      getBoundingClientRect: () => rect,
    };
    const camera = { x: 10, y: -5, zoom: 2 };
    const renderer = {
      getCamera: () => camera,
      screenToGraph: (screenX: number, screenY: number) => {
        const px = (screenX - rect.left) * (canvas.width / rect.width);
        const py = (screenY - rect.top) * (canvas.height / rect.height);
        return [px / camera.zoom - camera.x, py / camera.zoom - camera.y];
      },
    };
    Object.assign(graph, { _destroyed: false, canvas, renderer });

    const clientPoint = graph.graphToScreen(30, 25);
    const graphPoint = graph.screenToGraph(clientPoint.x, clientPoint.y);

    expect(clientPoint.x).toBeCloseTo(140);
    expect(clientPoint.y).toBeCloseTo(50 + 40 / 3);
    expect(graphPoint.x).toBeCloseTo(30);
    expect(graphPoint.y).toBeCloseTo(25);

    const cameraSnapshot = graph.getCamera();
    cameraSnapshot.zoom = 10;
    expect(camera.zoom).toBe(2);
  });

  it('focuses using backing-store dimensions while preserving zoom', () => {
    const dataModel = new DataModel({ theme: {} });
    dataModel.addNodes([
      { id: 'a', x: 10, y: 20 },
      { id: 'b', x: 30, y: 40 },
    ]);
    const setCamera = vi.fn();
    const graph = Object.create(Graph.prototype) as Graph & Record<string, unknown>;
    Object.assign(graph, {
      _destroyed: false,
      dataModel,
      containerEl: { clientWidth: 400, clientHeight: 300 },
      canvas: { width: 800, height: 600 },
      renderer: {
        getCamera: () => ({ x: 0, y: 0, zoom: 2 }),
        setCamera,
      },
    });

    graph.focusItem(['a', 'b'], 40);

    expect(setCamera).toHaveBeenCalledWith({ x: 180, y: 120 });
  });

  it('zooms out only when needed to keep focused nodes inside padding', () => {
    const dataModel = new DataModel({ theme: {} });
    dataModel.addNodes([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 1000, y: 0 },
    ]);
    const setCamera = vi.fn();
    const graph = Object.create(Graph.prototype) as Graph & Record<string, unknown>;
    Object.assign(graph, {
      _destroyed: false,
      dataModel,
      containerEl: { clientWidth: 800, clientHeight: 600 },
      canvas: { width: 800, height: 600 },
      renderer: {
        getCamera: () => ({ x: 0, y: 0, zoom: 2 }),
        setCamera,
      },
    });

    graph.focusItem(['a', 'b'], 50);

    const camera = setCamera.mock.calls[0][0] as { x: number; y: number; zoom: number };
    expect(camera.zoom).toBeCloseTo(0.7);
    expect(camera.x * camera.zoom).toBeCloseTo(50);
    expect((1000 + camera.x) * camera.zoom).toBeCloseTo(750);
  });

  it('fits the view around full node bodies so padding keeps them visible', () => {
    const nodes = [
      { id: 'n1', x: 120, y: 140 },
      { id: 'n2', x: 270, y: 140 },
      { id: 'n3', x: 420, y: 140 },
      { id: 'n4', x: 120, y: 290 },
      { id: 'n5', x: 270, y: 290 },
      { id: 'n6', x: 420, y: 290 },
    ];
    const setCamera = vi.fn();
    const graph = Object.create(Graph.prototype) as Graph & Record<string, unknown>;
    Object.assign(graph, {
      _destroyed: false,
      options: {},
      getCurrentLayoutNodes: () => nodes,
      containerEl: { clientWidth: 590, clientHeight: 320 },
      canvas: { width: 590, height: 320 },
      renderer: {
        ensureProcessed: () => undefined,
        getNodeDimensions: () => ({ width: 72, height: 36 }),
        getEdgeGeometryBounds: () => undefined,
        setCamera,
      },
    });

    graph.fitView(0.9);

    const camera = setCamera.mock.calls[0][0] as { x: number; y: number; zoom: number };
    // Bounds include node bodies (372x186), not just centers (300x150):
    // scale = min(590 / 372, 320 / 186) * 0.9.
    expect(camera.zoom).toBeCloseTo(0.9 * Math.min(590 / 372, 320 / 186));
    // The fitted graph must stay inside the canvas on both axes.
    expect(camera.zoom * 372).toBeLessThanOrEqual(590);
    expect(camera.zoom * 186).toBeLessThanOrEqual(320);
    // The camera centers the expanded bounds (center at 270, 215).
    expect(camera.x).toBeCloseTo(295 / camera.zoom - 270);
    expect(camera.y).toBeCloseTo(160 / camera.zoom - 215);
  });

  it('falls back to node centers when rendered dimensions are unavailable', () => {
    const nodes = [
      { id: 'n1', x: 120, y: 140 },
      { id: 'n6', x: 420, y: 290 },
    ];
    const setCamera = vi.fn();
    const graph = Object.create(Graph.prototype) as Graph & Record<string, unknown>;
    Object.assign(graph, {
      _destroyed: false,
      options: {},
      getCurrentLayoutNodes: () => nodes,
      containerEl: { clientWidth: 590, clientHeight: 320 },
      canvas: { width: 590, height: 320 },
      renderer: {
        ensureProcessed: () => undefined,
        getNodeDimensions: () => undefined,
        getEdgeGeometryBounds: () => undefined,
        setCamera,
      },
    });

    graph.fitView(0.9);

    const camera = setCamera.mock.calls[0][0] as { x: number; y: number; zoom: number };
    // Center-only bounds (300x150): scale = min(590 / 300, 320 / 150) * 0.9.
    expect(camera.zoom).toBeCloseTo(0.9 * Math.min(590 / 300, 320 / 150));
  });

  it('falls back to static node style dimensions right after render', () => {
    // Mirrors the render() path: fitView runs before the first draw(), so the
    // renderer dimension buffers do not exist yet. The static node style on
    // the graph options must still expand the bounds by node bodies.
    const nodes = [
      { id: 'n1', x: 120, y: 140 },
      { id: 'n2', x: 270, y: 140 },
      { id: 'n3', x: 420, y: 140 },
      { id: 'n4', x: 120, y: 290 },
      { id: 'n5', x: 270, y: 290 },
      { id: 'n6', x: 420, y: 290 },
    ];
    const setCamera = vi.fn();
    const graph = Object.create(Graph.prototype) as Graph & Record<string, unknown>;
    Object.assign(graph, {
      _destroyed: false,
      options: { node: { style: { width: 72, height: 36 } } },
      getCurrentLayoutNodes: () => nodes,
      containerEl: { clientWidth: 590, clientHeight: 320 },
      canvas: { width: 590, height: 320 },
      renderer: {
        ensureProcessed: () => undefined,
        getNodeDimensions: () => undefined,
        getEdgeGeometryBounds: () => undefined,
        setCamera,
      },
    });

    graph.fitView(0.9);

    const camera = setCamera.mock.calls[0][0] as { x: number; y: number; zoom: number };
    expect(camera.zoom).toBeCloseTo(0.9 * Math.min(590 / 372, 320 / 186));
    expect(camera.zoom * 372).toBeLessThanOrEqual(590);
    expect(camera.zoom * 186).toBeLessThanOrEqual(320);
  });

  it('expands the fitted bounds with curved edge geometry', () => {
    // Parallel arcs between two nodes bow far above the node centers; without
    // edge bounds the arc apex would be clipped at the canvas edge.
    const nodes = [
      { id: 'a', x: 200, y: 220 },
      { id: 'b', x: 340, y: 220 },
    ];
    const setCamera = vi.fn();
    const graph = Object.create(Graph.prototype) as Graph & Record<string, unknown>;
    Object.assign(graph, {
      _destroyed: false,
      options: {},
      getCurrentLayoutNodes: () => nodes,
      containerEl: { clientWidth: 590, clientHeight: 320 },
      canvas: { width: 590, height: 320 },
      renderer: {
        ensureProcessed: () => undefined,
        getNodeDimensions: () => ({ width: 34, height: 34 }),
        getEdgeGeometryBounds: () => ({ minX: 190, minY: 140, maxX: 350, maxY: 230 }),
        setCamera,
      },
    });

    graph.fitView(0.9);

    const camera = setCamera.mock.calls[0][0] as { x: number; y: number; zoom: number };
    // Merged bounds: node bodies (183..357 x, 203..237 y) ∪ edge arcs (y up to
    // 140) => 174 x 97. Height becomes the constraint, so the zoom must be
    // smaller than the node-only fit (bounded by width at 590 / 174).
    expect(camera.zoom).toBeCloseTo(0.9 * Math.min(590 / 174, 320 / 97));
    expect(camera.zoom).toBeLessThan(0.9 * (590 / 174));
    expect(camera.zoom * 97).toBeLessThanOrEqual(320);
  });

  it('expands the fitted bounds with combo boxes', () => {
    // Combo boxes wrap node bodies plus padding; without merging them the box
    // bleeds past the fitted view edges.
    const nodes = [
      { id: 'a', x: 200, y: 220 },
      { id: 'b', x: 340, y: 220 },
    ];
    const setCamera = vi.fn();
    const updateComboBounds = vi.fn();
    const graph = Object.create(Graph.prototype) as Graph & Record<string, unknown>;
    Object.assign(graph, {
      _destroyed: false,
      options: {},
      getCurrentLayoutNodes: () => nodes,
      containerEl: { clientWidth: 590, clientHeight: 320 },
      canvas: { width: 590, height: 320 },
      renderer: {
        ensureProcessed: () => undefined,
        getNodeDimensions: () => ({ width: 34, height: 34 }),
        getEdgeGeometryBounds: () => undefined,
        setCamera,
      },
      dataModel: {
        hasCombos: () => true,
        updateComboBounds,
        getCombos: () => [{ id: 'c1', x: 270, y: 220, width: 300, height: 200 }],
      },
    });

    graph.fitView(0.9);

    expect(updateComboBounds).toHaveBeenCalled();
    const camera = setCamera.mock.calls[0][0] as { x: number; y: number; zoom: number };
    // Merged bounds: nodes (183..357 x, 203..237 y) ∪ combo (120..420 x,
    // 120..320 y) => 300 x 200; height constrains the zoom.
    expect(camera.zoom).toBeCloseTo(0.9 * Math.min(590 / 300, 320 / 200));
    expect(camera.zoom * 300).toBeLessThanOrEqual(590);
    expect(camera.zoom * 200).toBeLessThanOrEqual(320);
  });
});

describe('P1: viewport resize fitting policy', () => {
  function createResizeGraph(autoFit?: boolean | number | object) {
    const graph = Object.create(Graph.prototype) as Graph & Record<string, unknown>;
    const rendererResize = vi.fn();
    const fitView = vi.fn();
    const eventEmitter = new EventEmitter();
    Object.assign(graph, {
      _destroyed: false,
      options: {
        data: { nodes: [], edges: [] },
        autoFit,
      },
      renderer: { resize: rendererResize },
      eventEmitter,
      fitView,
    });
    return { eventEmitter, fitView, graph, rendererResize };
  }

  it.each([undefined, false])('preserves the camera by default (%s)', (autoFit) => {
    const { eventEmitter, fitView, graph, rendererResize } = createResizeGraph(autoFit);
    const onResize = vi.fn();
    eventEmitter.on('resize', onResize);

    graph.setSize(320, 240);

    expect(rendererResize).toHaveBeenCalledWith(320, 240);
    expect(fitView).not.toHaveBeenCalled();
    expect(onResize).toHaveBeenCalledWith({ width: 320, height: 240 });
  });

  it('resizes, applies the default fit, then emits resize when enabled', () => {
    const order: string[] = [];
    const { eventEmitter, graph } = createResizeGraph(true);
    Object.assign(graph, {
      renderer: { resize: () => order.push('resize') },
      fitView: (options: number) => {
        order.push(`fit:${options}`);
      },
    });
    eventEmitter.on('resize', () => order.push('emit'));

    graph.setSize(320, 240);

    expect(order).toEqual(['resize', 'fit:0.9', 'emit']);
  });

  it('passes numeric and object fit options through without truthy coercion', () => {
    const fitOptions = { padding: 24, minZoom: 0.2, maxZoom: 1.5 };
    const zeroScale = createResizeGraph(0);
    const objectOptions = createResizeGraph(fitOptions);

    zeroScale.graph.setSize(320, 240);
    objectOptions.graph.setSize(640, 480);

    expect(zeroScale.fitView).toHaveBeenCalledWith(0);
    expect(objectOptions.fitView).toHaveBeenCalledWith(fitOptions);
  });

  it('applies the same policy to observed container size changes', () => {
    let resizeCallback: ResizeObserverCallback | undefined;
    const observe = vi.fn();
    class ResizeObserverStub {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback;
      }

      observe = observe;
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];
    }
    vi.stubGlobal('ResizeObserver', ResizeObserverStub);

    const viewport = { width: 400, height: 300 };
    const { fitView, graph, rendererResize } = createResizeGraph(0.75);
    Object.assign(graph, {
      containerEl: {
        get clientWidth() {
          return viewport.width;
        },
        get clientHeight() {
          return viewport.height;
        },
      },
    });

    (graph as unknown as { observeContainerResize(): void }).observeContainerResize();
    viewport.width = 280;
    viewport.height = 220;
    resizeCallback?.([], {} as ResizeObserver);
    vi.unstubAllGlobals();

    expect(observe).toHaveBeenCalledTimes(1);
    expect(rendererResize).toHaveBeenCalledWith(280, 220);
    expect(fitView).toHaveBeenCalledWith(0.75);
  });
});

describe('P1: label rendering options', () => {
  it('merges runtime label options and schedules a full visual refresh', () => {
    const dataModel = new DataModel({ theme: {} });
    const forceFlush = vi.fn();
    const graph = Object.create(Graph.prototype) as Graph & Record<string, unknown>;
    Object.assign(graph, {
      _destroyed: false,
      initialized: true,
      options: {
        data: { nodes: [], edges: [] },
        label: { scaleWithZoom: false, hideOnLowZoom: true, nodeMinZoom: 0.3 },
      },
      dataModel,
      scheduler: { forceFlush },
    });

    graph.updateOptions({
      label: {
        hideOnLowZoom: false,
        hideOnCollision: false,
        nodeMinZoom: 0.5,
        edgeMinZoom: 0.5,
      },
    });

    expect(graph).toMatchObject({
      options: {
        label: {
          scaleWithZoom: false,
          hideOnLowZoom: false,
          hideOnCollision: false,
          nodeMinZoom: 0.5,
          edgeMinZoom: 0.5,
        },
      },
    });
    expect(forceFlush).toHaveBeenCalledWith(RefreshLevel.FULL_PROCESS);
  });
});

describe('P1: Graph batch state scheduling', () => {
  function createStateGraph() {
    const dataModel = new DataModel({ theme: {} });
    dataModel.addNode({ id: 'node', x: 0, y: 0 });
    dataModel.initCombos([{ id: 'combo' }], []);
    dataModel.getChanges();
    const schedule = vi.fn(() => dataModel.getChanges());
    const scheduleRender = vi.fn();
    const graph = Object.create(Graph.prototype) as Graph & Record<string, unknown>;
    Object.assign(graph, {
      _destroyed: false,
      initialized: true,
      dataModel,
      scheduler: { schedule },
      renderer: { scheduleRender },
    });
    return { dataModel, graph, schedule, scheduleRender };
  }

  it('uses the data scheduler as the single draw path for mixed real changes', () => {
    const { graph, schedule, scheduleRender } = createStateGraph();

    graph.batchSetState([
      { id: 'node', state: 'selected', value: true },
      { id: 'combo', state: 'selected', value: true },
    ]);

    expect(schedule).toHaveBeenCalledTimes(1);
    expect(scheduleRender).not.toHaveBeenCalled();
  });

  it('still redraws a Combo when accompanying node operations are no-ops', () => {
    const { dataModel, graph, schedule, scheduleRender } = createStateGraph();
    dataModel.setNodeState('node', 'selected', true);
    dataModel.getChanges();

    graph.batchSetState([
      { id: 'node', state: 'selected', value: true },
      { id: 'combo', state: 'selected', value: true },
    ]);

    expect(schedule).not.toHaveBeenCalled();
    expect(scheduleRender).toHaveBeenCalledTimes(1);
  });
});

describe('P1: Combo structural API scheduling', () => {
  it('requests a render for membership and Combo mutations', () => {
    const dataModel = new DataModel({ theme: {} });
    dataModel.addNode({ id: 'node', x: 0, y: 0 });
    dataModel.initCombos([{ id: 'combo-a' }], [{ id: 'node' }]);
    const schedule = vi.fn();
    const scheduleRender = vi.fn();
    const graph = Object.create(Graph.prototype) as Graph & Record<string, unknown>;
    Object.assign(graph, {
      _destroyed: false,
      dataModel,
      scheduler: { schedule },
      renderer: { scheduleRender },
      ensureComboRenderer: vi.fn(),
    });

    graph.addToCombo('node', 'combo-a');
    graph.removeFromCombo('node');
    graph.createCombo({ id: 'combo-b' }, ['node']);
    graph.removeCombo('combo-b');

    expect(schedule).toHaveBeenCalledTimes(4);
    expect(scheduleRender).toHaveBeenCalledTimes(4);
  });

  it('uses draw-only refresh when collapsing or expanding has no element changes', () => {
    const dataModel = new DataModel({ theme: {} });
    dataModel.replaceData([{ id: 'node', x: 0, y: 0, states: ['hidden'] }], []);
    dataModel.initCombos([{ id: 'combo' }], [{ id: 'node', comboId: 'combo' }]);
    dataModel.getChanges();
    const schedule = vi.fn(() => dataModel.getChanges());
    const scheduleRender = vi.fn();
    const graph = Object.create(Graph.prototype) as Graph & Record<string, unknown>;
    Object.assign(graph, {
      _destroyed: false,
      dataModel,
      scheduler: { schedule },
      renderer: { scheduleRender },
      eventEmitter: new EventEmitter(),
    });

    graph.collapseCombo('combo');
    graph.expandCombo('combo');

    expect(schedule).not.toHaveBeenCalled();
    expect(scheduleRender).toHaveBeenCalledTimes(2);
  });

  it('uses draw-only refresh for an empty Combo', () => {
    const dataModel = new DataModel({ theme: {} });
    dataModel.initCombos([{ id: 'combo' }], []);
    const schedule = vi.fn(() => dataModel.getChanges());
    const scheduleRender = vi.fn();
    const graph = Object.create(Graph.prototype) as Graph & Record<string, unknown>;
    Object.assign(graph, {
      _destroyed: false,
      dataModel,
      scheduler: { schedule },
      renderer: { scheduleRender },
      eventEmitter: new EventEmitter(),
    });

    graph.collapseCombo('combo');
    graph.expandCombo('combo');

    expect(schedule).not.toHaveBeenCalled();
    expect(scheduleRender).toHaveBeenCalledTimes(2);
  });
});

describe('P0: Combo state API backing model', () => {
  it('should set, query, find, and clear combo states', () => {
    const dm = new DataModel({ theme: {} });
    dm.initCombos([{ id: 'combo-a' }], []);

    dm.setComboState('combo-a', 'selected', true);

    expect(dm.getCombo('combo-a')!.states.has('selected')).toBe(true);
    expect(dm.findCombosByState('selected')).toEqual(['combo-a']);

    dm.clearComboStates('combo-a');
    expect(dm.getCombo('combo-a')!.states.size).toBe(0);
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

describe('P1: replace complete state sets', () => {
  it('supports custom node and edge states', () => {
    const dm = new DataModel({ theme: {} });
    dm.addNode({ id: 'n1', x: 0, y: 0 });
    dm.addEdge({ id: 'e1', source: 'n1', target: 'n1' });
    dm.getChanges();

    dm.replaceNodeStates('n1', ['selected', 'connect-source']);
    dm.replaceEdgeStates('e1', ['invalid']);

    expect(Array.from(dm.getNode('n1')!.states)).toEqual(['selected', 'connect-source']);
    expect(Array.from(dm.getEdge('e1')!.states)).toEqual(['invalid']);
  });

  it('treats default as an empty state marker', () => {
    const dm = new DataModel({ theme: {} });
    dm.addNode({ id: 'n1', x: 0, y: 0 });
    dm.setNodeState('n1', 'selected', true);

    dm.replaceNodeStates('n1', ['default']);

    expect(Array.from(dm.getNode('n1')!.states)).toEqual([]);
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
    const { clickSelect } = await import('@src/behaviors/clickSelect.js');

    const renderer = {
      getCanvas: () => ({ style: { cursor: 'default' } }),
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

    clickSelect(asRenderer(renderer), asGraph(graph), {
      type: 'click-select',
      multiple: true,
      trigger: 'shift',
    });

    // Click n1 without shift — selects n1
    eventEmitter.emit('node:click', { nodeId: 'n1', event: modifierEvent(false) });
    expect(stateMap.get('selected')?.has('n1')).toBe(true);

    // Click n2 with shift — adds n2, keeps n1
    eventEmitter.emit('node:click', { nodeId: 'n2', event: modifierEvent(true) });
    expect(stateMap.get('selected')?.has('n1')).toBe(true);
    expect(stateMap.get('selected')?.has('n2')).toBe(true);

    // Click n3 without shift — clears previous, selects only n3
    eventEmitter.emit('node:click', { nodeId: 'n3', event: modifierEvent(false) });
    expect(stateMap.get('selected')?.has('n1')).toBe(false);
    expect(stateMap.get('selected')?.has('n2')).toBe(false);
    expect(stateMap.get('selected')?.has('n3')).toBe(true);
  });
});

describe('P1: hover-highlight degree', () => {
  it('should highlight multi-hop neighbors', async () => {
    const { hoverHighlight } = await import('@src/behaviors/hoverHighlight.js');

    const highlightArg = { nodeIds: new Set<string>(), edgeIndices: new Set<number>() };
    const renderer = {
      getCanvas: () => ({ style: { cursor: 'default' } }),
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
      setHighlight: vi.fn((arg: { nodeIds: Set<string>; edgeIndices: Set<number> }) => {
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

    hoverHighlight(asRenderer(renderer), asGraph(graph), {
      type: 'hover-highlight',
      degree: 2,
    });

    // Pointer enters n1 (emitted by the dispatcher)
    eventEmitter.emit('node:pointerover', { nodeId: 'n1', event: {} as MouseEvent });

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
