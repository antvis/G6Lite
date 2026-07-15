/**
 * Canvas2D underlay renderer for combo (group container) backgrounds.
 * Layered beneath the WebGL canvas with pointer-events: none.
 */

import type {
  ComboConfig,
  ComboStateStyleOverride,
  ComboStyleConfig,
  ElementState,
  InternalCombo,
} from '../types.js';
import type { Camera } from './camera.js';
import { graphToNDC } from './camera.js';

type ComboSize = number | [number, number];

interface ResolvedComboStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  borderRadius: number;
  label?: string | false;
  labelFontSize: number;
  labelColor: string;
  labelPlacement: 'top' | 'bottom' | 'inside' | 'center';
  collapsedType: 'circle' | 'rect';
  collapsedSize: ComboSize;
  count: boolean | string;
}

const STATE_ORDER: ElementState[] = ['active', 'highlight', 'selected', 'disabled', 'inactive'];

function resolveComboStyle<T>(
  val: T | ((combo: InternalCombo) => T) | undefined,
  combo: InternalCombo,
  fallback: T,
): T {
  if (val === undefined) return fallback;
  return typeof val === 'function' ? (val as (c: InternalCombo) => T)(combo) : val;
}

function mergeDefined(target: Record<string, unknown>, source: object | undefined): void {
  if (!source) return;
  for (const [key, value] of Object.entries(source)) {
    if (key === 'stateStyles' || value === undefined) continue;
    (target as Record<string, unknown>)[key] = value;
  }
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

    // Sort combos: parent first, children on top (render order)
    const sorted = this.sortByDepth(combos);
    const comboMap = new Map(combos.map((combo) => [combo.id, combo]));

    for (const combo of sorted) {
      // Skip combos with no bounds
      if (combo.width === 0 && combo.height === 0) continue;

      // Skip hidden combos
      if (combo.states.has('hidden')) continue;

      const style = this.resolveStyle(combo, config);
      const hasExplicitSelectedStyle = this.hasStateStyle(combo, config, 'selected');
      const hasExplicitActiveStyle =
        this.hasStateStyle(combo, config, 'active') ||
        this.hasStateStyle(combo, config, 'highlight');

      if (combo.collapsed) {
        this.drawCollapsed(ctx, combo, camera, style, comboMap, w, h, dpr);
      } else {
        this.drawExpanded(ctx, combo, camera, style, w, h, dpr);
      }

      this.drawStateOverlay(
        ctx,
        combo,
        camera,
        style,
        w,
        h,
        dpr,
        hasExplicitSelectedStyle,
        hasExplicitActiveStyle,
      );
    }
  }

  private resolveStyle(combo: InternalCombo, config?: ComboConfig): ResolvedComboStyle {
    const merged: Partial<ComboStyleConfig> = {};
    mergeDefined(merged, config?.style);
    mergeDefined(merged, combo.style);

    for (const state of STATE_ORDER) {
      if (!combo.states.has(state)) continue;
      mergeDefined(merged, config?.style?.stateStyles?.[state] as ComboStateStyleOverride);
      mergeDefined(merged, combo.style?.stateStyles?.[state] as ComboStateStyleOverride);
    }

    const collapsedSize = resolveComboStyle(
      merged.collapsedSize ?? merged.size,
      combo,
      30 as ComboSize,
    );
    const count = resolveComboStyle(merged.count, combo, true);

    return {
      fill: resolveComboStyle(merged.fill, combo, 'rgba(100, 150, 255, 0.08)'),
      stroke: resolveComboStyle(merged.stroke, combo, 'rgba(100, 150, 255, 0.3)'),
      strokeWidth: resolveComboStyle(merged.strokeWidth, combo, 1),
      opacity: resolveComboStyle(merged.opacity, combo, 1),
      borderRadius: resolveComboStyle(merged.borderRadius, combo, 8),
      label: resolveComboStyle(merged.label, combo, undefined),
      labelFontSize: resolveComboStyle(merged.labelFontSize, combo, 12),
      labelColor: resolveComboStyle(merged.labelColor, combo, 'rgba(0, 0, 0, 0.65)'),
      labelPlacement: merged.labelPlacement ?? 'top',
      collapsedType: merged.collapsedType ?? 'circle',
      collapsedSize,
      count,
    };
  }

  private hasStateStyle(
    combo: InternalCombo,
    config: ComboConfig | undefined,
    state: ElementState,
  ): boolean {
    return Boolean(config?.style?.stateStyles?.[state] || combo.style?.stateStyles?.[state]);
  }

  private drawExpanded(
    ctx: CanvasRenderingContext2D,
    combo: InternalCombo,
    camera: Camera,
    style: ResolvedComboStyle,
    w: number,
    h: number,
    dpr: number,
  ): void {
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

    const r = style.borderRadius * dpr * camera.zoom;

    ctx.save();
    ctx.globalAlpha = style.opacity;

    // Draw rounded rectangle
    ctx.beginPath();
    this.roundRect(ctx, sx, sy, sw, sh, Math.min(r, sw / 2, sh / 2));

    if (style.fill) {
      ctx.fillStyle = style.fill;
      ctx.fill();
    }
    if (style.stroke) {
      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = style.strokeWidth * dpr;
      ctx.stroke();
    }

    if (style.label) {
      this.drawLabel(ctx, style.label, sx, sy, sw, sh, style, dpr, camera.zoom);
    }

    ctx.restore();
  }

  private drawCollapsed(
    ctx: CanvasRenderingContext2D,
    combo: InternalCombo,
    camera: Camera,
    style: ResolvedComboStyle,
    comboMap: Map<string, InternalCombo>,
    w: number,
    h: number,
    dpr: number,
  ): void {
    const [px, py] = this.graphToScreen(combo.x, combo.y, camera, w, h);
    const [cw, ch] = this.getCollapsedScreenSize(style, camera, dpr);
    const radius = Math.min(cw, ch) / 2;

    // Skip if outside viewport
    if (px + cw / 2 < 0 || px - cw / 2 > w || py + ch / 2 < 0 || py - ch / 2 > h) return;

    ctx.save();
    ctx.globalAlpha = style.opacity;
    ctx.beginPath();

    if (style.collapsedType === 'rect') {
      this.roundRect(ctx, px - cw / 2, py - ch / 2, cw, ch, Math.min(8 * dpr, cw / 2, ch / 2));
    } else {
      ctx.arc(px, py, radius, 0, Math.PI * 2);
    }

    if (style.fill) {
      ctx.fillStyle = style.fill;
      ctx.fill();
    }
    if (style.stroke) {
      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = style.strokeWidth * dpr;
      ctx.stroke();
    }

    const text = this.getCollapsedText(combo, comboMap, style);
    if (text && radius > 8) {
      const fontSize = Math.max(10 * dpr, Math.min(style.labelFontSize * dpr, radius * 0.7));
      ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = style.labelColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, px, py);
    }

    ctx.restore();
  }

  private drawStateOverlay(
    ctx: CanvasRenderingContext2D,
    combo: InternalCombo,
    camera: Camera,
    style: ResolvedComboStyle,
    w: number,
    h: number,
    dpr: number,
    hasExplicitSelectedStyle: boolean,
    hasExplicitActiveStyle: boolean,
  ): void {
    if (combo.states.has('selected') && !hasExplicitSelectedStyle) {
      this.strokeComboOutline(ctx, combo, camera, style, w, h, dpr, 'rgba(24, 144, 255, 0.85)', 2);
      return;
    }
    if ((combo.states.has('active') || combo.states.has('highlight')) && !hasExplicitActiveStyle) {
      this.strokeComboOutline(ctx, combo, camera, style, w, h, dpr, 'rgba(24, 144, 255, 0.5)', 1.5);
    }
  }

  private strokeComboOutline(
    ctx: CanvasRenderingContext2D,
    combo: InternalCombo,
    camera: Camera,
    style: ResolvedComboStyle,
    w: number,
    h: number,
    dpr: number,
    stroke: string,
    strokeWidth: number,
  ): void {
    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth * dpr;
    ctx.beginPath();
    if (combo.collapsed) {
      const [px, py] = this.graphToScreen(combo.x, combo.y, camera, w, h);
      const [cw, ch] = this.getCollapsedScreenSize(style, camera, dpr);
      if (style.collapsedType === 'rect') {
        this.roundRect(ctx, px - cw / 2, py - ch / 2, cw, ch, Math.min(8 * dpr, cw / 2, ch / 2));
      } else {
        ctx.arc(px, py, Math.min(cw, ch) / 2, 0, Math.PI * 2);
      }
    } else {
      const halfW = combo.width / 2;
      const halfH = combo.height / 2;
      const [sx, sy] = this.graphToScreen(combo.x - halfW, combo.y - halfH, camera, w, h);
      const [ex, ey] = this.graphToScreen(combo.x + halfW, combo.y + halfH, camera, w, h);
      const sw = ex - sx;
      const sh = ey - sy;
      const r = style.borderRadius * dpr * camera.zoom;
      this.roundRect(ctx, sx, sy, sw, sh, Math.min(r, sw / 2, sh / 2));
    }
    ctx.stroke();
    ctx.restore();
  }

  private getCollapsedText(
    combo: InternalCombo,
    comboMap: Map<string, InternalCombo>,
    style: ResolvedComboStyle,
  ): string | null {
    if (style.label !== undefined) return style.label === false ? null : style.label;
    if (style.count === false) return null;
    if (typeof style.count === 'string') return style.count;
    return String(this.countChildNodes(combo, comboMap));
  }

  private countChildNodes(combo: InternalCombo, comboMap: Map<string, InternalCombo>): number {
    const visited = new Set<string>();
    const visit = (current: InternalCombo): number => {
      if (visited.has(current.id)) return 0;
      visited.add(current.id);
      let count = current.childNodeIds.size;
      for (const childId of current.childComboIds) {
        const child = comboMap.get(childId);
        if (child) count += visit(child);
      }
      return count;
    };
    return visit(combo);
  }

  private getCollapsedScreenSize(
    style: ResolvedComboStyle,
    camera: Camera,
    dpr: number,
  ): [number, number] {
    const size = style.collapsedSize;
    const width = Array.isArray(size) ? size[0] : size;
    const height = Array.isArray(size) ? size[1] : size;
    return [width * dpr * camera.zoom, height * dpr * camera.zoom];
  }

  private drawLabel(
    ctx: CanvasRenderingContext2D,
    text: string,
    sx: number,
    sy: number,
    sw: number,
    _sh: number,
    style: ResolvedComboStyle,
    dpr: number,
    zoom: number,
  ): void {
    const placement = style.labelPlacement;
    const fontSize = style.labelFontSize * dpr * Math.min(zoom, 1.5);
    const color = style.labelColor;

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
    } else if (placement === 'center') {
      ly = sy + _sh / 2;
      ctx.textBaseline = 'middle';
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
    config?: ComboConfig,
  ): string | null {
    // Check from deepest to shallowest
    const sorted = this.sortByDepth(combos).reverse();
    const dpr = window.devicePixelRatio || 1;
    for (const combo of sorted) {
      if (combo.states.has('hidden')) continue;
      const style = this.resolveStyle(combo, config);
      if (combo.collapsed) {
        const [px, py] = this.graphToScreen(combo.x, combo.y, camera, w, h);
        const [cw, ch] = this.getCollapsedScreenSize(style, camera, dpr);
        const dx = screenX - px;
        const dy = screenY - py;
        if (style.collapsedType === 'rect') {
          if (Math.abs(dx) <= cw / 2 && Math.abs(dy) <= ch / 2) return combo.id;
        } else {
          const r = Math.min(cw, ch) / 2;
          if (dx * dx + dy * dy <= r * r) return combo.id;
        }
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
