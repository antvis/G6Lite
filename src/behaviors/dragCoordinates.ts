import type { Renderer } from '../renderer/renderer';

interface ClientPoint {
  x: number;
  y: number;
}

/** Convert a client-coordinate pointer delta to graph-coordinate movement. */
export function getGraphDragDelta(
  renderer: Renderer,
  start: ClientPoint,
  current: ClientPoint,
): { dx: number; dy: number } {
  const [startGraphX, startGraphY] = renderer.screenToGraph(start.x, start.y);
  const [currentGraphX, currentGraphY] = renderer.screenToGraph(current.x, current.y);
  return { dx: currentGraphX - startGraphX, dy: currentGraphY - startGraphY };
}
