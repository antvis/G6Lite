/**
 * 用真实 g6-lite(WebGL)渲染每种布局并截图,输出到 public/layouts/<type>.png。
 *
 * 依赖 playground 的 vite dev server + capture.html。
 * 运行(在仓库根目录):
 *   npx vite --port 5179 --no-open &
 *   node website/scripts/capture-thumbnails.mjs
 *
 * 用纯 node(非 tsx)运行:tsx/esbuild 会向页面注入 __name 辅助函数,
 * 在 page.evaluate / screenshot 的页面上下文里会报 ReferenceError。
 */
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../public/layouts');
const BASE = process.env.CAPTURE_BASE ?? 'http://localhost:5179';

const DEFAULT_LAYOUTS = [
  { type: 'force', color: '5B8FF9' },
  { type: 'circular', color: '33B681' },
  { type: 'radial', color: 'E8684A' },
  { type: 'dagre', color: 'E1A416' },
  { type: 'grid', color: '1FA7C4' },
  { type: 'mindmap', color: '8B5CF6' },
  { type: 'fishbone', color: 'FF6B4A' },
];

const requestedLayouts = process.argv.slice(2);
const unknownLayouts = requestedLayouts.filter(
  (type) => !DEFAULT_LAYOUTS.some((layout) => layout.type === type),
);

if (unknownLayouts.length > 0) {
  throw new Error(`Unknown layout type: ${unknownLayouts.join(', ')}`);
}

const LAYOUTS =
  requestedLayouts.length > 0
    ? requestedLayouts.map((type) => DEFAULT_LAYOUTS.find((layout) => layout.type === type))
    : DEFAULT_LAYOUTS;

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  for (const { type, color } of LAYOUTS) {
    // 每个布局用全新 context:WebGL 截图在同一 page 跨次导航会复用上一帧的 GPU surface,
    // 导致所有截图字节级相同。新 context 保证拿到干净的渲染结果。
    const ctx = await browser.newContext({
      viewport: { width: 640, height: 480 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/capture.html#${type}|${color}`, { waitUntil: 'load' });
    let ready = false;
    for (let i = 0; i < 60; i++) {
      ready = await page.evaluate(() => window.__ready === true);
      if (ready) break;
      await page.waitForTimeout(150);
    }
    if (!ready) throw new Error(`${type}: render timeout`);
    await page.waitForTimeout(250);
    await page
      .locator('#stage')
      .screenshot({ path: resolve(OUT_DIR, `${type}.png`), omitBackground: true });
    console.log(`✓ ${type}.png`);
    await ctx.close();
  }

  await browser.close();
}

void main();
