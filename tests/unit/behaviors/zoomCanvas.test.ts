import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

function createAnimationFrameController() {
  let nextId = 1;
  const callbacks = new Map<number, FrameRequestCallback>();
  const request = vi.fn((callback: FrameRequestCallback) => {
    const id = nextId++;
    callbacks.set(id, callback);
    return id;
  });
  const cancel = vi.fn((id: number) => {
    callbacks.delete(id);
  });
  const flush = (time = 0) => {
    const pending = [...callbacks.values()];
    callbacks.clear();
    for (const callback of pending) callback(time);
  };

  return { request, cancel, flush };
}

let animationFrame: ReturnType<typeof createAnimationFrameController>;

beforeEach(() => {
  animationFrame = createAnimationFrameController();
  vi.stubGlobal('requestAnimationFrame', animationFrame.request);
  vi.stubGlobal('cancelAnimationFrame', animationFrame.cancel);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('zoomCanvas', () => {
  it.each([
    ['zooms in', -2, 1.02],
    ['zooms out', 2, 0.98],
    ['matches the G6 zoom-in response', -10, 1.1],
    ['matches the G6 zoom-out response', 10, 0.9],
  ])('%s for a delta of %s', (_name, deltaY, expectedZoom) => {
    const runtime = createRuntime();
    const teardown = zoomCanvas(runtime.renderer as unknown as Renderer);

    dispatchWheel(runtime.canvas, deltaY);
    expect(runtime.renderer.setCamera).not.toHaveBeenCalled();

    animationFrame.flush();

    expect(runtime.getCamera().zoom).toBeCloseTo(expectedZoom, 6);
    expect(runtime.renderer.scheduleRender).toHaveBeenCalledOnce();
    teardown();
  });

  it.each([
    ['zoom in', -100_000, 1.15],
    ['zoom out', 100_000, 0.85],
  ])('limits an abnormal %s frame', (_name, deltaY, expectedZoom) => {
    const runtime = createRuntime();
    const teardown = zoomCanvas(runtime.renderer as unknown as Renderer);

    dispatchWheel(runtime.canvas, deltaY);
    animationFrame.flush();

    expect(runtime.getCamera().zoom).toBeCloseTo(expectedZoom, 6);
    teardown();
  });

  it('accumulates same-direction events and updates the camera once per frame', () => {
    const runtime = createRuntime();
    const teardown = zoomCanvas(runtime.renderer as unknown as Renderer);

    dispatchWheel(runtime.canvas, -2);
    dispatchWheel(runtime.canvas, -3);
    dispatchWheel(runtime.canvas, -4);

    expect(animationFrame.request).toHaveBeenCalledOnce();
    expect(runtime.renderer.setCamera).not.toHaveBeenCalled();

    animationFrame.flush();

    expect(runtime.getCamera().zoom).toBeCloseTo(1.09, 6);
    expect(runtime.renderer.setCamera).toHaveBeenCalledOnce();
    expect(runtime.renderer.scheduleRender).toHaveBeenCalledOnce();
    expect(runtime.renderer.setMoving).toHaveBeenNthCalledWith(1, true);
    expect(runtime.renderer.setMoving).toHaveBeenNthCalledWith(2, false);
    teardown();
  });

  it('uses the latest direction when wheel input reverses within one frame', () => {
    const runtime = createRuntime();
    const teardown = zoomCanvas(runtime.renderer as unknown as Renderer);

    dispatchWheel(runtime.canvas, -10);
    dispatchWheel(runtime.canvas, 2);
    animationFrame.flush();

    expect(runtime.getCamera().zoom).toBeCloseTo(0.98, 6);
    expect(runtime.renderer.setCamera).toHaveBeenCalledOnce();
    teardown();
  });

  it.each([
    ['line', 1, WheelEvent.DOM_DELTA_LINE],
    ['page', 1, WheelEvent.DOM_DELTA_PAGE],
  ])('normalizes and limits %s delta mode', (_name, deltaY, deltaMode) => {
    const runtime = createRuntime();
    const teardown = zoomCanvas(runtime.renderer as unknown as Renderer);

    dispatchWheel(runtime.canvas, deltaY, deltaMode);
    animationFrame.flush();

    expect(runtime.getCamera().zoom).toBeCloseTo(0.85, 6);
    teardown();
  });

  it.each([
    ['increases', 2, 1.04],
    ['decreases', 0.5, 1.01],
  ])('%s the response with custom sensitivity', (_name, sensitivity, expectedZoom) => {
    const runtime = createRuntime();
    const teardown = zoomCanvas(runtime.renderer as unknown as Renderer, { sensitivity });

    dispatchWheel(runtime.canvas, -2);
    animationFrame.flush();

    expect(runtime.getCamera().zoom).toBeCloseTo(expectedZoom, 6);
    teardown();
  });

  it('respects custom zoom bounds', () => {
    const runtime = createRuntime(0.21);
    const teardown = zoomCanvas(runtime.renderer as unknown as Renderer, {
      sensitivity: 1,
      minZoom: 0.2,
      maxZoom: 2,
    });

    dispatchWheel(runtime.canvas, 100);
    animationFrame.flush();
    expect(runtime.getCamera().zoom).toBe(0.2);

    runtime.renderer.setCamera({ zoom: 1.9 });
    dispatchWheel(runtime.canvas, -100);
    animationFrame.flush();
    expect(runtime.getCamera().zoom).toBe(2);
    teardown();
  });

  it('does not update or render for a zero delta', () => {
    const runtime = createRuntime();
    const teardown = zoomCanvas(runtime.renderer as unknown as Renderer);

    const event = dispatchWheel(runtime.canvas, 0);

    expect(event.defaultPrevented).toBe(true);
    expect(animationFrame.request).not.toHaveBeenCalled();
    expect(runtime.renderer.setCamera).not.toHaveBeenCalled();
    expect(runtime.renderer.scheduleRender).not.toHaveBeenCalled();
    teardown();
  });

  it('removes the listener and cancels pending work during teardown', () => {
    const runtime = createRuntime();
    const teardown = zoomCanvas(runtime.renderer as unknown as Renderer);

    dispatchWheel(runtime.canvas, -10);
    teardown();
    animationFrame.flush();

    dispatchWheel(runtime.canvas, 100);

    expect(animationFrame.cancel).toHaveBeenCalledOnce();
    expect(runtime.renderer.setCamera).not.toHaveBeenCalled();
    expect(runtime.renderer.scheduleRender).not.toHaveBeenCalled();
  });
});

describe('resolveZoomCanvasOptions', () => {
  it('keeps valid custom values', () => {
    expect(resolveZoomCanvasOptions({ sensitivity: 0.7, minZoom: 0.2, maxZoom: 8 })).toEqual({
      sensitivity: 0.7,
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
