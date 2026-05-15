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
): () => void {
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
    rafId = requestAnimationFrame(tick);
  }
  let rafId = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(rafId);
    ro.disconnect();
  };
}

/**
 * Canvas-based labels to avoid 5000 DOM nodes rebuild.
 * - Keep WebGL rendering unchanged
 * - Draw labels onto a 2D canvas overlay
 * - Use chunked rendering + throttled redraw for smoother interaction
 * - Supports multi-line text (\n), inside-node rendering, and text truncation
 */
export function attachLabelsCanvas(
  container: HTMLElement,
  graph: GraphInstanceWithTools,
  opts?: {
    nodeLabel?: (node: LayoutNode) => string;
    /** Where to render label relative to node: 'inside' centers text within node bounds,
     *  'above' renders above the node (default), 'below' renders below, 'right' renders to the
     *  right of the node's left edge (left-aligned), 'right-edge' right-aligns text at the
     *  node's right edge (for transparent nodes where the line meets the right edge).
     *  Can also be a per-node function. */
    position?: 'inside' | 'above' | 'below' | 'right' | 'right-edge' | ((node: LayoutNode) => 'inside' | 'above' | 'below' | 'right' | 'right-edge');
    /** Return node size in graph coordinates for inside-node text layout. */
    nodeSize?: (node: LayoutNode) => { width: number; height: number };
    /** Font size in CSS pixels at zoom=1. Default: 10 for outside, 11 for inside. */
    fontSize?: number;
    /** Font family. Default: sans-serif. */
    fontFamily?: string;
    /** Text color — string or per-node function. Default: '#333'. */
    color?: string | ((node: LayoutNode) => string);
    /** Secondary text color (for lines after the first in multi-line labels). */
    secondaryColor?: string;
  }
): () => void {
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

  const positionOpt = opts?.position ?? 'above';
  const getPosition = typeof positionOpt === 'function' ? positionOpt : () => positionOpt;
  const FONT_FAMILY = opts?.fontFamily ?? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  const fontSizeOpt = opts?.fontSize;
  const isFontSizeFunction = typeof fontSizeOpt === 'function';
  const FONT_BASE_CSS = isFontSizeFunction ? 14 : (fontSizeOpt ?? (positionOpt === 'inside' ? 11 : 10));
  const FONT_SIZE_MIN = fontSizeOpt ? 4 : 8;
  const FONT_SIZE_MAX = fontSizeOpt ? 72 : 24;
  const getNodeFontSize = isFontSizeFunction ? fontSizeOpt : () => FONT_BASE_CSS;
  const LABEL_BATCH = 500;
  const MIN_DRAW_INTERVAL_MS = 40;
  const colorOpt = opts?.color ?? '#333333';
  const getNodeColor = typeof colorOpt === 'function' ? colorOpt : () => colorOpt;
  const SECONDARY_COLOR = opts?.secondaryColor ?? '#666666';

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

  /** Truncate text to fit within maxWidth pixels, appending '...' if needed. */
  function truncateText(text: string, maxWidth: number): string {
    if (ctx.measureText(text).width <= maxWidth) return text;
    const ellipsis = '...';
    const ellipsisW = ctx.measureText(ellipsis).width;
    let lo = 0, hi = text.length;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (ctx.measureText(text.slice(0, mid)).width + ellipsisW <= maxWidth) lo = mid;
      else hi = mid - 1;
    }
    return lo > 0 ? text.slice(0, lo) + ellipsis : ellipsis;
  }

  function renderLabelsChunked(token: number): void {
    const nodes = graph.getLayoutNodes();
    const cam = graph.getCamera();
    const { w, h } = syncCanvasSize();
    const dpr = getDprFromSrc();

    const fontSizeCss = fontSizeOpt && !isFontSizeFunction
      ? FONT_BASE_CSS
      : Math.max(FONT_SIZE_MIN, Math.min(FONT_SIZE_MAX, FONT_BASE_CSS * cam.zoom));
    const lineHeight = fontSizeCss * dpr * 1.3;

    ctx.clearRect(0, 0, w, h);
    ctx.textBaseline = 'middle';

    let index = 0;
    function drawChunk() {
      if (token !== drawToken) return;

      const end = Math.min(index + LABEL_BATCH, nodes.length);
      for (; index < end; index++) {
        const node = nodes[index];
        const label =
          (opts?.nodeLabel && opts.nodeLabel(node)) ?? node.name ?? node.id;
        if (!label) continue;

        const nodePos = getPosition(node);

        // Compute per-node font size
        const nodeFontSize = isFontSizeFunction ? getNodeFontSize(node) : fontSizeCss;
        const fontSizeDevice = nodeFontSize * dpr;

        const [ndcX, ndcY] = graphToNDC(node.x, node.y, w, h, cam);
        const px = ((ndcX + 1) / 2) * w;
        const py = ((1 - ndcY) / 2) * h;

        const lines = label.split('\n');

        // Per-node shadow setup
        if (nodePos !== 'inside' && nodePos !== 'right') {
          ctx.shadowColor = 'rgba(255,255,255,0.85)';
          ctx.shadowBlur = Math.max(2, fontSizeDevice * 0.35);
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        } else {
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }

        if (nodePos === 'right') {
          // Text left-aligned at node center (depth * indent),
          // positioned ABOVE the edge line.
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          ctx.font = `${fontSizeDevice}px ${FONT_FAMILY}`;
          ctx.fillStyle = getNodeColor(node);
          const offsetY = 3 * dpr;
          if (lines.length === 1) {
            ctx.fillText(lines[0], px, py - offsetY);
          } else {
            const totalH = lines.length * lineHeight;
            const baseY = py - offsetY - totalH + lineHeight;
            for (let i = 0; i < lines.length; i++) {
              ctx.fillText(lines[i].trim(), px, baseY + i * lineHeight);
            }
          }
          ctx.textAlign = 'center';
        } else if (nodePos === 'right-edge' && opts?.nodeSize) {
          // Right-align text at the node's right edge (line endpoint).
          // The horizontal branch line ends at node.x + node.width/2 in graph coords.
          const { width: nw } = opts.nodeSize(node);
          const rightEdgePx = px + (nw / 2) * cam.zoom * dpr;
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.font = `${fontSizeDevice}px ${FONT_FAMILY}`;
          ctx.fillStyle = getNodeColor(node);
          ctx.fillText(lines[0] ?? '', rightEdgePx, py);
          ctx.textAlign = 'center';
        } else if (nodePos === 'inside' && opts?.nodeSize) {
          // Render text centered inside the node with word wrapping
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const { width: nw, height: nh } = opts.nodeSize(node);
          const nodeScreenW = nw * cam.zoom * dpr;
          const nodeScreenH = nh * cam.zoom * dpr;
          const padding = fontSizeDevice * 0.5;
          const maxTextW = nodeScreenW - padding * 2;

          // Word-wrap each line segment
          const wrappedLines: Array<{ text: string; bold: boolean }> = [];
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const isBold = i === 0 && lines.length > 1;
            const fs = isBold ? fontSizeDevice : fontSizeDevice * 0.85;
            ctx.font = `${isBold ? 'bold ' : ''}${fs}px ${FONT_FAMILY}`;

            if (maxTextW > 0 && ctx.measureText(line).width > maxTextW) {
              // Word wrap
              const words = line.split(/\s+/);
              let current = '';
              for (const word of words) {
                const test = current ? current + ' ' + word : word;
                if (ctx.measureText(test).width > maxTextW && current) {
                  wrappedLines.push({ text: current, bold: isBold });
                  current = word;
                } else {
                  current = test;
                }
              }
              if (current) wrappedLines.push({ text: current, bold: isBold });
            } else {
              wrappedLines.push({ text: line, bold: isBold });
            }
          }

          // Single line: just fill at center. Multi-line: distribute evenly.
          if (wrappedLines.length === 1) {
            const { text, bold } = wrappedLines[0];
            const fs = bold ? fontSizeDevice : fontSizeDevice * 0.85;
            ctx.font = `${bold ? 'bold ' : ''}${fs}px ${FONT_FAMILY}`;
            ctx.fillStyle = getNodeColor(node);
            const displayText = maxTextW > 0 ? truncateText(text, maxTextW) : text;
            ctx.fillText(displayText, px, py);
          } else {
            const insideLineH = fontSizeDevice * 1.2;
            const totalTextH = (wrappedLines.length - 1) * insideLineH;
            const startY = py - totalTextH / 2;

            for (let i = 0; i < wrappedLines.length; i++) {
              const { text, bold } = wrappedLines[i];
              const fs = bold ? fontSizeDevice : fontSizeDevice * 0.85;
              ctx.font = `${bold ? 'bold ' : ''}${fs}px ${FONT_FAMILY}`;
              ctx.fillStyle = getNodeColor(node);
              const displayText = maxTextW > 0 ? truncateText(text, maxTextW) : text;
              ctx.fillText(displayText, px, startY + i * insideLineH);
            }
          }
        } else {
          // Render text above or below the node
          ctx.font = `${fontSizeDevice}px ${FONT_FAMILY}`;
          ctx.fillStyle = getNodeColor(node);

          // 'above': text left-aligned at node's left edge (where indented-tree edge arrives),
          // positioned above the horizontal edge segment
          // 'below': text centered below the node
          let textX = px;
          if (nodePos === 'above' && opts?.nodeSize) {
            const nodeW = opts.nodeSize(node).width;
            textX = px - (nodeW * cam.zoom * dpr) / 2;
            ctx.textAlign = 'left';
          }

          if (lines.length === 1) {
            const offsetY = nodePos === 'below'
              ? fontSizeDevice * 0.8
              : -fontSizeDevice * 0.6;
            ctx.fillText(lines[0], textX, py + offsetY);
          } else {
            const totalH = lines.length * lineHeight;
            const baseY = nodePos === 'below'
              ? py + fontSizeDevice * 0.5
              : py - totalH - fontSizeDevice * 0.2;
            for (let i = 0; i < lines.length; i++) {
              ctx.fillText(lines[i].trim(), textX, baseY + i * lineHeight + lineHeight / 2);
            }
          }

          if (ctx.textAlign === 'left') ctx.textAlign = 'center';
        }
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
    rafId = requestAnimationFrame(tick);
  }

  let rafId = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(rafId);
    ro.disconnect();
    overlayCanvas.remove();
  };
}

/**
 * Canvas-based edge labels — render text at edge midpoints.
 * Follows the same camera-sync pattern as attachLabelsCanvas.
 */
export function attachEdgeLabelsCanvas(
  container: HTMLElement,
  graph: GraphInstanceWithTools,
  opts?: {
    edgeLabel?: (edge: { source: string; target: string; data?: Record<string, unknown> }) => string | undefined;
    fontSize?: number;
    color?: string;
    /** Badge background color. Default: 'rgba(255,255,255,0.9)'. Use function for per-edge color. */
    bgColor?: string | ((edge: { source: string; target: string; data?: Record<string, unknown> }, label: string) => string);
    /** Badge border radius. Default: 8. */
    borderRadius?: number;
    /** Badge border color. Default: '#e0e0e0'. */
    borderColor?: string;
    /** Badge padding in CSS px. Default: 4. */
    padding?: number;
    /** Label position relative to edge. Default: 'center'. */
    position?: 'center' | 'above' | 'below';
    /** Text alignment. Default: 'center'. */
    align?: 'center' | 'left' | 'right';
    /** Whether to render label rotated along the edge direction. Default: false. */
    rotated?: boolean;
    /** Whether to show badge background. Default: true. */
    showBg?: boolean;
  }
): () => void {
  const overlayCanvas = document.createElement('canvas');
  overlayCanvas.className = 'edge-label-canvas';
  overlayCanvas.style.position = 'absolute';
  overlayCanvas.style.left = '0';
  overlayCanvas.style.top = '0';
  overlayCanvas.style.width = '100%';
  overlayCanvas.style.height = '100%';
  overlayCanvas.style.pointerEvents = 'none';
  container.appendChild(overlayCanvas);

  const ctx = overlayCanvas.getContext('2d');
  if (!ctx) return;

  const FONT_BASE_CSS = opts?.fontSize ?? 9;
  const LABEL_COLOR = opts?.color ?? '#666';

  let needsRedraw = true;

  function syncCanvasSize(): { w: number; h: number } {
    const src = graph.getCanvas();
    const w = src.width;
    const h = src.height;
    if (overlayCanvas.width !== w) overlayCanvas.width = w;
    if (overlayCanvas.height !== h) overlayCanvas.height = h;
    return { w, h };
  }

  function getDpr(): number {
    const src = graph.getCanvas();
    const rect = src.getBoundingClientRect();
    return Math.max(1, src.width / (rect.width || 1));
  }

  function renderEdgeLabels(): void {
    const data = (graph as any).getData() as { edges: Array<{ source: string; target: string; data?: Record<string, unknown> }> };
    const layoutNodes = graph.getLayoutNodes();
    const cam = graph.getCamera();
    const { w, h } = syncCanvasSize();

    const nodeMap = new Map<string, { x: number; y: number }>();
    for (const n of layoutNodes) nodeMap.set(n.id, n);

    const dpr = getDpr();
    const fontSizeCss = Math.max(6, Math.min(16, FONT_BASE_CSS * cam.zoom));
    const fontSizeDevice = fontSizeCss * dpr;

    const labelPos = opts?.position ?? 'center';
    const labelAlign = opts?.align ?? 'center';
    const showBg = opts?.showBg ?? true;

    ctx.clearRect(0, 0, w, h);
    ctx.font = `${fontSizeDevice}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

    for (const edge of data.edges) {
      const label = opts?.edgeLabel ? opts.edgeLabel(edge) : (edge.data as any)?.label;
      if (!label) continue;

      const src = nodeMap.get(edge.source);
      const tgt = nodeMap.get(edge.target);
      if (!src || !tgt) continue;

      const midX = (src.x + tgt.x) / 2;
      const midY = (src.y + tgt.y) / 2;

      const [ndcX, ndcY] = graphToNDC(midX, midY, w, h, cam);
      const px = ((ndcX + 1) / 2) * w;
      const py = ((1 - ndcY) / 2) * h;

      if (opts?.rotated) {
        // Compute screen-space angle from source to target
        const [sNdcX, sNdcY] = graphToNDC(src.x, src.y, w, h, cam);
        const [tNdcX, tNdcY] = graphToNDC(tgt.x, tgt.y, w, h, cam);
        const spx = ((sNdcX + 1) / 2) * w;
        const spy = ((1 - sNdcY) / 2) * h;
        const tpx = ((tNdcX + 1) / 2) * w;
        const tpy = ((1 - tNdcY) / 2) * h;
        let angle = Math.atan2(tpy - spy, tpx - spx);
        // Flip text that would render upside down
        if (angle > Math.PI / 2 || angle < -Math.PI / 2) angle += Math.PI;

        const offsetAbove = -(fontSizeDevice * 0.5 + 2 * dpr);

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = LABEL_COLOR;
        ctx.fillText(label, 0, offsetAbove);
        ctx.restore();
        continue;
      }

      // Vertical offset for above/below positioning
      const yOffset = (fontSizeDevice * 0.7 + 2 * dpr) * (labelPos === 'above' ? -1 : labelPos === 'below' ? 1 : 0);

      // Text alignment
      ctx.textAlign = labelAlign;
      ctx.textBaseline = 'middle';

      const finalPx = px;
      const finalPy = py + yOffset;

      // Draw rounded-rect badge background (only if showBg)
      if (showBg) {
        const metrics = ctx.measureText(label);
        const pad = (opts?.padding ?? 4) * dpr;
        const badgeW = metrics.width + pad * 2;
        const badgeH = fontSizeDevice + pad * 2;
        let badgeX: number;
        if (labelAlign === 'right') badgeX = finalPx - badgeW;
        else if (labelAlign === 'left') badgeX = finalPx;
        else badgeX = finalPx - badgeW / 2;
        const badgeY = finalPy - badgeH / 2;  // center badge vertically on text midline
        const r = (opts?.borderRadius ?? 8) * dpr;
        const bgColor = typeof opts?.bgColor === 'function'
          ? opts.bgColor(edge, label)
          : (opts?.bgColor ?? 'rgba(255,255,255,0.9)');

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, Math.min(r, badgeH / 2));
        ctx.fillStyle = bgColor;
        ctx.fill();
        if (opts?.borderColor !== 'none') {
          ctx.strokeStyle = opts?.borderColor ?? '#e0e0e0';
          ctx.lineWidth = 1 * dpr;
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.fillStyle = LABEL_COLOR;
      ctx.fillText(label, finalPx, finalPy);
    }
  }

  const ro = new ResizeObserver(() => { needsRedraw = true; renderEdgeLabels(); });
  ro.observe(graph.getCanvas());

  let lastCam = { ...graph.getCamera() };
  let lastSize = { w: graph.getCanvas().width, h: graph.getCanvas().height };

  function tick() {
    const cam = graph.getCamera();
    const canvas = graph.getCanvas();
    const size = { w: canvas.width, h: canvas.height };
    if (
      cam.x !== lastCam.x || cam.y !== lastCam.y || cam.zoom !== lastCam.zoom ||
      size.w !== lastSize.w || size.h !== lastSize.h
    ) {
      lastCam = { ...cam };
      lastSize = size;
      needsRedraw = true;
    }
    if (needsRedraw) {
      needsRedraw = false;
      renderEdgeLabels();
    }
    rafId = requestAnimationFrame(tick);
  }
  let rafId = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(rafId);
    ro.disconnect();
    overlayCanvas.remove();
  };
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

