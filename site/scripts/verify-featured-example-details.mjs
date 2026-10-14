/** Runnable scenario detail regression: rendering, camera, source, data and cleanup. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { chromium } = createRequire(new URL('../../package.json', import.meta.url))('playwright');
const origin = process.argv[2] ?? 'http://127.0.0.1:3010';
const browser = await chromium.launch({ headless: true });
const examples = [
  {
    id: 'relationship',
    zh: '人物关系网络',
    en: 'Character relationship network',
    nodes: 8,
    edges: 10,
    canvases: 4,
  },
  { id: 'org-chart', zh: '组织架构图', en: 'Organization chart', nodes: 6, edges: 5, canvases: 3 },
  { id: 'mindmap', zh: '思维导图', en: 'Mind map', nodes: 12, edges: 11, canvases: 3 },
  { id: 'fishbone', zh: '鱼骨图', en: 'Fishbone diagram', nodes: 20, edges: 19, canvases: 3 },
];
const results = [];
try {
  for (const locale of ['zh', 'en']) {
    for (const example of examples) {
      const prefix = locale === 'zh' ? '' : '/en';
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      // Retain the original stage so client navigation can prove its canvases were removed.
      await page.addInitScript(() => {
        window.__retainedExampleStage = null;
      });
      assert.equal(
        (
          await page.goto(`${origin}${prefix}/docs/examples/${example.id}`, {
            waitUntil: 'networkidle',
          })
        ).status(),
        200,
      );
      await page.locator('.example-preview-title .is-ready').waitFor();
      assert.equal(await page.locator('.example-detail-page h1').textContent(), example[locale]);
      const stage = page.locator('.example-preview-canvas');
      assert.equal(await stage.locator('canvas').count(), example.canvases);
      await stage.scrollIntoViewIfNeeded();
      const before = await stage.locator('.label-canvas').evaluate((canvas) => canvas.toDataURL());
      const box = await stage.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.wheel(0, -160);
      await page.waitForFunction(
        (snapshot) => document.querySelector('.label-canvas')?.toDataURL() !== snapshot,
        before,
      );
      const zoomed = await stage.locator('.label-canvas').evaluate((canvas) => canvas.toDataURL());
      // Pan from blank canvas, not the centered node (node hits intentionally block canvas drag).
      await page.mouse.move(box.x + 20, box.y + 20);
      await page.mouse.down();
      await page.mouse.move(box.x + 65, box.y + 50, { steps: 6 });
      await page.mouse.up();
      await page.waitForFunction(
        (snapshot) => document.querySelector('.label-canvas')?.toDataURL() !== snapshot,
        zoomed,
      );
      await page
        .getByRole('button', {
          name: locale === 'zh' ? '适应画布' : 'Fit view',
          exact: true,
        })
        .click();
      const sourceResponse = await page.request.get(`${origin}/example-sources/${example.id}.txt`);
      assert.equal(sourceResponse.status(), 200);
      const source = await sourceResponse.text();
      assert(source.includes("from '@antv/g6-lite'"));
      assert(source.includes('fitView:') && source.includes('cleanup'));
      assert(!source.includes('../../src/'));
      assert.equal((source.match(/\{ id: /g) ?? []).length, example.nodes);
      assert.equal((source.match(/\{ source: /g) ?? []).length, example.edges);
      await page
        .getByRole('tab', { name: locale === 'zh' ? '源码' : 'Source', exact: true })
        .click();
      await page.locator('.example-code-content pre code').first().waitFor();
      assert(
        (await page.locator('.example-code-content').textContent()).includes(
          "from '@antv/g6-lite'",
        ),
      );
      assert.equal(await page.locator('.example-code-filename').textContent(), `${example.id}.ts`);
      await page.getByRole('tab', { name: locale === 'zh' ? '数据' : 'Data', exact: true }).click();
      const data = JSON.parse(await page.locator('.example-data-panel pre code').textContent());
      assert.equal(data.nodes, example.nodes);
      assert.equal(data.edges, example.edges);
      await page.getByRole('button', { name: locale === 'zh' ? /刷新/ : /Refresh/ }).click();
      await page.locator('.example-preview-title .is-ready').waitFor();
      assert.equal(
        await stage.locator('canvas').count(),
        example.canvases,
        'refresh must not accumulate overlays',
      );
      await page
        .locator('.example-detail-page')
        .screenshot({ path: `/tmp/g6lite-detail-${example.id}-${locale}.png` });
      await stage.evaluate((element) => {
        window.__retainedExampleStage = element;
      });
      const documentOrigin = await page.evaluate(() => performance.timeOrigin);
      // Top-level Next navigation keeps the same document, unlike the detail sidebar's plain anchors.
      const docsLink = page.locator('a[href="' + prefix + '/docs"]').first();
      await docsLink.click();
      await page.waitForURL('**' + prefix + '/docs');
      await page.waitForFunction(
        (previousOrigin) =>
          performance.timeOrigin !== previousOrigin ||
          (window.__retainedExampleStage &&
            window.__retainedExampleStage.querySelectorAll('canvas').length === 0),
        documentOrigin,
      );
      assert.deepEqual(errors, []);
      results.push({
        id: example.id,
        locale,
        rendering: true,
        camera: true,
        source: true,
        data: true,
        cleanup: true,
      });
      await page.close();
    }
  }
  for (const dark of [false, true]) {
    for (const example of examples) {
      const page = await browser.newPage({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
        deviceScaleFactor: 2,
      });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      if (dark) await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
      await page.goto(`${origin}/docs/examples/${example.id}`, { waitUntil: 'networkidle' });
      await page.locator('.example-preview-title .is-ready').waitFor();
      if (dark)
        assert(
          await page.locator('html').evaluate((element) => element.classList.contains('dark')),
        );
      await page.getByRole('button', { name: '适应画布', exact: true }).tap();
      await page.getByRole('tab', { name: '源码', exact: true }).tap();
      await page.locator('.example-code-content pre code').first().waitFor();
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      await page.locator('.example-preview-stage').screenshot({
        path: `/tmp/g6lite-detail-${example.id}-mobile-${dark ? 'dark' : 'light'}.png`,
      });
      results.push({
        id: example.id,
        width: 390,
        dark,
        rendering: true,
        source: true,
        overflow: false,
      });
      await page.close();
    }
  }
  console.log(JSON.stringify({ results }, null, 2));
} finally {
  await browser.close();
}
