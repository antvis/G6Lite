import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_ZOOM_CANVAS_OPTIONS,
  resolveZoomCanvasOptions,
  zoomCanvas,
} from '@src/behaviors/zoomCanvas.js';
import type { Renderer } from '@src/renderer/renderer.js';

function createRuntime(initialZoom = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 800,
    bottom: 500,
    width: 800,
    height: 500,
    toJSON: () => ({}),
  });

  let camera = { x: 0, y: 0, zoom: initialZoom };
  const renderer = {
    getCanvas: () => canvas,
    getCamera: () => camera,
    setCamera: vi.fn((next: Partial<typeof camera>) => {
      camera = { ...camera, ...next };
    }),
    setMoving: vi.fn(),
    scheduleRender: vi.fn(),
  };

  return {
    canvas,
    renderer,
    getCamera: () => camera,
  };
}

function dispatchWheel(canvas: HTMLCanvasElement, deltaY: number, deltaMode = 0): WheelEvent {
  const event = new WheelEvent('wheel', { cancelable: true, deltaY, deltaMode });
  canvas.dispatchEvent(event);
  return event;
}

describe('zoomCanvas', () => {
  it('uses a continuous default close to the previous fixed 10% step', () => {
    const runtime = createRuntime();
    const teardown = zoomCanvas(runtime.renderer as unknown as Renderer);

    dispatchWheel(runtime.canvas, 100);

    expect(runtime.getCamera().zoom).toBeCloseTo(Math.exp(-0.15), 6);
    expect(runtime.getCamera().zoom).toBeGreaterThan(0.86);
    expect(runtime.getCamera().zoom).toBeLessThan(0.87);
    expect(runtime.renderer.scheduleRender).toHaveBeenCalledOnce();
    teardown();
  });

  it('keeps a common zoom-in wheel step close to the previous 10% response', () => {
    const runtime = createRuntime();
    const teardown = zoomCanvas(runtime.renderer as unknown as Renderer);

    dispatchWheel(runtime.canvas, -100);

    expect(runtime.getCamera().zoom).toBeCloseTo(Math.exp(0.15), 6);
    expect(runtime.getCamera().zoom).toBeGreaterThan(1.16);
    expect(runtime.getCamera().zoom).toBeLessThan(1.17);
    teardown();
  });

  it('zooms in for negative deltas and keeps small trackpad deltas small', () => {
    const runtime = createRuntime();
    const teardown = zoomCanvas(runtime.renderer as unknown as Renderer);

    dispatchWheel(runtime.canvas, -2);

    expect(runtime.getCamera().zoom).toBeCloseTo(Math.exp(0.003), 6);
    teardown();
  });

  it.each([
    ['line', 1, WheelEvent.DOM_DELTA_LINE, Math.exp(-16 * 0.0015)],
    ['page', 1, WheelEvent.DOM_DELTA_PAGE, Math.exp(-500 * 0.0015)],
  ])('normalizes %s delta mode', (_name, deltaY, deltaMode, rawExpected) => {
    const runtime = createRuntime();
    const teardown = zoomCanvas(runtime.renderer as unknown as Renderer);

    dispatchWheel(runtime.canvas, deltaY, deltaMode);

    const expected = Math.max(0.85, rawExpected);
    expect(runtime.getCamera().zoom).toBeCloseTo(expected, 6);
    teardown();
  });

  it('limits an abnormal single wheel event', () => {
    const runtime = createRuntime();
    const teardown = zoomCanvas(runtime.renderer as unknown as Renderer);

    dispatchWheel(runtime.canvas, 100_000);
    expect(runtime.getCamera().zoom).toBeCloseTo(0.85, 6);

    dispatchWheel(runtime.canvas, -100_000);
    expect(runtime.getCamera().zoom).toBeCloseTo(0.85 * 1.18, 6);
    teardown();
  });

  it('respects custom zoom bounds', () => {
    const runtime = createRuntime(0.21);
    const teardown = zoomCanvas(runtime.renderer as unknown as Renderer, {
      sensitivity: 0.01,
      minZoom: 0.2,
      maxZoom: 2,
    });

    dispatchWheel(runtime.canvas, 100);
    expect(runtime.getCamera().zoom).toBe(0.2);

    runtime.renderer.setCamera({ zoom: 1.9 });
    dispatchWheel(runtime.canvas, -100);
    expect(runtime.getCamera().zoom).toBe(2);
    teardown();
  });

  it('does not update or render for a zero delta', () => {
    const runtime = createRuntime();
    const teardown = zoomCanvas(runtime.renderer as unknown as Renderer);

    const event = dispatchWheel(runtime.canvas, 0);

    expect(event.defaultPrevented).toBe(true);
    expect(runtime.renderer.setCamera).not.toHaveBeenCalled();
    expect(runtime.renderer.scheduleRender).not.toHaveBeenCalled();
    teardown();
  });

  it('removes the wheel listener during teardown', () => {
    const runtime = createRuntime();
    const teardown = zoomCanvas(runtime.renderer as unknown as Renderer);
    teardown();

    dispatchWheel(runtime.canvas, 100);

    expect(runtime.renderer.setCamera).not.toHaveBeenCalled();
  });
});

describe('resolveZoomCanvasOptions', () => {
  it('keeps valid custom values', () => {
    expect(resolveZoomCanvasOptions({ sensitivity: 0.0007, minZoom: 0.2, maxZoom: 8 })).toEqual({
      sensitivity: 0.0007,
      minZoom: 0.2,
      maxZoom: 8,
    });
  });

  it('falls back for invalid values and invalid ranges', () => {
    expect(
      resolveZoomCanvasOptions({
        sensitivity: Number.NaN,
        minZoom: -1,
        maxZoom: Number.POSITIVE_INFINITY,
      }),
    ).toEqual(DEFAULT_ZOOM_CANVAS_OPTIONS);
    expect(resolveZoomCanvasOptions({ minZoom: 2, maxZoom: 1 })).toEqual(
      DEFAULT_ZOOM_CANVAS_OPTIONS,
    );
  });
});
