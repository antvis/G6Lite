import { cloneGraphData, generateGraphData } from '../datasets/generate.mjs';

function createDeferredLayoutCase(runLayout, data, tier, type, config = {}) {
  return {
    name: `${tier}/${type}`,
    fn(deferred) {
      runLayout(
        cloneGraphData(data),
        { type, worker: false, ...config },
        { width: 800, height: 600 },
      )
        .then(() => deferred.resolve())
        .catch((error) => {
          deferred.benchmark.error = error;
          deferred.resolve();
        });
    },
    options: { defer: true },
    metadata: {
      scope: 'public',
      tier,
      operation: 'layout',
      config: { type, worker: false, ...config },
    },
  };
}

export async function createLayoutSuite(mode) {
  const { runLayout } = await import('../../dist/index.js');
  const tier = mode === 'full' ? 'small' : 'tiny';
  const data = generateGraphData(mode === 'full' ? 1000 : 100, 3, 0xbb67ae85);
  const cases = [
    createDeferredLayoutCase(runLayout, data, tier, 'grid'),
    createDeferredLayoutCase(runLayout, data, tier, 'circular'),
    createDeferredLayoutCase(runLayout, data, tier, 'random'),
    createDeferredLayoutCase(runLayout, data, tier, 'force', {
      maxIteration: mode === 'full' ? 30 : 10,
      minMovement: 2,
      animate: false,
    }),
    createDeferredLayoutCase(runLayout, data, tier, 'force-atlas2', {
      maxIteration: mode === 'full' ? 30 : 10,
      barnesHut: true,
      prune: false,
      animate: false,
    }),
  ];
  return { name: 'layout', cases };
}
