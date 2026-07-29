import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as publicApi from '@src/index.js';

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

  it('uses directory barrels instead of reaching through directory internals', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/index.ts'), 'utf8');
    const directoryImports = [...source.matchAll(/from ['"]\.\/(\w+)\/([^'"]+)['"]/g)].map(
      (match) => match[0],
    );

    expect(directoryImports).toEqual(
      expect.arrayContaining([
        "from './behaviors/index.js'",
        "from './extensions/index.js'",
        "from './layout/index.js'",
        "from './renderer/index.js'",
      ]),
    );
    expect(directoryImports.every((entry) => entry.endsWith("/index.js'"))).toBe(true);
  });
});
