import type { Graph } from '../src/index.ts';
import type { LayoutNode } from '../src/types.ts';
import { graphToNDC } from '../src/renderer/camera.ts';

export interface GraphInstanceWithTools extends Graph {
  getCamera(): { x: number; y: number; zoom: number };
  setCamera(partial: { x?: number; y?: number; zoom?: number }): void;
  resetCamera(): void;
  getLayoutNodes(): LayoutNode[];
  getCanvas(): HTMLCanvasElement;
}

export function attachCanvasTools(
  container: HTMLElement,
  graph: GraphInstanceWithTools
): void {
  const toolbar = document.createElement('div');
  toolbar.className = 'canvas-toolbar';
  toolbar.innerHTML = `
    <button data-tool="zoom-in">＋</button>
    <button data-tool="zoom-out">－</button>
    <button data-tool="fit">全屏</button>
    <button data-tool="reset">还原</button>
  `;
  container.appendChild(toolbar);

  const ZOOM_STEP = 1.2;

  toolbar.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'BUTTON') return;
    const tool = target.getAttribute('data-tool');
    if (!tool) return;
    const cam = graph.getCamera();
    if (tool === 'zoom-in') {
      graph.setCamera({ zoom: cam.zoom * ZOOM_STEP });
    } else if (tool === 'zoom-out') {
      graph.setCamera({ zoom: cam.zoom / ZOOM_STEP });
    } else if (tool === 'reset') {
      graph.resetCamera();
    } else if (tool === 'fit') {
      fitView(graph);
    }
  });
}

export function attachLabels(
  container: HTMLElement,
  graph: GraphInstanceWithTools,
  opts?: {
    nodeLabel?: (node: LayoutNode) => string;
  }
): void {
  const overlay = document.createElement('div');
  overlay.className = 'label-overlay';
  container.appendChild(overlay);

  function renderLabels() {
    const nodes = graph.getLayoutNodes();
    const canvas = graph.getCanvas();
    const cam = graph.getCamera();
    const rect = canvas.getBoundingClientRect();
    const width = canvas.width;
    const height = canvas.height;

    overlay.innerHTML = '';

    const fontBase = 10;
    const camZoom = graph.getCamera().zoom;
    const fontSize = Math.max(6, Math.min(18, fontBase * camZoom));

    nodes.forEach((node) => {
      const label =
        (opts?.nodeLabel && opts.nodeLabel(node)) ??
        node.name ??
        node.id;
      if (!label) return;
      const [ndcX, ndcY] = graphToNDC(node.x, node.y, width, height, cam);
      const px = ((ndcX + 1) / 2) * rect.width;
      const py = ((1 - ndcY) / 2) * rect.height;
      const el = document.createElement('div');
      el.className = 'node-label';
      el.textContent = label;
      el.style.left = `${px}px`;
      el.style.top = `${py}px`;
      el.style.fontSize = `${fontSize}px`;
      overlay.appendChild(el);
    });
  }

  const ro = new ResizeObserver(() => renderLabels());
  ro.observe(graph.getCanvas());

  const origSetCamera = graph.setCamera.bind(graph);
  graph.setCamera = (partial) => {
    origSetCamera(partial);
    renderLabels();
  };

  renderLabels();

  // Also watch camera changes driven by behaviors (e.g. wheel zoom) via a lightweight RAF loop.
  let lastCam = { ...graph.getCamera() };
  let lastSize = { w: graph.getCanvas().width, h: graph.getCanvas().height };
  function tick() {
    const cam = graph.getCamera();
    const canvas = graph.getCanvas();
    const size = { w: canvas.width, h: canvas.height };
    if (
      cam.x !== lastCam.x ||
      cam.y !== lastCam.y ||
      cam.zoom !== lastCam.zoom ||
      size.w !== lastSize.w ||
      size.h !== lastSize.h
    ) {
      lastCam = { ...cam };
      lastSize = size;
      renderLabels();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function fitView(graph: GraphInstanceWithTools): void {
  const nodes = graph.getLayoutNodes();
  if (!nodes.length) return;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.y > maxY) maxY = n.y;
  }
  const width = maxX - minX || 1;
  const height = maxY - minY || 1;
  const canvas = graph.getCanvas();
  const rect = canvas.getBoundingClientRect();
  const viewW = rect.width || 800;
  const viewH = rect.height || 600;
  const scaleX = viewW / width;
  const scaleY = viewH / height;
  const zoom = Math.min(scaleX, scaleY) * 0.9;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  graph.setCamera({
    zoom,
    x: -centerX + (viewW / (2 * zoom)),
    y: -centerY + (viewH / (2 * zoom)),
  });
}

