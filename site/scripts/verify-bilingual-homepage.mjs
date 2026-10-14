/** Public homepage parity, translated UI, localized navigation, SEO and compatibility previews. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { chromium } = createRequire(new URL('../../package.json', import.meta.url))('playwright');
const origin = process.argv[2] ?? 'http://127.0.0.1:3010';
const browser = await chromium.launch({ headless: true });
const results = [];
const han = /\p{Script=Han}/u;
const expected = {
  zh: {
    path: '/',
    lang: 'zh-CN',
    actions: ['快速开始', '用 AI 构建', '查看示例'],
    cta: '开始使用 G6Lite',
    controls: ['高亮', '移动', '缩放'],
  },
  en: {
    path: '/en',
    lang: 'en',
    actions: ['Quick start', 'Build with AI', 'Examples'],
    cta: 'Get started with G6Lite',
    controls: ['Highlight', 'Move', 'Zoom'],
  },
};
try {
  for (const locale of ['zh', 'en']) {
    const copy = expected[locale];
    const prefix = locale === 'en' ? '/en' : '';
    for (const [width, dark] of [
      [1440, false],
      [1024, false],
      [768, false],
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
      await page.addInitScript(
        (dark) => localStorage.setItem('theme', dark ? 'dark' : 'light'),
        dark,
      );
      assert.equal(
        (await page.goto(origin + copy.path, { waitUntil: 'networkidle' })).status(),
        200,
      );
      const main = page.locator(`main[lang="${copy.lang}"]`);
      await main.locator('[data-graph-status="ready"]').waitFor({ timeout: 20000 });
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('html').getAttribute('lang'), copy.lang);
      assert.equal(await main.locator('h1').count(), 1);
      assert.equal(await main.locator('[data-graph-status]').count(), 1);
      assert.equal(await main.locator('#opensource').count(), 0);
      const footer = main.locator('footer');
      assert.equal(await footer.locator('[class*="footerBottom"]').count(), 0);
      assert(!/MIT licensed|G6Lite · WebGL/.test(await footer.textContent()));
      assert.equal(await footer.locator('[class*="footerBrand"] p').count(), 1);
      assert.equal(await footer.locator('h3').count(), 4);
      assert.equal(await footer.locator('a').count(), 13);
      assert.equal(await main.locator('h2').last().textContent(), copy.cta);
      assert.equal(await main.locator('[data-g6lite-home-navigation]').count(), 1);
      const actions = main.locator('[class*="heroAside"] [class*="actions"] a');
      assert.deepEqual(
        (await actions.allTextContents()).map((text) => text.trim()),
        copy.actions,
      );
      assert.deepEqual(
        await actions.evaluateAll((elements) =>
          elements.map((element) => element.getAttribute('href')),
        ),
        [prefix + '/docs/getting-started/quick-start', prefix + '/ai', prefix + '/docs/examples'],
      );
      const links = await main
        .locator('a')
        .evaluateAll((elements) => elements.map((element) => element.getAttribute('href')));
      if (locale === 'en') {
        assert.equal(
          await main.locator('h1').textContent(),
          'A lightweight engine for large-scale graphs',
        );
        assert.equal(await main.locator('h1 span').textContent(), 'large-scale graphs');
        assert.equal(
          await main.locator('#workflow h2').textContent(),
          'Your data, made interactive',
        );
        assert.equal(
          await main.locator('#performance h2').textContent(),
          'A small core, responsive interactions',
        );
        assert.equal(await main.locator('#scenarios h2').textContent(), 'Examples');
        assert.equal(
          await main.locator('#developers h2').textContent(),
          'Fits your app, adapts to your needs',
        );
        assert.equal(
          await main.locator('#architecture h2').textContent(),
          'Layers that work as one',
        );
        assert(
          await main
            .locator('h1, h2, h3')
            .evaluateAll((elements) =>
              elements.every((element) => !/[.!?]$/.test(element.textContent.trim())),
            ),
          'headings should not end in sentence punctuation',
        );
        assert(
          await main
            .locator('[class*="heroDescription"]')
            .evaluate((element) => element.textContent.trim().endsWith('.')),
        );
        assert(
          await main
            .locator('#developers p')
            .evaluate((element) => element.textContent.trim().endsWith('.')),
        );
        assert(
          (await main.locator('[class*="architectureHeading"] p').textContent()).includes(
            'WebGL renders nodes and edges, while Canvas 2D',
          ),
        );
        assert.equal(
          await main.locator('footer [class*="footerBrand"] p').textContent(),
          'A lightweight WebGL engine for interactive graphs',
        );
        assert(
          !han.test(await main.textContent()),
          'English homepage has untranslated visible content',
        );
        const attributes = await main
          .locator('[aria-label], [title], img')
          .evaluateAll((elements) =>
            elements.flatMap((element) =>
              ['aria-label', 'title', 'alt'].map((name) => element.getAttribute(name) ?? ''),
            ),
          );
        assert(
          !attributes.some((value) => han.test(value)),
          'English accessibility or image text is not localized',
        );
        assert(
          links
            .filter((href) => href.startsWith('/') && !href.startsWith('//'))
            .every((href) => href === '/en' || href.startsWith('/en/')),
          'English link escapes to Chinese',
        );
      }
      if (width === 1440 && !dark) {
        for (const href of new Set(
          links.filter((href) => href.startsWith('/') && !href.startsWith('//')),
        ))
          assert.equal(
            (await page.request.get(origin + href, { timeout: 90000 })).status(),
            200,
            href,
          );
        const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
        assert.equal(new URL(canonical).pathname, copy.path);
        assert.equal(
          new URL(await page.locator('link[rel="alternate"][hreflang="en"]').getAttribute('href'))
            .pathname,
          '/en',
        );
        assert.equal(
          new URL(
            await page.locator('link[rel="alternate"][hreflang="zh-CN"]').getAttribute('href'),
          ).pathname,
          '/',
        );
        const robots = page.locator('meta[name="robots"]');
        assert(
          !((await robots.count()) ? await robots.getAttribute('content') : '').includes('noindex'),
        );
        assert((await page.locator('script[type="application/ld+json"]').count()) > 0);
      }
      const update = main.locator('[data-update-scenario]');
      assert.deepEqual(await update.locator('button').allTextContents(), copy.controls);
      await update.getByRole('button', { name: copy.controls[1], exact: true }).click();
      assert.equal(await update.getAttribute('data-update-scenario'), 'position');
      await update.getByRole('button', { name: copy.controls[2], exact: true }).click();
      assert.equal(await update.getAttribute('data-update-scenario'), 'viewport');
      await update.getByRole('button', { name: copy.controls[0], exact: true }).click();
      await page.evaluate(() => window.scrollTo(0, 400));
      await page.locator('[data-g6lite-home-navigation="compact"]').waitFor({ state: 'attached' });
      assert(
        parseFloat(
          await page
            .locator('#nd-nav > div')
            .evaluate((element) => getComputedStyle(element).borderRadius),
        ) >= 26,
      );
      for (const section of await main.locator(':scope > section').all())
        await section.scrollIntoViewIfNeeded();
      await main
        .locator('img')
        .evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert(
        await main
          .locator(
            '[class*="featuredCard"], [class*="workflowCard"], [class*="advantageCard"], [class*="codePanel"], [class*="architectureRow"]',
          )
          .evaluateAll((elements) =>
            elements.every((element) => element.scrollWidth <= element.clientWidth),
          ),
        'component overflow',
      );
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.locator('[data-g6lite-home-navigation="expanded"]').waitFor({ state: 'attached' });
      assert.equal(
        await page
          .locator('#nd-nav > div')
          .evaluate((element) => getComputedStyle(element).transitionDuration),
        '0s',
      );
      await page.screenshot({
        path: `/tmp/g6-public-home-${locale}-${width}-${dark ? 'dark' : 'light'}.png`,
        fullPage: true,
      });
      assert.deepEqual(errors, []);
      results.push({ locale, width, dark, passed: true });
      await page.close();
    }
  }
  const removedPreview = await browser.newPage();
  assert.equal(
    (
      await removedPreview.goto(origin + '/preview/ava-home', { waitUntil: 'networkidle' })
    ).status(),
    404,
  );
  await removedPreview.close();
  for (const path of ['/preview/home-v2']) {
    const page = await browser.newPage();
    assert.equal((await page.goto(origin + path, { waitUntil: 'networkidle' })).status(), 200);
    assert.equal(await page.locator('main[lang="zh-CN"] #architecture').count(), 1);
    assert((await page.locator('meta[name="robots"]').getAttribute('content')).includes('noindex'));
    await page.close();
  }
  const statePage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await statePage.route('**/homepage/graph-desktop.json', (route) =>
    route.fulfill({ status: 404, body: '' }),
  );
  await statePage.goto(origin + '/en', { waitUntil: 'networkidle' });
  await statePage.locator('[data-graph-status="error"]').waitFor();
  assert(await statePage.getByText('The graph could not be loaded', { exact: true }).isVisible());
  assert(await statePage.getByRole('button', { name: 'Retry', exact: true }).isVisible());
  assert.equal(await statePage.locator('[data-graph-status] canvas').count(), 0);
  assert(
    await statePage
      .getByRole('toolbar', { name: 'Graph viewport controls' })
      .locator('button')
      .evaluateAll((elements) => elements.every((element) => element.disabled)),
  );
  await statePage.unroute('**/homepage/graph-desktop.json');
  await statePage.getByRole('button', { name: 'Retry', exact: true }).click();
  await statePage.locator('[data-graph-status="ready"]').waitFor();
  const initialZoom = Number(
    await statePage.locator('[data-graph-status]').getAttribute('data-zoom'),
  );
  await statePage.getByRole('button', { name: 'Zoom in on graph', exact: true }).click();
  assert(
    Number(await statePage.locator('[data-graph-status]').getAttribute('data-zoom')) > initialZoom,
  );
  await statePage.getByRole('button', { name: 'Fit graph', exact: true }).click();
  assert(
    Math.abs(
      Number(await statePage.locator('[data-graph-status]').getAttribute('data-zoom')) -
        initialZoom,
    ) < 0.001,
  );
  await statePage.getByRole('button', { name: 'Choose a language', exact: true }).click();
  await statePage.getByRole('dialog').getByRole('button', { name: '中文', exact: true }).click();
  await statePage.waitForURL(origin + '/');
  await statePage.locator('main[lang="zh-CN"]').waitFor();
  await statePage.getByRole('button', { name: '选择语言', exact: true }).click();
  await statePage.getByRole('dialog').getByRole('button', { name: 'English', exact: true }).click();
  await statePage.waitForURL(origin + '/en');
  await statePage.locator('main[lang="en"]').waitFor();
  assert(!han.test(await statePage.locator('main[lang="en"]').textContent()));
  await statePage.locator('#nd-nav a[href="/en/docs"]').first().click();
  await statePage.waitForURL(origin + '/en/docs');
  assert.equal(
    await statePage.locator('[data-g6lite-home-navigation]').count(),
    0,
    'homepage nav styling must not leak into docs',
  );
  assert.equal(await statePage.locator('[data-graph-status]').count(), 0);
  await statePage.close();
  console.log(
    JSON.stringify(
      {
        results,
        removedAvaPreview: true,
        existingHomeV2Preview: 'shared component, noindex',
        englishErrorRetry: true,
        languageSwitch: true,
        navigationCleanup: true,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
