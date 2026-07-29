import type { LabelLayout, LabelPlacement, NodeDecorationPlacement } from '../types.js';

export interface MeasuredDecorationItem {
  data: unknown;
  layout: LabelLayout;
  index: number;
  isOverflow?: boolean;
}

export function orderDecorationItems(
  items: MeasuredDecorationItem[],
  sort: 'none' | 'width-desc' | undefined,
): void {
  if (sort === 'width-desc') {
    items.sort((a, b) => b.layout.width - a.layout.width || a.index - b.index);
  }
}

export function selectVisibleDecorationItems(
  items: MeasuredDecorationItem[],
  maxVisible: number | undefined,
  expanded: boolean,
): { visibleItems: MeasuredDecorationItem[]; hiddenCount: number } {
  const limit = Math.max(1, maxVisible ?? items.length);
  if (expanded || items.length <= limit) return { visibleItems: items, hiddenCount: 0 };
  const visibleItems = items.slice(0, Math.max(0, limit - 1));
  return { visibleItems, hiddenCount: items.length - visibleItems.length };
}

export function createDecorationGroupLayout(
  items: MeasuredDecorationItem[],
  isStack: boolean,
  itemGap: number,
): LabelLayout {
  if (!isStack) return items[0].layout;
  return {
    width: Math.max(...items.map((item) => item.layout.width)),
    height:
      items.reduce((sum, item) => sum + item.layout.height, 0) +
      itemGap * Math.max(0, items.length - 1),
  };
}

export function resolveDecorationPlacement(
  requested: NodeDecorationPlacement,
  labelPlacement: LabelPlacement,
): LabelPlacement {
  if (requested !== 'follow-label') return requested;
  return labelPlacement === 'left' ? 'left' : 'right';
}

export function getStackItemX(
  placement: LabelPlacement,
  groupWidth: number,
  itemWidth: number,
): number {
  return placement === 'left' ? groupWidth / 2 - itemWidth / 2 : -groupWidth / 2 + itemWidth / 2;
}
