import { describe, expect, it } from 'vitest';
import { getLabelRenderer, registerLabelRenderer } from '../extensions/label.js';
import { extensionFactory, register, type LabelRenderer } from '../index.js';

function renderer(width: number): LabelRenderer {
  return {
    measure: () => ({ width, height: 10 }),
    draw: () => undefined,
  };
}

describe('label extension registry', () => {
  it('registers label renderers through register()', () => {
    const custom = renderer(20);

    register('label', 'registry-custom-label', custom);

    expect(getLabelRenderer('registry-custom-label')).toEqual(custom);
  });

  it('registers label renderer factories through register()', () => {
    register(
      'label',
      'registry-label-factory',
      extensionFactory(() => renderer(24)),
    );

    expect(getLabelRenderer('registry-label-factory')?.measure({} as never).width).toBe(24);
  });

  it('uses the latest renderer for duplicate names', () => {
    const first = renderer(10);
    const second = renderer(30);

    registerLabelRenderer('registry-replace-label', first);
    registerLabelRenderer('registry-replace-label', second);

    expect(getLabelRenderer('registry-replace-label')?.measure({} as never).width).toBe(30);
  });

  it('rejects empty renderer names', () => {
    expect(() => registerLabelRenderer('  ', renderer(10))).toThrow(/must not be empty/);
  });
});
