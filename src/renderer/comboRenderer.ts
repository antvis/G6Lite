/**
 * Canvas2D underlay renderer for combo (group container) backgrounds.
 * Layered beneath the WebGL canvas with pointer-events: none.
 */

import { graphToNDC } from './camera.js';
import type { Camera } from './camera.js';
import type { InternalCombo, ComboConfig, ComboStyleConfig } from '../types.js';

function resolveComboStyle<T>(
  val: T | ((combo: InternalCombo) => T) | undefined,
  combo: InternalCombo,
  fallback: T,
): T {
  if (val === undefined) return fallback;
  return typeof val === 'function' ? (val as (c: InternalCombo) => T)(combo) : val;
}

export class ComboRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(container: HTMLElement, mainCanvas: HTMLCanvasElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    // Insert before mainCanvas (underlay)
    container.insertBefore(this.canvas, mainCanvas);
    this.ctx = this.canvas.getContext('2d')!;
  }

  private syncSize(): { w: number; h: number; dpr: number } {
    const rect = this.canvas.parentElement?.getBoundingClientRect();
    const cssW = rect?.width || 800;
    const cssH = rect?.height || 600;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(cssW * dpr);
    const h = Math.round(cssH * dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    return { w, h, dpr };
  }

  draw(combos: InternalCombo[], camera: Camera, config?: ComboConfig): void {
    const { w, h, dpr } = this.syncSize();
    const ctx = this.ctx;
    ctx.clearRect(0, 0, w, h);

    if (!combos.length) return;

    const style = config?.style;

    // Sort combos: parent first, children on top (render order)
    const sorted = this.sortByDepth(combos);

    for (const combo of sorted) {
      // Skip combos with no bounds
      if (combo.width === 0 && combo.height === 0) continue;

      // Skip hidden combos
      if (combo.states.has('hidden')) continue;

      if (combo.collapsed) {
        this.drawCollapsed(ctx, combo, camera, style, w, h, dpr);
      } else {
        this.drawExpanded(ctx, combo, camera, style, w, h, dpr);
      }
    }
  }

  private drawExpanded(
    ctx: CanvasRenderingContext2D,
    combo: InternalCombo,
    camera: Camera,
    style: ComboStyleConfig | undefined,
    w: number,
    h: number,
    dpr: number,
  ): void {
    const fill = resolveComboStyle(style?.fill, combo, 'rgba(100, 150, 255, 0.08)');
    const stroke = resolveComboStyle(style?.stroke, combo, 'rgba(100, 150, 255, 0.3)');
    const strokeWidth = style?.strokeWidth ?? 1;
    const borderRadius = style?.borderRadius ?? 8;
    const opacity = style?.opacity ?? 1;

    // Compute screen-space bounding box
    const halfW = combo.width / 2;
    const halfH = combo.height / 2;
    const topLeft = this.graphToScreen(combo.x - halfW, combo.y - halfH, camera, w, h);
    const bottomRight = this.graphToScreen(combo.x + halfW, combo.y + halfH, camera, w, h);

    const sx = topLeft[0];
    const sy = topLeft[1];
    const sw = bottomRight[0] - topLeft[0];
    const sh = bottomRight[1] - topLeft[1];

    // Skip if entirely outside viewport
    if (sx > w || sy > h || sx + sw < 0 || sy + sh < 0) return;

    const r = borderRadius * dpr * camera.zoom;

    ctx.save();
    ctx.globalAlpha = opacity;

    // Draw rounded rectangle
    ctx.beginPath();
    this.roundRect(ctx, sx, sy, sw, sh, Math.min(r, sw / 2, sh / 2));

    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth * dpr;
      ctx.stroke();
    }

    // Draw label
    const labelVal = style?.label;
    if (labelVal !== undefined) {
      const text = resolveComboStyle(labelVal, combo, combo.id);
      if (text) {
        this.drawLabel(ctx, text, sx, sy, sw, sh, style, dpr, camera.zoom);
      }
    }

    // State highlights
    if (combo.states.has('selected')) {
      ctx.strokeStyle = 'rgba(24, 144, 255, 0.8)';
      ctx.lineWidth = 2 * dpr;
      ctx.stroke();
    } else if (combo.states.has('active') || combo.states.has('highlight')) {
      ctx.strokeStyle = 'rgba(24, 144, 255, 0.5)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawCollapsed(
    ctx: CanvasRenderingContext2D,
    combo: InternalCombo,
    camera: Camera,
    style: ComboStyleConfig | undefined,
    w: number,
    h: number,
    dpr: number,
  ): void {
    const fill = resolveComboStyle(style?.fill, combo, 'rgba(100, 150, 255, 0.15)');
    const stroke = resolveComboStyle(style?.stroke, combo, 'rgba(100, 150, 255, 0.5)');
    const strokeWidth = style?.strokeWidth ?? 1;
    const collapsedSize = style?.collapsedSize ?? 30;

    const [px, py] = this.graphToScreen(combo.x, combo.y, camera, w, h);
    const radius = (collapsedSize / 2) * dpr * camera.zoom;

    // Skip if outside viewport
    if (px + radius < 0 || px - radius > w || py + radius < 0 || py - radius > h) return;

    ctx.save();
    ctx.globalAlpha = style?.opacity ?? 1;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);

    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth * dpr;
      ctx.stroke();
    }

    // Draw collapsed icon (a small "+" or node count)
    const nodeCount = combo.childNodeIds.size;
    if (nodeCount > 0 && radius > 8) {
      const fontSize = Math.max(10, Math.min(14, radius * 0.7));
      ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(nodeCount), px, py);
    }

    ctx.restore();
  }

  private drawLabel(
    ctx: CanvasRenderingContext2D,
    text: string,
    sx: number,
    sy: number,
    sw: number,
    _sh: number,
    style: ComboStyleConfig | undefined,
    dpr: number,
    zoom: number,
  ): void {
    const placement = style?.labelPlacement ?? 'top';
    const fontSize = (style?.labelFontSize ?? 12) * dpr * Math.min(zoom, 1.5);
    const color = style?.labelColor ?? 'rgba(0, 0, 0, 0.65)';

    if (fontSize < 6) return; // Too small to read

    ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';

    let lx = sx + sw / 2;
    let ly: number;

    if (placement === 'top') {
      ly = sy - fontSize * 0.5;
      ctx.textBaseline = 'bottom';
    } else if (placement === 'bottom') {
      ly = sy + _sh + fontSize * 0.5;
      ctx.textBaseline = 'top';
    } else {
      // inside
      ly = sy + fontSize * 1.2;
      ctx.textBaseline = 'top';
      lx = sx + 8 * dpr;
      ctx.textAlign = 'left';
    }

    ctx.fillText(text, lx, ly);
  }

  private graphToScreen(
    gx: number,
    gy: number,
    camera: Camera,
    w: number,
    h: number,
  ): [number, number] {
    const [ndcX, ndcY] = graphToNDC(gx, gy, w, h, camera);
    const px = ((ndcX + 1) / 2) * w;
    const py = ((1 - ndcY) / 2) * h;
    return [px, py];
  }

  private sortByDepth(combos: InternalCombo[]): InternalCombo[] {
    // Build depth map: root combos have depth 0, children have depth+1
    const depthMap = new Map<string, number>();
    const comboMap = new Map<string, InternalCombo>();
    for (const c of combos) comboMap.set(c.id, c);

    const visiting = new Set<string>();
    const getDepth = (id: string): number => {
      if (depthMap.has(id)) return depthMap.get(id)!;
      // Guard against circular parent-child relationships to avoid stack overflow.
      if (visiting.has(id)) {
        depthMap.set(id, 0);
        return 0;
      }
      const c = comboMap.get(id);
      if (!c || !c.parentId || !comboMap.has(c.parentId)) {
        depthMap.set(id, 0);
        return 0;
      }
      visiting.add(id);
      const d = getDepth(c.parentId) + 1;
      visiting.delete(id);
      depthMap.set(id, d);
      return d;
    };

    for (const c of combos) getDepth(c.id);

    // Sort parent-first so children overlay parents
    return [...combos].sort((a, b) => depthMap.get(a.id)! - depthMap.get(b.id)!);
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ): void {
    if (r <= 0) {
      ctx.rect(x, y, w, h);
      return;
    }
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /** Hit-test: check if a screen coordinate falls inside any combo. Returns deepest combo first. */
  pickAt(
    screenX: number,
    screenY: number,
    combos: InternalCombo[],
    camera: Camera,
    w: number,
    h: number,
  ): string | null {
    // Check from deepest to shallowest
    const sorted = this.sortByDepth(combos).reverse();
    for (const combo of sorted) {
      if (combo.collapsed) {
        const [px, py] = this.graphToScreen(combo.x, combo.y, camera, w, h);
        const r = 15 * camera.zoom;
        const dx = screenX - px;
        const dy = screenY - py;
        if (dx * dx + dy * dy <= r * r) return combo.id;
      } else {
        if (combo.width === 0 && combo.height === 0) continue;
        const halfW = combo.width / 2;
        const halfH = combo.height / 2;
        const [sx, sy] = this.graphToScreen(combo.x - halfW, combo.y - halfH, camera, w, h);
        const [ex, ey] = this.graphToScreen(combo.x + halfW, combo.y + halfH, camera, w, h);
        if (screenX >= sx && screenX <= ex && screenY >= sy && screenY <= ey) {
          return combo.id;
        }
      }
    }
    return null;
  }

  destroy(): void {
    this.canvas.remove();
  }
}
