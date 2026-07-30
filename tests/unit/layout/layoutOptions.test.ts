import { describe, expect, it } from 'vitest';
import { normalizeLibraryLayoutOptions } from '@src/layout/layoutOptions.js';

describe('layout option normalization', () => {
  it.each([
    [999, 100, 1],
    [1000, 200, 1.5],
    [1001, 200, 1.5],
    [5000, 200, 1.5],
    [5001, 50, 2],
    [6000, 50, 2],
  ])('uses consistent force thresholds for %i nodes', (nodeCount, maxIteration, minMovement) => {
    expect(normalizeLibraryLayoutOptions('force', { type: 'force' }, nodeCount)).toEqual({
      animate: false,
      maxIteration,
      minMovement,
    });
  });

  it('keeps explicit force options and maps iterations only when needed', () => {
    expect(
      normalizeLibraryLayoutOptions(
        'force',
        {
          type: 'force',
          worker: true,
          iterations: 80,
          maxIteration: 40,
          minMovement: 0.25,
          animate: true,
        },
        1000,
      ),
    ).toEqual({ maxIteration: 40, minMovement: 0.25, animate: true });

    expect(
      normalizeLibraryLayoutOptions('force', { type: 'force', iterations: 80 }, 1000),
    ).toMatchObject({ maxIteration: 80 });
  });

  it('applies the same ForceAtlas2 safety defaults at every runtime boundary', () => {
    expect(normalizeLibraryLayoutOptions('force-atlas2', { type: 'force-atlas2' }, 1000)).toEqual({
      animate: false,
      barnesHut: true,
      prune: false,
      maxIteration: 100,
    });
    expect(
      normalizeLibraryLayoutOptions('force-atlas2', { type: 'force-atlas2' }, 6000),
    ).toMatchObject({ maxIteration: 50 });
  });

  it('normalizes d3-force defaults without force-only iteration fields', () => {
    const options = normalizeLibraryLayoutOptions('d3-force', { type: 'd3-force' }, 1000);

    expect(options).toMatchObject({ animate: false, alphaDecay: 0.1 });
    expect(options.linkDistance).toBeCloseTo(Math.sqrt(1000) * 80);
    expect(options).not.toHaveProperty('maxIteration');
    expect(options).not.toHaveProperty('minMovement');
  });
});
