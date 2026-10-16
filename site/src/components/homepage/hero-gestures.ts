import type { Camera, Graph } from '../../../../src/index.ts';

type Point = { x: number; y: number };
type Baseline = { anchor: Point; zoom: number; distance: number; count: number };

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 40;

/** Touch/pinch adapter using only the public camera API; mouse behaviors stay in G6Lite. */
export function bindHeroGestures(
  graph: Graph,
  canvas: HTMLCanvasElement,
  onChange: (camera: Camera, pointers: number) => void,
  onError: () => void,
) {
  const pointers = new Map<number, Point>();
  let baseline: Baseline | null = null;
  let frame = 0;
  let wheelDelta = 0;
  let wheelCenter: Point = { x: 0, y: 0 };
  let disposed = false;

  const snapshot = () => {
    const points = [...pointers.values()];
    const [first, second] = points;
    if (!first) return null;
    return {
      center: second ? { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 } : first,
      distance: second ? Math.hypot(first.x - second.x, first.y - second.y) : 0,
    };
  };
  const notify = () => {
    if (!disposed) onChange(graph.getCamera(), pointers.size);
  };
  const rebase = () => {
    const current = snapshot();
    baseline = current
      ? {
          anchor: graph.screenToGraph(current.center.x, current.center.y),
          zoom: graph.getZoom(),
          distance: current.distance,
          count: pointers.size,
        }
      : null;
    notify();
  };
  const apply = () => {
    frame = 0;
    if (disposed || graph.destroyed) return;
    try {
      const current = snapshot();
      if (baseline && current) {
        const ratio =
          baseline.count === 2 && baseline.distance >= 4 ? current.distance / baseline.distance : 1;
        const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, baseline.zoom * ratio));
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        // Keep the initial graph-space anchor under the moving finger/midpoint.
        graph.setCamera({
          zoom,
          x:
            ((current.center.x - rect.left) * (canvas.width / rect.width)) / zoom -
            baseline.anchor.x,
          y:
            ((current.center.y - rect.top) * (canvas.height / rect.height)) / zoom -
            baseline.anchor.y,
        });
      } else if (wheelDelta) {
        graph.zoomBy(Math.exp(-Math.max(-200, Math.min(200, wheelDelta)) * 0.006), {
          center: wheelCenter,
          minZoom: MIN_ZOOM,
          maxZoom: MAX_ZOOM,
        });
      }
      wheelDelta = 0;
      notify();
    } catch {
      onError();
    }
  };
  const flush = () => {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      apply();
    }
  };
  const schedule = () => {
    if (!frame && !disposed) frame = requestAnimationFrame(apply);
  };
  const onDown = (event: PointerEvent) => {
    if (event.pointerType !== 'touch' || disposed) return;
    event.preventDefault(); // Suppress compatibility mouse dragging for touch.
    if (pointers.size >= 2) return;
    flush();
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    canvas.setPointerCapture(event.pointerId);
    rebase();
  };
  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== 'touch' || !pointers.has(event.pointerId)) return;
    event.preventDefault();
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    schedule();
  };
  const onEnd = (event: PointerEvent) => {
    if (!pointers.has(event.pointerId)) {
      if (event.type === 'pointerup') notify();
      return;
    }
    if (event.type === 'pointerup') {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      flush();
    } else if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    pointers.delete(event.pointerId);
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    rebase();
  };
  const onWheel = (event: WheelEvent) => {
    if (!event.ctrlKey || disposed) return; // Regular wheel remains webpage scrolling.
    event.preventDefault();
    if (pointers.size || !Number.isFinite(event.deltaY)) return;
    const factor = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? canvas.clientHeight : 1;
    wheelDelta += event.deltaY * factor;
    wheelCenter = { x: event.clientX, y: event.clientY };
    schedule();
  };
  const reset = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    wheelDelta = 0;
    baseline = null;
    const ids = [...pointers.keys()];
    pointers.clear();
    for (const id of ids) if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
    notify();
  };

  canvas.addEventListener('pointerdown', onDown, { passive: false });
  canvas.addEventListener('pointermove', onMove, { passive: false });
  canvas.addEventListener('pointerup', onEnd);
  canvas.addEventListener('pointercancel', onEnd);
  canvas.addEventListener('lostpointercapture', onEnd);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('blur', reset);
  return {
    reset,
    destroy() {
      disposed = true;
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onEnd);
      canvas.removeEventListener('pointercancel', onEnd);
      canvas.removeEventListener('lostpointercapture', onEnd);
      canvas.removeEventListener('wheel', onWheel);
      window.removeEventListener('blur', reset);
      reset();
    },
  };
}
