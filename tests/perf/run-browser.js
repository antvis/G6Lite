import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { writeJsonReport } from './reporters/json.js';
import { writeMarkdownReport } from './reporters/markdown.js';

function readArgument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? (process.argv[index + 1] ?? fallback) : fallback;
}

const mode = readArgument('--mode', 'quick');
if (!['quick', 'full'].includes(mode))
  throw new Error(`Unsupported browser benchmark mode: ${mode}`);
const outputDirectory = path.resolve(readArgument('--output-dir', 'performance'));
const repositoryRoot = path.resolve('.');
const benchmarkRoot = path.resolve('tests/perf/browser');
const server = await createServer({
  configFile: false,
  root: benchmarkRoot,
  publicDir: path.resolve('playground'),
  logLevel: 'warn',
  resolve: {
    alias: {
      [path.resolve('src/layout/layoutWorker.js')]: path.resolve('src/layout/layoutWorker.ts'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 0,
    strictPort: false,
    fs: { allow: [repositoryRoot] },
  },
});

let browser;
try {
  await server.listen();
  const baseUrl = server.resolvedUrls?.local[0];
  if (!baseUrl) throw new Error('Vite did not expose a local benchmark URL');
  const launchOptions =
    process.platform === 'darwin' && !process.env.CI
      ? { channel: 'chrome', headless: true }
      : { headless: true };
  browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(new URL('bench.html', baseUrl).toString(), { waitUntil: 'networkidle' });

  await page.click('#btn-micro');
  await page.waitForFunction(
    () => document.querySelector('#progress-text')?.textContent === 'Benchmark.js complete',
    undefined,
    { timeout: 120_000 },
  );

  const selectedTiers = mode === 'full' ? ['#t100', '#t1000'] : ['#t100'];
  for (const selector of ['#t100', '#t1000', '#t5000', '#t10000']) {
    await page.locator(selector).evaluate((element, checked) => {
      element.checked = checked;
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }, selectedTiers.includes(selector));
  }
  await page.click('#btn-start');
  await page.waitForFunction(
    () => document.querySelector('#progress-text')?.textContent === 'Complete',
    undefined,
    { timeout: mode === 'full' ? 240_000 : 120_000 },
  );

  const report = await page.evaluate(() => window.__G6LITE_PERF_REPORT__);
  if (!report) throw new Error('Browser benchmark did not expose a report');
  report.environment.mode = mode;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const basename = `g6lite-browser-benchmark-${mode}-${stamp}`;
  const [jsonPath, markdownPath] = await Promise.all([
    writeJsonReport(report, outputDirectory, basename),
    writeMarkdownReport(report, outputDirectory, basename),
  ]);
  console.log(`JSON report: ${jsonPath}`);
  console.log(`Markdown report: ${markdownPath}`);

  if (report.micro.some((result) => result.status === 'invalid')) process.exitCode = 1;
} finally {
  await browser?.close();
  await server.close();
}
