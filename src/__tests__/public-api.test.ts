import { describe, expect, it } from 'vitest';
import * as publicApi from '../index.js';

describe('package public API boundary', () => {
  it('exports the reviewed runtime surface only', () => {
    expect(Object.keys(publicApi).sort()).toEqual([
      'BaseNode',
      'BreathingNode',
      'EventEmitter',
      'Graph',
      'extensionFactory',
      'register',
      'registerNode',
      'resolveTheme',
      'runLayout',
    ]);
  });

  it('does not expose engine implementation classes from the package root', () => {
    expect(publicApi).not.toHaveProperty('DataModel');
    expect(publicApi).not.toHaveProperty('RenderScheduler');
    expect(publicApi).not.toHaveProperty('RefreshLevel');
  });
});
