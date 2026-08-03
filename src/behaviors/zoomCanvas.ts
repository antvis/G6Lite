/**
 * zoom-canvas: wheel to zoom.
 */

import type { Renderer } from '../renderer/renderer';

export interface ZoomCanvasOptions {
  /** Wheel/trackpad sensitivity. Must be a finite positive number. */
  sensitivity?: number;
  /** Minimum camera zoom. Defaults to 0.1. */
  minZoom?: number;
  /** Maximum camera zoom. Defaults to 20. */
  maxZoom?: number;
}

interface ResolvedZoomCanvasOptions {
  sensitivity: number;
  minZoom: number;
  maxZoom: number;
}

export const DEFAULT_ZOOM_CANVAS_OPTIONS: Readonly<ResolvedZoomCanvasOptions> = {
  sensitivity: 0.0015,
  minZoom: 0.1,
  maxZoom: 20,
};

const MIN_EVENT_ZOOM_FACTOR = 0.85;
const MAX_EVENT_ZOOM_FACTOR = 1.18;
const LINE_HEIGHT_PX = 16;

function isFinitePositive(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function resolveZoomCanvasOptions(options?: ZoomCanvasOptions): ResolvedZoomCanvasOptions {
  const sensitivity = isFinitePositive(options?.sensitivity)
    ? options.sensitivity
    : DEFAULT_ZOOM_CANVAS_OPTIONS.sensitivity;
  const minZoom = isFinitePositive(options?.minZoom)
    ? options.minZoom
    : DEFAULT_ZOOM_CANVAS_OPTIONS.minZoom;
  const maxZoom = isFinitePositive(options?.maxZoom)
    ? options.maxZoom
    : DEFAULT_ZOOM_CANVAS_OPTIONS.maxZoom;

  if (minZoom >= maxZoom) return { ...DEFAULT_ZOOM_CANVAS_OPTIONS };
  return { sensitivity, minZoom, maxZoom };
}

function normalizeWheelDelta(event: WheelEvent, canvas: HTMLCanvasElement): number {
  if (!Number.isFinite(event.deltaY) || event.deltaY === 0) return 0;
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * LINE_HEIGHT_PX;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    const cssHeight =
      canvas.getBoundingClientRect().height || canvas.clientHeight || canvas.height || 1;
    return event.deltaY * cssHeight;
  }
  return event.deltaY;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function zoomCanvas(renderer: Renderer, options?: ZoomCanvasOptions): () => void {
  const canvas = renderer.getCanvas();
  const { sensitivity, minZoom, maxZoom } = resolveZoomCanvasOptions(options);
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const normalizedDelta = normalizeWheelDelta(e, canvas);
    if (normalizedDelta === 0) return;

    renderer.setMoving(true);
    renderer.setMoving(false); // triggers 150ms debounce restore
    const cam = renderer.getCamera();
    const factor = clamp(
      Math.exp(-normalizedDelta * sensitivity),
      MIN_EVENT_ZOOM_FACTOR,
      MAX_EVENT_ZOOM_FACTOR,
    );
    const newZoom = clamp(cam.zoom * factor, minZoom, maxZoom);
    if (newZoom === cam.zoom) return;

    // 保持画布中心对应的图空间点不变，使放大缩小时中心稳定
    const w = canvas.width || 1;
    const h = canvas.height || 1;
    // 画布中心在当前相机下对应的图坐标（推导自 graphToNDC 的反函数）
    const centerGraphX = w / (2 * cam.zoom) - cam.x;
    const centerGraphY = h / (2 * cam.zoom) - cam.y;
    // 计算新的相机平移，使该图坐标仍然落在画布中心
    const nextCamX = w / (2 * newZoom) - centerGraphX;
    const nextCamY = h / (2 * newZoom) - centerGraphY;

    renderer.setCamera({ zoom: newZoom, x: nextCamX, y: nextCamY });
    renderer.scheduleRender();
  };
  canvas.addEventListener('wheel', onWheel, { passive: false });
  return () => canvas.removeEventListener('wheel', onWheel);
}
