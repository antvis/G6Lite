import type {
  LabelLayout,
  LabelPlacement,
  NodeDecorationAnchor,
  NodeDecorationAttachment,
  ResolvedLabelStyle,
} from '../types';

export function getCustomNodeLabelAnchor(
  px: number,
  py: number,
  nodeWidth: number,
  nodeHeight: number,
  layout: LabelLayout,
  style: ResolvedLabelStyle,
  horizontalGap: number,
): { x: number; y: number } {
  let x = px + style.labelOffsetX;
  let y = py + style.labelOffsetY;
  switch (style.labelPlacement) {
    case 'bottom':
      y += nodeHeight / 2 + layout.height / 2 + style.labelFontSize * 0.1;
      break;
    case 'top':
      y -= nodeHeight / 2 + layout.height / 2 + style.labelFontSize * 0.1;
      break;
    case 'left':
      x -= nodeWidth / 2 + horizontalGap + layout.width / 2;
      break;
    case 'right':
      x += nodeWidth / 2 + horizontalGap + layout.width / 2;
      break;
    case 'center':
      break;
  }
  return { x, y };
}

export function getNodeDecorationAnchor(
  px: number,
  py: number,
  nodeWidth: number,
  nodeHeight: number,
  layout: LabelLayout,
  placement: LabelPlacement,
  attachment: NodeDecorationAttachment,
  anchor: NodeDecorationAnchor,
  gap: number,
  crossOffsetRatio = 0,
  boundaryOverlap = 0,
  boundaryAnchor?: { x: number; y: number },
): { x: number; y: number } {
  let x = px + (boundaryAnchor?.x ?? 0);
  let y = py + (boundaryAnchor?.y ?? 0);
  let widthOffset = 0;
  let heightOffset = 0;
  if (attachment === 'outside') {
    widthOffset = layout.width / 2 + gap;
    heightOffset = layout.height / 2 + gap;
  } else if (attachment === 'inside') {
    widthOffset = -layout.width / 2;
    heightOffset = -layout.height / 2;
  }

  if (!boundaryAnchor) {
    if (placement === 'top') y -= nodeHeight / 2 + heightOffset;
    else if (placement === 'bottom') y += nodeHeight / 2 + heightOffset;
    else if (placement === 'left') x -= nodeWidth / 2 + widthOffset;
    else if (placement === 'right') x += nodeWidth / 2 + widthOffset;
  } else if (attachment === 'outside' || attachment === 'inside') {
    if (placement === 'top') y -= heightOffset;
    else if (placement === 'bottom') y += heightOffset;
    else if (placement === 'left') x -= widthOffset;
    else if (placement === 'right') x += widthOffset;
  }

  if (anchor !== 'center') {
    const direction = anchor === 'start' ? 1 : -1;
    if (placement === 'right') x += (layout.width / 2) * direction;
    else if (placement === 'left') x -= (layout.width / 2) * direction;
    else if (placement === 'bottom') y += (layout.height / 2) * direction;
    else if (placement === 'top') y -= (layout.height / 2) * direction;
  }

  if (anchor === 'start' && boundaryOverlap) {
    if (placement === 'right') x -= boundaryOverlap;
    else if (placement === 'left') x += boundaryOverlap;
    else if (placement === 'bottom') y -= boundaryOverlap;
    else if (placement === 'top') y += boundaryOverlap;
  }

  if (!boundaryAnchor) {
    if (placement === 'left' || placement === 'right') y += nodeHeight * crossOffsetRatio;
    else if (placement === 'top' || placement === 'bottom') x += nodeWidth * crossOffsetRatio;
  }
  return { x, y };
}

export function getBuiltInNodeBoundaryAnchor(
  base: 'circle' | 'rect',
  placement: 'left' | 'right' | 'top' | 'bottom',
  width: number,
  height: number,
  crossOffsetRatio: number,
  borderRadius = 0,
): { x: number; y: number } {
  const radiusX = width / 2;
  const radiusY = height / 2;
  if (placement === 'left' || placement === 'right') {
    const y = Math.max(-radiusY, Math.min(radiusY, height * crossOffsetRatio));
    let x = radiusX;
    if (base === 'circle' && radiusY > 0) {
      x = radiusX * Math.sqrt(Math.max(0, 1 - (y * y) / (radiusY * radiusY)));
    } else if (base === 'rect' && borderRadius > 0 && Math.abs(y) > radiusY - borderRadius) {
      const cornerY = Math.abs(y) - (radiusY - borderRadius);
      x = radiusX - borderRadius + Math.sqrt(Math.max(0, borderRadius ** 2 - cornerY ** 2));
    }
    return { x: placement === 'right' ? x : -x, y };
  }

  const x = Math.max(-radiusX, Math.min(radiusX, width * crossOffsetRatio));
  let y = radiusY;
  if (base === 'circle' && radiusX > 0) {
    y = radiusY * Math.sqrt(Math.max(0, 1 - (x * x) / (radiusX * radiusX)));
  } else if (base === 'rect' && borderRadius > 0 && Math.abs(x) > radiusX - borderRadius) {
    const cornerX = Math.abs(x) - (radiusX - borderRadius);
    y = radiusY - borderRadius + Math.sqrt(Math.max(0, borderRadius ** 2 - cornerX ** 2));
  }
  return { x, y: placement === 'bottom' ? y : -y };
}
