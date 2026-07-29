import type { NodeBadgeItem } from '../types';
import type { DecorationRenderer } from './contracts';

interface BuiltinBadgeLayoutData {
  shape: 'circle' | 'pill';
  text: string;
  fill: string;
  color: string;
  fontSize: number;
  kind: NodeBadgeItem['kind'];
  icon?: string;
  fontFamily: string;
}

const DEFAULT_FILL: Record<NodeBadgeItem['kind'], string> = {
  count: '#F4664A',
  lock: '#7E92B5',
  warning: '#F4664A',
  favorite: '#FFBE3A',
  text: '#F4664A',
  icon: '#7E92B5',
};

function getLabelScale(zoom: number): number {
  if (!Number.isFinite(zoom)) return 1;
  return Math.max(0.25, Math.min(zoom, 2));
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  const ellipsis = '…';
  if (ctx.measureText(ellipsis).width > maxWidth) return '';
  const glyphs = Array.from(text);
  let low = 0;
  let high = glyphs.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (ctx.measureText(`${glyphs.slice(0, mid).join('')}${ellipsis}`).width <= maxWidth) low = mid;
    else high = mid - 1;
  }
  return `${glyphs.slice(0, low).join('')}${ellipsis}`;
}

function drawLock(ctx: CanvasRenderingContext2D, size: number, color: string): void {
  const unit = size / 8;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, unit);
  ctx.beginPath();
  ctx.arc(0, -unit, unit * 1.7, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fillRect(-unit * 2.4, -unit, unit * 4.8, unit * 3.5);
}

function drawWarning(
  ctx: CanvasRenderingContext2D,
  size: number,
  color: string,
  fill: string,
): void {
  const radius = size * 0.34;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -radius);
  ctx.lineTo(radius, radius);
  ctx.lineTo(-radius, radius);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = fill;
  ctx.lineWidth = Math.max(1, size / 10);
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.45);
  ctx.lineTo(0, radius * 0.35);
  ctx.stroke();
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(0, radius * 0.68, Math.max(1, size / 18), 0, Math.PI * 2);
  ctx.fill();
}

function drawFavorite(ctx: CanvasRenderingContext2D, size: number, color: string): void {
  const outer = size * 0.34;
  const inner = outer * 0.45;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let index = 0; index < 10; index++) {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

export const builtinBadgeRenderer: DecorationRenderer<NodeBadgeItem> = {
  measure({ ctx, data, dpr, zoom, nodeWidth, nodeHeight }) {
    const nodeBaseSize = Math.max(1, Math.min(nodeWidth, nodeHeight));
    const badgeSize = nodeBaseSize / 3;
    const labelScale = dpr * getLabelScale(zoom / Math.max(dpr, Number.EPSILON));
    const fontSize = Math.min(8 * labelScale, badgeSize * 0.65);
    const color = data.color ?? '#FFFFFF';
    const fill = data.fill ?? DEFAULT_FILL[data.kind] ?? '#7E92B5';
    const fontFamily = data.iconFontFamily ?? 'sans-serif';
    const rawText =
      data.kind === 'count'
        ? String(data.value ?? '')
        : data.kind === 'text'
          ? String(data.text ?? '')
          : data.kind === 'icon'
            ? String(data.icon ?? '')
            : '';

    const contentFontSize = data.kind === 'icon' ? badgeSize * (2 / 3) : fontSize;
    ctx.font = `${contentFontSize}px ${fontFamily}`;
    if (data.kind === 'text') {
      const padding = 4 * dpr;
      const maxWidth = nodeBaseSize * 1.5;
      const availableTextWidth = Math.max(0, maxWidth - padding * 2);
      const text = fitText(ctx, rawText, availableTextWidth);
      const width = Math.min(
        maxWidth,
        Math.max(badgeSize, ctx.measureText(text).width + padding * 2),
      );
      return {
        width,
        height: badgeSize,
        data: {
          shape: 'pill',
          text,
          fill,
          color,
          fontSize,
          fontFamily,
          kind: data.kind,
        },
      };
    }

    return {
      width: badgeSize,
      height: badgeSize,
      data: {
        shape: 'circle',
        text: rawText,
        fill,
        color,
        fontSize: contentFontSize,
        fontFamily,
        kind: data.kind,
        icon: data.icon,
      },
    };
  },

  draw({ ctx, layout }) {
    const visual = layout.data as BuiltinBadgeLayoutData | undefined;
    if (!visual) return;
    ctx.save();
    ctx.fillStyle = visual.fill;
    ctx.beginPath();
    if (visual.shape === 'circle') {
      ctx.arc(0, 0, layout.width / 2, 0, Math.PI * 2);
    } else {
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(
          -layout.width / 2,
          -layout.height / 2,
          layout.width,
          layout.height,
          layout.height / 2,
        );
      } else {
        ctx.rect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
      }
    }
    ctx.fill();
    ctx.clip();

    if (visual.kind === 'lock') drawLock(ctx, layout.height, visual.color);
    else if (visual.kind === 'warning') drawWarning(ctx, layout.height, visual.color, visual.fill);
    else if (visual.kind === 'favorite') drawFavorite(ctx, layout.height, visual.color);
    else if (visual.text) {
      ctx.font = `${visual.fontSize}px ${visual.fontFamily}`;
      ctx.fillStyle = visual.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(visual.text, 0, 0);
    }
    ctx.restore();
  },
};
