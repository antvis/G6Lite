import { readFile } from 'node:fs/promises';

const [indexDeclaration, graphDeclaration, typesDeclaration] = await Promise.all([
  readFile(new URL('../dist/index.d.ts', import.meta.url), 'utf8'),
  readFile(new URL('../dist/graph.d.ts', import.meta.url), 'utf8'),
  readFile(new URL('../dist/types.d.ts', import.meta.url), 'utf8'),
]);

const failures = [];

for (const name of ['InternalNode', 'InternalEdge', 'InternalCombo']) {
  if (indexDeclaration.includes(name)) {
    failures.push(`dist/index.d.ts must not export ${name}`);
  }
  if (graphDeclaration.includes(name)) {
    failures.push(`dist/graph.d.ts public signatures must not reference ${name}`);
  }
}

if (/\bPickResult\b/u.test(graphDeclaration)) {
  failures.push('dist/graph.d.ts must not emit the internal PickResult helper');
}

for (const name of [
  'eventEmitter',
  'getLayoutNodes',
  'getCanvas',
  'getNodeIndex',
  'pickAt',
  'setHighlight',
  'clearHighlight',
  'updateData',
  'scheduleRender',
  'pickComboAt',
]) {
  if (new RegExp(`\\b${name}\\b`, 'u').test(graphDeclaration)) {
    failures.push(`dist/graph.d.ts must strip internal Graph member ${name}`);
  }
}

for (const name of ['NodeModel', 'EdgeModel', 'ComboModel', 'ElementModel']) {
  if (!indexDeclaration.includes(name)) {
    failures.push(`dist/index.d.ts must export ${name}`);
  }
}

if (!typesDeclaration.includes('((combo: ComboModel) => T)')) {
  failures.push('ComboStyleValue must expose ComboModel to extension callbacks');
}

if (failures.length > 0) {
  throw new Error(`Public declaration boundary check failed:\n- ${failures.join('\n- ')}`);
}
