import { transform } from 'sucrase';

import type { SiteExampleHandle } from './example-runtime';

// Modules the playground compiles against are provided by the site bundle
// itself through a global registry, injected while the compiled blob module
// executes. Unknown imports fail at runtime with the registry lookup.
const GLOBAL_KEY = '__g6litePlaygroundExternals__';

interface SiteExampleModule {
  run(container: string | HTMLElement): Promise<SiteExampleHandle>;
}

const layoutModules = {
  '@antv/g6-lite/layouts/mds': () => import('@antv/g6-lite/layouts/mds'),
  '@antv/g6-lite/layouts/radial': () => import('@antv/g6-lite/layouts/radial'),
  '@antv/g6-lite/layouts/indented': () => import('@antv/g6-lite/layouts/indented'),
  '@antv/g6-lite/layouts/mindmap': () => import('@antv/g6-lite/layouts/mindmap'),
  '@antv/g6-lite/layouts/fishbone': () => import('@antv/g6-lite/layouts/fishbone'),
  '@antv/g6-lite/layouts/random': () => import('@antv/g6-lite/layouts/random'),
};

async function loadExternals(code: string): Promise<Record<string, unknown>> {
  const [g6, demoPanel, tooling, lilGui] = await Promise.all([
    import('@antv/g6-lite'),
    import('../../demos/demo-panel.ts'),
    import('../../demos/tooling.ts'),
    import('lil-gui'),
  ]);
  const layouts = await Promise.all(
    Object.entries(layoutModules)
      .filter(([name]) => code.includes(`'${name}'`) || code.includes(`"${name}"`))
      .map(async ([name, load]) => [name, await load()] as const),
  );
  return {
    ...Object.fromEntries(layouts),
    '@antv/g6-lite': g6,
    'lil-gui': lilGui,
    './demo-panel.ts': demoPanel,
    './demo-panel': demoPanel,
    './tooling.ts': tooling,
    './tooling': tooling,
  };
}

function compile(source: string): string {
  // Strip TypeScript only; module statements stay in place so the rewritten
  // imports below can address the injected registry. Suited for single-file
  // demos, which is all the playground accepts.
  return transform(source, {
    transforms: ['typescript'],
    filePath: 'playground-example.ts',
  }).code;
}

// Static imports cannot load from a blob module, so rewrite each import
// statement into a destructuring from the injected registry. The input is
// either demo source style or user-edited code, both regular ESM imports.
function convertNamed(named: string): string {
  return named
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const alias = part.match(/^([\w$]+)\s+as\s+([\w$]+)$/);
      return alias ? `${alias[1]}: ${alias[2]}` : part;
    })
    .join(', ');
}

function rewriteImports(code: string): string {
  let output = code;

  output = output.replace(
    /^import\s+\*\s+as\s+([\w$]+)\s+from\s*(["'])([^"']+)\2\s*;?$/gm,
    (_match, name: string, _quote: string, src: string) =>
      `const ${name} = __ex[${JSON.stringify(src)}];`,
  );
  output = output.replace(
    /^import\s+([\w$]+)\s*,\s*\{([\s\S]*?)\}\s*from\s*(["'])([^"']+)\3\s*;?$/gm,
    (_match, def: string, named: string, _quote: string, src: string) =>
      `const { default: ${def}, ${convertNamed(named)} } = __ex[${JSON.stringify(src)}];`,
  );
  output = output.replace(
    /^import\s*\{([\s\S]*?)\}\s*from\s*(["'])([^"']+)\2\s*;?$/gm,
    (_match, named: string, _quote: string, src: string) =>
      `const {${convertNamed(named)}} = __ex[${JSON.stringify(src)}];`,
  );
  output = output.replace(
    /^import\s+([\w$]+)\s+from\s*(["'])([^"']+)\2\s*;?$/gm,
    (_match, def: string, _quote: string, src: string) =>
      `const { default: ${def} } = __ex[${JSON.stringify(src)}];`,
  );
  output = output.replace(/^import\s*(["'])([^"']+)\1\s*;?$/gm, '');

  if (/^import[\s{*]/m.test(output)) {
    throw new Error('Playground supports static imports of @antv/g6-lite, its optional layouts, lil-gui, demo-panel, and tooling only');
  }
  return output;
}

/**
 * Transpiles the edited TypeScript source in the browser and runs it against
 * the preview container, returning the same handle contract as the built-in
 * examples.
 */
export async function runPlaygroundExample(
  source: string,
  container: HTMLElement,
): Promise<SiteExampleHandle> {
  const code = compile(source);
  const externals = await loadExternals(code);
  const body = `const __ex = globalThis[${JSON.stringify(GLOBAL_KEY)}];\n${rewriteImports(code)}`;
  const url = URL.createObjectURL(new Blob([body], { type: 'text/javascript' }));

  try {
    (globalThis as Record<string, unknown>)[GLOBAL_KEY] = externals;
    // The blob URL only exists at runtime; bundlers must not resolve it.
    const mod = (await import(/* webpackIgnore: true */ url)) as SiteExampleModule;
    const handle = await mod.run(container);
    if (!handle || typeof handle.destroy !== 'function') {
      throw new Error('The example must return a handle with destroy()');
    }
    if (typeof handle.fitView !== 'function') {
      throw new Error('The example must return a handle with fitView()');
    }
    return handle;
  } finally {
    URL.revokeObjectURL(url);
    delete (globalThis as Record<string, unknown>)[GLOBAL_KEY];
  }
}
