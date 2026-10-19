/**
 * Screenshot each docs example's live preview so the directory thumbnail
 * matches the canvas on the right. Requires the site dev server.
 */
import { inflateSync } from 'node:zlib';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(__dirname, '..');
const repositoryRoot = resolve(siteRoot, '..');
const base = process.env.CAPTURE_BASE ?? 'http://localhost:3000';
const meta = JSON.parse(readFileSync(resolve(siteRoot, 'content/docs/zh/examples/meta.json'), 'utf8'));
const ids = meta.pages.filter((id) => id !== 'index');
const slow = new Set(['real-dataset', 'large', 'large-labeled', 'layout-worker', 'relationship']);

const featured = {
  relationship: 'network',
  'org-chart': 'hierarchy',
  mindmap: 'mindmap',
  fishbone: 'fishbone',
};

function decodePng(buffer) {
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 2;
  const idats = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === 'IDAT') idats.push(data);
    else if (type === 'IEND') break;
    offset += 12 + length;
  }
  const inflated = inflateSync(Buffer.concat(idats));
  const bpp = colorType === 6 ? 4 : 3;
  const stride = width * bpp;
  const rows = [];
  let cursor = 0;
  let previous = Buffer.alloc(stride);
  for (let y = 0; y < height; y += 1) {
    const filter = inflated[cursor];
    cursor += 1;
    const row = Buffer.from(inflated.subarray(cursor, cursor + stride));
    cursor += stride;
    for (let i = 0; i < stride; i += 1) {
      const left = i >= bpp ? row[i - bpp] : 0;
      const up = previous[i];
      const upLeft = i >= bpp ? previous[i - bpp] : 0;
      let predictor = 0;
      if (filter === 1) predictor = left;
      else if (filter === 2) predictor = up;
      else if (filter === 3) predictor = (left + up) >> 1;
      else if (filter === 4) {
        const pa = Math.abs(up - upLeft);
        const pb = Math.abs(left - upLeft);
        const pc = Math.abs(left + up - 2 * upLeft);
        predictor = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
      }
      row[i] = (row[i] + predictor) & 255;
    }
    rows.push(row);
    previous = row;
  }
  return { width, height, bpp, rows };
}

function boxesNear(a, b, gap) {
  const dx = Math.max(0, a.minX - b.maxX, b.minX - a.maxX);
  const dy = Math.max(0, a.minY - b.maxY, b.minY - a.maxY);
  return dx <= gap && dy <= gap;
}

function clusterAroundLargest(components) {
  if (components.length === 0) return [];
  const light = components.filter((item) => item.backdrop >= 170);
  const pool = light.length > 0 ? light : components;
  const largest = pool.reduce((best, item) => (item.colorCount > best.colorCount ? item : best));
  const chosen = [largest];
  let grew = true;
  while (grew) {
    grew = false;
    for (const item of components) {
      if (chosen.includes(item)) continue;
      if (chosen.some((box) => boxesNear(box, item, 80))) {
        chosen.push(item);
        grew = true;
      }
    }
  }
  return chosen;
}

function isCanvasChrome(component, width, height) {
  if (component.colorCount < 80) return true;
  const boxWidth = component.maxX - component.minX + 1;
  const boxHeight = component.maxY - component.minY + 1;
  const density = component.count / (boxWidth * boxHeight);
  if (boxWidth > 500 && density < 0.05) return true;
  return component.minX > width * 0.62 && component.maxY < height * 0.4;
}

function contentCrop(buffer) {
  const image = decodePng(buffer);
  const { width, height, bpp, rows } = image;
  const full = { width, height, left: 0, top: 0, cropWidth: width, cropHeight: height };
  const ink = new Uint8Array(width * height);
  for (let y = 0; y < height; y += 1) {
    const row = rows[y];
    for (let x = 0; x < width; x += 1) {
      const index = x * bpp;
      const red = row[index];
      const green = row[index + 1];
      const blue = row[index + 2];
      const alpha = bpp === 4 ? row[index + 3] : 255;
      if (alpha < 16) continue;
      const min = Math.min(red, green, blue);
      const max = Math.max(red, green, blue);
      const chroma = max - min;
      if (min >= 242 && chroma <= 12) continue;
      if (max <= 42 && chroma <= 14) continue;
      ink[y * width + x] = 1;
    }
  }

  const seen = new Uint8Array(width * height);
  const stack = [];
  const components = [];
  for (let start = 0; start < ink.length; start += 1) {
    if (!ink[start] || seen[start]) continue;
    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;
    let count = 0;
    let colorCount = 0;
    stack.push(start);
    seen[start] = 1;
    while (stack.length) {
      const cursor = stack.pop();
      const x = cursor % width;
      const y = (cursor / width) | 0;
      count += 1;
      const sample = rows[y][x * bpp];
      const green = rows[y][x * bpp + 1];
      const blue = rows[y][x * bpp + 2];
      if (Math.max(sample, green, blue) - Math.min(sample, green, blue) > 18) colorCount += 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      const neighbors = [cursor - 1, cursor + 1, cursor - width, cursor + width];
      for (const next of neighbors) {
        if (next < 0 || next >= ink.length || !ink[next] || seen[next]) continue;
        const nextX = next % width;
        if (Math.abs(nextX - x) > 1) continue;
        seen[next] = 1;
        stack.push(next);
      }
    }
    components.push({ minX, maxX, minY, maxY, count, colorCount });
  }

  const graphParts = components.filter((component) => !isCanvasChrome(component, width, height));
  const pool = graphParts.length > 0 ? graphParts : components;
  for (const component of pool) {
    const points = [
      [component.minX - 6, (component.minY + component.maxY) >> 1],
      [component.maxX + 6, (component.minY + component.maxY) >> 1],
      [(component.minX + component.maxX) >> 1, component.minY - 6],
      [(component.minX + component.maxX) >> 1, component.maxY + 6],
    ];
    let backdrop = 255;
    for (const [rawX, rawY] of points) {
      const x = Math.min(width - 1, Math.max(0, rawX));
      const y = Math.min(height - 1, Math.max(0, rawY));
      const row = rows[y];
      const index = x * bpp;
      backdrop = Math.min(backdrop, (row[index] + row[index + 1] + row[index + 2]) / 3);
    }
    component.backdrop = backdrop;
  }
  const source = clusterAroundLargest(pool);
  if (source.length === 0) return full;
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  for (const part of source) {
    minX = Math.min(minX, part.minX);
    maxX = Math.max(maxX, part.maxX);
    minY = Math.min(minY, part.minY);
    maxY = Math.max(maxY, part.maxY);
  }
  const padX = Math.max(16, Math.round((maxX - minX) * 0.08));
  const padY = Math.max(16, Math.round((maxY - minY) * 0.1));
  const left = Math.max(0, minX - padX);
  const top = Math.max(0, minY - padY);
  const right = Math.min(width, maxX + padX + 1);
  const bottom = Math.min(height, maxY + padY + 1);
  return { width, height, left, top, cropWidth: right - left, cropHeight: bottom - top };
}

async function launchBrowser() {
  const candidates = [
    undefined,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ];
  let lastError;
  for (const executablePath of candidates) {
    if (executablePath && !existsSync(executablePath)) continue;
    try {
      return await chromium.launch(executablePath ? { executablePath } : {});
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function waitForPreview(page, id) {
  await page.waitForFunction(
    () => {
      const stage = document.querySelector('.example-preview-canvas');
      const canvas = stage?.querySelector('canvas');
      const fit = [...document.querySelectorAll('button')].find((button) =>
        (button.textContent || '').includes('适应画布'),
      );
      if (!stage || !canvas || !fit || fit.disabled) return false;
      const rect = stage.getBoundingClientRect();
      return rect.width > 200 && rect.height > 80 && canvas.width > 0;
    },
    undefined,
    { timeout: slow.has(id) ? 90_000 : 30_000 },
  );
  await page.waitForTimeout(slow.has(id) ? 1200 : 500);
}

function writeOutputs(captured, failed) {
  const cropsPath = resolve(siteRoot, 'src/data/example-crops.ts');
  const previous = readFileSync(cropsPath, 'utf8');
  const entries = captured
    .map(
      ({ id, width, height, left, top, cropWidth, cropHeight }) =>
        `  ${/^[A-Za-z_][A-Za-z0-9_]*$/.test(id) ? id : `'${id}'`}: {\n    width: ${width},\n    height: ${height},\n    left: ${left},\n    top: ${top},\n    cropWidth: ${cropWidth},\n    cropHeight: ${cropHeight},\n  },`,
    )
    .join('\n');
  const kept = [];
  for (const id of ids) {
    if (captured.some((item) => item.id === id)) continue;
    const match = previous.match(new RegExp(`(?:'${id}'|${id}): \\{[\\s\\S]*?\\n  \\},`));
    if (match) kept.push(`  ${match[0].trimEnd()}`);
  }
  writeFileSync(
    cropsPath,
    `/**\n * Crop windows for example thumbnails.\n *\n * Each image is a screenshot of the docs live preview, and the crop is the\n * graph content, so the directory thumbnail shows the same picture as the canvas.\n */\nconst exampleCrops = {\n${[entries, ...kept].filter(Boolean).join('\n')}\n} as const;\n\nexport default exampleCrops;\n`,
  );

  const recordsPath = resolve(siteRoot, 'public/homepage/examples/crop-records.json');
  const records = JSON.parse(readFileSync(recordsPath, 'utf8'));
  for (const item of captured) {
    const key = featured[item.id];
    if (!key || !records[key]) continue;
    records[key].imageWidth = item.width;
    records[key].imageHeight = item.height;
    records[key].crop = [item.left, item.top, item.left + item.cropWidth, item.top + item.cropHeight];
    records[key].width = item.cropWidth;
    records[key].height = item.cropHeight;
  }
  writeFileSync(recordsPath, `${JSON.stringify(records, null, 2)}\n`);

  if (failed.length > 0) {
    console.error(`Failed ${failed.length}: ${failed.map((item) => item.id).join(', ')}`);
    process.exitCode = 1;
  }
}

async function cropsOnly() {
  const captured = ids.map((id) => {
    const file = resolve(siteRoot, 'public/examples', `${id}.png`);
    const crop = contentCrop(readFileSync(file));
    console.log(`${id} ${crop.cropWidth}x${crop.cropHeight} @ ${crop.left},${crop.top}`);
    return { id, ...crop };
  });
  writeOutputs(captured, []);
}

async function main() {
  if (process.argv.includes('--crops-only')) {
    cropsOnly();
    return;
  }
  const browser = await launchBrowser();
  const captured = [];
  const failed = [];
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    for (const id of ids) {
      try {
        await page.goto(`${base}/docs/examples/${id}`, { waitUntil: 'domcontentloaded' });
        await waitForPreview(page, id);
        const file = resolve(siteRoot, 'public/examples', `${id}.png`);
        await page.locator('.example-preview-canvas').screenshot({ path: file });
        const crop = contentCrop(readFileSync(file));
        captured.push({ id, ...crop });
        console.log(`✓ ${id} ${crop.width}x${crop.height} crop ${crop.cropWidth}x${crop.cropHeight}`);
      } catch (error) {
        failed.push({ id, error: error instanceof Error ? error.message : String(error) });
        console.error(`✗ ${id}: ${error instanceof Error ? error.message.split('\n')[0] : error}`);
      }
    }
    await context.close();
  } finally {
    await browser.close();
  }
  writeOutputs(captured, failed);
}

await main();
