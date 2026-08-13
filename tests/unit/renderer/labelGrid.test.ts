import { describe, expect, it } from 'vitest';
import { LabelGrid } from '@src/renderer/labelGrid.js';

describe('LabelGrid', () => {
  it('allows non-overlapping labels inside the same grid cell', () => {
    const grid = new LabelGrid();
    grid.reset(400, 300);
    grid.register(10, 10, 20, 10);

    expect(grid.hasOverlap(80, 10, 20, 10)).toBe(false);
  });

  it('detects labels whose real bounds overlap', () => {
    const grid = new LabelGrid();
    grid.reset(400, 300);
    grid.register(10, 10, 20, 10);

    expect(grid.hasOverlap(25, 15, 20, 10)).toBe(true);
  });

  it('detects overlap when registered bounds span multiple cells', () => {
    const grid = new LabelGrid();
    grid.reset(400, 300);
    grid.register(140, 20, 30, 20);

    expect(grid.hasOverlap(160, 25, 20, 10)).toBe(true);
    expect(grid.hasOverlap(180, 25, 20, 10)).toBe(false);
  });

  it('clears registered bounds between frames', () => {
    const grid = new LabelGrid();
    grid.reset(400, 300);
    grid.register(10, 10, 20, 10);
    grid.reset(400, 300);

    expect(grid.hasOverlap(10, 10, 20, 10)).toBe(false);
  });
});
