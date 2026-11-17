import { afterEach, expect, it, vi } from 'vitest';
import { Graph } from '@src/graph.js';
import { ComboRenderer } from '@src/renderer/comboRenderer.js';
import type { InternalCombo } from '@src/types.js';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it.each([1, 2, 3])('draws and picks collapsed Combo bounds at device pixel ratio %s', (dpr) => {
  vi.stubGlobal('devicePixelRatio', dpr);
  const context = {
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
  };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
  const container = document.createElement('div');
  const canvas = document.createElement('canvas');
  const backingScale = Math.min(dpr, 2);
  canvas.width = 400 * backingScale;
  canvas.height = 300 * backingScale;
  canvas.getBoundingClientRect = () => new DOMRect(10, 20, 400, 300);
  container.appendChild(canvas);

  const combo: InternalCombo = {
    id: 'archive',
    childNodeIds: new Set(),
    childComboIds: new Set(),
    collapsed: true,
    x: 100,
    y: 80,
    width: 118,
    height: 130,
    style: { collapsedType: 'rect', collapsedSize: [120, 48] },
    states: new Set(),
  };
  const camera = { x: 0, y: 0, zoom: backingScale };
  const renderer = new ComboRenderer(container, canvas);
  renderer.draw([combo], camera);

  expect((container.firstChild as HTMLCanvasElement).width).toBe(canvas.width);
  expect(context.quadraticCurveTo).toHaveBeenCalledWith(
    expect.closeTo(160 * backingScale),
    expect.closeTo(56 * backingScale),
    expect.closeTo(160 * backingScale),
    expect.any(Number),
  );

  const graph = {
    canvas,
    comboRenderer: renderer,
    dataModel: { hasCombos: () => true, getCombos: () => [combo] },
    renderer: { getCamera: () => camera },
    options: {},
  };
  expect(Graph.prototype.pickComboAt.call(graph, 168, 100)).toBe('archive');
  expect(Graph.prototype.pickComboAt.call(graph, 172, 100)).toBeNull();
});
