import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const repositoryRoot = path.resolve('.');
const catalogPath = path.resolve('playground/demos/catalog.json');
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));

function readArgument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? (process.argv[index + 1] ?? fallback) : fallback;
}

const profile = readArgument('--profile', 'smoke');
if (!['smoke', 'release', 'full'].includes(profile)) {
  throw new Error(`Unsupported examples profile: ${profile}`);
}
const screenshotsDirectory = readArgument('--screenshots-dir', '');

function validateCatalog() {
  const ids = new Set();
  const aliases = new Set();
  const files = new Set();

  for (const demo of catalog) {
    if (ids.has(demo.id)) throw new Error(`Duplicate demo id: ${demo.id}`);
    ids.add(demo.id);
  }

  for (const demo of catalog) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(demo.id)) {
      throw new Error(`Invalid demo id: ${demo.id}`);
    }
    if (files.has(demo.file)) throw new Error(`Duplicate demo file: ${demo.file}`);
    files.add(demo.file);
    if (!existsSync(path.resolve('playground/demos', demo.file))) {
      throw new Error(`Missing demo module: ${demo.file}`);
    }
    if (!Array.isArray(demo.coverage) || demo.coverage.length === 0) {
      throw new Error(`Demo ${demo.id} has no coverage declarations`);
    }
    for (const alias of demo.aliases ?? []) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(alias)) {
        throw new Error(`Invalid demo alias: ${alias}`);
      }
      if (ids.has(alias) || aliases.has(alias)) throw new Error(`Duplicate demo alias: ${alias}`);
      aliases.add(alias);
    }
    if (demo.audiences.includes('site')) {
      for (const required of [
        path.resolve('site/content/docs/examples', `${demo.id}.mdx`),
        path.resolve('site/public/examples', `${demo.id}.png`),
      ]) {
        if (!existsSync(required)) throw new Error(`Site demo ${demo.id} is missing ${required}`);
      }
    }
  }
}

function selectDemos() {
  if (profile === 'smoke') {
    return catalog.filter((demo) => demo.releaseCheck === 'smoke' || demo.releaseCheck === 'visual');
  }
  if (profile === 'release') return catalog.filter((demo) => demo.releaseCheck !== false);
  return catalog;
}

async function launchBrowser() {
  const candidates = [
    undefined,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];
  let lastError;
  for (const executablePath of candidates) {
    if (executablePath && !existsSync(executablePath)) continue;
    try {
      return await chromium.launch(executablePath ? { executablePath } : {});
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function checkDemo(browser, baseUrl, demo) {
  const context = await browser.newContext({
    viewport: { width: 960, height: 600 },
    deviceScaleFactor: demo.capture.deviceScaleFactor ?? 1,
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.stack ?? error.message));

  const timeout = demo.releaseCheck === 'full' ? 120_000 : Math.max(18_000, (demo.capture.settleMs ?? 450) + 15_000);
  await page.goto(`${baseUrl}capture-demo.html#${demo.id}`, { waitUntil: 'load', timeout });
  await page.waitForFunction(
    () => window.__ready === true || Boolean(window.__captureError),
    undefined,
    { timeout },
  );
  const state = await page.evaluate(() => ({
    ready: window.__ready === true,
    error: window.__captureError,
    demo: window.__G6LITE_DEMO__,
    canvases: Array.from(document.querySelectorAll('canvas')).map((canvas) => ({
      width: canvas.width,
      height: canvas.height,
      cssWidth: canvas.getBoundingClientRect().width,
      cssHeight: canvas.getBoundingClientRect().height,
    })),
    frames: Array.from(document.querySelectorAll('iframe')).map((frame) => ({
      cssWidth: frame.getBoundingClientRect().width,
      cssHeight: frame.getBoundingClientRect().height,
      benchmarkReady: Boolean(
        frame.contentDocument?.getElementById('btn-start') &&
          frame.contentDocument?.getElementById('graph-container'),
      ),
    })),
  }));

  if (state.error) throw new Error(`${demo.id}: ${state.error}`);
  if (!state.ready || state.demo?.status !== 'ready') {
    throw new Error(`${demo.id}: did not reach ready state`);
  }
  if (pageErrors.length > 0) throw new Error(`${demo.id}: ${pageErrors.join('\n')}`);
  const hasVisibleCanvas = state.canvases.some(
      (canvas) => canvas.width > 0 && canvas.height > 0 && canvas.cssWidth > 0 && canvas.cssHeight > 0,
    );
  const hasPerformanceSurface =
    demo.kind === 'performance' &&
    state.frames.some(
      (frame) => frame.cssWidth > 0 && frame.cssHeight > 0 && frame.benchmarkReady,
    );
  if (!hasVisibleCanvas && !hasPerformanceSurface) {
    throw new Error(`${demo.id}: no visible render surface`);
  }

  if (screenshotsDirectory && demo.capture.mode !== 'none') {
    const target = path.resolve(screenshotsDirectory, `${demo.id}.png`);
    mkdirSync(path.dirname(target), { recursive: true });
    await page.locator('#stage').screenshot({ path: target, omitBackground: false });
  }
  await context.close();
}

validateCatalog();
const selected = selectDemos();
const server = await createServer({
  configFile: path.resolve('vite.config.ts'),
  logLevel: 'warn',
  server: { host: '127.0.0.1', port: 0, open: false },
});

let browser;
try {
  await server.listen();
  const baseUrl = server.resolvedUrls?.local[0];
  if (!baseUrl) throw new Error('Vite did not expose a Playground URL');
  browser = await launchBrowser();
  for (const [index, demo] of selected.entries()) {
    await checkDemo(browser, baseUrl, demo);
    console.log(`✓ ${demo.id} (${index + 1}/${selected.length})`);
  }
  console.log(`Checked ${selected.length} examples with profile ${profile}`);
} finally {
  await browser?.close();
  await server.close();
}
