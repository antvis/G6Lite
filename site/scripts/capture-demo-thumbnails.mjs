import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(__dirname, '../..');
const catalog = JSON.parse(
  readFileSync(resolve(repositoryRoot, 'playground/demos/catalog.json'), 'utf8'),
);
const OUT_DIR = resolve(__dirname, '../public/examples');
const BASE = process.env.CAPTURE_BASE ?? 'http://localhost:5179';

const defaultIds = catalog
  .filter((demo) => demo.audiences.includes('site') || ['large', 'large-labeled'].includes(demo.id))
  .map((demo) => demo.id);
const requestedIds = process.argv.slice(2);
const ids = requestedIds.length > 0 ? requestedIds : defaultIds;
const demoById = new Map(catalog.map((demo) => [demo.id, demo]));
const unknownIds = ids.filter((id) => !demoById.has(id));
if (unknownIds.length > 0) throw new Error(`Unknown demo id: ${unknownIds.join(', ')}`);

async function launchBrowser() {
  const candidates = [
    undefined,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
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

async function waitForReady(page, demo) {
  const timeout = demo.releaseCheck === 'full' ? 120_000 : 18_000;
  await page.waitForFunction(
    () => window.__ready === true || Boolean(window.__captureError),
    undefined,
    { timeout },
  );
  const state = await page.evaluate(() => ({ ready: window.__ready, error: window.__captureError }));
  if (state.error) throw new Error(`${demo.id}: ${state.error}`);
  if (!state.ready) throw new Error(`${demo.id}: render timeout`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await launchBrowser();
  try {
    for (const id of ids) {
      const demo = demoById.get(id);
      const context = await browser.newContext({
        viewport: { width: 960, height: 600 },
        deviceScaleFactor: demo.capture.deviceScaleFactor ?? 2,
      });
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.stack ?? error.message));
      await page.goto(`${BASE}/capture-demo.html#${id}`, { waitUntil: 'load' });
      await waitForReady(page, demo);
      if (pageErrors.length > 0) throw new Error(`${id}: ${pageErrors.join('\n')}`);
      await page.locator('#stage').screenshot({
        path: resolve(OUT_DIR, `${id}.png`),
        omitBackground: false,
      });
      console.log(`✓ ${id}.png`);
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

void main();
