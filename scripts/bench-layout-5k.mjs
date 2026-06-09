/**
 * One-off layout benchmark for 5K-node diagnosis.
 * Run: node --experimental-vm-modules scripts/bench-layout-5k.mjs
 */
import { performance } from 'node:perf_hooks';
import {
  ForceLayout,
  ForceAtlas2Layout,
  FruchtermanLayout,
  GridLayout,
  CircularLayout,
  RandomLayout,
  D3ForceLayout,
} from '@antv/layout';

function genData(n, degree) {
  const nodes = Array.from({ length: n }, (_, i) => ({ id: String(i) }));
  const edges = [];
  for (let i = 0; i < n; i++) {
    const k = Math.min(degree, n - 1);
    for (let j = 0; j < k; j++) {
      const t = (i + 1 + j * 13) % n;
      if (t !== i) edges.push({ source: String(i), target: String(t) });
    }
  }
  return { nodes, edges };
}

function spread(nodes) {
  const s = Math.max(200, Math.sqrt(nodes.length) * 30);
  return nodes.map((n) => ({ ...n, x: Math.random() * s, y: Math.random() * s }));
}

async function timeIt(label, fn) {
  const t0 = performance.now();
  try {
    await fn();
    const dur = performance.now() - t0;
    console.log(`  ${label.padEnd(48)} ${dur.toFixed(0)} ms`);
    return dur;
  } catch (e) {
    console.log(`  ${label.padEnd(48)} ERROR: ${e.message}`);
    return -1;
  }
}

async function runScenario(nodeCount, degree) {
  const { nodes, edges } = genData(nodeCount, degree);
  console.log(`\n=== ${nodeCount} nodes / ${edges.length} edges ===`);
  const initNodes = spread(nodes);
  const data = () => ({ nodes: initNodes.map((n) => ({ ...n })), edges: edges.map((e) => ({ ...e })) });

  await timeIt('force (no BH, maxIter=50)', async () => {
    const layout = new ForceLayout({ maxIteration: 50, minMovement: 2.0, animate: false });
    await layout.execute(data());
  });

  await timeIt('force-atlas2 prune=false (FIXED), maxIter=50', async () => {
    const layout = new ForceAtlas2Layout({ maxIteration: 50, barnesHut: true, prune: false });
    await layout.execute(data());
  });

  await timeIt('force-atlas2 prune=true (BROKEN), maxIter=30', async () => {
    const layout = new ForceAtlas2Layout({ maxIteration: 30, barnesHut: true, prune: true });
    await layout.execute(data());
  });

  await timeIt('fruchterman, maxIter=50', async () => {
    const layout = new FruchtermanLayout({ maxIteration: 50, animate: false });
    await layout.execute(data());
  });

  await timeIt('grid', async () => {
    const layout = new GridLayout({});
    await layout.execute(data());
  });

  await timeIt('circular', async () => {
    const layout = new CircularLayout({ radius: 600 });
    await layout.execute(data());
  });

  await timeIt('random', async () => {
    const layout = new RandomLayout({});
    await layout.execute(data());
  });
}

(async () => {
  for (const n of [1000, 2000, 5000]) {
    await runScenario(n, 3);
  }
})();
