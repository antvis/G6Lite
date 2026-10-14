/** Run against a dev or static production site: node site/scripts/verify-hero-live-graph.mjs [origin]. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

// Use the repository's existing browser test dependency, not a site-local install.
const { chromium } = createRequire(new URL('../../package.json', import.meta.url))('playwright');

const origin = process.argv[2] ?? 'http://127.0.0.1:3010';
const url = `${origin}/`;
const browser = await chromium.launch({ headless: true });
const result = [];
const errors = [];
const ready = async (page) => {
  await page.locator('[data-graph-status="ready"]').waitFor({ timeout: 18000 });
};
const zoom = async (page) =>
  Number(await page.locator('[data-graph-status]').getAttribute('data-zoom'));
const observe = (page) => page.on('pageerror', (error) => errors.push(error.message));
const camera = async (page) =>
  page.locator('[data-graph-status]').evaluate((element) => ({
    x: Number(element.dataset.cameraX),
    y: Number(element.dataset.cameraY),
    zoom: Number(element.dataset.zoom),
  }));

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  observe(page);
  await page.goto(url, { waitUntil: 'networkidle' });
  await ready(page);
  const widget = page.locator('[data-graph-status]');
  assert.equal(await widget.getAttribute('data-node-count'), '500');
  assert.equal(await widget.getAttribute('data-edge-count'), '1242');
  assert.equal(await page.getByText('画布概览', { exact: true }).count(), 0);
  assert.equal(await widget.locator('img').count(), 0);
  assert.equal((await widget.boundingBox()).height, 480);
  const leadRect = await page.locator('[class*="heroLead"]').boundingBox();
  const widgetRect = await widget.boundingBox();
  assert(
    leadRect.x + leadRect.width <= widgetRect.x,
    'desktop Hero must be left copy / right graph',
  );
  const toolStyle = await widget.getByRole('toolbar').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      direction: style.flexDirection,
      background: style.backgroundColor,
      border: style.borderTopWidth,
    };
  });
  assert.equal(toolStyle.direction, 'row');
  assert.equal(toolStyle.background, 'rgba(0, 0, 0, 0)');
  assert.equal(toolStyle.border, '0px');
  assert.equal(
    await widget
      .locator('[class*="graphGrid"]')
      .evaluate((element) => getComputedStyle(element).backgroundSize),
    '12px 12px, 12px 12px',
  );
  assert.equal(
    await widget
      .locator('[class*="graphGrid"]')
      .evaluate((element) => getComputedStyle(element).pointerEvents),
    'none',
  );
  const canvas = widget.locator('canvas').first();
  assert(
    await canvas.evaluate((element) =>
      Boolean(element.getContext('webgl2') || element.getContext('webgl')),
    ),
  );
  const initial = await zoom(page);
  await page.getByRole('button', { name: '放大关系图' }).click();
  assert((await zoom(page)) > initial);
  await page.getByRole('button', { name: '缩小关系图' }).click();
  assert(Math.abs((await zoom(page)) - initial) < 0.001);
  await page.getByRole('button', { name: '适配画布' }).click();

  const data = await (await page.request.get(`${origin}/homepage/graph-desktop.json`)).json();
  const rect = await canvas.boundingBox();
  const dpr = await page.evaluate(() => Math.min(2, devicePixelRatio));
  const node = [...data.nodes]
    .filter((item) => item.data.size > 6)
    .sort((a, b) => Math.abs(b.x) - Math.abs(a.x))[0];
  await page.mouse.move(rect.x + 5, rect.y + rect.height - 5);
  await page.waitForTimeout(80);
  const plain = await canvas.screenshot();
  await page.mouse.move(
    rect.x + rect.width / 2 + (node.x * initial) / dpr,
    rect.y + rect.height / 2 + (node.y * initial) / dpr,
  );
  await page.waitForTimeout(100);
  assert.equal(
    await canvas.evaluate((element) => element.style.cursor),
    'pointer',
    'node picking and hover',
  );
  const highlighted = await canvas.screenshot();
  assert(!plain.equals(highlighted), 'hover must change rendered pixels');
  await page.mouse.down();
  await page.mouse.move(
    rect.x + rect.width / 2 + (node.x * initial) / dpr + 50,
    rect.y + rect.height / 2 + (node.y * initial) / dpr - 20,
    { steps: 8 },
  );
  await page.mouse.up();
  await page.mouse.move(rect.x + 5, rect.y + rect.height - 5);
  await page.waitForTimeout(150);
  assert(
    !plain.equals(await canvas.screenshot()),
    'mouse drag must move the node, not just highlight',
  );
  await page.mouse.move(rect.x + rect.width - 15, rect.y + 15);
  await page.waitForTimeout(100);
  const beforePan = await canvas.screenshot();
  await page.mouse.down();
  await page.mouse.move(rect.x + rect.width - 80, rect.y + 45, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(200);
  assert(!beforePan.equals(await canvas.screenshot()), 'drag must pan real pixels');
  await page.getByRole('button', { name: '适配画布' }).click();
  const fitted = await zoom(page);

  const desktopSession = await page.context().newCDPSession(page);
  const beforeWheel = await camera(page);
  const pinchCenter = { x: rect.x + rect.width * 0.6, y: rect.y + rect.height * 0.45 };
  const anchor = {
    x: ((pinchCenter.x - rect.x) * dpr) / beforeWheel.zoom - beforeWheel.x,
    y: ((pinchCenter.y - rect.y) * dpr) / beforeWheel.zoom - beforeWheel.y,
  };
  await desktopSession.send('Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    ...pinchCenter,
    deltaX: 0,
    deltaY: -35,
    modifiers: 2,
  });
  await page.waitForTimeout(150);
  const afterWheel = await camera(page);
  assert(afterWheel.zoom > beforeWheel.zoom, 'trackpad pinch must zoom');
  assert(
    Math.abs(((anchor.x + afterWheel.x) * afterWheel.zoom) / dpr + rect.x - pinchCenter.x) < 1,
    'pinch x anchor',
  );
  assert(
    Math.abs(((anchor.y + afterWheel.y) * afterWheel.zoom) / dpr + rect.y - pinchCenter.y) < 1,
    'pinch y anchor',
  );
  await page.getByRole('button', { name: '适配画布' }).click();

  const canvasCount = await widget.locator('canvas').count();
  await page.getByRole('button', { name: '切换主题' }).first().click();
  await page.waitForTimeout(200);
  assert.equal(
    await widget.locator('canvas').count(),
    canvasCount,
    'theme must reuse the instance',
  );
  assert.equal(await widget.getAttribute('data-graph-status'), 'ready');
  assert(Math.abs((await zoom(page)) - fitted) < 0.001);
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.wheel(0, 350);
  await page.waitForTimeout(200);
  assert((await page.evaluate(() => scrollY)) > 0, 'wheel must scroll the page');
  assert(Math.abs((await zoom(page)) - fitted) < 0.001);

  await page.locator('#nd-nav a[href="/docs"]').first().click();
  await page.waitForURL(`${origin}/docs`);
  assert.equal(await page.locator('[data-graph-status]').count(), 0);
  await page.goBack();
  await ready(page);
  assert.equal(await page.locator('[data-graph-status]').count(), 1);
  await page
    .locator('[data-graph-status] canvas')
    .first()
    .evaluate((element) => {
      const gl = element.getContext('webgl2') || element.getContext('webgl');
      gl.getExtension('WEBGL_lose_context').loseContext();
    });
  await page.locator('[data-graph-status="error"]').waitFor();
  assert.equal(await page.locator('[data-graph-status] canvas').count(), 0);
  assert.equal(await page.locator('[data-graph-status] img').count(), 0);
  assert(await page.getByRole('button', { name: '重新加载' }).isVisible());
  assert(await page.getByRole('button', { name: '放大关系图' }).isDisabled());
  await page.getByRole('button', { name: '重新加载' }).click();
  await ready(page);
  assert.equal(await page.locator('[data-graph-status] canvas').count(), canvasCount);
  result.push(
    'desktop: WebGL, grid, taller canvas, node/canvas drag, hover, controls, anchored trackpad pinch, theme reuse, wheel scrolling, route cleanup, context-loss retry',
  );
  await page.close();

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  observe(mobile);
  await mobile.goto(url, { waitUntil: 'networkidle' });
  await ready(mobile);
  assert.equal(await mobile.locator('[data-graph-status]').getAttribute('data-node-count'), '250');
  assert.equal(await mobile.locator('[data-graph-status]').getAttribute('data-edge-count'), '541');
  assert.equal(
    await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
  );
  const touch = await mobile.context().newCDPSession(mobile);
  await mobile.locator('[data-graph-status]').scrollIntoViewIfNeeded();
  const mobileRect = await mobile.locator('[data-graph-status] canvas').first().boundingBox();
  const panStart = {
    x: mobileRect.x + mobileRect.width * 0.7,
    y: mobileRect.y + mobileRect.height * 0.55,
  };
  const mobileCamera = await camera(mobile);
  const scrollBefore = await mobile.evaluate(() => scrollY);
  await touch.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ ...panStart, id: 1 }],
  });
  for (const offset of [10, 20, 30, 40]) {
    await touch.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: panStart.x - offset, y: panStart.y - offset / 2, id: 1 }],
    });
    await mobile.waitForTimeout(35);
  }
  await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await mobile.waitForTimeout(200);
  const pannedCamera = await camera(mobile);
  assert(Math.abs(pannedCamera.x - mobileCamera.x) > 1, 'single finger must pan');
  assert(
    Math.abs((await mobile.evaluate(() => scrollY)) - scrollBefore) < 1,
    'canvas touch must not scroll webpage',
  );

  const center = {
    x: mobileRect.x + mobileRect.width * 0.55,
    y: mobileRect.y + mobileRect.height * 0.5,
  };
  const pinchBefore = await camera(mobile);
  const touchAnchor = {
    x: ((center.x - mobileRect.x) * 2) / pinchBefore.zoom - pinchBefore.x,
    y: ((center.y - mobileRect.y) * 2) / pinchBefore.zoom - pinchBefore.y,
  };
  await touch.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: center.x - 35, y: center.y, id: 1 }],
  });
  const beforeSecondFinger = await camera(mobile);
  await touch.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { x: center.x - 35, y: center.y, id: 1 },
      { x: center.x + 35, y: center.y, id: 2 },
    ],
  });
  await mobile.waitForTimeout(60);
  const afterSecondFinger = await camera(mobile);
  assert(
    Math.abs(beforeSecondFinger.zoom - afterSecondFinger.zoom) < 0.001,
    'adding a finger must not jump',
  );
  for (const distance of [40, 45, 50, 55]) {
    await touch.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        { x: center.x - distance, y: center.y, id: 1 },
        { x: center.x + distance, y: center.y, id: 2 },
      ],
    });
    await mobile.waitForTimeout(35);
  }
  const pinchAfter = await camera(mobile);
  assert(pinchAfter.zoom > pinchBefore.zoom * 1.4, 'two fingers must zoom');
  assert(
    Math.abs(((touchAnchor.x + pinchAfter.x) * pinchAfter.zoom) / 2 + mobileRect.x - center.x) < 1,
    'touch midpoint x must remain anchored',
  );
  assert(
    Math.abs(((touchAnchor.y + pinchAfter.y) * pinchAfter.zoom) / 2 + mobileRect.y - center.y) < 1,
    'touch midpoint y must remain anchored',
  );
  await touch.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    // CDP specifies the ended contact, not the remaining contact.
    touchPoints: [{ x: center.x + 55, y: center.y, id: 2 }],
  });
  await mobile.waitForTimeout(50);
  assert.equal(
    await mobile.locator('[data-graph-status]').getAttribute('data-active-pointers'),
    '1',
  );
  assert(
    Math.abs((await zoom(mobile)) - pinchAfter.zoom) < 0.001,
    'removing a finger must not jump',
  );
  await touch.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: center.x - 65, y: center.y + 10, id: 1 }],
  });
  await mobile.waitForTimeout(50);
  assert(
    Math.abs((await camera(mobile)).x - pinchAfter.x) > 1,
    'remaining finger must continue panning',
  );
  await touch.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await mobile.waitForTimeout(50);
  assert.equal(
    await mobile.locator('[data-graph-status]').getAttribute('data-active-pointers'),
    '0',
  );
  // Blank page margin, outside the canvas: normal page scrolling must remain available.
  await touch.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: 5, y: 700, id: 3 }],
  });
  for (const y of [660, 620, 580]) {
    await touch.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: 5, y, id: 3 }],
    });
    await mobile.waitForTimeout(35);
  }
  await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await mobile.waitForTimeout(200);
  assert(
    (await mobile.evaluate(() => scrollY)) > scrollBefore,
    'touch outside canvas must scroll webpage',
  );
  result.push(
    'mobile: smaller data, DPR 2, single-finger pan, anchored pinch, 1/2-finger transitions, cancellation, outside-page scrolling',
  );
  await mobile.close();

  const deferred = await browser.newPage({ viewport: { width: 768, height: 260 } });
  observe(deferred);
  let dataRequests = 0;
  deferred.on('request', (request) => {
    if (/graph-(desktop|mobile)\.json/.test(request.url())) dataRequests++;
  });
  await deferred.goto(url, { waitUntil: 'networkidle' });
  assert.equal(
    await deferred.locator('[data-graph-status]').getAttribute('data-graph-status'),
    'waiting',
  );
  assert.equal(dataRequests, 0, 'off-screen graph data must not download');
  assert(await deferred.getByText('正在加载关系图', { exact: true }).isVisible());
  assert.equal(await deferred.locator('[data-graph-status] img').count(), 0);
  await deferred.locator('[data-graph-status]').scrollIntoViewIfNeeded();
  await ready(deferred);
  assert.equal(dataRequests, 1);
  result.push('deferred: no off-screen data request, initializes on visibility');
  await deferred.close();

  const legacy = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  observe(legacy);
  await legacy.addInitScript(() => {
    window.requestIdleCallback = undefined;
    window.IntersectionObserver = undefined;
  });
  await legacy.goto(url, { waitUntil: 'networkidle' });
  await ready(legacy);
  result.push('legacy scheduling: timer fallback without idle or intersection APIs');
  await legacy.close();

  const cancelled = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  observe(cancelled);
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  let requested;
  const requestStarted = new Promise((resolve) => {
    requested = resolve;
  });
  await cancelled.route('**/graph-desktop.json', async (route) => {
    requested();
    await gate;
    await route.continue().catch(() => undefined);
  });
  await cancelled.goto(url, { waitUntil: 'domcontentloaded' });
  await requestStarted;
  assert(await cancelled.getByText('正在加载关系图', { exact: true }).isVisible());
  await cancelled.locator('#nd-nav a[href="/docs"]').first().click();
  await cancelled.waitForURL(`${origin}/docs`);
  release();
  await cancelled.waitForTimeout(300);
  assert.equal(await cancelled.locator('[data-graph-status]').count(), 0);
  result.push('pending load: navigation cancels startup without stale canvas');
  await cancelled.close();

  for (const failure of ['asset', 'webgl', 'data']) {
    const fallback = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    observe(fallback);
    if (failure === 'asset')
      await fallback.route('**/graph-desktop.json', (route) =>
        route.fulfill({ status: 404, body: '' }),
      );
    if (failure === 'data')
      await fallback.route('**/graph-desktop.json', (route) =>
        route.fulfill({
          contentType: 'application/json',
          body: '{"nodes":[{"id":"bad"}],"edges":[]}',
        }),
      );
    if (failure === 'webgl')
      await fallback.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, ...args) {
          if (type === 'webgl' || type === 'webgl2') return null;
          return original.call(this, type, ...args);
        };
      });
    await fallback.goto(url, { waitUntil: 'networkidle' });
    await fallback.locator('[data-graph-status="error"]').waitFor();
    assert(await fallback.getByText('关系图暂时无法加载', { exact: true }).isVisible());
    assert.equal(await fallback.locator('[data-graph-status] img').count(), 0);
    assert.equal(await fallback.locator('[data-graph-status] canvas').count(), 0);
    assert(await fallback.getByRole('button', { name: '放大关系图' }).isDisabled());
    assert(await fallback.getByRole('button', { name: '重新加载' }).isVisible());
    if (failure !== 'webgl') {
      await fallback.unroute('**/graph-desktop.json');
      await fallback.getByRole('button', { name: '重新加载' }).click();
      await ready(fallback);
      assert.equal(await fallback.locator('[data-graph-status] canvas').count(), canvasCount);
    }
    result.push(`${failure}: error state without image, disabled controls and retry`);
    await fallback.close();
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ passed: result, pageErrors: errors }, null, 2));
} finally {
  await browser.close();
}
