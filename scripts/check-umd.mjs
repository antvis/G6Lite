import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const packageRoot = new URL('../', import.meta.url);
const bundle = readFileSync(new URL('dist/g6-lite.umd.min.js', packageRoot));
const publicApi = await import(new URL('dist/index.js', packageRoot));
const expectedExports = Object.keys(publicApi).sort();
const testUrl = 'https://g6lite.example.test/';
const cdnUrl = 'https://cdn.jsdelivr.net/npm/@antv/g6-lite@beta/dist/g6-lite.umd.min.js';

function readExample(file) {
  const readme = readFileSync(new URL(file, packageRoot), 'utf8');
  const blocks = [...readme.matchAll(/```html\n([\s\S]*?)\n```/g)];
  const example = blocks.find((match) => match[1].includes(cdnUrl))?.[1];
  assert.ok(example, `Missing CDN example in ${file}`);
  return example;
}

const example = readExample('README.md');
assert.equal(readExample('README.zh-CN.md'), example, 'Both README examples must stay runnable');

async function launchBrowser() {
  const candidates = [
    undefined,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];
  let lastError;
  for (const executablePath of candidates) {
    if (executablePath && !existsSync(executablePath)) continue;
    try {
      return await chromium.launch({
        ...(executablePath ? { executablePath } : {}),
        args: ['--enable-unsafe-swiftshader'],
      });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

const browser = await launchBrowser();
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  const unexpectedRequests = [];
  let bundleRequests = 0;
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  // Run the README unchanged, serving the built bytes at the cross-origin CDN URL.
  // Any external dependency or missing chunk makes the check fail.
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    if (url === testUrl) {
      await route.fulfill({ contentType: 'text/html', body: example });
    } else if (url === cdnUrl) {
      bundleRequests++;
      await route.fulfill({ contentType: 'application/javascript', body: bundle });
    } else {
      unexpectedRequests.push(url);
      await route.abort();
    }
  });
  await page.addInitScript(() => {
    window.umdWorkerResults = [];
    const NativeWorker = window.Worker;
    window.Worker = class extends NativeWorker {
      constructor(url, options) {
        super(url, options);
        this.addEventListener('message', (event) => {
          window.umdWorkerResults.push(event.data);
        });
      }
    };
  });
  await page.goto(testUrl);
  try {
    await page.waitForFunction(
      () =>
        document.querySelector('canvas') &&
        graph.getData().nodes.every((n) => Number.isFinite(n.x)),
    );
  } catch (error) {
    throw new Error(`README render failed: ${errors.join('; ')}`, { cause: error });
  }
  const result = await page.evaluate(async () => {
    const exports = Object.keys(window.G6Lite).sort();
    const canvas = document.querySelector('canvas');
    const renderedNodes = graph.getNodeCount();
    const renderedEdges = graph.getEdgeCount();
    const data = {
      nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      edges: [{ source: 'a', target: 'b' }],
    };
    const positions = [];
    for (const type of ['circular', 'dagre']) {
      const main = await G6Lite.runLayout(data, { type }, { width: 800, height: 500 });
      const worker = await G6Lite.runLayout(
        data,
        { type, worker: true },
        { width: 800, height: 500 },
      );
      positions.push(main.nodes, worker.nodes);
    }
    graph.destroy();
    return {
      exports,
      renderedNodes,
      renderedEdges,
      canvasSize: [canvas.width, canvas.height],
      positions,
      workerResults: window.umdWorkerResults,
    };
  });
  assert.deepEqual(result.exports, expectedExports);
  assert.equal(result.renderedNodes, 3);
  assert.equal(result.renderedEdges, 2);
  assert.ok(result.canvasSize.every((dimension) => dimension > 0));
  for (const nodes of result.positions) {
    assert.equal(nodes.length, 3);
    assert.ok(nodes.every((node) => Number.isFinite(node.x) && Number.isFinite(node.y)));
    assert.ok(new Set(nodes.map((node) => `${node.x},${node.y}`)).size > 1);
  }
  // Checking messages catches silent main-thread fallback after a Worker failure.
  assert.equal(result.workerResults.length, 2);
  assert.ok(
    result.workerResults.every((message) => !message.error && message.positions.length === 3),
  );
  assert.equal(bundleRequests, 1);
  assert.deepEqual(unexpectedRequests, []);
  assert.deepEqual(errors, []);
  console.log(
    'UMD: README rendering, public exports, main-thread and inline Worker layouts passed.',
  );
} finally {
  await browser.close();
}
