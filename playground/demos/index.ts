import catalogData from './catalog.json';

export type DemoCategory =
  | 'getting-started'
  | 'data'
  | 'node'
  | 'edge'
  | 'label'
  | 'layout'
  | 'interaction'
  | 'combo'
  | 'theme'
  | 'extension'
  | 'scenario'
  | 'dataset'
  | 'performance'
  | 'regression';

export type DemoKind = 'functional' | 'regression' | 'scenario' | 'performance' | 'dataset';
export type DemoAudience = 'playground' | 'site';
export type DemoReleaseCheck = 'smoke' | 'visual' | 'full' | false;
export type DemoCaptureMode = 'visual' | 'artifact' | 'none';

export interface DemoCaptureConfig {
  mode: DemoCaptureMode;
  settleMs?: number;
  deviceScaleFactor?: number;
}

export interface DemoCatalogEntry {
  id: string;
  file: string;
  title: string;
  description: string;
  category: DemoCategory;
  kind: DemoKind;
  audiences: DemoAudience[];
  coverage: string[];
  releaseCheck: DemoReleaseCheck;
  capture: DemoCaptureConfig;
  aliases?: string[];
}

export interface DemoHandle {
  destroy(): void;
  ready?: Promise<void>;
}

export interface DemoModule {
  run(container: string | HTMLElement): Promise<DemoHandle>;
}

export interface DemoItem extends DemoCatalogEntry {
  loadModule(): Promise<DemoModule>;
  loadSource(): Promise<string>;
}

const moduleLoaders = import.meta.glob<DemoModule>('./*.ts');
const sourceLoaders = import.meta.glob<string>('./*.ts', {
  query: '?raw',
  import: 'default',
});

function assertCatalog(entries: DemoCatalogEntry[]): void {
  const ids = new Set<string>();
  const aliases = new Set<string>();
  const files = new Set<string>();

  for (const entry of entries) {
    if (ids.has(entry.id)) throw new Error(`Duplicate demo id: ${entry.id}`);
    ids.add(entry.id);
  }

  for (const entry of entries) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id)) {
      throw new Error(`Invalid demo id: ${entry.id}`);
    }
    if (files.has(entry.file)) throw new Error(`Duplicate demo file: ${entry.file}`);
    files.add(entry.file);

    const modulePath = `./${entry.file}`;
    if (!moduleLoaders[modulePath] || !sourceLoaders[modulePath]) {
      throw new Error(`Demo module not found for ${entry.id}: ${entry.file}`);
    }
    if (entry.coverage.length === 0) {
      throw new Error(`Demo ${entry.id} must declare at least one coverage capability`);
    }
    for (const alias of entry.aliases ?? []) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(alias)) {
        throw new Error(`Invalid demo alias: ${alias}`);
      }
      if (ids.has(alias) || aliases.has(alias)) throw new Error(`Duplicate demo alias: ${alias}`);
      aliases.add(alias);
    }
  }
}

const catalog = catalogData as DemoCatalogEntry[];
assertCatalog(catalog);

export const demos: DemoItem[] = catalog.map((entry) => {
  const modulePath = `./${entry.file}`;
  return {
    ...entry,
    loadModule: moduleLoaders[modulePath],
    loadSource: sourceLoaders[modulePath],
  };
});

const demoById = new Map(demos.map((demo) => [demo.id, demo]));
const aliasToId = new Map(
  demos.flatMap((demo) => (demo.aliases ?? []).map((alias) => [alias, demo.id] as const)),
);

export function normalizeDemoId(id: string): string {
  return aliasToId.get(id) ?? id;
}

export function getDemo(id: string): DemoItem | undefined {
  return demoById.get(normalizeDemoId(id));
}

export async function runDemo(demo: DemoItem, container: HTMLElement): Promise<DemoHandle> {
  const module = await demo.loadModule();
  const result = await module.run(container);
  if (!result || typeof result.destroy !== 'function') {
    throw new Error(`Demo ${demo.id} must return a handle with destroy()`);
  }
  const destroy = result.destroy.bind(result);
  return { destroy, ready: 'ready' in result ? result.ready : undefined };
}
