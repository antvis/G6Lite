/** Compact homepage gallery: layout, decoded thumbnails and direct detail navigation. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { chromium } = createRequire(new URL('../../package.json', import.meta.url))('playwright');
const origin = process.argv[2] ?? 'http://127.0.0.1:3010';
const browser = await chromium.launch({ headless: true });
const examples = [
  ['关系网络', 'relationship'],
  ['层级图', 'org-chart'],
  ['脑图', 'mindmap'],
  ['鱼骨图', 'fishbone'],
];
const results = [];
try {
  for (const [width, dark] of [
    [1440, false],
    [1024, false],
    [768, false],
    [390, false],
    [320, false],
    [1440, true],
    [390, true],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      hasTouch: width < 768,
      isMobile: width < 768,
    });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    if (dark) await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
    if (dark)
      assert(await page.locator('html').evaluate((element) => element.classList.contains('dark')));
    const section = page.locator('#scenarios');
    await section.scrollIntoViewIfNeeded();
    assert.equal(await section.locator('h2').textContent(), '精选示例');
    assert.deepEqual(
      await section.locator('article h3').allTextContents(),
      examples.map(([title]) => title),
    );
    assert.equal(await section.locator('dialog, canvas, button').count(), 0);
    assert.equal(await page.locator('[data-graph-status]').count(), 1);
    assert.equal(await section.locator('[class*="architectureSection"]').count(), 0);
    assert.equal(await page.locator('#developers [class*="architectureFigure"]').count(), 0);
    assert.equal(await page.locator('#architecture [class*="architectureFigure"]').count(), 1);
    const columns = width >= 1024 ? 4 : width >= 360 ? 2 : 1;
    const boxes = await section.locator('article').evaluateAll((elements) =>
      elements.map((element) => {
        const box = element.getBoundingClientRect();
        return { x: box.x, y: box.y };
      }),
    );
    for (let i = 0; i < boxes.length; i++) {
      if (i < columns) assert(Math.abs(boxes[i].y - boxes[0].y) < 1);
      else assert(boxes[i].y > boxes[0].y);
    }
    if (width >= 1024)
      assert((await section.boundingBox()).height < 700, 'compact desktop section');
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    for (const [title, id] of examples) {
      const link = section.getByRole('link', { name: `查看${title}示例`, exact: true });
      assert.equal(await link.getAttribute('href'), `/docs/examples/${id}`);
      const titleRow = link.locator('[class*="featuredTitleRow"]');
      assert.equal(await titleRow.locator('h3').textContent(), title);
      const headingBox = await titleRow.locator('h3').boundingBox();
      const actionBox = await titleRow.locator('[class*="featuredAction"]').first().boundingBox();
      assert(actionBox.x >= headingBox.x + headingBox.width);
      assert(
        Math.abs(actionBox.y + actionBox.height / 2 - headingBox.y - headingBox.height / 2) < 2,
      );
      assert.equal(
        await link.locator('[class*="featuredContent"] > [class*="featuredAction"]').count(),
        0,
      );
      assert.equal(await link.locator('[class*="featuredActionLabel"]').isVisible(), width >= 768);
      const image = link.locator('img');
      await image.evaluate((element) => element.decode());
      assert(
        await image.evaluate(
          (element) =>
            element.naturalWidth > 0 && getComputedStyle(element).objectFit === 'contain',
        ),
      );
      const style = await link.evaluate((element) => {
        const s = getComputedStyle(element);
        return { border: s.borderTopWidth, shadow: s.boxShadow, background: s.backgroundColor };
      });
      assert.deepEqual(style, { border: '0px', shadow: 'none', background: 'rgba(0, 0, 0, 0)' });
      assert.equal(
        (await page.request.get(origin + (await link.getAttribute('href')))).status(),
        200,
      );
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(
      await section
        .locator('[class*="featuredImage"]')
        .first()
        .evaluate((element) => getComputedStyle(element).transitionDuration),
      '0s',
    );
    await section.screenshot({
      path: `/tmp/g6lite-compact-${width}-${dark ? 'dark' : 'light'}.png`,
    });
    const link = section.getByRole('link', { name: '查看关系网络示例', exact: true });
    if (width < 768) await link.tap();
    else {
      await link.focus();
      await page.keyboard.press('Enter');
    }
    await page.waitForURL('**/docs/examples/relationship');
    await page.locator('.example-preview-title .is-ready').waitFor();
    assert.deepEqual(errors, []);
    results.push({ width, dark, columns, passed: true, staticDialog: false, inlineEntry: true });
    await page.close();
  }
  console.log(JSON.stringify({ results }, null, 2));
} finally {
  await browser.close();
}
