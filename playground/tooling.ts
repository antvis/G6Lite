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

/**
 * Canvas-based labels to avoid 5000 DOM nodes rebuild.
 * - Keep WebGL rendering unchanged
 * - Draw labels onto a 2D canvas overlay
 * - Use chunked rendering + throttled redraw for smoother interaction
 */
export function attachLabelsCanvas(
  container: HTMLElement,
  graph: GraphInstanceWithTools,
  opts?: {
    nodeLabel?: (node: LayoutNode) => string;
  }
): void {
  const overlayCanvas = document.createElement('canvas');
  overlayCanvas.className = 'label-canvas';
  overlayCanvas.style.position = 'absolute';
  overlayCanvas.style.left = '0';
  overlayCanvas.style.top = '0';
  overlayCanvas.style.width = '100%';
  overlayCanvas.style.height = '100%';
  overlayCanvas.style.pointerEvents = 'none';
  container.appendChild(overlayCanvas);

  const ctx = overlayCanvas.getContext('2d');
  if (!ctx) return;

  const FONT_BASE_CSS = 10;
  const FONT_SIZE_MIN = 6;
  const FONT_SIZE_MAX = 18;
  const LABEL_BATCH = 500; // progressive draw chunks
  const MIN_DRAW_INTERVAL_MS = 40; // throttle redraws during interaction

  let drawToken = 0;
  let lastDrawAt = 0;
  let needsRedraw = true;

  function syncCanvasSize(): { w: number; h: number } {
    const src = graph.getCanvas();
    const w = src.width;
    const h = src.height;
    if (overlayCanvas.width !== w) overlayCanvas.width = w;
    if (overlayCanvas.height !== h) overlayCanvas.height = h;
    return { w, h };
  }

  function getDprFromSrc(): number {
    const src = graph.getCanvas();
    const rect = src.getBoundingClientRect();
    const cssW = rect.width || 1;
    return Math.max(1, src.width / cssW);
  }

  function renderLabelsChunked(token: number): void {
    const nodes = graph.getLayoutNodes();
    const cam = graph.getCamera();
    const { w, h } = syncCanvasSize();

    // Match the original DOM label sizing formula (but convert CSS px -> device px).
    const fontSizeCss = Math.max(
      FONT_SIZE_MIN,
      Math.min(FONT_SIZE_MAX, FONT_BASE_CSS * cam.zoom)
    );
    const dpr = getDprFromSrc();
    const fontSizeDevice = fontSizeCss * dpr;

    // Use shadow instead of per-label background rectangles (much cheaper).
    ctx.clearRect(0, 0, w, h);
    ctx.shadowColor = 'rgba(255,255,255,0.8)';
    ctx.shadowBlur = Math.max(2, fontSizeDevice * 0.3);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${fontSizeDevice}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;

    let index = 0;
    function drawChunk() {
      if (token !== drawToken) return;

      const end = Math.min(index + LABEL_BATCH, nodes.length);
      for (; index < end; index++) {
        const node = nodes[index];
        const label =
          (opts?.nodeLabel && opts.nodeLabel(node)) ?? node.name ?? node.id;
        if (!label) continue;

        const [ndcX, ndcY] = graphToNDC(node.x, node.y, w, h, cam);
        const px = ((ndcX + 1) / 2) * w;
        const py = ((1 - ndcY) / 2) * h;

        // Approximate the DOM transform: translate(-50%, -120%)
        ctx.fillText(label, px, py - fontSizeDevice * 0.6);
      }

      if (index < nodes.length) {
        requestAnimationFrame(drawChunk);
      }
    }

    drawChunk();
  }

  function requestRenderIfNeeded(force = false) {
    const now = performance.now();
    if (!force && !needsRedraw) return;
    if (!force && now - lastDrawAt < MIN_DRAW_INTERVAL_MS) return;

    needsRedraw = false;
    lastDrawAt = now;
    drawToken++;
    renderLabelsChunked(drawToken);
  }

  // Track size changes (canvas resize due to flex layout)
  const ro = new ResizeObserver(() => {
    needsRedraw = true;
    requestRenderIfNeeded(true);
  });
  ro.observe(graph.getCanvas());

  // Camera change detection: behaviors update renderer.setCamera directly,
  // so we must observe via RAF and compare camera/size.
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
      needsRedraw = true;
      requestRenderIfNeeded(false);
    }

    requestRenderIfNeeded(false);
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

