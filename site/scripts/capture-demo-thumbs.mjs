/**
 * Screenshot each docs example's live preview; the PNGs feed the example
 * directory thumbnails and gallery cards. Requires the site dev server.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(__dirname, '..');
const base = process.env.CAPTURE_BASE ?? 'http://localhost:3000';
const meta = JSON.parse(readFileSync(resolve(siteRoot, 'content/docs/zh/examples/meta.json'), 'utf8'));
const ids = meta.pages.filter((id) => id !== 'index');
const slow = new Set(['real-dataset', 'large', 'large-labeled', 'layout-worker', 'relationship']);

// The preview container holds the graph canvases plus demo UI (toolbars,
// menus, status text). Some demos render the graph into a nested wrapper
// div, so only hide direct children that contain no render layer at all.
const HIDE_CHROME_CSS =
  '.example-preview-canvas > *:not(canvas):not(.label-overlay):not(:has(canvas)) { display: none !important; }';

async function launchBrowser() {
  let lastError;
  for (const options of [{}, { channel: 'chrome' }, { channel: 'msedge' }]) {
    try {
      return await chromium.launch(options);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function waitForPreview(page, id) {
  await page.waitForFunction(
    () => {
      const stage = document.querySelector('.example-preview-canvas');
      const canvas = stage?.querySelector('canvas');
      const fit = [...document.querySelectorAll('button')].find((button) =>
        (button.textContent || '').includes('适应画布'),
      );
      if (!stage || !canvas || !fit || fit.disabled) return false;
      const rect = stage.getBoundingClientRect();
      return rect.width > 200 && rect.height > 80 && canvas.width > 0;
    },
    undefined,
    { timeout: slow.has(id) ? 90_000 : 30_000 },
  );
  await page.waitForTimeout(slow.has(id) ? 1200 : 500);
}

async function main() {
  const browser = await launchBrowser();
  const failed = [];
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    for (const id of ids) {
      try {
        await page.goto(`${base}/docs/examples/${id}`, { waitUntil: 'domcontentloaded' });
        await waitForPreview(page, id);
        await page.addStyleTag({ content: HIDE_CHROME_CSS });
        await page
          .locator('.example-preview-canvas')
          .screenshot({ path: resolve(siteRoot, 'public/examples', `${id}.png`) });
        console.log(`✓ ${id}`);
      } catch (error) {
        failed.push(id);
        console.error(`✗ ${id}: ${error instanceof Error ? error.message.split('\n')[0] : error}`);
      }
    }
    await context.close();
  } finally {
    await browser.close();
  }
  if (failed.length > 0) {
    console.error(`Failed ${failed.length}: ${failed.join(', ')}`);
    process.exitCode = 1;
  }
}

await main();
