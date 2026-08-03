/**
 * G6Lite Performance Benchmark — browser-based benchmark runner.
 * Runs 5 test scenarios across configurable data scale tiers.
 */

import { Graph, type GraphData, type LayoutConfig } from '../../../src/index.js';
import type { Renderer } from '../../../src/renderer/renderer.js';
import {
  collectBrowserEnvironment,
  runBrowserMicroBenchmarks,
  type BrowserMicroResult,
} from './micro.js';
import { generateGraphData } from '../datasets/generate.js';

interface BrowserPerfReport {
  schemaVersion: 1;
  environment: Record<string, unknown>;
  micro: BrowserMicroResult[];
  scenarios: BenchResult[];
  warnings: string[];
}

declare global {
  interface Window {
    __G6LITE_PERF_REPORT__?: BrowserPerfReport;
  }
}

// ─── Types ───────────────────────────────────────────────────────────

interface BenchResult {
  scale: { nodes: number; edges: number };
  firstRender: { total: number; layout: number; render: number; p95: number; samples: number };
  highlight: { median: number; p95: number };
  dragFPS: number;
  zoomFPS: number;
  dragFrame: FrameDiagnostics;
  zoomFrame: FrameDiagnostics;
  pickAt: { median: number };
  memory: MemoryDiagnostics;
}

interface FrameDiagnostics {
  fpsMedian: number;
  p95FrameMs: number;
  droppedFrameRatio: number;
  longTaskCount: number;
  longTaskTotalMs: number;
}

interface MemoryDiagnostics {
  supported: boolean;
  source?: string;
  before?: number;
  afterRender?: number;
  afterDestroy?: number;
  delta?: number;
  postDestroyDelta?: number;
}

interface BenchTier {
  nodes: number;
  degree: number;
  /** Real dataset URL; when set, data is fetched instead of generated. */
  url?: string;
  /** Display label (real datasets carry their own name). */
  label?: string;
}

/** Whether real datasets should re-run force layout instead of reusing preset coords. */
let relayoutReal = false;

function getRenderer(graph: Graph): Renderer {
  return (graph as unknown as { renderer: Renderer }).renderer;
}

// ─── Data Generation ─────────────────────────────────────────────────

function generateData(nodeCount: number, degree: number): GraphData {
  return generateGraphData(nodeCount, degree, 0x6a09e667) as GraphData;
}

/** Cache fetched real datasets so the 5 scenarios per tier don't refetch. */
const datasetCache = new Map<string, GraphData>();

async function loadDataset(url: string): Promise<GraphData> {
  let data = datasetCache.get(url);
  if (!data) {
    data = (await fetch(url).then((r) => r.json())) as GraphData;
    datasetCache.set(url, data);
  }
  return data;
}

/**
 * Resolve a tier to its graph data. Synthetic tiers are generated; real
 * datasets are fetched. Returns the data plus the layout option to use —
 * real datasets reuse their sigma-preset ForceAtlas2 coords (no layout)
 * unless the user opts into re-running force layout.
 */
async function resolveTier(
  tier: BenchTier,
): Promise<{ data: GraphData; layout: LayoutConfig | undefined }> {
  const forceLayout = { type: 'force', maxIteration: 100, animate: false };
  if (tier.url) {
    const data = await loadDataset(tier.url);
    return { data, layout: relayoutReal ? (forceLayout as LayoutConfig) : undefined };
  }
  return { data: generateData(tier.nodes, tier.degree), layout: forceLayout };
}

// ─── Stats Utilities ─────────────────────────────────────────────────

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = arr.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function p95(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = arr.slice().sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length * 0.95)] ?? sorted[sorted.length - 1];
}

// ─── DOM Helpers ─────────────────────────────────────────────────────

const $ = (sel: string) => document.querySelector(sel)!;
const getContainer = () => $('#graph-container') as HTMLElement;
const getProgressBar = () => $('#progress-bar') as HTMLElement;
const getProgressText = () => $('#progress-text') as HTMLElement;
const getLiveMetrics = () => $('#live-metrics') as HTMLElement;
const getPreviewLabel = () => $('#preview-label') as HTMLElement;
const getResultsBody = () => $('#results-body') as HTMLElement;
const getMicroResultsBody = () => $('#micro-results-body') as HTMLElement;
const getBtnStart = () => $('#btn-start') as HTMLButtonElement;
const getBtnMicro = () => $('#btn-micro') as HTMLButtonElement;
const getBtnStop = () => $('#btn-stop') as HTMLButtonElement;

// ─── State ───────────────────────────────────────────────────────────

let aborted = false;
let results: BenchResult[] = [];
let microResults: BrowserMicroResult[] = [];

function buildBrowserReport(): BrowserPerfReport {
  return {
    schemaVersion: 1,
    environment: collectBrowserEnvironment(),
    micro: microResults,
    scenarios: results,
    warnings: microResults
      .filter((result) => result.status !== 'pass')
      .map((result) => `${result.id}: ${result.error ?? `RME ${formatNum(result.rme, 2)}%`}`),
  };
}

function syncBrowserReport(): void {
  window.__G6LITE_PERF_REPORT__ = buildBrowserReport();
}

// ─── Helpers ─────────────────────────────────────────────────────────

/** Clean container and yield to let browser GC previous WebGL context. */
async function cleanContainer(cont: HTMLElement): Promise<void> {
  cont.innerHTML = '';
  await new Promise((r) => setTimeout(r, 50));
}

/** Create a Graph, render it, fit to center, and return it. */
async function makeGraph(
  graphData: GraphData,
  cont: HTMLElement,
  layout: LayoutConfig | undefined,
): Promise<Graph> {
  const graph = new Graph({
    container: cont,
    data: graphData,
    layout,
    theme: 'light',
  });
  await graph.render();
  graph.fitView(0.85);
  return graph;
}

// ─── Benchmark Scenarios ─────────────────────────────────────────────

async function benchFirstRender(
  graphData: GraphData,
  cont: HTMLElement,
  layout: LayoutConfig | undefined,
): Promise<{ total: number; layout: number; render: number; p95: number; samples: number }> {
  const sampleCount = graphData.nodes.length <= 1000 ? 3 : graphData.nodes.length <= 5000 ? 2 : 1;
  const totals: number[] = [];
  const layouts: number[] = [];
  const renders: number[] = [];

  for (let sample = 0; sample < sampleCount; sample++) {
    await cleanContainer(cont);
    let layoutDuration = 0;
    const graph = new Graph({
      container: cont,
      data: graphData,
      layout,
      theme: 'light',
    });
    graph.on('layout:end', (e: { duration: number }) => {
      layoutDuration = e.duration;
    });
    const t0 = performance.now();
    await graph.render();
    graph.fitView(0.85);
    const total = performance.now() - t0;
    const layoutMs = layoutDuration || 0;
    totals.push(total);
    layouts.push(layoutMs);
    renders.push(total - layoutMs);
    graph.destroy();
  }

  return {
    total: median(totals),
    layout: median(layouts),
    render: median(renders),
    p95: p95(totals),
    samples: sampleCount,
  };
}

/**
 * @internal benchmark
 * Direct renderer access is intentional here to isolate raw WebGL highlight
 * costs. This is benchmark-only code, not a public API usage example.
 */
async function benchHighlight(
  graphData: GraphData,
  cont: HTMLElement,
  layout: LayoutConfig | undefined,
  onMetric: (ms: number) => void,
): Promise<{ median: number; p95: number }> {
  await cleanContainer(cont);
  const graph = await makeGraph(graphData, cont, layout);

  const renderer = getRenderer(graph);
  const nodes = renderer.getNodes();
  const edges = renderer.getEdges();

  const times: number[] = [];

  for (let i = 0; i < 20; i++) {
    if (aborted) break;
    const nodeId = nodes[i % nodes.length]?.id;
    if (!nodeId) continue;

    const edgeIndices = new Set<number>();
    const nodeIds = new Set<string>([nodeId]);
    edges.forEach((e, idx) => {
      if (e.source === nodeId || e.target === nodeId) {
        edgeIndices.add(idx);
        nodeIds.add(e.source);
        nodeIds.add(e.target);
      }
    });

    const t0 = performance.now();
    renderer.setHighlight({ nodeIds, edgeIndices });
    renderer.draw();
    const ms = performance.now() - t0;
    times.push(ms);
    onMetric(ms);

    await new Promise((r) => setTimeout(r, 0));
  }

  renderer.setHighlight({ nodeIds: new Set(), edgeIndices: new Set() });
  renderer.draw();
  graph.destroy();
  return { median: median(times), p95: p95(times) };
}

/** @internal benchmark — directly measures renderer camera-update throughput. */
function createLongTaskTracker(): () => { count: number; totalMs: number } {
  let count = 0;
  let totalMs = 0;
  let observer: PerformanceObserver | undefined;
  if (
    typeof PerformanceObserver !== 'undefined' &&
    PerformanceObserver.supportedEntryTypes?.includes('longtask')
  ) {
    observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        count++;
        totalMs += entry.duration;
      }
    });
    observer.observe({ entryTypes: ['longtask'] });
  }
  return () => {
    observer?.disconnect();
    return { count, totalMs };
  };
}

function summarizeFrames(
  intervals: number[],
  longTasks: { count: number; totalMs: number },
): FrameDiagnostics {
  const droppedThresholdMs = (1000 / 60) * 1.5;
  return {
    fpsMedian: intervals.length > 0 ? median(intervals.map((dt) => 1000 / dt)) : 0,
    p95FrameMs: p95(intervals),
    droppedFrameRatio:
      intervals.length > 0
        ? intervals.filter((interval) => interval > droppedThresholdMs).length / intervals.length
        : 0,
    longTaskCount: longTasks.count,
    longTaskTotalMs: longTasks.totalMs,
  };
}

async function benchDragFPS(
  graphData: GraphData,
  cont: HTMLElement,
  layout: LayoutConfig | undefined,
  onFPS: (fps: number) => void,
): Promise<FrameDiagnostics> {
  await cleanContainer(cont);
  const graph = await makeGraph(graphData, cont, layout);
  const renderer = getRenderer(graph);
  const frames = 120;
  const intervals: number[] = [];
  const stopLongTaskTracker = createLongTaskTracker();

  return new Promise<FrameDiagnostics>((resolve) => {
    let count = 0;
    let lastTime = performance.now();

    function frame() {
      if (aborted || count >= frames) {
        renderer.setMoving(false);
        graph.destroy();
        resolve(summarizeFrames(intervals, stopLongTaskTracker()));
        return;
      }

      const cam = renderer.getCamera();
      renderer.setMoving(true);
      renderer.setCamera({ x: cam.x + 2 });
      renderer.draw();

      const now = performance.now();
      if (count > 0) {
        intervals.push(now - lastTime);
        onFPS(1000 / (now - lastTime));
      }
      lastTime = now;
      count++;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}

/** @internal benchmark — directly measures renderer camera-update throughput. */
async function benchZoomFPS(
  graphData: GraphData,
  cont: HTMLElement,
  layout: LayoutConfig | undefined,
  onFPS: (fps: number) => void,
): Promise<FrameDiagnostics> {
  await cleanContainer(cont);
  const graph = await makeGraph(graphData, cont, layout);
  const renderer = getRenderer(graph);
  const frames = 120;
  const intervals: number[] = [];
  const stopLongTaskTracker = createLongTaskTracker();

  return new Promise<FrameDiagnostics>((resolve) => {
    let count = 0;
    let lastTime = performance.now();

    function frame() {
      if (aborted || count >= frames) {
        renderer.setMoving(false);
        graph.destroy();
        resolve(summarizeFrames(intervals, stopLongTaskTracker()));
        return;
      }

      const progress = count / frames;
      const zoom = 1.0 + Math.sin(progress * Math.PI * 2) * 0.5;
      renderer.setMoving(true);
      renderer.setCamera({ zoom });
      renderer.draw();

      const now = performance.now();
      if (count > 0) {
        intervals.push(now - lastTime);
        onFPS(1000 / (now - lastTime));
      }
      lastTime = now;
      count++;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}

/** @internal benchmark — directly measures the renderer picking path. */
async function benchPickAt(
  graphData: GraphData,
  cont: HTMLElement,
  layout: LayoutConfig | undefined,
): Promise<{ median: number }> {
  await cleanContainer(cont);
  const graph = await makeGraph(graphData, cont, layout);
  const renderer = getRenderer(graph);
  const canvas = renderer.getCanvas() as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();

  // Trigger lazy init
  renderer.pickAt(rect.left + rect.width / 2, rect.top + rect.height / 2);

  const times: number[] = [];
  for (let i = 0; i < 100; i++) {
    if (aborted) break;
    const sx = rect.left + ((i * 37 + 17) % Math.max(1, rect.width));
    const sy = rect.top + ((i * 53 + 29) % Math.max(1, rect.height));
    const t0 = performance.now();
    renderer.pickAt(sx, sy);
    times.push(performance.now() - t0);
  }

  graph.destroy();
  return { median: median(times) };
}

async function readMemoryBytes(): Promise<{ bytes?: number; source?: string }> {
  const perf = performance as Performance & {
    memory?: { usedJSHeapSize: number };
    measureUserAgentSpecificMemory?: () => Promise<{ bytes: number }>;
  };
  if (crossOriginIsolated && typeof perf.measureUserAgentSpecificMemory === 'function') {
    try {
      const result = await perf.measureUserAgentSpecificMemory();
      return { bytes: result.bytes, source: 'measureUserAgentSpecificMemory' };
    } catch {
      // Fall through to the less precise Chromium heap metric.
    }
  }
  if (perf.memory?.usedJSHeapSize !== undefined) {
    return { bytes: perf.memory.usedJSHeapSize, source: 'performance.memory' };
  }
  return {};
}

async function benchMemory(
  graphData: GraphData,
  cont: HTMLElement,
  layout: LayoutConfig | undefined,
): Promise<MemoryDiagnostics> {
  await cleanContainer(cont);
  const before = await readMemoryBytes();
  const graph = await makeGraph(graphData, cont, layout);
  await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
  const afterRender = await readMemoryBytes();
  graph.destroy();
  cont.innerHTML = '';
  await new Promise((resolve) => setTimeout(resolve, 0));
  const afterDestroy = await readMemoryBytes();
  if (
    before.bytes === undefined ||
    afterRender.bytes === undefined ||
    afterDestroy.bytes === undefined
  ) {
    return { supported: false };
  }
  return {
    supported: true,
    source: afterRender.source ?? before.source,
    before: before.bytes,
    afterRender: afterRender.bytes,
    afterDestroy: afterDestroy.bytes,
    delta: afterRender.bytes - before.bytes,
    postDestroyDelta: afterDestroy.bytes - before.bytes,
  };
}

// ─── Runner ──────────────────────────────────────────────────────────

function getSelectedTiers(): BenchTier[] {
  const tiers: BenchTier[] = [];
  const degree =
    parseInt((document.getElementById('custom-degree') as HTMLInputElement).value) || 3;

  document.querySelectorAll('.tier-checkbox:checked').forEach((cb) => {
    const val = parseInt((cb as HTMLInputElement).value);
    if (val > 0) tiers.push({ nodes: val, degree });
  });

  const customNodes = parseInt((document.getElementById('custom-nodes') as HTMLInputElement).value);
  if (customNodes > 0) {
    tiers.push({ nodes: customNodes, degree });
  }

  // Real datasets (sigma.js 同款),节点数填位用于展示,实际从 JSON 读取。
  document.querySelectorAll('.ds-checkbox:checked').forEach((cb) => {
    const el = cb as HTMLInputElement;
    tiers.push({ nodes: 0, degree: 0, url: el.value, label: el.dataset.label || el.value });
  });

  return tiers;
}

function formatNum(n: number, decimals = 1): string {
  return n.toFixed(decimals);
}

function formatScale(nodes: number, edges: number): string {
  const fmtN =
    nodes >= 1000 ? `${(nodes / 1000).toFixed(nodes % 1000 === 0 ? 0 : 1)}K` : String(nodes);
  const fmtE =
    edges >= 1000 ? `${(edges / 1000).toFixed(edges % 1000 === 0 ? 0 : 1)}K` : String(edges);
  return `${fmtN} / ${fmtE}`;
}

function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined) return 'n/a';
  const sign = bytes >= 0 ? '+' : '-';
  return `${sign}${formatNum(Math.abs(bytes) / 1024 / 1024, 1)}MB`;
}

function addResultRow(result: BenchResult): void {
  const body = getResultsBody();
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><strong>${formatScale(result.scale.nodes, result.scale.edges)}</strong></td>
    <td>${formatNum(result.firstRender.layout)}ms</td>
    <td>${formatNum(result.firstRender.render)}ms</td>
    <td>${formatNum(result.firstRender.total)}ms</td>
    <td>${formatNum(result.firstRender.p95)}ms</td>
    <td>${formatNum(result.highlight.median)}ms</td>
    <td class="${result.dragFPS >= 50 ? 'cell-good' : result.dragFPS >= 30 ? 'cell-warn' : 'cell-bad'}">${formatNum(result.dragFPS, 0)} FPS</td>
    <td>${formatNum(result.dragFrame.p95FrameMs, 1)}ms</td>
    <td class="${result.zoomFPS >= 50 ? 'cell-good' : result.zoomFPS >= 30 ? 'cell-warn' : 'cell-bad'}">${formatNum(result.zoomFPS, 0)} FPS</td>
    <td>${formatNum(result.zoomFrame.p95FrameMs, 1)}ms</td>
    <td>${formatNum(result.pickAt.median, 2)}ms</td>
    <td>${result.memory.supported ? formatBytes(result.memory.postDestroyDelta) : 'unsupported'}</td>
  `;
  body.appendChild(tr);
}

function addMicroResultRow(result: BrowserMicroResult): void {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><strong>${result.name}</strong></td>
    <td>${result.scope}</td>
    <td>${formatNum(result.hz, 0)}</td>
    <td>${formatNum(result.meanMs, 4)}ms</td>
    <td class="${result.status === 'pass' ? 'cell-good' : result.status === 'warning' ? 'cell-warn' : 'cell-bad'}">±${formatNum(result.rme, 2)}%</td>
    <td>${result.sampleSize}</td>
  `;
  getMicroResultsBody().appendChild(tr);
}

function updateProgress(current: number, total: number, stage: string): void {
  const pct = total > 0 ? (current / total) * 100 : 0;
  getProgressBar().style.width = `${pct}%`;
  getProgressText().textContent = stage;
}

async function runBenchmark(): Promise<void> {
  const tiers = getSelectedTiers();
  if (tiers.length === 0) {
    getProgressText().textContent = 'No tiers selected';
    return;
  }

  aborted = false;
  relayoutReal = (document.getElementById('ds-relayout') as HTMLInputElement)?.checked ?? false;
  results = [];
  getResultsBody().innerHTML = '';
  getBtnStart().disabled = true;
  getBtnMicro().disabled = true;
  getBtnStop().disabled = false;

  const totalSteps = tiers.length * 6;
  let step = 0;
  const cont = getContainer();

  for (const tier of tiers) {
    if (aborted) break;

    let data: GraphData;
    let layout: LayoutConfig | undefined;
    try {
      ({ data, layout } = await resolveTier(tier));
    } catch (err) {
      getProgressText().textContent = `加载失败 ${tier.label ?? tier.url}: ${String(err)}`;
      continue;
    }
    const label = tier.url
      ? `${tier.label} (${layout ? 'force' : '预置坐标'})`
      : `${tier.nodes.toLocaleString()} nodes`;
    const result: BenchResult = {
      scale: { nodes: data.nodes.length, edges: data.edges.length },
      firstRender: { total: 0, layout: 0, render: 0, p95: 0, samples: 0 },
      highlight: { median: 0, p95: 0 },
      dragFPS: 0,
      zoomFPS: 0,
      dragFrame: {
        fpsMedian: 0,
        p95FrameMs: 0,
        droppedFrameRatio: 0,
        longTaskCount: 0,
        longTaskTotalMs: 0,
      },
      zoomFrame: {
        fpsMedian: 0,
        p95FrameMs: 0,
        droppedFrameRatio: 0,
        longTaskCount: 0,
        longTaskTotalMs: 0,
      },
      pickAt: { median: 0 },
      memory: { supported: false },
    };

    // 1. First Render
    getPreviewLabel().textContent = `${label} - First Render`;
    updateProgress(step, totalSteps, `${label} - First Render`);
    getLiveMetrics().textContent = '';
    result.firstRender = await benchFirstRender(data, cont, layout);
    getLiveMetrics().textContent = `Total: ${formatNum(result.firstRender.total)}ms`;
    step++;
    if (aborted) break;

    // 2. Highlight
    getPreviewLabel().textContent = `${label} - Highlight`;
    updateProgress(step, totalSteps, `${label} - Highlight`);
    result.highlight = await benchHighlight(data, cont, layout, (ms) => {
      getLiveMetrics().textContent = `Highlight: ${formatNum(ms)}ms`;
    });
    step++;
    if (aborted) break;

    // 3. Drag FPS
    getPreviewLabel().textContent = `${label} - Drag FPS`;
    updateProgress(step, totalSteps, `${label} - Drag FPS`);
    result.dragFrame = await benchDragFPS(data, cont, layout, (fps) => {
      getLiveMetrics().textContent = `FPS: ${formatNum(fps, 0)}`;
    });
    result.dragFPS = result.dragFrame.fpsMedian;
    step++;
    if (aborted) break;

    // 4. Zoom FPS
    getPreviewLabel().textContent = `${label} - Zoom FPS`;
    updateProgress(step, totalSteps, `${label} - Zoom FPS`);
    result.zoomFrame = await benchZoomFPS(data, cont, layout, (fps) => {
      getLiveMetrics().textContent = `FPS: ${formatNum(fps, 0)}`;
    });
    result.zoomFPS = result.zoomFrame.fpsMedian;
    step++;
    if (aborted) break;

    // 5. Pick
    getPreviewLabel().textContent = `${label} - pickAt`;
    updateProgress(step, totalSteps, `${label} - pickAt`);
    getLiveMetrics().textContent = '';
    result.pickAt = await benchPickAt(data, cont, layout);
    getLiveMetrics().textContent = `Pick: ${formatNum(result.pickAt.median, 2)}ms`;
    step++;

    // 6. Memory lifecycle
    getPreviewLabel().textContent = `${label} - Memory`;
    updateProgress(step, totalSteps, `${label} - Memory`);
    result.memory = await benchMemory(data, cont, layout);
    getLiveMetrics().textContent = result.memory.supported
      ? `Post-destroy delta: ${formatBytes(result.memory.postDestroyDelta)}`
      : 'Memory API unsupported';
    step++;

    results.push(result);
    addResultRow(result);
    syncBrowserReport();
  }

  // Done
  cont.innerHTML = '';
  updateProgress(totalSteps, totalSteps, aborted ? 'Stopped' : 'Complete');
  getPreviewLabel().textContent = 'Graph Preview';
  getLiveMetrics().textContent = '';
  getBtnStart().disabled = false;
  getBtnMicro().disabled = false;
  getBtnStop().disabled = true;
}

async function runMicroBenchmark(): Promise<void> {
  aborted = false;
  microResults = [];
  getMicroResultsBody().innerHTML = '';
  getBtnStart().disabled = true;
  getBtnMicro().disabled = true;
  getBtnStop().disabled = true;
  getProgressBar().style.width = '0%';
  getProgressText().textContent = 'Running Benchmark.js micro suites';
  getPreviewLabel().textContent = 'Benchmark.js — 1K preset graph';

  try {
    microResults = await runBrowserMicroBenchmarks(getContainer(), (result, formatted) => {
      addMicroResultRow(result);
      getLiveMetrics().textContent = formatted;
      getProgressText().textContent = `${result.name} (${result.status})`;
    });
    getProgressBar().style.width = '100%';
    getProgressText().textContent = 'Benchmark.js complete';
    syncBrowserReport();
  } catch (error) {
    getProgressText().textContent = `Benchmark.js failed: ${String(error)}`;
  } finally {
    getContainer().innerHTML = '';
    getPreviewLabel().textContent = 'Graph Preview';
    getLiveMetrics().textContent = '';
    getBtnStart().disabled = false;
    getBtnMicro().disabled = false;
  }
}

// ─── Export ──────────────────────────────────────────────────────────

function resultsToMarkdown(): string {
  const lines = [
    '| Scale | Layout | Render | First Render | First Render p95 | Highlight | Drag FPS | Drag p95 | Zoom FPS | Zoom p95 | Pick | Post-destroy Heap Delta |',
    '|-------|--------|--------|-------------|------------------|-----------|----------|----------|----------|----------|------|---------------|',
  ];
  for (const r of results) {
    lines.push(
      `| ${formatScale(r.scale.nodes, r.scale.edges)} | ${formatNum(r.firstRender.layout)}ms | ${formatNum(r.firstRender.render)}ms | ${formatNum(r.firstRender.total)}ms | ${formatNum(r.firstRender.p95)}ms | ${formatNum(r.highlight.median)}ms | ${formatNum(r.dragFPS, 0)} FPS | ${formatNum(r.dragFrame.p95FrameMs, 1)}ms | ${formatNum(r.zoomFPS, 0)} FPS | ${formatNum(r.zoomFrame.p95FrameMs, 1)}ms | ${formatNum(r.pickAt.median, 2)}ms | ${r.memory.supported ? formatBytes(r.memory.postDestroyDelta) : 'unsupported'} |`,
    );
  }
  if (microResults.length > 0) {
    lines.push('', '## Benchmark.js Micro Results', '');
    for (const result of microResults) {
      lines.push(
        `- ${result.name}: ${formatNum(result.hz, 0)} ops/sec, ${formatNum(result.meanMs, 4)}ms mean, ±${formatNum(result.rme, 2)}% RME, ${result.sampleSize} samples (${result.scope})`,
      );
    }
  }
  return lines.join('\n');
}

function exportJSON(): void {
  const report = buildBrowserReport();
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `g6lite-bench-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Init ────────────────────────────────────────────────────────────

getBtnStart().addEventListener('click', () => runBenchmark());
getBtnMicro().addEventListener('click', () => runMicroBenchmark());
getBtnStop().addEventListener('click', () => {
  aborted = true;
});
$('#btn-copy').addEventListener('click', () => {
  navigator.clipboard.writeText(resultsToMarkdown());
  ($('#btn-copy') as HTMLButtonElement).textContent = 'Copied!';
  setTimeout(() => {
    ($('#btn-copy') as HTMLButtonElement).textContent = 'Copy Markdown';
  }, 1500);
});
$('#btn-export').addEventListener('click', exportJSON);
syncBrowserReport();
