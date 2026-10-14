/** Independent code window and Hero-consistent heading typography, scoped to the preview. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const { chromium } = createRequire(new URL('../../package.json', import.meta.url))('playwright');
const origin = process.argv[2] ?? 'http://127.0.0.1:3010';
const characters = new Set(
  readFileSync(new URL('../src/components/homepage/fonts/characters.txt', import.meta.url), 'utf8'),
);
const source = readFileSync(
  new URL('../src/components/homepage/homepage.tsx', import.meta.url),
  'utf8',
);
const code = source.match(/const quickStartCode = `([\s\S]*?)`;/)?.[1];
assert(code, 'quick-start snippet must exist');
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
      hasTouch: width < 768,
      isMobile: width < 768,
    });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    if (dark) await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    assert.equal((await page.goto(`${origin}/`, { waitUntil: 'networkidle' })).status(), 200);
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator('#developers');
    await section.scrollIntoViewIfNeeded();
    const body = section.locator('[class*="developerBody"]');
    const copy = body.locator('[class*="developerCopy"]');
    const terminal = body.getByRole('figure', { name: 'TypeScript 快速接入示例' });
    assert.equal(
      await section
        .locator('[class*="developerBar"], [class*="developerPanel"], [class*="moreEntry"]')
        .count(),
      0,
    );
    assert.equal(
      await section.locator('[class*="sectionHeading"]').count(),
      0,
      'no detached top heading',
    );
    assert.equal(await copy.locator('h2').count(), 1);
    assert.equal(await copy.locator('h2').textContent(), '快速接入，灵活定制');
    assert.equal(await copy.locator('h2 br').count(), 1);
    assert.equal(await copy.locator('h3').count(), 0, 'no repeated secondary heading');
    assert.equal(await copy.locator('p').count(), 1);
    assert.equal(
      await copy.locator('p').textContent(),
      '将关系图集成到现有 Web 应用，根据业务需求配置布局、交互与样式，并通过数据更新接口保持图与业务数据同步。',
    );
    assert.equal(await copy.locator('a').count(), 1);
    assert(!(await copy.textContent()).includes('一个入口，清晰配置'));
    assert(!(await copy.textContent()).includes('AI 工作流'));
    assert(!(await copy.textContent()).includes('扩展 API'));
    const entry = copy.getByRole('link', { name: /阅读快速开始/ });
    assert.equal(await entry.getAttribute('href'), '/docs/getting-started/quick-start');
    assert.equal(
      (await page.request.get(origin + (await entry.getAttribute('href')))).status(),
      200,
    );
    assert.equal(await terminal.locator('figcaption small').textContent(), 'graph.ts');
    assert.equal(await terminal.locator('figcaption i').count(), 3);
    assert.equal((await terminal.locator('pre code').textContent()).trim(), code.trim());
    assert.equal(
      await terminal
        .locator('figcaption')
        .evaluate((element) => getComputedStyle(element).borderBottomWidth),
      '0px',
    );
    assert.equal(await body.evaluate((element) => getComputedStyle(element).borderTopWidth), '0px');
    const terminalBox = await terminal.boundingBox();
    const windowStyle = await terminal.evaluate((element) => {
      const s = getComputedStyle(element);
      return {
        background: s.backgroundImage,
        shadow: s.boxShadow,
        radius: s.borderRadius,
        border: s.borderTopWidth,
      };
    });
    assert.equal(windowStyle.radius, '18px');
    assert.equal(windowStyle.border, '0px', 'surface contour must not change the box model');
    if (dark) {
      assert.equal(
        windowStyle.background,
        'linear-gradient(145deg, rgb(34, 44, 64), rgb(27, 36, 53))',
      );
      assert(windowStyle.shadow.includes('rgba(190, 204, 234, 0.14) 0px 0px 0px 1px inset'));
      assert(windowStyle.shadow.includes('rgba(0, 0, 0, 0.5)'));
    } else {
      assert.equal(
        windowStyle.background,
        'linear-gradient(145deg, rgb(25, 34, 56), rgb(17, 27, 42))',
      );
      assert(!windowStyle.shadow.includes('inset'), 'light theme remains unchanged');
    }
    const copyBox = await copy.boundingBox();
    const bodyBox = await body.boundingBox();
    const titleBox = await copy.locator('h2').boundingBox();
    assert(titleBox.y >= copyBox.y && titleBox.y + titleBox.height <= copyBox.y + copyBox.height);
    assert.equal(
      await copy.evaluate((element) => element.scrollWidth > element.clientWidth),
      false,
    );
    if (width >= 768) {
      assert(terminalBox.x > copyBox.x + copyBox.width);
      assert(terminalBox.width > bodyBox.width * 0.55);
      assert(
        Math.abs(copyBox.y + copyBox.height / 2 - terminalBox.y - terminalBox.height / 2) < 2,
        'copy must be one vertically centered group',
      );
    } else assert(terminalBox.y > copyBox.y + copyBox.height);
    if (width === 1440) {
      assert.equal(Math.round(bodyBox.width), 1160);
      assert(terminalBox.width >= 680, 'real desktop code window must not be chat-preview narrow');
    }
    assert.equal(
      await terminal.locator('pre').evaluate((element) => getComputedStyle(element).whiteSpace),
      'pre-wrap',
    );
    assert(
      await terminal
        .locator('pre')
        .evaluate((element) => parseFloat(getComputedStyle(element).fontSize) >= 12),
    );
    const heroStyle = await page.locator('main h1').evaluate((element) => {
      const s = getComputedStyle(element);
      return { family: s.fontFamily, weight: s.fontWeight, color: s.color };
    });
    const headings = await page.locator('main h1, main h2, main h3').evaluateAll((elements) =>
      elements.map((element) => {
        const s = getComputedStyle(element);
        return {
          text: element.textContent,
          family: s.fontFamily,
          weight: s.fontWeight,
          color: s.color,
        };
      }),
    );
    for (const heading of headings) {
      assert.equal(heading.family, heroStyle.family, heading.text);
      assert.equal(heading.weight, '500', heading.text);
      assert.equal(heading.color, heroStyle.color, heading.text);
      for (const character of heading.text)
        if (/\p{Script=Han}/u.test(character))
          assert(characters.has(character), `missing heading glyph ${character}`);
    }
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    assert.equal(
      await terminal.evaluate((element) => element.scrollWidth > element.clientWidth),
      false,
    );
    await body.screenshot({
      path: `/tmp/g6-terminal-access-live-${width}-${dark ? 'dark' : 'light'}.png`,
    });
    assert.deepEqual(errors, []);
    results.push({
      width,
      dark,
      codeWidth: Math.round(terminalBox.width),
      independentTerminal: true,
      groupedHeading: true,
      headingCount: headings.length,
      passed: true,
    });
    await page.close();
  }
  console.log(JSON.stringify({ results }, null, 2));
} finally {
  await browser.close();
}
