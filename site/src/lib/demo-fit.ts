import type { FitViewOptions, Graph } from '../../../src/index.ts';

type Insets = [number, number, number, number];

function getOverlayRect(overlay: HTMLElement): DOMRect {
  const rect = overlay.getBoundingClientRect();
  if (!overlay.classList.contains('g6lite-demo-controls') || !rect.width || !rect.height) return rect;
  const heading = overlay.querySelector<HTMLElement>(':scope > .lil-title[aria-expanded="true"]');
  const contents = overlay.querySelector<HTMLElement>(':scope > .lil-children');
  if (!heading || !contents || !overlay.parentElement) return rect;

  // Reserve the expanded panel while its opening animation is still running.
  const parent = overlay.parentElement.getBoundingClientRect();
  const height = Math.min(parent.bottom - rect.top, heading.offsetHeight + contents.scrollHeight);
  return new DOMRect(rect.x, rect.y, rect.width, Math.max(rect.height, height));
}

export function fitDemoView(
  graph: Graph,
  toolbar: HTMLElement | null,
  { compact = false, options = {}, overlayRoot }: {
    compact?: boolean;
    options?: FitViewOptions;
    overlayRoot?: HTMLElement;
  } = {},
) {
  const element = graph.getCanvas();
  const canvas = element.getBoundingClientRect();
  if (!canvas.width || !canvas.height) return;

  const base = options.padding ?? Math.min(40, canvas.width * 0.09, canvas.height * 0.13);
  const initialPadding: Insets = Array.isArray(base)
    ? [...base]
    : [base, base, base, base];
  const overlays = Array.from(
    (overlayRoot ?? element.parentElement)?.querySelectorAll<HTMLElement>('.g6lite-demo-controls, [role="status"]') ?? [],
  );
  if (toolbar) overlays.push(toolbar);

  const rects = overlays.map((overlay) => ({
    rect: getOverlayRect(overlay),
    bottomGap: overlay === toolbar && !compact ? 20 : 36,
  }));
  let candidates = [initialPadding];
  for (const { rect, bottomGap } of rects) {
    if (
      !rect.width || !rect.height ||
      rect.right <= canvas.left || rect.left >= canvas.right ||
      rect.bottom <= canvas.top || rect.top >= canvas.bottom
    ) {
      continue;
    }

    // The fit bounds cover geometry. Reserve extra room between it and any
    // overlay so labels and decorations have room to extend past those bounds.
    const insets = [
      rect.bottom - canvas.top + 16,
      canvas.right - rect.left + 24,
      canvas.bottom - rect.top + bottomGap,
      rect.right - canvas.left + 24,
    ];
    // Consider reserving space on either axis for each corner overlay.
    // Choosing the sides together avoids sacrificing the same axis twice.
    const next = candidates.flatMap((candidate) => {
      if (candidate.some((value, side) => value >= insets[side])) return [candidate];
      return insets.map((inset, side) => {
        const padding: Insets = [...candidate];
        padding[side] = inset;
        return padding;
      }).filter(([top, right, bottom, left]) =>
        left + right < canvas.width && top + bottom < canvas.height,
      );
    });
    if (next.length) candidates = next;
  }

  const area = ([top, right, bottom, left]: Insets) =>
    (canvas.width - left - right) * (canvas.height - top - bottom);
  const padding = candidates.reduce((best, candidate) =>
    area(candidate) > area(best) ? candidate : best,
  );

  if (compact) {
    const maxWidth = 560;
    const maxHeight = 240;
    const centeredInset = (canvas.width - maxWidth) / 2;
    if (centeredInset >= Math.max(padding[1], padding[3])) {
      padding[1] = padding[3] = centeredInset;
    }
    const extraX = Math.max(0, canvas.width - padding[1] - padding[3] - maxWidth) / 2;
    const extraY = Math.max(0, canvas.height - padding[0] - padding[2] - maxHeight) / 2;
    padding[0] += extraY;
    padding[1] += extraX;
    padding[2] += extraY;
    padding[3] += extraX;
  }

  // fitView uses backing pixels. Keep the compact scale equal across displays.
  const maxZoom = options.maxZoom ?? (compact ? 1.4 * Math.min(2, window.devicePixelRatio || 1) : undefined);
  graph.fitView({ ...options, padding, maxZoom });
}
