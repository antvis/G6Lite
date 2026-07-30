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
            (args) => (args.path === selectedImport ? undefined : { external: true, path: args.path }),
          );
        },
      },
    ],
  });
}

export default [
  {
    name: '@antv/g6-gl (initial entry before layout, brotli)',
    path: 'dist/index.js',
    ignore: ['@antv/layout'],
    limit: '90 KB',
  },
  ...officialLayouts.map((layout) => ({
    name: `@antv/g6-gl (initial entry + ${layout} layout, brotli)`,
    path: 'dist/index.js',
    modifyEsbuildConfig: includeOnlyLayout(layout),
    limit: '120 KB',
  })),
];
