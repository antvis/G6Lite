/**
 * G6Lite Performance Benchmark — browser-based benchmark runner.
 * Runs 5 test scenarios across configurable data scale tiers.
 */

import { Graph } from '../src/index.js';
import type { GraphData } from '../src/types.js';

// ─── Types ───────────────────────────────────────────────────────────

interface BenchResult {
  scale: { nodes: number; edges: number };
  firstRender: { total: number; layout: number; render: number };
  highlight: { median: number; p95: number };
  dragFPS: number;
  zoomFPS: number;
  pickAt: { median: number };
}

interface BenchTier {
  nodes: number;
  degree: number;
}

// ─── Data Generation ─────────────────────────────────────────────────

function generateData(nodeCount: number, degree: number): GraphData {
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: String(i),
    data: { cluster: String(i % 5) },
  }));
  const edges: { source: string; target: string }[] = [];
  for (let i = 0; i < nodeCount; i++) {
    for (let j = 0; j < degree; j++) {
      const t = (i + 1 + j * 13) % nodeCount;
      if (t !== i) edges.push({ source: String(i), target: String(t) });
    }
  }
  return { nodes, edges };
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
const getBtnStart = () => $('#btn-start') as HTMLButtonElement;
const getBtnStop = () => $('#btn-stop') as HTMLButtonElement;

// ─── State ───────────────────────────────────────────────────────────

let aborted = false;
let results: BenchResult[] = [];

// ─── Helpers ─────────────────────────────────────────────────────────

/** Clean container and yield to let browser GC previous WebGL context. */
async function cleanContainer(cont: HTMLElement): Promise<void> {
  cont.innerHTML = '';
  await new Promise((r) => setTimeout(r, 50));
}

/** Fit camera so the graph is centered with padding. */
function fitView(graph: Graph): void {
  const nodes = graph.getLayoutNodes();
  if (!nodes.length) return;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const n of nodes) {
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.y > maxY) maxY = n.y;
  }
  const gw = maxX - minX || 1;
  const gh = maxY - minY || 1;
  const canvas = graph.getCanvas();
  const rect = canvas.getBoundingClientRect();
  const vw = rect.width || 800;
  const vh = rect.height || 600;
  const zoom = Math.min(vw / gw, vh / gh) * 0.85;
  graph.setCamera({
    zoom,
    x: -(minX + maxX) / 2 + vw / (2 * zoom),
    y: -(minY + maxY) / 2 + vh / (2 * zoom),
  });
}

/** Create a Graph, render it, fit to center, and return it. */
async function makeGraph(graphData: GraphData, cont: HTMLElement): Promise<Graph> {
  const graph = new Graph({
    container: cont,
    data: graphData,
    layout: { type: 'force', maxIteration: 100, animate: false },
    theme: 'light',
  });
  await graph.render();
  fitView(graph);
  return graph;
}

// ─── Benchmark Scenarios ─────────────────────────────────────────────

async function benchFirstRender(
  graphData: GraphData,
  cont: HTMLElement,
): Promise<{ total: number; layout: number; render: number }> {
  await cleanContainer(cont);

  let layoutDuration = 0;
  const graph = new Graph({
    container: cont,
    data: graphData,
    layout: { type: 'force', maxIteration: 100, animate: false },
    theme: 'light',
  });
  graph.on('layout:end', (e: { duration: number }) => { layoutDuration = e.duration; });

  const t0 = performance.now();
  await graph.render();
  fitView(graph);
  const total = performance.now() - t0;

  const layout = layoutDuration || 0;
  const render = total - layout;

  graph.destroy();
  return { total, layout, render };
}

async function benchHighlight(
  graphData: GraphData,
  cont: HTMLElement,
  onMetric: (ms: number) => void,
): Promise<{ median: number; p95: number }> {
  await cleanContainer(cont);
  const graph = await makeGraph(graphData, cont);

  const renderer = (graph as any).renderer;
  const nodes = renderer.getNodes();
  const edges = renderer.getEdges();

  const times: number[] = [];

  for (let i = 0; i < 20; i++) {
    if (aborted) break;
    const nodeId = nodes[i % nodes.length]?.id;
    if (!nodeId) continue;

    const edgeIndices = new Set<number>();
    const nodeIds = new Set<string>([nodeId]);
    edges.forEach((e: any, idx: number) => {
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

async function benchDragFPS(
  graphData: GraphData,
  cont: HTMLElement,
  onFPS: (fps: number) => void,
): Promise<number> {
  await cleanContainer(cont);
  const graph = await makeGraph(graphData, cont);
  const renderer = (graph as any).renderer;
  const frames = 120;
  const intervals: number[] = [];

  return new Promise<number>((resolve) => {
    let count = 0;
    let lastTime = performance.now();

    function frame() {
      if (aborted || count >= frames) {
        renderer.setMoving(false);
        graph.destroy();
        resolve(intervals.length > 0 ? median(intervals.map((dt) => 1000 / dt)) : 0);
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

async function benchZoomFPS(
  graphData: GraphData,
  cont: HTMLElement,
  onFPS: (fps: number) => void,
): Promise<number> {
  await cleanContainer(cont);
  const graph = await makeGraph(graphData, cont);
  const renderer = (graph as any).renderer;
  const frames = 120;
  const intervals: number[] = [];

  return new Promise<number>((resolve) => {
    let count = 0;
    let lastTime = performance.now();

    function frame() {
      if (aborted || count >= frames) {
        renderer.setMoving(false);
        graph.destroy();
        resolve(intervals.length > 0 ? median(intervals.map((dt) => 1000 / dt)) : 0);
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

async function benchPickAt(
  graphData: GraphData,
  cont: HTMLElement,
): Promise<{ median: number }> {
  await cleanContainer(cont);
  const graph = await makeGraph(graphData, cont);
  const renderer = (graph as any).renderer;
  const canvas = renderer.getCanvas() as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();

  // Trigger lazy init
  renderer.pickAt(rect.left + rect.width / 2, rect.top + rect.height / 2);

  const times: number[] = [];
  for (let i = 0; i < 100; i++) {
    if (aborted) break;
    const sx = rect.left + Math.random() * rect.width;
    const sy = rect.top + Math.random() * rect.height;
    const t0 = performance.now();
    renderer.pickAt(sx, sy);
    times.push(performance.now() - t0);
  }

  graph.destroy();
  return { median: median(times) };
}

// ─── Runner ──────────────────────────────────────────────────────────

function getSelectedTiers(): BenchTier[] {
  const tiers: BenchTier[] = [];
  const degree = parseInt((document.getElementById('custom-degree') as HTMLInputElement).value) || 3;

  document.querySelectorAll('.tier-checkbox:checked').forEach((cb) => {
    const val = parseInt((cb as HTMLInputElement).value);
    if (val > 0) tiers.push({ nodes: val, degree });
  });

  const customNodes = parseInt((document.getElementById('custom-nodes') as HTMLInputElement).value);
  if (customNodes > 0) {
    tiers.push({ nodes: customNodes, degree });
  }

  return tiers;
}

function formatNum(n: number, decimals = 1): string {
  return n.toFixed(decimals);
}

function formatScale(nodes: number, edges: number): string {
  const fmtN = nodes >= 1000 ? `${(nodes / 1000).toFixed(nodes % 1000 === 0 ? 0 : 1)}K` : String(nodes);
  const fmtE = edges >= 1000 ? `${(edges / 1000).toFixed(edges % 1000 === 0 ? 0 : 1)}K` : String(edges);
  return `${fmtN} / ${fmtE}`;
}

function addResultRow(result: BenchResult): void {
  const body = getResultsBody();
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><strong>${formatScale(result.scale.nodes, result.scale.edges)}</strong></td>
    <td>${formatNum(result.firstRender.layout)}ms</td>
    <td>${formatNum(result.firstRender.render)}ms</td>
    <td>${formatNum(result.firstRender.total)}ms</td>
    <td>${formatNum(result.highlight.median)}ms</td>
    <td class="${result.dragFPS >= 50 ? 'cell-good' : result.dragFPS >= 30 ? 'cell-warn' : 'cell-bad'}">${formatNum(result.dragFPS, 0)} FPS</td>
    <td class="${result.zoomFPS >= 50 ? 'cell-good' : result.zoomFPS >= 30 ? 'cell-warn' : 'cell-bad'}">${formatNum(result.zoomFPS, 0)} FPS</td>
    <td>${formatNum(result.pickAt.median, 2)}ms</td>
  `;
  body.appendChild(tr);
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
  results = [];
  getResultsBody().innerHTML = '';
  getBtnStart().disabled = true;
  getBtnStop().disabled = false;

  const totalSteps = tiers.length * 5;
  let step = 0;
  const cont = getContainer();

  for (const tier of tiers) {
    if (aborted) break;

    const data = generateData(tier.nodes, tier.degree);
    const label = `${tier.nodes.toLocaleString()} nodes`;
    const result: BenchResult = {
      scale: { nodes: tier.nodes, edges: data.edges.length },
      firstRender: { total: 0, layout: 0, render: 0 },
      highlight: { median: 0, p95: 0 },
      dragFPS: 0,
      zoomFPS: 0,
      pickAt: { median: 0 },
    };

    // 1. First Render
    getPreviewLabel().textContent = `${label} - First Render`;
    updateProgress(step, totalSteps, `${label} - First Render`);
    getLiveMetrics().textContent = '';
    result.firstRender = await benchFirstRender(data, cont);
    getLiveMetrics().textContent = `Total: ${formatNum(result.firstRender.total)}ms`;
    step++;
    if (aborted) break;

    // 2. Highlight
    getPreviewLabel().textContent = `${label} - Highlight`;
    updateProgress(step, totalSteps, `${label} - Highlight`);
    result.highlight = await benchHighlight(data, cont, (ms) => {
      getLiveMetrics().textContent = `Highlight: ${formatNum(ms)}ms`;
    });
    step++;
    if (aborted) break;

    // 3. Drag FPS
    getPreviewLabel().textContent = `${label} - Drag FPS`;
    updateProgress(step, totalSteps, `${label} - Drag FPS`);
    result.dragFPS = await benchDragFPS(data, cont, (fps) => {
      getLiveMetrics().textContent = `FPS: ${formatNum(fps, 0)}`;
    });
    step++;
    if (aborted) break;

    // 4. Zoom FPS
    getPreviewLabel().textContent = `${label} - Zoom FPS`;
    updateProgress(step, totalSteps, `${label} - Zoom FPS`);
    result.zoomFPS = await benchZoomFPS(data, cont, (fps) => {
      getLiveMetrics().textContent = `FPS: ${formatNum(fps, 0)}`;
    });
    step++;
    if (aborted) break;

    // 5. Pick
    getPreviewLabel().textContent = `${label} - pickAt`;
    updateProgress(step, totalSteps, `${label} - pickAt`);
    getLiveMetrics().textContent = '';
    result.pickAt = await benchPickAt(data, cont);
    getLiveMetrics().textContent = `Pick: ${formatNum(result.pickAt.median, 2)}ms`;
    step++;

    results.push(result);
    addResultRow(result);
  }

  // Done
  cont.innerHTML = '';
  updateProgress(totalSteps, totalSteps, aborted ? 'Stopped' : 'Complete');
  getPreviewLabel().textContent = 'Graph Preview';
  getLiveMetrics().textContent = '';
  getBtnStart().disabled = false;
  getBtnStop().disabled = true;
}

// ─── Export ──────────────────────────────────────────────────────────

function resultsToMarkdown(): string {
  const lines = [
    '| Scale | Layout | Render | First Render | Highlight | Drag FPS | Zoom FPS | Pick |',
    '|-------|--------|--------|-------------|-----------|----------|----------|------|',
  ];
  for (const r of results) {
    lines.push(
      `| ${formatScale(r.scale.nodes, r.scale.edges)} | ${formatNum(r.firstRender.layout)}ms | ${formatNum(r.firstRender.render)}ms | ${formatNum(r.firstRender.total)}ms | ${formatNum(r.highlight.median)}ms | ${formatNum(r.dragFPS, 0)} FPS | ${formatNum(r.zoomFPS, 0)} FPS | ${formatNum(r.pickAt.median, 2)}ms |`,
    );
  }
  return lines.join('\n');
}

function exportJSON(): void {
  const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `g6lite-bench-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Init ────────────────────────────────────────────────────────────

getBtnStart().addEventListener('click', () => runBenchmark());
getBtnStop().addEventListener('click', () => { aborted = true; });
$('#btn-copy').addEventListener('click', () => {
  navigator.clipboard.writeText(resultsToMarkdown());
  ($('#btn-copy') as HTMLButtonElement).textContent = 'Copied!';
  setTimeout(() => { ($('#btn-copy') as HTMLButtonElement).textContent = 'Copy Markdown'; }, 1500);
});
$('#btn-export').addEventListener('click', exportJSON);
