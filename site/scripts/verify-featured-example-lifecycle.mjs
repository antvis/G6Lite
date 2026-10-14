/** Browser-side lifecycle contract for the four demos; requires the Playground dev server. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { chromium } = createRequire(new URL('../../package.json', import.meta.url))('playwright');
const origin = process.argv[2] ?? 'http://127.0.0.1:5179';
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const id of ['relationship', 'org-chart', 'mindmap', 'fishbone']) {
    const page = await browser.newPage({
      viewport: { width: 960, height: 600 },
      deviceScaleFactor: 2,
    });
    await page.goto(`${origin}/capture-demo.html#basic`);
    await page.waitForFunction(() => window.__ready === true);
    // Import through Vite's root-relative module URL, avoiding host-specific filesystem paths.
    const lifecycle = await page.evaluate(async (id) => {
      const demoModule = await import(`/demos/${id}.ts`);
      const requestFrame = window.requestAnimationFrame.bind(window);
      const cancelFrame = window.cancelAnimationFrame.bind(window);
      const pendingFrames = new Set();
      window.requestAnimationFrame = (callback) => {
        const frame = requestFrame((time) => {
          pendingFrames.delete(frame);
          callback(time);
        });
        pendingFrames.add(frame);
        return frame;
      };
      window.cancelAnimationFrame = (frame) => {
        pendingFrames.delete(frame);
        cancelFrame(frame);
      };
      const Observer = window.ResizeObserver;
      const activeObservers = new Set();
      window.ResizeObserver = class extends Observer {
        constructor(callback) {
          super(callback);
          activeObservers.add(this);
        }
        disconnect() {
          activeObservers.delete(this);
          super.disconnect();
        }
      };
      const stage = document.createElement('div');
      stage.style.cssText = 'position:relative;width:960px;height:600px;';
      document.body.replaceChildren(stage);
      const handle = await demoModule.run(stage);
      const initialCanvases = stage.querySelectorAll('canvas').length;
      await handle.fitView();
      await new Promise((resolve) => requestFrame(resolve));
      const labels = stage.querySelectorAll('.label-canvas,.edge-label-canvas').length;
      handle.destroy();
      await new Promise((resolve) => requestFrame(() => requestFrame(resolve)));
      return {
        initialCanvases,
        labels,
        remainingCanvases: stage.querySelectorAll('canvas').length,
        pendingFrames: pendingFrames.size,
        activeObservers: activeObservers.size,
      };
    }, id);
    assert.equal(lifecycle.labels, id === 'relationship' ? 2 : 1);
    assert.equal(lifecycle.remainingCanvases, 0);
    assert.equal(lifecycle.pendingFrames, 0);
    assert.equal(lifecycle.activeObservers, 0);
    results.push({ id, ...lifecycle, passed: true });
    await page.close();
  }
  console.log(JSON.stringify({ results }, null, 2));
} finally {
  await browser.close();
}
