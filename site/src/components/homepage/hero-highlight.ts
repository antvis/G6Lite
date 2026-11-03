import type { Graph } from '../../../../src/index.ts';

/** Keep the large graph steady while the pointer crosses many tiny nodes. */
export function bindHeroHighlight(graph: Graph, canvas: HTMLCanvasElement): () => void {
  const neighbors = new Map<string, Set<string>>();
  for (const edge of graph.getEdges()) {
    for (const id of new Set([edge.source, edge.target])) {
      const items = neighbors.get(id) ?? new Set([id]);
      items.add(edge.id).add(edge.source).add(edge.target);
      neighbors.set(id, items);
    }
  }
  let highlighted = new Set<string>();
  let current: string | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let dragging = false;

  const cancel = () => {
    clearTimeout(timer);
    timer = undefined;
  };
  const apply = (nodeId: string | null) => {
    cancel();
    if (nodeId === current) return;
    const next = nodeId ? (neighbors.get(nodeId) ?? new Set([nodeId])) : new Set<string>();
    graph.batchSetState([
      ...[...highlighted]
        .filter((id) => !next.has(id))
        .map((id) => ({ id, state: 'highlight', value: false })),
      ...[...next]
        .filter((id) => !highlighted.has(id))
        .map((id) => ({ id, state: 'highlight', value: true })),
    ]);
    highlighted = next;
    current = nodeId;
    canvas.style.cursor = nodeId ? 'pointer' : 'default';
  };
  const onOver = ({ nodeId }: { nodeId: string }) => {
    if (dragging) return;
    cancel();
    timer = setTimeout(() => apply(nodeId), 20);
  };
  const onLeave = () => {
    if (dragging) return;
    cancel();
    timer = setTimeout(() => apply(null), 140);
  };
  const reset = () => apply(null);
  const onDown = () => {
    cancel();
    dragging = true;
  };
  const onUp = () => {
    dragging = false;
    reset();
  };

  graph.on('node:pointerover', onOver);
  graph.on('node:pointerleave', onLeave);
  canvas.addEventListener('mouseleave', reset);
  canvas.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  window.addEventListener('blur', onUp);
  return () => {
    graph.off('node:pointerover', onOver);
    graph.off('node:pointerleave', onLeave);
    canvas.removeEventListener('mouseleave', reset);
    canvas.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    window.removeEventListener('blur', onUp);
    reset();
  };
}
