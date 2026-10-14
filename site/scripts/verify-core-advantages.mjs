/** Regression for the preview's evidence and illustrative controls. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const { chromium } = createRequire(new URL('../../package.json', import.meta.url))('playwright');
const snapshot = JSON.parse(
  readFileSync(new URL('../src/components/homepage/bundle-measurement.json', import.meta.url)),
);
const packageJson = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url)));
assert.equal(snapshot.version, packageJson.version, 'remeasure when the package version changes');
assert(snapshot.initialBytes > 0 && snapshot.initialBytes <= 90000);
assert.equal(snapshot.unitBytes, 1000);
const origin = process.argv[2] ?? 'http://127.0.0.1:3010';
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const [width, dark] of [
    [1440, false],
    [1024, false],
    [390, false],
    [320, false],
    [1440, true],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      hasTouch: width < 768,
      isMobile: width < 768,
    });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
    if (dark) await page.getByRole('button', { name: '切换主题' }).first().click();
    const section = page.locator('#performance');
    await section.scrollIntoViewIfNeeded();
    assert.equal(await section.locator('h2').textContent(), '轻量加载，流畅交互');
    assert.deepEqual(
      (await section.locator('article h3').allTextContents()).map((text) => text.trim()),
      ['轻量加载', '批量渲染', '按需更新'],
    );
    assert.equal(
      await section.locator('[class*="measuredSize"] strong').textContent(),
      `${(snapshot.initialBytes / 1000).toFixed(1)}kB`,
    );
    assert((await section.textContent()).includes(snapshot.version));
    assert((await section.textContent()).includes(snapshot.measuredAt));
    assert(!(await section.textContent()).includes('把每一次变化，留在局部'));
    assert(!(await section.textContent()).includes('90kB'));
    assert.equal(await section.locator('canvas').count(), 0);
    assert.equal(await page.locator('[data-graph-status]').count(), 1);
    const demo = section.locator('[data-update-scenario]');
    assert.equal(await demo.getAttribute('data-update-scenario'), 'highlight');
    assert.equal(await demo.locator('button[aria-pressed="true"]').count(), 1);
    assert.equal(await demo.locator('circle[class*="updatedNode"]').getAttribute('cx'), '140');
    await demo.getByRole('button', { name: '移动', exact: true }).click();
    assert.equal(await demo.getAttribute('data-update-scenario'), 'position');
    assert.equal(await demo.locator('circle[class*="updatedNode"]').getAttribute('cx'), '166');
    assert.equal(await demo.locator('circle[class*="updatedNode"]').getAttribute('cy'), '62');
    assert((await demo.getByRole('status').textContent()).includes('关联边'));
    await demo.getByRole('button', { name: '缩放', exact: true }).click();
    assert.equal(await demo.getAttribute('data-update-scenario'), 'viewport');
    assert((await demo.locator('svg > g').getAttribute('transform')).includes('scale(1.12)'));
    assert((await demo.getByRole('status').textContent()).includes('相机参数'));
    await demo.getByRole('button', { name: '高亮', exact: true }).focus();
    await page.keyboard.press('Enter');
    assert.equal(await demo.getAttribute('data-update-scenario'), 'highlight');
    assert.equal(await demo.locator('button[aria-pressed="true"]').count(), 1);
    assert((await demo.getByRole('img').getAttribute('aria-label')).includes('非实时性能测试'));
    const layout = await section.evaluate((element) => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      cardsOverflow: [...element.querySelectorAll('article')].some(
        (card) => card.scrollWidth > card.clientWidth,
      ),
    }));
    assert.equal(layout.overflow, false);
    assert.equal(layout.cardsOverflow, false);
    const links = await section
      .locator('a')
      .evaluateAll((elements) => elements.map((element) => element.getAttribute('href')));
    for (const link of links) assert.equal((await page.request.get(origin + link)).status(), 200);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(
      await demo
        .locator('svg > g')
        .evaluate((element) => getComputedStyle(element).transitionDuration),
      '0s',
    );
    assert.deepEqual(errors, []);
    results.push({ width, dark, passed: true, secondWebGl: false, controls: 'pointer + keyboard' });
    await page.close();
  }
  console.log(JSON.stringify({ measurement: snapshot.initialBytes, results }, null, 2));
} finally {
  await browser.close();
}
