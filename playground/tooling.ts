import type { Graph, NodeModel } from '../src/index.ts';

export type GraphInstanceWithTools = Graph;

function getMainCanvas(container: HTMLElement): HTMLCanvasElement {
  const canvases = container.querySelectorAll<HTMLCanvasElement>('canvas');
  const canvas = Array.from(canvases).find(
    (candidate) =>
      candidate.parentElement === container &&
      !candidate.classList.contains('label-canvas') &&
      !candidate.classList.contains('edge-label-canvas'),
  );
  if (!canvas) {
    throw new Error('Graph canvas not found in the supplied container.');
  }
  return canvas;
}

function graphToCanvas(
  graph: GraphInstanceWithTools,
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
): { x: number; y: number } {
  const point = graph.graphToScreen(x, y);
  const rect = canvas.getBoundingClientRect();
  return {
    x: (point.x - rect.left) * (canvas.width / (rect.width || 1)),
    y: (point.y - rect.top) * (canvas.height / (rect.height || 1)),
  };
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
      graph.fitView();
    }
  });
}

export function attachLabels(
  container: HTMLElement,
  graph: GraphInstanceWithTools,
  opts?: {
    nodeLabel?: (node: NodeModel) => string;
  }
): () => void {
  const canvas = getMainCanvas(container);
  const overlay = document.createElement('div');
  overlay.className = 'label-overlay';
  container.appendChild(overlay);

  function renderLabels() {
    const nodes = graph.getNodes();
    const rect = canvas.getBoundingClientRect();

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
      const point = graph.graphToScreen(node.x, node.y);
      const px = point.x - rect.left;
      const py = point.y - rect.top;
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
  ro.observe(canvas);

  const origSetCamera = graph.setCamera.bind(graph);
  graph.setCamera = (partial) => {
    origSetCamera(partial);
    renderLabels();
  };

  renderLabels();

  // Also watch camera changes driven by behaviors (e.g. wheel zoom) via a lightweight RAF loop.
  let lastCam = { ...graph.getCamera() };
  let lastSize = { w: canvas.width, h: canvas.height };
  function tick() {
    const cam = graph.getCamera();
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
    nodeLabel?: (node: NodeModel) => string;
    /** Where to render label relative to node: 'inside' centers text within node bounds,
     *  'above' renders above the node (default), 'below' renders below, 'right' renders to the
     *  right of the node's left edge (left-aligned), 'right-edge' right-aligns text at the
     *  node's right edge (for transparent nodes where the line meets the right edge).
     *  Can also be a per-node function. */
    position?: 'inside' | 'above' | 'below' | 'right' | 'right-edge' | ((node: NodeModel) => 'inside' | 'above' | 'below' | 'right' | 'right-edge');
    /** Return node size in graph coordinates for inside-node text layout. */
    nodeSize?: (node: NodeModel) => { width: number; height: number };
    /** Font size in CSS pixels at zoom=1. Default: 10 for outside, 11 for inside. */
    fontSize?: number | ((node: NodeModel) => number);
    /** Font family. Default: sans-serif. */
    fontFamily?: string;
    /** Text color — string or per-node function. Default: '#333'. */
    color?: string | ((node: NodeModel) => string);
    /** Secondary text color (for lines after the first in multi-line labels). */
    secondaryColor?: string;
  }
): () => void {
  const mainCanvas = getMainCanvas(container);
  const overlayCanvas = document.createElement('canvas');
  overlayCanvas.className = 'label-canvas';
  overlayCanvas.style.position = 'absolute';
  overlayCanvas.style.left = '0';
  overlayCanvas.style.top = '0';
  overlayCanvas.style.width = '100%';
  overlayCanvas.style.height = '100%';
  overlayCanvas.style.pointerEvents = 'none';
  container.appendChild(overlayCanvas);

  const context = overlayCanvas.getContext('2d');
  if (!context) {
    overlayCanvas.remove();
    return () => {};
  }
  const ctx = context;

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
    const w = mainCanvas.width;
    const h = mainCanvas.height;
    if (overlayCanvas.width !== w) overlayCanvas.width = w;
    if (overlayCanvas.height !== h) overlayCanvas.height = h;
    return { w, h };
  }

  function getDprFromSrc(): number {
    const rect = mainCanvas.getBoundingClientRect();
    const cssW = rect.width || 1;
    return Math.max(1, mainCanvas.width / cssW);
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
    const nodes = graph.getNodes();
    const cam = graph.getCamera();
    const { w, h } = syncCanvasSize();
    const dpr = getDprFromSrc();

    const fontSizeCss = fontSizeOpt && !isFontSizeFunction
      ? FONT_BASE_CSS
      : Math.max(FONT_SIZE_MIN, Math.min(FONT_SIZE_MAX, FONT_BASE_CSS * cam.zoom));
    const lineHeight = fontSizeCss * dpr * 1.3;

    ctx.clearRect(0, 0, w, h);
    ctx.textBaseline = 'middle';

    // Reuse a halo via stroke+fill rather than canvas shadowBlur — shadowBlur is a
    // slow software path that costs ~200µs per fillText, dominating draw time at 5k labels.
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    const HALO_COLOR = 'rgba(255,255,255,0.85)';
    const CULL_MARGIN = 64;
    let lastFont = '';

    let index = 0;
    function drawChunk() {
      if (token !== drawToken) return;

      const end = Math.min(index + LABEL_BATCH, nodes.length);
      for (; index < end; index++) {
        const node = nodes[index];
        const label =
          (opts?.nodeLabel && opts.nodeLabel(node)) ?? node.name ?? node.id;
        if (!label) continue;

        const { x: px, y: py } = graphToCanvas(
          graph,
          mainCanvas,
          node.x,
          node.y,
        );
        if (px < -CULL_MARGIN || px > w + CULL_MARGIN || py < -CULL_MARGIN || py > h + CULL_MARGIN) {
          continue;
        }

        const nodePos = getPosition(node);

        // Compute per-node font size
        const nodeFontSize = isFontSizeFunction ? getNodeFontSize(node) : fontSizeCss;
        const fontSizeDevice = nodeFontSize * dpr;
        const useHalo = nodePos !== 'inside' && nodePos !== 'right';

        const lines = label.split('\n');

        if (nodePos === 'right') {
          // Text left-aligned at node center (depth * indent),
          // positioned ABOVE the edge line.
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          const fontStr = `${fontSizeDevice}px ${FONT_FAMILY}`;
          if (fontStr !== lastFont) {
            ctx.font = fontStr;
            lastFont = fontStr;
          }
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
          const fontStr = `${fontSizeDevice}px ${FONT_FAMILY}`;
          if (fontStr !== lastFont) {
            ctx.font = fontStr;
            lastFont = fontStr;
          }
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

          if (useHalo) {
            ctx.lineWidth = Math.max(2, fontSizeDevice * 0.3);
            ctx.strokeStyle = HALO_COLOR;
          }

          if (lines.length === 1) {
            const offsetY = nodePos === 'below'
              ? fontSizeDevice * 0.8
              : -fontSizeDevice * 0.6;
            if (useHalo) ctx.strokeText(lines[0], textX, py + offsetY);
            ctx.fillText(lines[0], textX, py + offsetY);
          } else {
            const totalH = lines.length * lineHeight;
            const baseY = nodePos === 'below'
              ? py + fontSizeDevice * 0.5
              : py - totalH - fontSizeDevice * 0.2;
            for (let i = 0; i < lines.length; i++) {
              const ly = baseY + i * lineHeight + lineHeight / 2;
              if (useHalo) ctx.strokeText(lines[i].trim(), textX, ly);
              ctx.fillText(lines[i].trim(), textX, ly);
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
  ro.observe(mainCanvas);

  // Camera change detection: behaviors update renderer.setCamera directly,
  // so we must observe via RAF and compare camera/size.
  let lastCam = { ...graph.getCamera() };
  let lastSize = { w: mainCanvas.width, h: mainCanvas.height };

  function tick() {
    const cam = graph.getCamera();
    const size = { w: mainCanvas.width, h: mainCanvas.height };

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
  const mainCanvas = getMainCanvas(container);
  const overlayCanvas = document.createElement('canvas');
  overlayCanvas.className = 'edge-label-canvas';
  overlayCanvas.style.position = 'absolute';
  overlayCanvas.style.left = '0';
  overlayCanvas.style.top = '0';
  overlayCanvas.style.width = '100%';
  overlayCanvas.style.height = '100%';
  overlayCanvas.style.pointerEvents = 'none';
  container.appendChild(overlayCanvas);

  const context = overlayCanvas.getContext('2d');
  if (!context) {
    overlayCanvas.remove();
    return () => {};
  }
  const ctx = context;

  const FONT_BASE_CSS = opts?.fontSize ?? 9;
  const LABEL_COLOR = opts?.color ?? '#666';

  let needsRedraw = true;

  function syncCanvasSize(): { w: number; h: number } {
    const w = mainCanvas.width;
    const h = mainCanvas.height;
    if (overlayCanvas.width !== w) overlayCanvas.width = w;
    if (overlayCanvas.height !== h) overlayCanvas.height = h;
    return { w, h };
  }

  function getDpr(): number {
    const rect = mainCanvas.getBoundingClientRect();
    return Math.max(1, mainCanvas.width / (rect.width || 1));
  }

  function renderEdgeLabels(): void {
    const data = graph.getData();
    const layoutNodes = graph.getNodes();
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

      const { x: px, y: py } = graphToCanvas(
        graph,
        mainCanvas,
        midX,
        midY,
      );

      if (opts?.rotated) {
        // Compute screen-space angle from source to target
        const { x: spx, y: spy } = graphToCanvas(
          graph,
          mainCanvas,
          src.x,
          src.y,
        );
        const { x: tpx, y: tpy } = graphToCanvas(
          graph,
          mainCanvas,
          tgt.x,
          tgt.y,
        );
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
  ro.observe(mainCanvas);

  let lastCam = { ...graph.getCamera() };
  let lastSize = { w: mainCanvas.width, h: mainCanvas.height };

  function tick() {
    const cam = graph.getCamera();
    const size = { w: mainCanvas.width, h: mainCanvas.height };
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
