import type BenchmarkType from 'benchmark';
import BenchmarkImport from 'benchmark';
import lodashImport from 'lodash';
import platformImport from 'platform';
import { Graph, type GraphData } from '../../../src/index.js';
import { generateGraphData } from '../datasets/generate.js';

const unwrapDefault = <T>(value: T | { default?: T }): T =>
  ((value as { default?: T }).default ?? value) as T;
const BenchmarkBootstrap = unwrapDefault(BenchmarkImport);
const BenchmarkRuntime = BenchmarkBootstrap.runInContext({
  _: unwrapDefault(lodashImport),
  platform: unwrapDefault(platformImport),
}) as typeof BenchmarkImport;
(globalThis as typeof globalThis & { Benchmark?: typeof BenchmarkImport }).Benchmark =
  BenchmarkRuntime;

export interface BrowserMicroResult {
  id: string;
  suite: 'browser-graph-api';
  name: string;
  scope: 'public' | 'internal';
  tier: 'small';
  operation: string;
  config: Record<string, unknown>;
  hz: number;
  meanMs: number;
  rme: number;
  sampleSize: number;
  cycles: number;
  status: 'pass' | 'warning' | 'invalid';
  error?: string;
}

interface BrowserBenchmarkCase {
  name: string;
  operation: string;
  scope: 'public' | 'internal';
  fn: (() => void) | ((deferred: BenchmarkType.Deferred) => void);
  options?: BenchmarkType.Options;
}

function toResult(target: BenchmarkType, benchmarkCase: BrowserBenchmarkCase): BrowserMicroResult {
  const error = target.error ? String(target.error.stack ?? target.error) : undefined;
  const rme = target.stats.rme;
  return {
    id: `browser-graph-api/${target.name}`,
    suite: 'browser-graph-api',
    name: target.name ?? benchmarkCase.name,
    scope: benchmarkCase.scope,
    tier: 'small',
    operation: benchmarkCase.operation,
    config: { nodes: 1000, edges: 3000, layout: 'preset' },
    hz: target.hz,
    meanMs: target.stats.mean * 1000,
    rme,
    sampleSize: target.stats.sample.length,
    cycles: target.cycles,
    status: error ? 'invalid' : rme > 10 ? 'warning' : 'pass',
    error,
  };
}

function waitForScheduledFrame(deferred: BenchmarkType.Deferred): void {
  requestAnimationFrame(() => deferred.resolve());
}

export async function runBrowserMicroBenchmarks(
  container: HTMLElement,
  onCycle?: (result: BrowserMicroResult, formatted: string) => void,
): Promise<BrowserMicroResult[]> {
  container.innerHTML = '';
  const data = generateGraphData(1000, 3, 0x3c6ef372) as GraphData;
  const graph = new Graph({
    container,
    data,
    theme: 'light',
    node: {
      stateStyles: {
        selected: { stroke: '#163B65', strokeWidth: 2 },
      },
    },
  });
  await graph.render();
  graph.fitView(0.85);

  const positionUpdatesA = data.nodes.slice(0, 100).map((node) => ({
    id: node.id,
    x: (node.x ?? 0) + 1,
    y: (node.y ?? 0) - 1,
  }));
  const positionUpdatesB = data.nodes.slice(0, 100).map((node) => ({
    id: node.id,
    x: (node.x ?? 0) - 1,
    y: (node.y ?? 0) + 1,
  }));
  const dataUpdatesA = data.nodes.slice(0, 100).map((node, index) => ({
    id: node.id,
    data: { revision: 1, rank: index % 10 },
  }));
  const dataUpdatesB = data.nodes.slice(0, 100).map((node, index) => ({
    id: node.id,
    data: { revision: 2, rank: index % 10 },
  }));
  const selectedStates = Object.fromEntries(
    data.nodes.slice(0, 100).map((node) => [node.id, ['selected']]),
  );
  const clearedStates = Object.fromEntries(data.nodes.slice(0, 100).map((node) => [node.id, []]));
  const renderer = (graph as unknown as { renderer: any }).renderer;
  const canvas = graph.getCanvas();
  const rect = canvas.getBoundingClientRect();
  const pickPoints = Array.from({ length: 32 }, (_, index) => ({
    x: rect.left + ((index * 37) % Math.max(1, rect.width)),
    y: rect.top + ((index * 53) % Math.max(1, rect.height)),
  }));
  renderer.pickAt(pickPoints[0].x, pickPoints[0].y);

  let positionToggle = false;
  let dataToggle = false;
  let stateToggle = false;
  let pickIndex = 0;
  const cases: BrowserBenchmarkCase[] = [
    {
      name: 'small/update-node-positions-100-to-frame',
      operation: 'update-node-positions-to-frame',
      scope: 'public',
      fn(deferred: BenchmarkType.Deferred) {
        positionToggle = !positionToggle;
        graph.updateNodePositions(positionToggle ? positionUpdatesA : positionUpdatesB);
        waitForScheduledFrame(deferred);
      },
      options: { defer: true },
    },
    {
      name: 'small/update-node-data-100-to-frame',
      operation: 'update-node-data-to-frame',
      scope: 'public',
      fn(deferred: BenchmarkType.Deferred) {
        dataToggle = !dataToggle;
        graph.updateNodeData(dataToggle ? dataUpdatesA : dataUpdatesB);
        waitForScheduledFrame(deferred);
      },
      options: { defer: true },
    },
    {
      name: 'small/set-element-states-100-to-frame',
      operation: 'set-element-states-to-frame',
      scope: 'public',
      fn(deferred: BenchmarkType.Deferred) {
        stateToggle = !stateToggle;
        graph.setElementStates(stateToggle ? selectedStates : clearedStates);
        waitForScheduledFrame(deferred);
      },
      options: { defer: true },
    },
    {
      name: 'small/get-neighbor-nodes',
      operation: 'get-neighbor-nodes',
      scope: 'public',
      fn() {
        graph.getNeighborNodes('500');
      },
    },
    {
      name: 'small/get-adjacent-edges',
      operation: 'get-adjacent-edges',
      scope: 'public',
      fn() {
        graph.getAdjacentEdges('500');
      },
    },
    {
      name: 'small/pick-at-warm',
      operation: 'pick-at-warm',
      scope: 'internal',
      fn() {
        const point = pickPoints[pickIndex++ % pickPoints.length];
        renderer.pickAt(point.x, point.y);
      },
    },
  ];

  const results = await new Promise<BrowserMicroResult[]>((resolve) => {
    const suite = new BenchmarkRuntime.Suite('browser-graph-api');
    const caseByName = new Map(cases.map((benchmarkCase) => [benchmarkCase.name, benchmarkCase]));
    for (const benchmarkCase of cases) {
      suite.add(benchmarkCase.name, benchmarkCase.fn, {
        initCount: 1,
        minSamples: 3,
        minTime: 0.02,
        maxTime: 0.5,
        ...(benchmarkCase.options ?? {}),
      });
    }
    const collected: BrowserMicroResult[] = [];
    suite.on('cycle', (event: BenchmarkType.Event) => {
      const target = event.target as unknown as BenchmarkType;
      const benchmarkCase = caseByName.get(target.name ?? '');
      if (!benchmarkCase) return;
      const result = toResult(target, benchmarkCase);
      collected.push(result);
      onCycle?.(result, String(target));
    });
    suite.on('complete', () => resolve(collected));
    suite.run({ async: true, queued: true });
  });

  graph.destroy();
  container.innerHTML = '';
  return results;
}

export function collectBrowserEnvironment(): Record<string, unknown> {
  return {
    runtime: 'browser',
    generatedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    language: navigator.language,
    hardwareConcurrency: navigator.hardwareConcurrency,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    devicePixelRatio: window.devicePixelRatio,
    benchmarkVersion: BenchmarkRuntime.version,
  };
}
