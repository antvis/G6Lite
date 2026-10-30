const officialLayouts = [
  'circular',
  'concentric',
  'dagre',
  'd3-force',
  'force',
  'force-atlas2',
  'fruchterman',
  'grid',
  'mds',
  'radial',
  'random',
];

function includeOnlyLayout(selectedLayout) {
  const selectedImport = `@antv/layout/lib/algorithm/${selectedLayout}/index.js`;
  return (config) => ({
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      {
        name: `size-limit-${selectedLayout}`,
        setup(build) {
          build.onResolve(
            { filter: /^@antv\/layout\/lib\/algorithm\/[^/]+\/index\.js$/ },
            (args) =>
              args.path === selectedImport ? undefined : { external: true, path: args.path },
          );
        },
      },
    ],
  });
}

export default [
  {
    name: '@antv/g6-lite (complete UMD with inline layout Worker, gzip)',
    path: 'dist/g6-lite.umd.min.js',
    disablePlugins: ['@size-limit/esbuild'],
    gzip: true,
    limit: '350 KB',
  },
  {
    name: '@antv/g6-lite (initial entry before layout, brotli)',
    path: 'dist/index.js',
    ignore: ['@antv/layout'],
    limit: '90 KB',
  },
  ...officialLayouts.map((layout) => ({
    name: `@antv/g6-lite (initial entry + ${layout} layout, brotli)`,
    path: 'dist/index.js',
    modifyEsbuildConfig: includeOnlyLayout(layout),
    // 121 KB: the base entry was already at 119.98 KB, and the fitView
    // edge/combo bounds work added ~0.5 KB. Owner-approved bump.
    limit: '121 KB',
  })),
];
