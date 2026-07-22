import { describe, expect, it, vi } from 'vitest';
import type { DecorationRenderer } from '@src/extensions/contracts.js';
import { getDecorationRenderer } from '@src/extensions/decoration.js';
import type { NodeBadgeItem } from '@src/types.js';

function makeContext() {
  return {
    measureText: vi.fn((text: string) => ({ width: text.length * 8 })),
    beginPath: vi.fn(),
    arc: vi.fn(),
    roundRect: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    font: '',
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    textAlign: 'start' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
  } as unknown as CanvasRenderingContext2D;
}

function measure(data: NodeBadgeItem, nodeSize = 60) {
  const ctx = makeContext();
  const renderer = getDecorationRenderer('builtin-badge') as DecorationRenderer<NodeBadgeItem>;
  const layout = renderer.measure({
    ctx,
    node: { id: 'n1' },
    data,
    dpr: 1,
    zoom: 1,
    nodeWidth: nodeSize,
    nodeHeight: nodeSize,
  });
  return { ctx, layout, renderer };
}

describe('builtin badge renderer', () => {
  it('registers automatically and sizes circular badges to one third of the node', () => {
    const small = measure({ kind: 'count', value: 12 }, 24).layout;
    const large = measure({ kind: 'count', value: 12 }, 60).layout;
    expect(small.width).toBeCloseTo(8);
    expect(small.height).toBeCloseTo(8);
    expect(large.width).toBeCloseTo(20);
    expect(large.height).toBeCloseTo(20);
  });

  it('uses the design token for count badges and draws the value', () => {
    const { ctx, layout, renderer } = measure({ kind: 'count', value: 12 });
    expect(layout.data).toMatchObject({ fill: '#F4664A', color: '#FFFFFF', text: '12' });
    renderer.draw({
      ctx,
      node: { id: 'n1' },
      data: { kind: 'count', value: 12 },
      dpr: 1,
      zoom: 1,
      nodeWidth: 60,
      nodeHeight: 60,
      layout,
    });
    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.fillText).toHaveBeenCalledWith('12', 0, 0);
  });

  it('limits pill width to 1.5 times the node and ellipsizes long text', () => {
    const { layout } = measure({ kind: 'text', text: '这是一个非常长的待排查标签' }, 60);
    expect(layout.height).toBeCloseTo(20);
    expect(layout.width).toBeLessThanOrEqual(90);
    expect(layout.data).toMatchObject({ shape: 'pill', fill: '#F4664A' });
    expect(String((layout.data as { text: string }).text)).toMatch(/…$/);
  });

  it.each([
    ['lock', '#7E92B5'],
    ['warning', '#F4664A'],
    ['favorite', '#FFBE3A'],
    ['icon', '#7E92B5'],
  ] as const)('uses the default %s color', (kind, fill) => {
    const { layout } = measure({ kind, icon: kind === 'icon' ? '★' : undefined });
    expect(layout.data).toMatchObject({ fill, color: '#FFFFFF', kind });
  });

  it('supports per-item fill and color overrides', () => {
    const { layout } = measure({ kind: 'icon', icon: 'G', fill: '#123456', color: '#ABCDEF' });
    expect(layout.data).toMatchObject({ fill: '#123456', color: '#ABCDEF', text: 'G' });
  });
});
