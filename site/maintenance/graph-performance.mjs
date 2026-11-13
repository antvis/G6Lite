import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { cpus, release, arch } from 'node:os';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

// From the repository root, pass an isolated npm directory containing the
// exact packages listed in adapters. For an unpublished G6Lite version, use
// npm pack after building the library and install that tarball in the directory.
// Use BENCHMARK_CHROMIUM to select a specific Chromium executable.
const [packageDir, output] = process.argv.slice(2);
if (!packageDir || !output) {
  throw new Error('Usage: node site/maintenance/graph-performance.mjs <benchmark npm install directory> <output.json>');
}
const require = createRequire(resolve('package.json'));
const esbuild = require('esbuild');
const { chromium } = require('playwright');

const adapters = {
  g6lite: {
    packages: { '@antv/g6-lite': '0.1.0' },
    renderer: 'WebGL',
    code: `
      import { Graph } from '@antv/g6-lite';
      export const prepare = (data) => data;
      export function mount(container, data) {
        const graph = new Graph({ container, data, behaviors: [],
          node: { style: { size: 4, fill: '#3276d2', strokeWidth: 0 } },
          edge: { style: { stroke: '#93a0b3', lineWidth: 1, endArrow: false } },
        });
        return { ready: graph.render(), destroy: () => graph.destroy() };
      }
    `,
  },
  g6: {
    packages: { '@antv/g6': '5.1.1' },
    renderer: 'Canvas 2D',
    code: `
      import { Graph } from '@antv/g6';
      export function prepare({ nodes, edges }) {
        return { nodes: nodes.map(({ id, x, y }) => ({ id, style: { x, y } })), edges };
      }
      export function mount(container, data) {
        const graph = new Graph({ container, data, behaviors: [], animation: false,
          node: { type: 'circle', style: { size: 4, fill: '#3276d2', lineWidth: 0, label: false } },
          edge: { type: 'line', style: { stroke: '#93a0b3', lineWidth: 1, endArrow: false, label: false } },
        });
        return { ready: graph.render(), destroy: () => graph.destroy() };
      }
    `,
  },
  sigma: {
    packages: { sigma: '4.0.4', graphology: '0.26.0' },
    renderer: 'WebGL 2',
    code: `
      import Sigma from 'sigma';
      import { MultiDirectedGraph } from 'graphology';
      export const prepare = (data) => data;
      export function mount(container, { nodes, edges }) {
        const data = new MultiDirectedGraph();
        for (const { id, x, y } of nodes) {
          data.addNode(id, { x, y: -y, size: 2, color: '#3276d2' });
        }
        for (const { id, source, target } of edges) {
          data.addDirectedEdgeWithKey(id, source, target, { size: 1, color: '#93a0b3' });
        }
        const graph = new Sigma(data, container, { renderLabels: false, renderEdgeLabels: false });
        return { destroy: () => graph.kill() };
      }
    `,
  },
  echarts: {
    packages: { echarts: '6.1.0' },
    renderer: 'Canvas 2D',
    code: `
      import { init, use } from 'echarts/core';
      import { GraphChart } from 'echarts/charts';
      import { CanvasRenderer } from 'echarts/renderers';
      use([GraphChart, CanvasRenderer]);
      export const prepare = ({ nodes, edges }) => ({
        animation: false,
        series: [{ type: 'graph', layout: 'none', data: nodes, links: edges,
          symbol: 'circle', symbolSize: 4, label: { show: false }, edgeSymbol: 'none',
          itemStyle: { color: '#3276d2' }, lineStyle: { color: '#93a0b3', width: 1, opacity: 1 },
        }],
      });
      export function mount(container, options) {
        const chart = init(container, null, { renderer: 'canvas' });
        chart.setOption(options);
        return { destroy: () => chart.dispose() };
      }
    `,
  },
};

const viewport = { width: 1000, height: 700 };
const container = { width: 900, height: 600 };
const warmup = 3;
const sampleCount = Number(process.env.BENCHMARK_SAMPLES ?? 20);
const sizes = [1000, 5000];
const engines = Object.keys(adapters);
const bundles = {};
for (const [name, { packages, renderer, code }] of Object.entries(adapters)) {
  for (const [pkg, expected] of Object.entries(packages)) {
    const { version } = JSON.parse(await readFile(resolve(packageDir, 'node_modules', pkg, 'package.json'), 'utf8'));
    if (version !== expected) throw new Error(`${pkg}: expected ${expected}, got ${version}`);
  }
  const bundle = await esbuild.build({
    stdin: { contents: code, resolveDir: resolve(packageDir), loader: 'js' },
    format: 'iife', globalName: `bench_${name}`, platform: 'browser', target: 'chrome120',
    bundle: true, minify: true, legalComments: 'none', write: false,
    define: { 'process.env.NODE_ENV': '"production"' },
  });
  const { contents, text } = bundle.outputFiles[0];
  bundles[name] = { text, packages, renderer, bytes: contents.length, gzipBytes: gzipSync(contents, { level: 9 }).length };
}

const browser = await chromium.launch({
  executablePath: process.env.BENCHMARK_CHROMIUM,
  args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
});
try {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.setContent(`<main style="width:${container.width}px;height:${container.height}px;position:relative"></main>`);
  const environment = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    const info = gl?.getExtension('WEBGL_debug_renderer_info');
    const gpu = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl?.getParameter(gl.RENDERER);
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return { gpu, devicePixelRatio, userAgent: navigator.userAgent };
  });
  for (const name of engines) await page.addScriptTag({ content: bundles[name].text });

  const samples = await page.evaluate(async ({ engines, sizes, warmup, sampleCount }) => {
    const element = document.querySelector('main');
    const frame = () => new Promise(requestAnimationFrame);
    const results = {};
    for (const size of sizes) {
      const nodes = Array.from({ length: size }, (_, i) => ({
        id: String(i), x: 24 + i % 100 * 8.5, y: 24 + Math.floor(i / 100) * 10.5,
      }));
      const edges = nodes.flatMap(({ id }, i) => [1, 7, 101].map((step) => ({
        id: `e-${i}-${step}`, source: id, target: String((i + step) % size),
      })));
      const row = Object.fromEntries(engines.map((engine) => [engine, []]));
      for (let round = 0; round < warmup + sampleCount; round++) {
        for (let position = 0; position < engines.length; position++) {
          const engine = engines[(round + position) % engines.length];
          const adapter = window[`bench_${engine}`];
          const prepared = adapter.prepare(structuredClone({ nodes, edges }));
          await frame();
          const start = performance.now();
          const graph = adapter.mount(element, prepared);
          try {
            await graph.ready;
            await frame();
            await frame();
            const elapsed = performance.now() - start;
            if (!element.querySelector('canvas')) throw new Error(`${engine} did not create a canvas`);
            if (round >= warmup) row[engine].push(Number(elapsed.toFixed(2)));
          } finally {
            graph.destroy();
            element.replaceChildren();
          }
        }
      }
      results[size] = row;
    }
    return results;
  }, { engines, sizes, warmup, sampleCount });
  if (pageErrors.length) throw new Error(pageErrors.join('\n'));
  const report = {
    measured: new Date().toISOString(),
    environment: { ...environment, os: release(), arch: arch(), cpu: cpus()[0].model, chromium: browser.version(), node: process.version, esbuild: esbuild.version, viewport, container },
    workload: { nodes: sizes, edgesPerNode: 3, warmup, sampleCount, timing: 'mount through two animation frames after render API completion' },
    bundles: Object.fromEntries(engines.map((name) => {
      const { text, ...metrics } = bundles[name];
      return [name, metrics];
    })),
    samples,
  };
  await writeFile(output, JSON.stringify(report, null, 2) + '\n');
} finally {
  await browser.close();
}
