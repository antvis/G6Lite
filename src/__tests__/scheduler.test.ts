import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DataModel } from '../dataModel.js';
import { RefreshLevel, RenderScheduler } from '../scheduler.js';
import type { ThemeTokens } from '../types.js';

const mockTheme: ThemeTokens = {
  nodeFill: '#5B8FF9',
  nodeSize: 24,
  nodeStroke: '#fff',
  nodeStrokeWidth: 0,
  edgeStroke: '#99ADD1',
  edgeLineWidth: 1,
  edgeArrow: true,
  canvasBackground: '#fff',
  edgeDefaultColor: '#99ADD1',
  edgeCategoryPalette: [],
  edgeStateStyles: {},
  nodeStateStyles: {},
};

function createMockRenderer() {
  return {
    draw: vi.fn(),
    patchStyles: vi.fn(),
    patchPositions: vi.fn(),
    partialProcess: vi.fn(),
    updateData: vi.fn(),
    hasRenderedArrows: vi.fn(() => false),
  };
}

describe('RenderScheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should resolve RefreshLevel.NONE when no changes', () => {
    expect(RefreshLevel.NONE).toBe(0);
  });

  it('should schedule FULL_PROCESS on dataReplaced', () => {
    const renderer = createMockRenderer();
    const dataModel = new DataModel({ theme: mockTheme });
    const scheduler = new RenderScheduler(renderer as any, dataModel);

    dataModel.replaceData([{ id: 'a', x: 0, y: 0 }], []);
    scheduler.schedule();
    vi.runAllTimers();

    expect(renderer.updateData).toHaveBeenCalled();
    expect(renderer.draw).toHaveBeenCalled();
  });

  it('should schedule PARTIAL_PROCESS on nodeAdded', () => {
    const renderer = createMockRenderer();
    const dataModel = new DataModel({ theme: mockTheme });
    const scheduler = new RenderScheduler(renderer as any, dataModel);

    dataModel.addNode({ id: 'a', x: 0, y: 0 });
    scheduler.schedule();
    vi.runAllTimers();

    expect(renderer.partialProcess).toHaveBeenCalled();
    expect(renderer.draw).toHaveBeenCalled();
  });

  it('should schedule PATCH_POSITION on nodePositionChanged', () => {
    const renderer = createMockRenderer();
    const dataModel = new DataModel({ theme: mockTheme });
    const scheduler = new RenderScheduler(renderer as any, dataModel);

    dataModel.addNode({ id: 'a', x: 0, y: 0 });
    scheduler.schedule();
    vi.runAllTimers();
    renderer.partialProcess.mockClear();
    renderer.draw.mockClear();

    dataModel.updateNodePosition('a', 100, 200);
    scheduler.schedule();
    vi.runAllTimers();

    expect(renderer.patchPositions).toHaveBeenCalled();
    expect(renderer.draw).toHaveBeenCalled();
  });

  it('should schedule PATCH_STYLE on state changed', () => {
    const renderer = createMockRenderer();
    const dataModel = new DataModel({ theme: mockTheme });
    const scheduler = new RenderScheduler(renderer as any, dataModel);

    dataModel.addNode({ id: 'a', x: 0, y: 0 });
    scheduler.schedule();
    vi.runAllTimers();
    renderer.partialProcess.mockClear();
    renderer.draw.mockClear();

    dataModel.setNodeState('a', 'selected', true);
    scheduler.schedule();
    vi.runAllTimers();

    expect(renderer.patchStyles).toHaveBeenCalled();
    expect(renderer.draw).toHaveBeenCalled();
  });

  it('should schedule FULL_PROCESS for edge state changes when arrows are rendered', () => {
    const renderer = createMockRenderer();
    renderer.hasRenderedArrows.mockReturnValue(true);
    const dataModel = new DataModel({ theme: mockTheme });
    const scheduler = new RenderScheduler(renderer as any, dataModel);

    dataModel.addEdge({ id: 'edge-1', source: 'a', target: 'b' });
    scheduler.schedule();
    vi.runAllTimers();
    renderer.partialProcess.mockClear();
    renderer.updateData.mockClear();
    renderer.draw.mockClear();

    dataModel.setEdgeState('edge-1', 'hidden', true);
    scheduler.schedule();
    vi.runAllTimers();

    expect(renderer.updateData).toHaveBeenCalled();
    expect(renderer.patchStyles).not.toHaveBeenCalled();
    expect(renderer.draw).toHaveBeenCalled();
  });

  it('should merge multiple schedule calls in same frame', () => {
    const renderer = createMockRenderer();
    const dataModel = new DataModel({ theme: mockTheme });
    const scheduler = new RenderScheduler(renderer as any, dataModel);

    dataModel.addNode({ id: 'a', x: 0, y: 0 });
    scheduler.schedule();
    dataModel.updateNodePosition('a', 100, 200);
    scheduler.schedule();
    vi.runAllTimers();

    // PARTIAL_PROCESS (from nodeAdded) > PATCH_POSITION (from positionChanged)
    expect(renderer.partialProcess).toHaveBeenCalled();
    expect(renderer.draw).toHaveBeenCalledTimes(1);
  });

  it('should not schedule after destroy', () => {
    const renderer = createMockRenderer();
    const dataModel = new DataModel({ theme: mockTheme });
    const scheduler = new RenderScheduler(renderer as any, dataModel);

    scheduler.destroy();
    dataModel.addNode({ id: 'a', x: 0, y: 0 });
    scheduler.schedule();
    vi.runAllTimers();

    expect(renderer.draw).not.toHaveBeenCalled();
  });

  it('should force flush at given level', () => {
    const renderer = createMockRenderer();
    const dataModel = new DataModel({ theme: mockTheme });
    const scheduler = new RenderScheduler(renderer as any, dataModel);

    scheduler.forceFlush(RefreshLevel.DRAW_ONLY);
    expect(renderer.draw).toHaveBeenCalled();
  });

  it('should expose RefreshLevel enum correctly', () => {
    expect(RefreshLevel.NONE).toBeLessThan(RefreshLevel.DRAW_ONLY);
    expect(RefreshLevel.DRAW_ONLY).toBeLessThan(RefreshLevel.HIGHLIGHT_DELTA);
    expect(RefreshLevel.HIGHLIGHT_DELTA).toBeLessThan(RefreshLevel.PATCH_STYLE);
    expect(RefreshLevel.PATCH_STYLE).toBeLessThan(RefreshLevel.PATCH_POSITION);
    expect(RefreshLevel.PATCH_POSITION).toBeLessThan(RefreshLevel.PARTIAL_PROCESS);
    expect(RefreshLevel.PARTIAL_PROCESS).toBeLessThan(RefreshLevel.FULL_PROCESS);
  });
});
