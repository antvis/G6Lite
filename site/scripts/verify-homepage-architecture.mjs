/** Independent static architecture: semantic layers, responsive geometry and theme. */
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
    [768, false],
    [390, false],
    [320, false],
    [1440, true],
    [1024, true],
    [390, true],
    [320, true],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: 'reduce',
    });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    if (dark) await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator('#architecture');
    assert.equal(await section.count(), 1);
    assert.equal(await section.locator('h2').textContent(), '分层架构，协同渲染');
    assert.equal(
      await section.evaluate((element) => element.previousElementSibling.id),
      'developers',
    );
    assert.equal(await page.locator('#opensource').count(), 0);
    assert(
      !(await page.locator('main[lang="zh-CN"]').textContent()).includes('开源透明，按需扩展'),
    );
    const action = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: '开始使用 G6Lite', exact: true }) });
    assert.equal(await action.count(), 1);
    assert.equal(
      await action.locator('p').textContent(),
      '阅读接入指南，构建可交互的关系图；查看源码，了解实现细节与扩展方式。',
    );
    assert.equal(await action.locator('[class*="ctaSpark"], span[aria-hidden="true"]').count(), 0);
    assert(!(await action.textContent()).includes('✦'));
    assert.equal(await action.locator('a').count(), 2);
    assert(await action.evaluate((element) => element.scrollWidth <= element.clientWidth));
    assert(
      await section.evaluate(
        (element) =>
          element.nextElementSibling.querySelector('h2')?.textContent === '开始使用 G6Lite',
      ),
    );
    assert.equal(
      await action.getByRole('link', { name: /快速开始/ }).getAttribute('href'),
      '/docs/getting-started/quick-start',
    );
    assert.equal(
      await action.getByRole('link', { name: /查看 GitHub/ }).getAttribute('href'),
      'https://github.com/antvis/G6Lite',
    );
    assert.equal(
      await page
        .locator('footer')
        .getByRole('link', { name: '问题反馈', exact: true })
        .getAttribute('href'),
      'https://github.com/antvis/G6Lite/issues',
    );
    assert.equal(
      await page
        .locator('footer')
        .getByRole('link', { name: '更新记录', exact: true })
        .getAttribute('href'),
      '/docs/changelog',
    );
    assert.equal(
      (await page.request.get(`${origin}/docs/getting-started/quick-start`)).status(),
      200,
    );
    assert.equal((await page.request.get(`${origin}/docs/changelog`)).status(), 200);
    assert.equal(
      await page.locator('#developers figure').count(),
      1,
      'developer only contains the code window',
    );
    assert.equal(await page.locator('#developers [class*="architecture"]').count(), 0);
    assert.equal(await section.locator('canvas').count(), 0);
    assert.equal(await page.locator('[data-graph-status]').count(), 1);
    const figure = section.getByRole('figure', { name: 'G6Lite 分层架构与协同绘制图层' });
    assert.equal(await figure.count(), 1);
    assert.deepEqual(await figure.locator('[class*="architectureRowLabel"]').allTextContents(), [
      '使用方',
      '公开入口',
      '内部职责',
      '协同绘制',
    ]);
    assert.deepEqual(await figure.locator('h3').allTextContents(), [
      '数据模型',
      '布局计算',
      '交互控制',
      '渲染调度',
    ]);
    assert.deepEqual(
      await figure
        .locator('[data-render-layer]')
        .evaluateAll((elements) => elements.map((element) => element.dataset.renderLayer)),
      ['overlay', 'main', 'underlay'],
    );
    assert(
      (await figure.locator('[data-render-layer="overlay"]').textContent()).includes('标签与图标'),
    );
    assert(
      (await figure.locator('[data-render-layer="main"]').textContent()).includes(
        '节点与边 · 按需拾取',
      ),
    );
    assert(
      (await figure.locator('[data-render-layer="underlay"]').textContent()).includes(
        'Combo 分组边界',
      ),
    );
    assert((await figure.locator('figcaption').textContent()).includes('内部模块不属于公开 API'));
    for (const stale of [
      '宿主应用与 AI 工作流',
      'DataModel · Layout',
      'Browser · DOM',
      '把复杂度留在引擎里',
    ])
      assert(!(await section.textContent()).includes(stale));
    const columns = await figure
      .locator('[class*="architectureResponsibilities"]')
      .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
    assert.equal(columns, width >= 1024 ? 4 : width >= 768 ? 2 : 1);
    const height = (await figure.boundingBox()).height;
    if (width === 1440) {
      assert.equal(Math.round((await figure.boundingBox()).width), 960);
      assert(height >= 350 && height <= 440, `diagram height ${height}`);
    }
    const appearance = await section.evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      border: getComputedStyle(element).borderTopWidth,
    }));
    assert.equal(appearance.background, dark ? 'rgb(23, 30, 40)' : 'rgb(248, 249, 253)');
    assert.equal(appearance.border, '0px');
    assert(
      await figure.evaluate(
        (element) =>
          getComputedStyle(element).boxShadow === 'none' &&
          getComputedStyle(element).borderTopWidth === '0px',
      ),
    );
    assert(
      await figure
        .locator('p, strong, span, figcaption')
        .evaluateAll((elements) =>
          elements.every((element) => parseFloat(getComputedStyle(element).fontSize) >= 12),
        ),
    );
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    assert(
      await figure
        .locator('div')
        .evaluateAll((elements) =>
          elements.every((element) => element.scrollWidth <= element.clientWidth),
        ),
    );
    const link = section.getByRole('link', { name: /查看完整架构/ });
    assert.equal(await link.getAttribute('href'), '/docs/concepts/architecture');
    assert.equal(
      (await page.request.get(origin + (await link.getAttribute('href')))).status(),
      200,
    );
    await link.focus();
    assert(await link.evaluate((element) => document.activeElement === element));
    await link.evaluate((element) => element.blur());
    await section.evaluate((element) =>
      window.scrollTo(0, element.getBoundingClientRect().top + scrollY - 100),
    );
    const clip = await section.evaluate((element) => {
      const r = element.getBoundingClientRect();
      return { x: r.x, y: r.y + scrollY, width: r.width, height: r.height };
    });
    await page.screenshot({
      path: `/tmp/g6-independent-architecture-${width}-${dark ? 'dark' : 'light'}.png`,
      clip,
      fullPage: true,
    });
    await action.evaluate((element) =>
      window.scrollTo(0, element.getBoundingClientRect().top + scrollY - 100),
    );
    const actionClip = await action.evaluate((element) => {
      const r = element.getBoundingClientRect();
      return { x: r.x, y: r.y + scrollY, width: r.width, height: r.height };
    });
    await page.screenshot({
      path: `/tmp/g6-final-cta-${width}-${dark ? 'dark' : 'light'}.png`,
      clip: actionClip,
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    results.push({
      width,
      dark,
      responsibilityColumns: columns,
      figureHeight: Math.round(height),
      independent: true,
      passed: true,
    });
    await page.close();
  }
  console.log(JSON.stringify({ results }, null, 2));
} finally {
  await browser.close();
}
