import { describe, expect, it, vi } from 'vitest';
import { dragCanvas } from '@src/behaviors/dragCanvas.js';
import { dragNode } from '@src/behaviors/dragNode.js';
import { EventEmitter } from '@src/events.js';
import type { Graph } from '@src/graph.js';
import type { Renderer } from '@src/renderer/renderer.js';

function asRenderer(renderer: unknown): Renderer {
  return renderer as Renderer;
}

function asGraph(graph: unknown): Graph {
  return graph as Graph;
}

function mouseEvent(clientX: number, clientY: number): MouseEvent {
  return new MouseEvent('mousedown', { button: 0, clientX, clientY });
}

function createNodeGraph() {
  return {
    eventEmitter: new EventEmitter(),
    getItemStates: vi.fn(() => []),
    findNodesByState: vi.fn(() => []),
    getNodePosition: vi.fn(() => ({ x: 0, y: 0 })),
    updateNodePosition: vi.fn(),
    getComboData: vi.fn(() => null),
    getComboChildren: vi.fn(() => ({ nodes: [], combos: [] })),
  };
}

describe('high-DPR drag coordinate regression', () => {
  it('keeps a dragged node under the pointer when DPR 2 offsets zoom 2', () => {
    const graph = createNodeGraph();
    const renderer = {
      getCamera: vi.fn(() => ({ x: 0, y: 0, zoom: 2 })),
      // DPR 2 backing scale / zoom 2 means 1 CSS px equals 1 graph unit.
      screenToGraph: vi.fn((x: number, y: number) => [x, y] as [number, number]),
    };
    const teardown = dragNode(asRenderer(renderer), asGraph(graph));

    graph.eventEmitter.emit('node:pointerdown', {
      nodeId: 'node',
      event: mouseEvent(100, 100),
    });
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 112, clientY: 106 }));

    expect(graph.updateNodePosition).toHaveBeenCalledWith('node', 12, 6);
    teardown();
  });

  it('uses independent horizontal and vertical backing scales', () => {
    const graph = createNodeGraph();
    const renderer = {
      getCamera: vi.fn(() => ({ x: 0, y: 0, zoom: 4 })),
      // Simulate backing scale X=2, Y=3 at zoom 4.
      screenToGraph: vi.fn((x: number, y: number) => [x * 0.5, y * 0.75] as [number, number]),
    };
    const teardown = dragNode(asRenderer(renderer), asGraph(graph));

    graph.eventEmitter.emit('node:pointerdown', {
      nodeId: 'node',
      event: mouseEvent(100, 100),
    });
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 112, clientY: 108 }));

    expect(graph.updateNodePosition).toHaveBeenCalledWith('node', 6, 6);
    teardown();
  });

  it('applies the same high-DPR graph delta to combo children', () => {
    const graph = createNodeGraph();
    graph.getComboData.mockReturnValue({ id: 'combo' });
    graph.getComboChildren.mockReturnValue({ nodes: ['node'], combos: [] });
    const renderer = {
      getCamera: vi.fn(() => ({ x: 0, y: 0, zoom: 2 })),
      screenToGraph: vi.fn((x: number, y: number) => [x, y] as [number, number]),
    };
    const teardown = dragNode(asRenderer(renderer), asGraph(graph));

    graph.eventEmitter.emit('combo:pointerdown', {
      comboId: 'combo',
      event: mouseEvent(100, 100),
    });
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 112, clientY: 106 }));

    expect(graph.updateNodePosition).toHaveBeenCalledWith('node', 12, 6);
    teardown();
  });

  it('pans the canvas by the converted graph delta instead of raw CSS delta over zoom', () => {
    const graph = { eventEmitter: new EventEmitter() };
    const renderer = {
      getCamera: vi.fn(() => ({ x: 3, y: 4, zoom: 2 })),
      // DPR 2 backing scale / zoom 2 means 1 CSS px equals 1 graph unit.
      screenToGraph: vi.fn((x: number, y: number) => [x - 3, y - 4] as [number, number]),
      setCamera: vi.fn(),
      scheduleRender: vi.fn(),
    };
    const teardown = dragCanvas(asRenderer(renderer), asGraph(graph));

    graph.eventEmitter.emit('canvas:pointerdown', { event: mouseEvent(100, 100) });
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 112, clientY: 106 }));

    expect(renderer.setCamera).toHaveBeenCalledWith({ x: 15, y: 10 });
    teardown();
  });
});
