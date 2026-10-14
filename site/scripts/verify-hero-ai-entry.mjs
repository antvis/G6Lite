/** Hero entry order, AI visual priority, preserved footer and pointer/keyboard navigation. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { chromium } = createRequire(new URL('../../package.json', import.meta.url))('playwright');
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
    [390, true],
    [320, true],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      hasTouch: width < 768,
      isMobile: width < 768,
      reducedMotion: 'reduce',
    });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    if (dark) await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const hero = page.locator('section').filter({ has: page.locator('h1') });
    const actions = hero.locator('[class*="heroAside"] [class*="actions"]');
    const links = actions.getByRole('link');
    assert.deepEqual(
      (await links.allTextContents()).map((text) => text.trim()),
      ['快速开始', '用 AI 构建', '查看示例'],
    );
    const expected = ['/docs/getting-started/quick-start', '/ai', '/docs/examples'];
    for (let i = 0; i < 3; i++) {
      assert.equal(await links.nth(i).getAttribute('href'), expected[i]);
      assert.equal((await page.request.get(origin + expected[i])).status(), 200);
      assert((await links.nth(i).boundingBox()).height >= 44);
    }
    assert((await links.nth(0).getAttribute('class')).includes('secondaryButton'));
    assert((await links.nth(1).getAttribute('class')).includes('primaryButton'));
    assert((await links.nth(2).getAttribute('class')).includes('heroExampleLink'));
    assert.equal(await actions.locator('[class*="primaryButton"]').count(), 1);
    const aiStyle = await links.nth(1).evaluate((element) => {
      const s = getComputedStyle(element);
      const root = element.closest('main[lang="zh-CN"]');
      return {
        fill: s.backgroundColor,
        expected: getComputedStyle(root).getPropertyValue('--primary-background').trim(),
        border: s.borderTopWidth,
      };
    });
    assert.notEqual(aiStyle.fill, 'rgba(0, 0, 0, 0)');
    assert.equal(aiStyle.border, '0px');
    const quick = await links.nth(0).boundingBox();
    const ai = await links.nth(1).boundingBox();
    if (width >= 390)
      assert(Math.abs(quick.y - ai.y) < 2 && ai.x > quick.x, 'AI second item on the same row');
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    const footerAction = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: '开始使用 G6Lite', exact: true }) });
    assert.equal(await footerAction.locator('[class*="primaryButton"]').textContent(), '快速开始 ');
    assert.equal(
      await footerAction.locator('[class*="secondaryButton"]').textContent(),
      ' 查看 GitHub',
    );
    await links.nth(0).focus();
    await page.keyboard.press('Tab');
    assert(await links.nth(1).evaluate((element) => document.activeElement === element));
    assert(
      await links.nth(1).evaluate((element) => getComputedStyle(element).outlineStyle !== 'none'),
    );
    await links.nth(1).evaluate((element) => element.blur());
    await hero.screenshot({
      path: `/tmp/g6-hero-ai-entry-${width}-${dark ? 'dark' : 'light'}.png`,
    });
    if (width < 768) await links.nth(1).tap();
    else {
      await links.nth(1).focus();
      await page.keyboard.press('Enter');
    }
    await page.waitForURL('**/ai');
    assert.deepEqual(errors, []);
    results.push({
      width,
      dark,
      order: 'quick-start / AI / examples',
      aiPrimary: true,
      passed: true,
    });
    await page.close();
  }
  console.log(JSON.stringify({ results }, null, 2));
} finally {
  await browser.close();
}
