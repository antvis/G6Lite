import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../public/examples');
const BASE = process.env.CAPTURE_BASE ?? 'http://localhost:5179';

const DEFAULT_DEMOS = [
  'basic',
  'node-style',
  'edge-arrows',
  'layouts',
  'tooltip',
  'combo',
  'parallel-edges',
  'real-dataset',
  'large',
  'large-labeled',
];

const requestedDemos = process.argv.slice(2);
const DEMOS = requestedDemos.length > 0 ? requestedDemos : DEFAULT_DEMOS;

const unknownDemos = DEMOS.filter((id) => !DEFAULT_DEMOS.includes(id));
if (unknownDemos.length > 0) {
  throw new Error(`Unknown demo id: ${unknownDemos.join(', ')}`);
}

const DEMO_TIMEOUTS = {
  large: 60_000,
  'large-labeled': 120_000,
};

const DEMO_DEVICE_SCALE_FACTORS = {
  large: 1,
  'large-labeled': 1,
};

const CHROME_FALLBACKS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
];

async function launchBrowser() {
  try {
    return await chromium.launch();
  } catch (error) {
    for (const executablePath of CHROME_FALLBACKS) {
      try {
        return await chromium.launch({ executablePath });
      } catch {
        // Try the next installed browser.
      }
    }
    throw error;
  }
}

async function waitForReady(page, id) {
  const timeout = DEMO_TIMEOUTS[id] ?? 18_000;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeout) {
    const state = await page.evaluate(() => ({
      ready: window.__ready === true,
      error: window.__captureError,
    }));
    if (state.error) throw new Error(`${id}: ${state.error}`);
    if (state.ready) return;
    await page.waitForTimeout(200);
  }
  throw new Error(`${id}: render timeout after ${timeout}ms`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const browser = await launchBrowser();

  for (const id of DEMOS) {
    const context = await browser.newContext({
      viewport: { width: 960, height: 600 },
      deviceScaleFactor: DEMO_DEVICE_SCALE_FACTORS[id] ?? 2,
    });
    const page = await context.newPage();

    page.on('pageerror', (error) => {
      throw error;
    });

    await page.goto(`${BASE}/capture-demo.html#${id}`, { waitUntil: 'load' });
    await waitForReady(page, id);
    await page.locator('#stage').screenshot({
      path: resolve(OUT_DIR, `${id}.png`),
      omitBackground: false,
    });
    console.log(`✓ ${id}.png`);

    await context.close();
  }

  await browser.close();
}

void main();
